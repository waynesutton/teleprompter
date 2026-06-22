"use node";

import { createDecipheriv, createHash } from "node:crypto";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { buildScriptGeneratorSystemPrompt } from "./promptTemplates";

const providerValidator = v.union(
  v.literal("auto"),
  v.literal("openai"),
  v.literal("claude"),
  v.literal("openrouter"),
);
const lengthValidator = v.union(v.literal("short"), v.literal("long"), v.literal("open"));
const scriptVoiceProfileValidator = v.object({
  name: v.string(),
  audience: v.string(),
  tone: v.string(),
  pacing: v.string(),
  bannedWords: v.string(),
  preferredPhrases: v.string(),
  examples: v.string(),
  structure: v.string(),
  defaultLength: lengthValidator,
});

type Provider = "openai" | "claude" | "openrouter";

type ProviderConfig = {
  provider: Provider;
  label: string;
  apiKey: string;
  model: string;
  siteUrl?: string;
  appName?: string;
};

const DEFAULT_PROVIDER_MODELS: Record<Provider, string> = {
  openai: "gpt-5.4-mini",
  claude: "claude-sonnet-4-6",
  openrouter: "openrouter/fusion",
};

type AiProviderStatusResult = {
  isAuthenticated: boolean;
  providers: Array<{ provider: Provider; label: string; model: string }>;
  hasFirecrawl: boolean;
};

type GenerateResult =
  | {
      ok: true;
      script: string;
      provider: Provider;
      model: string;
      usedUrl: string | null;
    }
  | {
      ok: false;
      code: "invalid_input" | "missing_setup" | "provider_error";
      message: string;
    };

type RewriteResult =
  | {
      ok: true;
      script: string;
      provider: Provider;
      model: string;
    }
  | {
      ok: false;
      code: "invalid_input" | "missing_setup" | "provider_error";
      message: string;
    };

const MAX_CONTEXT_CHARS = 12000;

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

const getConfiguredProviders = (keys: StoredUserApiKey[]): ProviderConfig[] => {
  const providers: ProviderConfig[] = [];
  const openAiKey = keys.find((key) => key.service === "openai");
  const anthropicKey = keys.find((key) => key.service === "claude");
  const openRouterKey = keys.find((key) => key.service === "openrouter");

  if (openAiKey) {
    providers.push({
      provider: "openai",
      label: "OpenAI",
      apiKey: decryptKey(openAiKey),
      model: openAiKey.model || DEFAULT_PROVIDER_MODELS.openai,
    });
  }

  if (anthropicKey) {
    providers.push({
      provider: "claude",
      label: "Claude",
      apiKey: decryptKey(anthropicKey),
      model: anthropicKey.model || DEFAULT_PROVIDER_MODELS.claude,
    });
  }

  if (openRouterKey) {
    providers.push({
      provider: "openrouter",
      label: "OpenRouter",
      apiKey: decryptKey(openRouterKey),
      model: openRouterKey.model || DEFAULT_PROVIDER_MODELS.openrouter,
      siteUrl: openRouterKey.siteUrl,
      appName: openRouterKey.appName,
    });
  }

  return providers;
};

const getFirstUrl = (input: string) => {
  const markdownUrl = input.match(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/i)?.[1];
  const plainUrl = input.match(/https?:\/\/[^\s)]+/i)?.[0];
  return (markdownUrl ?? plainUrl ?? "").replace(/[.,;!?]+$/, "");
};

const truncateContext = (value: string) => {
  if (value.length <= MAX_CONTEXT_CHARS) {
    return value;
  }

  return `${value.slice(0, MAX_CONTEXT_CHARS)}\n\n[Source truncated for length]`;
};

const getRsvpSystemPrompt = () => `You rewrite teleprompter scripts for RSVP speed reading with ORP highlighting.

Rules:
- Preserve the user's meaning and order.
- Make sentences easier to read one word at a time.
- Prefer short spoken phrases.
- Remove filler, repeated setup, and overly long clauses.
- Keep useful direction notes only when they help delivery, like [pause].
- Keep --- page breaks only when they still help.
- Do not explain your changes.
- Do not wrap the output in code fences.
- Output only the rewritten script body.`;

