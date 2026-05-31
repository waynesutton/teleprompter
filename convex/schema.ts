import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  prompts: defineTable({
    key: v.string(),
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
  }).index("by_key", ["key"]),
  defaultSettings: defineTable({
    key: v.string(),
    fontSize: v.number(),
    speed: v.number(),
    speedMultiplier: v.number(),
    textColor: v.union(v.literal("white"), v.literal("red"), v.literal("yellow"), v.literal("grey"), v.literal("darkgrey")),
    fontFamily: v.union(v.literal("system"), v.literal("graphite"), v.literal("lexend"), v.literal("opendyslexic")),
    layoutMode: v.union(v.literal("left"), v.literal("centered")),
    guide: v.boolean(),
    fitToWindow: v.boolean(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
  savedScripts: defineTable({
    canonicalTitle: v.string(),
    canonicalFolder: v.optional(v.string()),
    folder: v.optional(v.string()),
    title: v.string(),
    script: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_canonicalTitle", ["canonicalTitle"])
    .index("by_updatedAt", ["updatedAt"]),
});
