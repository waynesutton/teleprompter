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
    fontFamily: v.optional(v.string()),
    layoutMode: v.optional(v.union(v.literal("left"), v.literal("centered"))),
    backgroundMode: v.optional(v.union(v.literal("black"), v.literal("spotlight"), v.literal("white"))),
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
    fontFamily: v.string(),
    layoutMode: v.union(v.literal("left"), v.literal("centered")),
    backgroundMode: v.optional(v.union(v.literal("black"), v.literal("spotlight"), v.literal("white"))),
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
      v.literal("r2"),
      v.literal("mux"),
      v.literal("heygen"),
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
  aiPromptSettings: defineTable({
    ownerId: v.id("users"),
    prompt: v.string(),
    skillSourceUrl: v.optional(v.string()),
    skillMarkdown: v.optional(v.string()),
    notes: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"]),
  buildItems: defineTable({
    ownerId: v.id("users"),
    kind: v.union(v.literal("script"), v.literal("video"), v.literal("both")),
    status: v.union(v.literal("active"), v.literal("archived")),
    sourceType: v.union(v.literal("prompt"), v.literal("link"), v.literal("doc"), v.literal("script"), v.literal("mixed")),
    title: v.string(),
    sourceText: v.optional(v.string()),
    scriptSnapshot: v.optional(v.string()),
    videoBrief: v.optional(v.string()),
    transcriptText: v.optional(v.string()),
    editPlan: v.optional(v.string()),
    edlJson: v.optional(v.string()),
    subtitleStyle: v.optional(v.string()),
    renderChecklist: v.optional(v.string()),
    projectMemory: v.optional(v.string()),
    outputFormat: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    archivedAt: v.optional(v.number()),
  })
    .index("by_ownerId_and_status_and_updatedAt", ["ownerId", "status", "updatedAt"])
    .index("by_ownerId_and_kind_and_status", ["ownerId", "kind", "status"])
    .index("by_ownerId_and_updatedAt", ["ownerId", "updatedAt"]),
  videoJobs: defineTable({
    ownerId: v.id("users"),
    status: v.union(
      v.literal("queued"),
      v.literal("authoring"),
      v.literal("authored"),
      v.literal("rendering"),
      v.literal("done"),
      v.literal("failed"),
    ),
    sourceType: v.union(v.literal("prompt"), v.literal("url"), v.literal("script"), v.literal("mixed")),
    title: v.string(),
    prompt: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    scriptText: v.optional(v.string()),
    designInstructions: v.optional(v.string()),
    designUrl: v.optional(v.string()),
    voiceProfileId: v.optional(v.string()),
    voiceProfileName: v.optional(v.string()),
    aspectRatio: v.union(v.literal("16:9"), v.literal("9:16"), v.literal("1:1")),
    durationSeconds: v.number(),
    quality: v.union(v.literal("draft"), v.literal("standard"), v.literal("high")),
    progress: v.number(),
    message: v.optional(v.string()),
    outputUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerId_and_updatedAt", ["ownerId", "updatedAt"])
    .index("by_ownerId_and_status_and_updatedAt", ["ownerId", "status", "updatedAt"]),
});
