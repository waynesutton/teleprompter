import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { DEFAULT_SCRIPT_SYSTEM_PROMPT, trimSkillContext } from "./promptTemplates";

const MAX_USER_PROMPT_CHARS = 10000;

const normalizePrompt = (value: string) => value.trim().slice(0, MAX_USER_PROMPT_CHARS);

export const get = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return {
        isAuthenticated: false,
        defaultPrompt: DEFAULT_SCRIPT_SYSTEM_PROMPT,
        prompt: DEFAULT_SCRIPT_SYSTEM_PROMPT,
        hasCustomPrompt: false,
        skillSourceUrl: null,
        skillMarkdown: null,
        notes: null,
        updatedAt: null,
      };
    }

    const existing = await ctx.db
      .query("aiPromptSettings")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .unique();

    return {
      isAuthenticated: true,
      defaultPrompt: DEFAULT_SCRIPT_SYSTEM_PROMPT,
      prompt: existing?.prompt ?? DEFAULT_SCRIPT_SYSTEM_PROMPT,
      hasCustomPrompt: Boolean(existing),
      skillSourceUrl: existing?.skillSourceUrl ?? null,
      skillMarkdown: existing?.skillMarkdown ?? null,
      notes: existing?.notes ?? null,
      updatedAt: existing?.updatedAt ?? null,
    };
  },
});

export const getForCurrentUser = internalQuery({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return null;
    }

    return await ctx.db
      .query("aiPromptSettings")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .unique();
  },
});

export const save = mutation({
  args: {
    prompt: v.string(),
    skillSourceUrl: v.optional(v.string()),
    skillMarkdown: v.optional(v.string()),
    notes: v.optional(v.string()),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return {
        ok: false,
        message: "Sign in with GitHub to save your script generator prompt.",
      };
    }

    const prompt = normalizePrompt(args.prompt);
    if (!prompt) {
      return {
        ok: false,
        message: "Add prompt rules before saving.",
      };
    }

    const existing = await ctx.db
      .query("aiPromptSettings")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .unique();
    const nextSettings = {
      ownerId,
      prompt,
      skillSourceUrl: args.skillSourceUrl?.trim() || undefined,
      skillMarkdown: args.skillMarkdown ? trimSkillContext(args.skillMarkdown) : undefined,
      notes: args.notes?.trim() || undefined,
      updatedAt: args.updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, nextSettings);
      return {
        ok: true,
        message: "Script generator prompt saved.",
      };
    }

    await ctx.db.insert("aiPromptSettings", nextSettings);
    return {
      ok: true,
      message: "Script generator prompt saved.",
    };
  },
});

export const reset = mutation({
  args: {
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return {
        ok: false,
        message: "Sign in with GitHub to reset your script generator prompt.",
      };
    }

    const existing = await ctx.db
      .query("aiPromptSettings")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .unique();

    if (!existing) {
      return {
        ok: true,
        message: "Default script generator prompt is already active.",
      };
    }

    void args.updatedAt;
    await ctx.db.delete(existing._id);

    return {
      ok: true,
      message: "Script generator prompt reset to the app default.",
    };
  },
});

export const saveImportedSkill = internalMutation({
  args: {
    skillSourceUrl: v.string(),
    skillMarkdown: v.string(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return null;
    }

    const existing = await ctx.db
      .query("aiPromptSettings")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .unique();
    const skillMarkdown = trimSkillContext(args.skillMarkdown);

    if (existing) {
      await ctx.db.patch(existing._id, {
        skillSourceUrl: args.skillSourceUrl.trim(),
        skillMarkdown,
        updatedAt: args.updatedAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("aiPromptSettings", {
      ownerId,
      prompt: DEFAULT_SCRIPT_SYSTEM_PROMPT,
      skillSourceUrl: args.skillSourceUrl.trim(),
      skillMarkdown,
      updatedAt: args.updatedAt,
    });
  },
});
