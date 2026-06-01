"use node";

import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const serviceValidator = v.union(
  v.literal("openai"),
  v.literal("claude"),
  v.literal("openrouter"),
  v.literal("firecrawl"),
  v.literal("elevenlabs"),
);

const getEncryptionKey = () => {
  const secret = process.env.USER_KEYS_SECRET?.trim();

  if (!secret) {
    throw new Error("USER_KEYS_SECRET is not configured.");
  }

  return createHash("sha256").update(secret).digest();
};

const encryptKey = (value: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);

  return {
    encryptedKey: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
};

export const save = action({
  args: {
    service: serviceValidator,
    apiKey: v.string(),
    model: v.optional(v.string()),
    siteUrl: v.optional(v.string()),
    appName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);
    const apiKey = args.apiKey.trim();

    if (!ownerId) {
      return { ok: false, message: "Sign in with GitHub to save API keys." };
    }

    if (!apiKey) {
      return { ok: false, message: "Paste an API key before saving." };
    }

    try {
      const encrypted = encryptKey(apiKey);
      await ctx.runMutation(internal.userApiKeys.saveEncrypted, {
        service: args.service,
        ...encrypted,
        model: args.model,
        siteUrl: args.siteUrl,
        appName: args.appName,
        updatedAt: Date.now(),
      });

      return { ok: true, message: "API key saved." };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Could not save that API key.",
      };
    }
  },
});
