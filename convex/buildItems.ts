import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const BUILD_ITEM_LIMIT = 60;

const kindValidator = v.union(v.literal("script"), v.literal("video"), v.literal("both"));
const statusValidator = v.union(v.literal("active"), v.literal("archived"));
const sourceTypeValidator = v.union(v.literal("prompt"), v.literal("link"), v.literal("doc"), v.literal("script"), v.literal("mixed"));

const cleanOptional = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const list = query({
  args: {
    status: v.optional(v.union(statusValidator, v.literal("all"))),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return [];
    }

    const status = args.status;

    if (!status || status === "all") {
      return await ctx.db
        .query("buildItems")
        .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
        .order("desc")
        .take(BUILD_ITEM_LIMIT);
    }

    return await ctx.db
      .query("buildItems")
      .withIndex("by_ownerId_and_status_and_updatedAt", (q) => q.eq("ownerId", ownerId).eq("status", status))
      .order("desc")
      .take(BUILD_ITEM_LIMIT);
  },
});

export const save = mutation({
  args: {
    itemId: v.optional(v.id("buildItems")),
    kind: kindValidator,
    sourceType: sourceTypeValidator,
    title: v.string(),
    sourceText: v.optional(v.string()),
    scriptSnapshot: v.optional(v.string()),
    videoBrief: v.optional(v.string()),
    notes: v.optional(v.string()),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return null;
    }

    const title = args.title.trim().replace(/\s+/g, " ");
    if (!title) {
      return null;
    }

    const nextItem = {
      kind: args.kind,
      sourceType: args.sourceType,
      title,
      sourceText: cleanOptional(args.sourceText),
      scriptSnapshot: cleanOptional(args.scriptSnapshot),
      videoBrief: cleanOptional(args.videoBrief),
      notes: cleanOptional(args.notes),
      updatedAt: args.updatedAt,
    };

    if (args.itemId) {
      const existing = await ctx.db
        .query("buildItems")
        .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
        .filter((q) => q.eq(q.field("_id"), args.itemId))
        .unique();

      if (!existing) {
        return null;
      }

      await ctx.db.patch(existing._id, nextItem);
      return existing._id;
    }

    return await ctx.db.insert("buildItems", {
      ownerId,
      status: "active",
      createdAt: args.updatedAt,
      ...nextItem,
    });
  },
});

export const setStatus = mutation({
  args: {
    itemId: v.id("buildItems"),
    status: statusValidator,
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return false;
    }

    const existing = await ctx.db
      .query("buildItems")
      .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
      .filter((q) => q.eq(q.field("_id"), args.itemId))
      .unique();

    if (!existing || existing.status === args.status) {
      return Boolean(existing);
    }

    await ctx.db.patch(
      existing._id,
      args.status === "archived"
        ? {
            status: args.status,
            archivedAt: args.updatedAt,
            updatedAt: args.updatedAt,
          }
        : {
            status: args.status,
            updatedAt: args.updatedAt,
          },
    );

    return true;
  },
});

export const remove = mutation({
  args: {
    itemId: v.id("buildItems"),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return false;
    }

    const existing = await ctx.db
      .query("buildItems")
      .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
      .filter((q) => q.eq(q.field("_id"), args.itemId))
      .unique();

    if (!existing) {
      return false;
    }

    await ctx.db.delete(existing._id);
    return true;
  },
});
