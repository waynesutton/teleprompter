import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const LOCAL_PROMPT_KEY = "local-main";
const DEFAULT_SETTINGS_KEY = "shared-defaults";
const SAVED_SCRIPT_LIMIT = 50;

const colorValidator = v.union(v.literal("white"), v.literal("red"), v.literal("yellow"), v.literal("grey"), v.literal("darkgrey"));
const fontFamilyValidator = v.union(v.literal("system"), v.literal("promptdeck"), v.literal("lexend"), v.literal("opendyslexic"));
const layoutModeValidator = v.union(v.literal("left"), v.literal("centered"));
const backgroundModeValidator = v.union(v.literal("black"), v.literal("spotlight"), v.literal("white"));
const PROMPT_FONTS = ["system", "promptdeck", "lexend", "opendyslexic"] as const;
type PromptFont = (typeof PROMPT_FONTS)[number];

const DEFAULT_PROMPT = {
  script: `Welcome to PromptDeck.

PromptDeck helps you write, organize, generate, and read scripts in the browser.
It also gives you an agent AI workflow for turning notes, links, docs, or prompts into stronger scripts.

Start in Script when you want to draft by hand.
Move to Build when you want agent-style help turning notes, links, or ideas into a stronger script.

[pause]

AI is optional.
The prompter works without login.

If you sign in, you can save scripts, create your own writing tones, add your own keys, and keep scripts private to your account.

[pause]

Use page breaks when you want a cleaner pace.
Use RSVP when you want one word at a time.
Use Mini View when you need a compact recording window.

The goal is simple:
write the script, shape it with help when you need it, and deliver without distractions.

Let's record.`,
  fontSize: 56,
  speed: 36,
  speedMultiplier: 1,
  scroll: 0,
  mirrored: false,
  guide: false,
  fitToWindow: false,
  textColor: "white" as const,
  fontFamily: "system" as const,
  layoutMode: "left" as const,
  backgroundMode: "black" as const,
};

const DEFAULT_SCRIPT_SETTINGS = {
  fontSize: DEFAULT_PROMPT.fontSize,
  speed: DEFAULT_PROMPT.speed,
  speedMultiplier: DEFAULT_PROMPT.speedMultiplier,
  textColor: DEFAULT_PROMPT.textColor,
  fontFamily: DEFAULT_PROMPT.fontFamily,
  layoutMode: DEFAULT_PROMPT.layoutMode,
  backgroundMode: DEFAULT_PROMPT.backgroundMode,
  guide: DEFAULT_PROMPT.guide,
  fitToWindow: DEFAULT_PROMPT.fitToWindow,
};

const normalizeTitle = (title: string) => title.trim().replace(/\s+/g, " ");

const getCanonicalTitle = (title: string) => normalizeTitle(title).toLowerCase();

const normalizeFolder = (folder: string) => folder.trim().replace(/\s+/g, " ");

const getCanonicalFolder = (folder: string) => normalizeFolder(folder).toLowerCase();

const normalizePromptFont = (fontFamily: string | undefined): PromptFont => {
  if (PROMPT_FONTS.some((font) => font === fontFamily)) {
    return fontFamily as PromptFont;
  }

  return DEFAULT_PROMPT.fontFamily;
};

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return null;
    }

    const prompt = await ctx.db
      .query("prompts")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .unique();

    if (!prompt) {
      return { ...DEFAULT_PROMPT, key: LOCAL_PROMPT_KEY, updatedAt: 0 };
    }

    return {
      ...prompt,
      speedMultiplier: prompt.speedMultiplier ?? DEFAULT_PROMPT.speedMultiplier,
      fitToWindow: prompt.fitToWindow ?? DEFAULT_PROMPT.fitToWindow,
      textColor: prompt.textColor ?? DEFAULT_PROMPT.textColor,
      fontFamily: normalizePromptFont(prompt.fontFamily),
      layoutMode: prompt.layoutMode ?? DEFAULT_PROMPT.layoutMode,
      backgroundMode: prompt.backgroundMode ?? DEFAULT_PROMPT.backgroundMode,
    };
  },
});

export const getDefaultSettings = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return null;
    }

    const settings = await ctx.db
      .query("defaultSettings")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .unique();

    if (!settings) {
      return { ...DEFAULT_SCRIPT_SETTINGS, key: DEFAULT_SETTINGS_KEY, updatedAt: 0 };
    }

    return {
      ...settings,
      fontFamily: normalizePromptFont(settings.fontFamily),
      backgroundMode: settings.backgroundMode ?? DEFAULT_SCRIPT_SETTINGS.backgroundMode,
    };
  },
});

export const listSavedScripts = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return [];
    }

    return await ctx.db
      .query("savedScripts")
      .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(SAVED_SCRIPT_LIMIT);
  },
});

