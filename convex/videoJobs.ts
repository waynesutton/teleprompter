import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const VIDEO_JOB_LIMIT = 40;

const sourceTypeValidator = v.union(v.literal("prompt"), v.literal("url"), v.literal("script"), v.literal("mixed"));
const aspectRatioValidator = v.union(v.literal("16:9"), v.literal("9:16"), v.literal("1:1"));
const qualityValidator = v.union(v.literal("draft"), v.literal("standard"), v.literal("high"));

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
  handler: async (ctx) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return null;
    }

    // Video creation is disabled while the Video tab and sandbox execution are hidden.
    return null;
  },
});
