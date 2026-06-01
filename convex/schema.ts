import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  prompts: defineTable({
    key: v.string(),
    ownerId: v.optional(v.id("users")),
    script: v.string(),
    fontSize: v.number(),
    speed: v.number(),
    speedMultiplier: v.optional(v.number()),
    scroll: v.number(),
    mirrored: v.boolean(),
    guide: v.boolean(),
    fitToWindow: v.optional(v.boolean()),
    textColor: v.optional(
      v.union(v.literal("white"), v.literal("red"), v.literal("yellow"), v.literal("grey"), v.literal("darkgrey")),
    ),
    fontFamily: v.optional(v.union(v.literal("system"), v.literal("graphite"), v.literal("lexend"), v.literal("opendyslexic"))),
    layoutMode: v.optional(v.union(v.literal("left"), v.literal("centered"))),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_ownerId", ["ownerId"]),
  defaultSettings: defineTable({
    key: v.string(),
    ownerId: v.optional(v.id("users")),
    fontSize: v.number(),
    speed: v.number(),
    speedMultiplier: v.number(),
    textColor: v.union(v.literal("white"), v.literal("red"), v.literal("yellow"), v.literal("grey"), v.literal("darkgrey")),
    fontFamily: v.union(v.literal("system"), v.literal("graphite"), v.literal("lexend"), v.literal("opendyslexic")),
    layoutMode: v.union(v.literal("left"), v.literal("centered")),
    guide: v.boolean(),
    fitToWindow: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_ownerId", ["ownerId"]),
  savedScripts: defineTable({
    ownerId: v.optional(v.id("users")),
    canonicalTitle: v.string(),
    canonicalFolder: v.optional(v.string()),
    folder: v.optional(v.string()),
    title: v.string(),
    script: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_canonicalTitle", ["canonicalTitle"])
    .index("by_updatedAt", ["updatedAt"])
    .index("by_ownerId_and_updatedAt", ["ownerId", "updatedAt"])
    .index("by_ownerId_and_canonicalTitle", ["ownerId", "canonicalTitle"]),
  scriptVoiceProfiles: defineTable({
    ownerId: v.optional(v.id("users")),
    canonicalName: v.string(),
    name: v.string(),
    audience: v.string(),
    tone: v.string(),
    pacing: v.string(),
    bannedWords: v.string(),
    preferredPhrases: v.string(),
    examples: v.string(),
    structure: v.string(),
    defaultLength: v.union(v.literal("short"), v.literal("long"), v.literal("open")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_canonicalName", ["canonicalName"])
    .index("by_updatedAt", ["updatedAt"])
    .index("by_ownerId_and_updatedAt", ["ownerId", "updatedAt"])
    .index("by_ownerId_and_canonicalName", ["ownerId", "canonicalName"]),
  userApiKeys: defineTable({
    ownerId: v.id("users"),
    service: v.union(
      v.literal("openai"),
      v.literal("claude"),
      v.literal("openrouter"),
      v.literal("firecrawl"),
      v.literal("elevenlabs"),
    ),
    encryptedKey: v.string(),
    iv: v.string(),
    tag: v.string(),
    model: v.optional(v.string()),
    siteUrl: v.optional(v.string()),
    appName: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_ownerId_and_service", ["ownerId", "service"])
    .index("by_ownerId", ["ownerId"]),
});
