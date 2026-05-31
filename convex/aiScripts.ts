import { action } from "./_generated/server";
import { v } from "convex/values";

const providerValidator = v.union(
  v.literal("auto"),
  v.literal("openai"),
  v.literal("claude"),
  v.literal("openrouter"),
);
const lengthValidator = v.union(v.literal("short"), v.literal("long"), v.literal("open"));

type Provider = "openai" | "claude" | "openrouter";
type GenerationLength = "short" | "long" | "open";

type ProviderConfig = {
  provider: Provider;
  label: string;
  apiKey: string;
  model: string;
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

const MAX_CONTEXT_CHARS = 12000;

const getEnv = (key: string) => process.env[key]?.trim() ?? "";

const getConfiguredProviders = (): ProviderConfig[] => {
  const providers: ProviderConfig[] = [];

  const openAiModel = getEnv("OPENAI_SCRIPT_MODEL");
  if (getEnv("OPENAI_API_KEY") && openAiModel) {
    providers.push({
      provider: "openai",
      label: "OpenAI",
      apiKey: getEnv("OPENAI_API_KEY"),
      model: openAiModel,
    });
  }

  const anthropicModel = getEnv("ANTHROPIC_SCRIPT_MODEL");
  if (getEnv("ANTHROPIC_API_KEY") && anthropicModel) {
    providers.push({
      provider: "claude",
      label: "Claude",
      apiKey: getEnv("ANTHROPIC_API_KEY"),
      model: anthropicModel,
    });
  }

  const openRouterModel = getEnv("OPENROUTER_SCRIPT_MODEL");
  if (getEnv("OPENROUTER_API_KEY") && openRouterModel) {
    providers.push({
      provider: "openrouter",
      label: "OpenRouter",
      apiKey: getEnv("OPENROUTER_API_KEY"),
      model: openRouterModel,
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

const getLengthInstruction = (length: GenerationLength) => {
  if (length === "short") {
    return "Target roughly 180 to 390 words for a 1 to 3 minute spoken script.";
  }

  if (length === "long") {
    return "Target roughly 650 to 850 words for a 5 minute or longer spoken script.";
  }

  return "Choose the right length for the source and topic. Do not pad.";
};

const getSystemPrompt = (length: GenerationLength, instructions: string) => `You write teleprompter scripts for one specific viewer.

Rules:
- Solve one clear problem for that viewer.
- Use spoken, camera-ready language.
- Keep sentences easy to read out loud.
- Avoid hype and AI-style phrasing.
- Do not use these words: delve, intricate, pivotal, comprehensive, multifaceted, facilitate, encompass, underscore, testament, notably, crucial, realm, landscape, moreover, furthermore, additionally, specifically, importantly, consequently, therefore, thus, myriad, plethora, nuanced, holistic, leverage, synergy, seamless, empower, innovative, transformative, robust, dynamic, cutting-edge, next-gen, revolutionary, breakthrough, game changer, supercharge, unlock, groundbreaking, AI-powered.
- Output only the script body.
- Do not wrap the script in code fences.
- Use --- page breaks when helpful.
- Use short bracketed direction notes sparingly, like [pause].

Length:
${getLengthInstruction(length)}

User style notes:
${instructions.trim() || "Use a clear, direct, human voice."}`;

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

const scrapeUrl = async (url: string) => {
  const firecrawlApiKey = getEnv("FIRECRAWL_API_KEY");
  if (!firecrawlApiKey) {
    return {
      ok: false as const,
      message: "These options are not setup. Contact the app creator to config.",
    };
  }

  const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firecrawlApiKey}`,
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
  const siteUrl = getEnv("OPENROUTER_SITE_URL");
  const appName = getEnv("OPENROUTER_APP_NAME");

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
  handler: async () => {
    return {
      providers: getConfiguredProviders().map(({ provider, label, model }) => ({
        provider,
        label,
        model,
      })),
      hasFirecrawl: Boolean(getEnv("FIRECRAWL_API_KEY")),
    };
  },
});

export const generateScript = action({
  args: {
    input: v.string(),
    provider: providerValidator,
    modelOverride: v.optional(v.string()),
    length: lengthValidator,
    instructions: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<GenerateResult> => {
    const input = args.input.trim();
    if (!input) {
      return {
        ok: false,
        code: "invalid_input",
        message: "Add a topic, notes, URL, or markdown link before generating.",
      };
    }

    const configuredProviders = getConfiguredProviders();
    if (configuredProviders.length === 0) {
      return {
        ok: false,
        code: "missing_setup",
        message: "These options are not setup. Contact the app creator to config.",
      };
    }

    const url = getFirstUrl(input);
    const scraped = url ? await scrapeUrl(url) : null;

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
        message: "These options are not setup. Contact the app creator to config.",
      };
    }

    const model = args.modelOverride?.trim() || selectedConfig.model;
    const systemPrompt = getSystemPrompt(args.length, args.instructions ?? "");
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
