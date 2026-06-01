import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const SCRIPT_VOICE_PROFILE_LIMIT = 40;

const lengthValidator = v.union(v.literal("short"), v.literal("long"), v.literal("open"));

const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ");

const getCanonicalName = (name: string) => normalizeName(name).toLowerCase();

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return [];
    }

    return await ctx.db
      .query("scriptVoiceProfiles")
      .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(SCRIPT_VOICE_PROFILE_LIMIT);
  },
});

export const save = mutation({
  args: {
    name: v.string(),
    audience: v.string(),
    tone: v.string(),
    pacing: v.string(),
    bannedWords: v.string(),
    preferredPhrases: v.string(),
    examples: v.string(),
    structure: v.string(),
    defaultLength: lengthValidator,
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return null;
    }

    const name = normalizeName(args.name);
    const canonicalName = getCanonicalName(name);

    if (!name || !args.tone.trim()) {
      return null;
    }

    const existing = await ctx.db
      .query("scriptVoiceProfiles")
      .withIndex("by_ownerId_and_canonicalName", (q) => q.eq("ownerId", ownerId).eq("canonicalName", canonicalName))
      .unique();
    const nextProfile = {
      ownerId,
      canonicalName,
      name,
      audience: args.audience.trim(),
      tone: args.tone.trim(),
      pacing: args.pacing.trim(),
      bannedWords: args.bannedWords.trim(),
      preferredPhrases: args.preferredPhrases.trim(),
      examples: args.examples.trim(),
      structure: args.structure.trim(),
      defaultLength: args.defaultLength,
      updatedAt: args.updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, nextProfile);
      return existing._id;
    }

    return await ctx.db.insert("scriptVoiceProfiles", {
      ...nextProfile,
      createdAt: args.updatedAt,
    });
  },
});

export const remove = mutation({
  args: {
    profileId: v.id("scriptVoiceProfiles"),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return false;
    }

    const existing = await ctx.db.get(args.profileId);

    if (!existing || existing.ownerId !== ownerId) {
      return false;
    }

    await ctx.db.delete(args.profileId);
    return true;
  },
});
