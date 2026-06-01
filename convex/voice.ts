import { action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

type StoredUserApiKey = {
  service: "openai" | "claude" | "openrouter" | "firecrawl" | "elevenlabs";
};

type VoiceStatusResult = {
  isAuthenticated: boolean;
  isConfigured: boolean;
  provider: string;
};

export const getVoiceStatus = action({
  args: {},
  handler: async (ctx): Promise<VoiceStatusResult> => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return {
        isAuthenticated: false,
        isConfigured: false,
        provider: "ElevenLabs",
      };
    }

    const keys: StoredUserApiKey[] = await ctx.runQuery(internal.userApiKeys.getForCurrentUser, {});

    return {
      isAuthenticated: true,
      isConfigured: Boolean(keys.find((key) => key.service === "elevenlabs")),
      provider: "ElevenLabs",
    };
  },
});
