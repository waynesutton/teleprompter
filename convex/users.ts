import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

type DeletableDoc = {
  _id:
    | Id<"prompts">
    | Id<"defaultSettings">
    | Id<"savedScripts">
    | Id<"scriptVoiceProfiles">
    | Id<"userApiKeys">
    | Id<"aiPromptSettings">
    | Id<"buildItems">
    | Id<"videoJobs">
    | Id<"authAccounts">
    | Id<"authSessions">
    | Id<"authRefreshTokens">
    | Id<"authVerificationCodes">;
};

const deleteDocs = async (ctx: MutationCtx, ids: DeletableDoc[]) => {
  for (const doc of ids) {
    await ctx.db.delete(doc._id);
  }
};

export const getViewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      name: user.name ?? null,
      email: user.email ?? null,
      image: user.image ?? null,
    };
  },
});

export const deleteCurrentAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return { ok: false, message: "Sign in before deleting an account.", deletedCount: 0 };
    }

    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .collect();
    const defaultSettings = await ctx.db
      .query("defaultSettings")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .collect();
    const savedScripts = await ctx.db
      .query("savedScripts")
      .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
      .collect();
    const scriptVoiceProfiles = await ctx.db
      .query("scriptVoiceProfiles")
      .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
      .collect();
    const userApiKeys = await ctx.db
      .query("userApiKeys")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .collect();
    const aiPromptSettings = await ctx.db
      .query("aiPromptSettings")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .collect();
    const buildItems = await ctx.db
      .query("buildItems")
      .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
      .collect();
    const videoJobs = await ctx.db
      .query("videoJobs")
      .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
      .collect();
    const authAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", ownerId))
      .collect();
    const authSessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", ownerId))
      .collect();

    let deletedCount = 0;

    for (const account of authAccounts) {
      const verificationCodes = await ctx.db
        .query("authVerificationCodes")
        .withIndex("accountId", (q) => q.eq("accountId", account._id))
        .collect();
      await deleteDocs(ctx, verificationCodes);
      deletedCount += verificationCodes.length;
    }

    for (const session of authSessions) {
      const refreshTokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
        .collect();
      await deleteDocs(ctx, refreshTokens);
      deletedCount += refreshTokens.length;
    }

    for (const group of [prompts, defaultSettings, savedScripts, scriptVoiceProfiles, userApiKeys, aiPromptSettings, buildItems, videoJobs, authAccounts, authSessions]) {
      await deleteDocs(ctx, group);
      deletedCount += group.length;
    }

    await ctx.db.delete(ownerId);
    deletedCount += 1;

    return {
      ok: true,
      message: "Account and saved PromptDeck data deleted.",
      deletedCount,
    };
  },
});
