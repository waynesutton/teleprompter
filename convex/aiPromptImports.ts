"use node";

import { createDecipheriv, createHash } from "node:crypto";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { trimSkillContext } from "./promptTemplates";

type StoredUserApiKey = {
  service: "openai" | "claude" | "openrouter" | "firecrawl" | "elevenlabs" | "r2" | "mux" | "heygen" | "daytona";
  encryptedKey: string;
  iv: string;
  tag: string;
  model?: string;
  siteUrl?: string;
  appName?: string;
};

const getEncryptionKey = () => {
  const secret = process.env.USER_KEYS_SECRET?.trim();

  if (!secret) {
    throw new Error("USER_KEYS_SECRET is not configured.");
  }

  return createHash("sha256").update(secret).digest();
};

const decryptKey = (key: StoredUserApiKey) => {
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(key.iv, "base64"));
  decipher.setAuthTag(Buffer.from(key.tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(key.encryptedKey, "base64")),
    decipher.final(),
  ]).toString("utf8");
};

export const importSkillFromUrl = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);
    const url = args.url.trim();

    if (!ownerId) {
      return {
        ok: false,
        message: "Sign in with GitHub to import skill guidance.",
      };
    }

    if (!/^https?:\/\/\S+$/i.test(url)) {
      return {
        ok: false,
        message: "Add a valid http or https skill URL.",
      };
    }

    const keys: StoredUserApiKey[] = await ctx.runQuery(internal.userApiKeys.getForCurrentUser, {});
    const firecrawlKey = keys.find((key) => key.service === "firecrawl");

    if (!firecrawlKey) {
      return {
        ok: false,
        message: "Add your Firecrawl API key in Account settings before importing a skill URL.",
      };
    }

    const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${decryptKey(firecrawlKey)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `Firecrawl could not import that skill. Status ${response.status}.`,
      };
    }

    const data = await response.json();
    const markdown =
      typeof data?.data?.markdown === "string"
        ? data.data.markdown
        : typeof data?.markdown === "string"
          ? data.markdown
          : "";

    if (!markdown.trim()) {
      return {
        ok: false,
        message: "Firecrawl did not return readable skill text.",
      };
    }

    const skillMarkdown = trimSkillContext(markdown);
    await ctx.runMutation(internal.aiPromptSettings.saveImportedSkill, {
      skillSourceUrl: url,
      skillMarkdown,
      updatedAt: Date.now(),
    });

    return {
      ok: true,
      message: "Skill guidance imported and saved.",
      skillMarkdown,
      skillSourceUrl: url,
    };
  },
});
