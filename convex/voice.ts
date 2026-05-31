import { action } from "./_generated/server";

const getEnv = (key: string) => process.env[key]?.trim() ?? "";

export const getVoiceStatus = action({
  args: {},
  handler: async () => {
    return {
      isConfigured: Boolean(getEnv("ELEVENLABS_API_KEY")),
      provider: "ElevenLabs",
    };
  },
});