const cleanGeneratedScript = (value: string) =>
  value
    .replace(/^```(?:markdown|md|text)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const parseOpenAiText = (data: unknown): string => {
  if (typeof data !== "object" || !data) {
    return "";
  }

  if ("output_text" in data && typeof data.output_text === "string") {
    return data.output_text;
  }

  const output = "output" in data && Array.isArray(data.output) ? data.output : [];
  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) {
        return [];
      }

      return (item.content as unknown[])
        .map((part: unknown) => {
          if (!part || typeof part !== "object") {
            return "";
          }

          if ("text" in part && typeof part.text === "string") {
            return part.text;
          }

          return "";
        })
        .filter(Boolean);
    })
    .join("\n");
};

const parseClaudeText = (data: unknown): string => {
  if (typeof data !== "object" || !data || !("content" in data) || !Array.isArray(data.content)) {
    return "";
  }

  return data.content
    .map((part) => {
      if (!part || typeof part !== "object" || !("text" in part) || typeof part.text !== "string") {
        return "";
      }

      return part.text;
    })
    .filter(Boolean)
    .join("\n");
};

const parseChatCompletionText = (data: unknown): string => {
  if (typeof data !== "object" || !data || !("choices" in data) || !Array.isArray(data.choices)) {
    return "";
  }

  const firstChoice = data.choices[0];
  if (!firstChoice || typeof firstChoice !== "object" || !("message" in firstChoice)) {
    return "";
  }

  const message = firstChoice.message;
  if (!message || typeof message !== "object" || !("content" in message) || typeof message.content !== "string") {
    return "";
  }

  return message.content;
};

const scrapeUrl = async (url: string, keys: StoredUserApiKey[]) => {
  const firecrawlKey = keys.find((key) => key.service === "firecrawl");
  if (!firecrawlKey) {
    return {
      ok: false as const,
      message: "Add your Firecrawl API key in Build settings before generating from a URL.",
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
      ok: false as const,
      message: `Firecrawl could not read that URL. Status ${response.status}.`,
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
      ok: false as const,
      message: "Firecrawl did not return readable page text.",
    };
  }

  return { ok: true as const, markdown: truncateContext(markdown) };
};

const callOpenAi = async (config: ProviderConfig, model: string, systemPrompt: string, userPrompt: string) => {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_output_tokens: 1600,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(typeof data?.error?.message === "string" ? data.error.message : `OpenAI returned ${response.status}.`);
  }

  return parseOpenAiText(data);
};

const callClaude = async (config: ProviderConfig, model: string, systemPrompt: string, userPrompt: string) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      max_tokens: 1600,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(typeof data?.error?.message === "string" ? data.error.message : `Claude returned ${response.status}.`);
  }

  return parseClaudeText(data);
};

const callOpenRouter = async (config: ProviderConfig, model: string, systemPrompt: string, userPrompt: string) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };
  const siteUrl = config.siteUrl;
  const appName = config.appName;

  if (siteUrl) {
    headers["HTTP-Referer"] = siteUrl;
  }

  if (appName) {
    headers["X-Title"] = appName;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1600,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(typeof data?.error?.message === "string" ? data.error.message : `OpenRouter returned ${response.status}.`);
  }

  return parseChatCompletionText(data);
};

export const getAiProviderStatus = action({
  args: {},
  handler: async (ctx): Promise<AiProviderStatusResult> => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return {
        isAuthenticated: false,
        providers: [],
        hasFirecrawl: false,
      };
    }

    const keys: StoredUserApiKey[] = await ctx.runQuery(internal.userApiKeys.getForCurrentUser, {});

    return {
      isAuthenticated: true,
      providers: getConfiguredProviders(keys).map(({ provider, label, model }) => ({
        provider,
        label,
        model,
      })),
      hasFirecrawl: Boolean(keys.find((key) => key.service === "firecrawl")),
    };
  },
});

export const generateScript = action({
  args: {
    input: v.string(),
    provider: providerValidator,
    modelOverride: v.optional(v.string()),
    length: lengthValidator,
    scriptVoiceProfile: v.optional(scriptVoiceProfileValidator),
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<GenerateResult> => {
    const ownerId = await getAuthUserId(ctx);
    const input = args.input.trim();

    if (!ownerId) {
      return {
        ok: false,
        code: "missing_setup",
        message: "Sign in with GitHub and add your API keys before using AI generation.",
      };
    }

    if (!input) {
      return {
        ok: false,
        code: "invalid_input",
        message: "Add a topic, notes, URL, or markdown link before generating.",
      };
    }

    const keys: StoredUserApiKey[] = await ctx.runQuery(internal.userApiKeys.getForCurrentUser, {});
    const configuredProviders = getConfiguredProviders(keys);
    if (configuredProviders.length === 0) {
      return {
        ok: false,
        code: "missing_setup",
        message: "Add an OpenAI, Claude, or OpenRouter API key in Build settings.",
      };
    }

    const url = getFirstUrl(input);
    const scraped = url ? await scrapeUrl(url, keys) : null;

    if (scraped && !scraped.ok) {
      return {
        ok: false,
        code: "missing_setup",
        message: scraped.message,
      };
    }

    const selectedConfig =
      args.provider === "auto"
        ? configuredProviders[0]
        : configuredProviders.find((config) => config.provider === args.provider);

    if (!selectedConfig) {
      return {
        ok: false,
        code: "missing_setup",
        message: "Add that provider API key in Build settings.",
      };
    }

    const promptSettings = await ctx.runQuery(internal.aiPromptSettings.getForCurrentUser, {});
    const model = args.modelOverride?.trim() || selectedConfig.model;
    const systemPrompt = buildScriptGeneratorSystemPrompt({
      basePrompt: promptSettings?.prompt,
      instructions: args.instructions ?? "",
      length: args.length,
      profile: args.scriptVoiceProfile,
      skillMarkdown: promptSettings?.skillMarkdown,
    });
    const sourceContext = scraped?.ok
      ? `Source URL: ${url}\n\nScraped page markdown:\n${scraped.markdown}\n\nUser notes:\n${truncateContext(input)}`
      : `User topic or notes:\n${truncateContext(input)}`;
    const userPrompt = `Create a teleprompter-ready script from this source.\n\n${sourceContext}`;

    try {
      const rawScript =
        selectedConfig.provider === "openai"
          ? await callOpenAi(selectedConfig, model, systemPrompt, userPrompt)
          : selectedConfig.provider === "claude"
            ? await callClaude(selectedConfig, model, systemPrompt, userPrompt)
            : await callOpenRouter(selectedConfig, model, systemPrompt, userPrompt);
      const script = cleanGeneratedScript(rawScript);

      if (!script) {
        return {
          ok: false,
          code: "provider_error",
          message: "The provider did not return script text.",
        };
      }

      return {
        ok: true,
        script,
        provider: selectedConfig.provider,
        model,
        usedUrl: url || null,
      };
    } catch (error) {
      return {
        ok: false,
        code: "provider_error",
        message: error instanceof Error ? error.message : "The provider could not generate a script.",
      };
    }
  },
});

export const rewriteForRsvp = action({
  args: {
    input: v.string(),
    provider: providerValidator,
    modelOverride: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<RewriteResult> => {
    const ownerId = await getAuthUserId(ctx);
    const input = args.input.trim();

    if (!ownerId) {
      return {
        ok: false,
        code: "missing_setup",
        message: "Sign in with GitHub and add your API keys before using AI RSVP rewrite.",
      };
    }

    if (!input) {
      return {
        ok: false,
        code: "invalid_input",
        message: "Add script text before using the RSVP rewrite.",
      };
    }

    const keys: StoredUserApiKey[] = await ctx.runQuery(internal.userApiKeys.getForCurrentUser, {});
    const configuredProviders = getConfiguredProviders(keys);
    if (configuredProviders.length === 0) {
      return {
        ok: false,
        code: "missing_setup",
        message: "Add an OpenAI, Claude, or OpenRouter API key in Build settings.",
      };
    }

    const selectedConfig =
      args.provider === "auto"
        ? configuredProviders[0]
        : configuredProviders.find((config) => config.provider === args.provider);

    if (!selectedConfig) {
      return {
        ok: false,
        code: "missing_setup",
        message: "Add that provider API key in Build settings.",
      };
    }

    const model = args.modelOverride?.trim() || selectedConfig.model;
    const systemPrompt = getRsvpSystemPrompt();
    const userPrompt = `Rewrite this script for RSVP one-word-at-a-time reading:\n\n${truncateContext(input)}`;

    try {
      const rawScript =
        selectedConfig.provider === "openai"
          ? await callOpenAi(selectedConfig, model, systemPrompt, userPrompt)
          : selectedConfig.provider === "claude"
            ? await callClaude(selectedConfig, model, systemPrompt, userPrompt)
            : await callOpenRouter(selectedConfig, model, systemPrompt, userPrompt);
      const script = cleanGeneratedScript(rawScript);

      if (!script) {
        return {
          ok: false,
          code: "provider_error",
          message: "The provider did not return rewritten script text.",
        };
      }

      return {
        ok: true,
        script,
        provider: selectedConfig.provider,
        model,
      };
    } catch (error) {
      return {
        ok: false,
        code: "provider_error",
        message: error instanceof Error ? error.message : "The provider could not rewrite the script.",
      };
    }
  },
});
