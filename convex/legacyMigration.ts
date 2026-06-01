import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";

const getEnv = (key: string) => process.env[key]?.trim() ?? "";

export const claimLegacySharedData = mutation({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return { ok: false, claimed: 0, message: "Sign in before claiming legacy shared data." };
    }

    const user = await ctx.db.get(ownerId);
    const legacyEmail = getEnv("LEGACY_OWNER_EMAIL").toLowerCase();
    const legacyName = getEnv("LEGACY_OWNER_GITHUB_LOGIN").toLowerCase();
    const userEmail = (user?.email ?? "").toLowerCase();
    const userName = (user?.name ?? "").toLowerCase();
    const isLegacyOwner = Boolean((legacyEmail && userEmail === legacyEmail) || (legacyName && userName === legacyName));

    if (!isLegacyOwner) {
      return { ok: false, claimed: 0, message: "This account is not configured as the legacy data owner." };
    }

    const [scripts, voices, prompts, defaults] = await Promise.all([
      ctx.db.query("savedScripts").withIndex("by_updatedAt").collect(),
      ctx.db.query("scriptVoiceProfiles").withIndex("by_updatedAt").collect(),
      ctx.db.query("prompts").withIndex("by_key").collect(),
      ctx.db.query("defaultSettings").withIndex("by_key").collect(),
    ]);
    let claimed = 0;

    for (const script of scripts.filter((item) => !item.ownerId)) {
      await ctx.db.patch(script._id, { ownerId });
      claimed += 1;
    }

    for (const voice of voices.filter((item) => !item.ownerId)) {
      await ctx.db.patch(voice._id, { ownerId });
      claimed += 1;
    }

    for (const prompt of prompts.filter((item) => !item.ownerId)) {
      await ctx.db.patch(prompt._id, { ownerId });
      claimed += 1;
    }

    for (const setting of defaults.filter((item) => !item.ownerId)) {
      await ctx.db.patch(setting._id, { ownerId });
      claimed += 1;
    }

    return { ok: true, claimed, message: `Claimed ${claimed} legacy record${claimed === 1 ? "" : "s"}.` };
  },
});
