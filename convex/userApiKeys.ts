import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";

const serviceValidator = v.union(
  v.literal("openai"),
  v.literal("claude"),
  v.literal("openrouter"),
  v.literal("firecrawl"),
  v.literal("elevenlabs"),
);

const SERVICES = ["openai", "claude", "openrouter", "firecrawl", "elevenlabs"] as const;

export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return {
        isAuthenticated: false,
        keys: SERVICES.map((service) => ({
          service,
          isConfigured: false,
          model: null,
          siteUrl: null,
          appName: null,
        })),
      };
    }

    const keys = await ctx.db
      .query("userApiKeys")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .collect();

    return {
      isAuthenticated: true,
      keys: SERVICES.map((service) => {
        const key = keys.find((entry) => entry.service === service);

        return {
          service,
          isConfigured: Boolean(key),
          model: key?.model ?? null,
          siteUrl: key?.siteUrl ?? null,
          appName: key?.appName ?? null,
        };
      }),
    };
  },
});

export const getForCurrentUser = internalQuery({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return [];
    }

    return await ctx.db
      .query("userApiKeys")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .collect();
  },
});

export const saveEncrypted = internalMutation({
  args: {
    service: serviceValidator,
    encryptedKey: v.string(),
    iv: v.string(),
    tag: v.string(),
    model: v.optional(v.string()),
    siteUrl: v.optional(v.string()),
    appName: v.optional(v.string()),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return null;
    }

    const existing = await ctx.db
      .query("userApiKeys")
      .withIndex("by_ownerId_and_service", (q) => q.eq("ownerId", ownerId).eq("service", args.service))
      .unique();
    const nextKey = {
      ownerId,
      service: args.service,
      encryptedKey: args.encryptedKey,
      iv: args.iv,
      tag: args.tag,
      model: args.model?.trim() || undefined,
      siteUrl: args.siteUrl?.trim() || undefined,
      appName: args.appName?.trim() || undefined,
      updatedAt: args.updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, nextKey);
      return existing._id;
    }

    return await ctx.db.insert("userApiKeys", nextKey);
  },
});

export const remove = mutation({
  args: {
    service: serviceValidator,
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return false;
    }

    const existing = await ctx.db
      .query("userApiKeys")
      .withIndex("by_ownerId_and_service", (q) => q.eq("ownerId", ownerId).eq("service", args.service))
      .unique();

    if (!existing) {
      return false;
    }

    await ctx.db.delete(existing._id);
    return true;
  },
});