export const save = mutation({
  args: {
    script: v.string(),
    fontSize: v.number(),
    speed: v.number(),
    speedMultiplier: v.number(),
    scroll: v.number(),
    mirrored: v.boolean(),
    guide: v.boolean(),
    fitToWindow: v.boolean(),
    textColor: colorValidator,
    fontFamily: fontFamilyValidator,
    layoutMode: layoutModeValidator,
    backgroundMode: backgroundModeValidator,
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return null;
    }

    const prompt = await ctx.db
      .query("prompts")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .unique();

    if (
      prompt &&
      prompt.script === args.script &&
      prompt.fontSize === args.fontSize &&
      prompt.speed === args.speed &&
      (prompt.speedMultiplier ?? DEFAULT_PROMPT.speedMultiplier) === args.speedMultiplier &&
      prompt.scroll === args.scroll &&
      prompt.mirrored === args.mirrored &&
      prompt.guide === args.guide &&
      (prompt.fitToWindow ?? DEFAULT_PROMPT.fitToWindow) === args.fitToWindow &&
      (prompt.textColor ?? DEFAULT_PROMPT.textColor) === args.textColor &&
      (prompt.fontFamily ?? DEFAULT_PROMPT.fontFamily) === args.fontFamily &&
      (prompt.layoutMode ?? DEFAULT_PROMPT.layoutMode) === args.layoutMode &&
      (prompt.backgroundMode ?? DEFAULT_PROMPT.backgroundMode) === args.backgroundMode
    ) {
      return prompt._id;
    }

    if (prompt) {
      await ctx.db.patch(prompt._id, args);
      return prompt._id;
    }

    return await ctx.db.insert("prompts", {
      key: LOCAL_PROMPT_KEY,
      ownerId,
      ...args,
    });
  },
});

export const saveDefaultSettings = mutation({
  args: {
    fontSize: v.number(),
    speed: v.number(),
    speedMultiplier: v.number(),
    textColor: colorValidator,
    fontFamily: fontFamilyValidator,
    layoutMode: layoutModeValidator,
    backgroundMode: backgroundModeValidator,
    guide: v.boolean(),
    fitToWindow: v.boolean(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return null;
    }

    const existing = await ctx.db
      .query("defaultSettings")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .unique();

    if (
      existing &&
      existing.fontSize === args.fontSize &&
      existing.speed === args.speed &&
      existing.speedMultiplier === args.speedMultiplier &&
      existing.textColor === args.textColor &&
      existing.fontFamily === args.fontFamily &&
      existing.layoutMode === args.layoutMode &&
      (existing.backgroundMode ?? DEFAULT_PROMPT.backgroundMode) === args.backgroundMode &&
      existing.guide === args.guide &&
      existing.fitToWindow === args.fitToWindow
    ) {
      return existing._id;
    }

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("defaultSettings", {
      key: DEFAULT_SETTINGS_KEY,
      ownerId,
      ...args,
    });
  },
});

export const saveSharedScript = mutation({
  args: {
    title: v.string(),
    folder: v.optional(v.string()),
    script: v.string(),
    expectedScriptId: v.optional(v.id("savedScripts")),
    saveAs: v.optional(v.boolean()),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return null;
    }

    const title = normalizeTitle(args.title);
    const folder = normalizeFolder(args.folder ?? "");
    const script = args.script.trim();

    if (!title || !script) {
      return { status: "invalid" as const };
    }

    const canonicalTitle = getCanonicalTitle(title);
    const canonicalFolder = getCanonicalFolder(folder);
    const matchingTitleScripts = await ctx.db
      .query("savedScripts")
      .withIndex("by_ownerId_and_canonicalTitle", (q) => q.eq("ownerId", ownerId).eq("canonicalTitle", canonicalTitle))
      .collect();
    const existing = matchingTitleScripts.find(
      (savedScript) => (savedScript.canonicalFolder ?? "") === canonicalFolder,
    );
    const ownedScripts = args.expectedScriptId
      ? await ctx.db
          .query("savedScripts")
          .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
          .collect()
      : [];
    const expectedScript = args.expectedScriptId
      ? ownedScripts.find((savedScript) => savedScript._id === args.expectedScriptId)
      : null;

    if (args.expectedScriptId && !expectedScript) {
      return { status: "missing" as const };
    }

    if (args.saveAs && existing) {
      return {
        status: "conflict" as const,
        existingTitle: existing.title,
        existingFolder: existing.folder ?? "",
      };
    }

    if (
      existing &&
      existing.title === title &&
      (existing.folder ?? "") === folder &&
      existing.script === script
    ) {
      return { status: "saved" as const, scriptId: existing._id };
    }

    if (existing && existing._id !== args.expectedScriptId) {
      return {
        status: "conflict" as const,
        existingTitle: existing.title,
        existingFolder: existing.folder ?? "",
      };
    }

    if (expectedScript) {
      await ctx.db.patch(expectedScript._id, {
        title,
        folder: folder || undefined,
        canonicalFolder: canonicalFolder || undefined,
        canonicalTitle,
        script,
        updatedAt: args.updatedAt,
      });
      return { status: "saved" as const, scriptId: expectedScript._id };
    }

    const scriptId = await ctx.db.insert("savedScripts", {
      ownerId,
      canonicalTitle,
      folder: folder || undefined,
      canonicalFolder: canonicalFolder || undefined,
      title,
      script,
      createdAt: args.updatedAt,
      updatedAt: args.updatedAt,
    });

    return { status: "created" as const, scriptId };
  },
});

export const deleteSharedScript = mutation({
  args: {
    scriptId: v.id("savedScripts"),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    if (!ownerId) {
      return false;
    }

    const existing = await ctx.db.get(args.scriptId);

    if (!existing || existing.ownerId !== ownerId) {
      return false;
    }

    await ctx.db.delete(args.scriptId);
    return true;
  },
});
