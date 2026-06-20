import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

const VIDEO_JOB_LIMIT = 40;

const sourceTypeValidator = v.union(v.literal("prompt"), v.literal("url"), v.literal("script"), v.literal("mixed"));
const aspectRatioValidator = v.union(v.literal("16:9"), v.literal("9:16"), v.literal("1:1"));
const qualityValidator = v.union(v.literal("draft"), v.literal("standard"), v.literal("high"));

const cleanOptional = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const hasUserKey = async (
  ctx: MutationCtx,
  ownerId: Id<"users">,
  service: "openai" | "claude" | "openrouter" | "firecrawl" | "heygen",
) => {
  const key = await ctx.db
    .query("userApiKeys")
    .withIndex("by_ownerId_and_service", (q) => q.eq("ownerId", ownerId).eq("service", service))
    .unique();

  return Boolean(key);
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return [];
    }

    return await ctx.db
      .query("videoJobs")
      .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(VIDEO_JOB_LIMIT);
  },
});

export const create = mutation({
  args: {
    sourceType: sourceTypeValidator,
    title: v.string(),
    prompt: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    scriptText: v.optional(v.string()),
    designInstructions: v.optional(v.string()),
    designUrl: v.optional(v.string()),
    voiceProfileId: v.optional(v.string()),
    voiceProfileName: v.optional(v.string()),
    aspectRatio: aspectRatioValidator,
    durationSeconds: v.number(),
    quality: qualityValidator,
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return null;
    }

    const title = args.title.trim().replace(/\s+/g, " ");
    const prompt = cleanOptional(args.prompt);
    const sourceUrl = cleanOptional(args.sourceUrl);
    const scriptText = cleanOptional(args.scriptText);
    const designInstructions = cleanOptional(args.designInstructions);
    const designUrl = cleanOptional(args.designUrl);

    if (!title || (!prompt && !sourceUrl && !scriptText)) {
      return null;
    }

    const [hasOpenAi, hasClaude, hasOpenRouter, hasFirecrawl, hasHeygen] = await Promise.all([
      hasUserKey(ctx, ownerId, "openai"),
      hasUserKey(ctx, ownerId, "claude"),
      hasUserKey(ctx, ownerId, "openrouter"),
      hasUserKey(ctx, ownerId, "firecrawl"),
      hasUserKey(ctx, ownerId, "heygen"),
    ]);
    const hasAiProvider = hasOpenAi || hasClaude || hasOpenRouter;
    const needsFirecrawl = Boolean(sourceUrl || designUrl);

    if (!hasAiProvider || !hasHeygen || (needsFirecrawl && !hasFirecrawl)) {
      return null;
    }

    return await ctx.db.insert("videoJobs", {
      ownerId,
      status: "queued",
      sourceType: args.sourceType,
      title,
      prompt,
      sourceUrl,
      scriptText,
      designInstructions,
      designUrl,
      voiceProfileId: cleanOptional(args.voiceProfileId),
      voiceProfileName: cleanOptional(args.voiceProfileName),
      aspectRatio: args.aspectRatio,
      durationSeconds: Math.max(15, Math.min(900, Math.round(args.durationSeconds))),
      quality: args.quality,
      progress: 0,
      message: "Queued with the user's HeyGen / HyperFrames key. Connect the renderer to author and render this job.",
      createdAt: args.updatedAt,
      updatedAt: args.updatedAt,
    });
  },
});
