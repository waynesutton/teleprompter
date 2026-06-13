Created: 2026-06-12 19:37 UTC
Last Updated: 2026-06-12 20:56 UTC
Status: Done

# Video Project Builder

## Problem

The Build tab can save script and video notes, but it does not yet support the text-first video workflow shown by `browser-use/video-use`: transcript-first editing, strategy confirmation, EDL JSON, subtitle planning, render checklist, and persistent project memory.

## Root Cause

Build items only store a broad source, script snapshot, video brief, and notes. That is enough for planning a video concept, but not enough to make video editing readable, reviewable, or repeatable.

## Proposed Solution

- Extend Build items with optional Video Project fields:
  - transcript reading view
  - edit strategy
  - EDL JSON
  - subtitle style
  - render checklist
  - project memory
  - output format
- Add a Video Project Builder panel in Build.
- Add a local "Draft Video Project" action that turns the current script/build form into a structured project plan without requiring AI.
- Keep rendering future-facing and honest: no browser-side ffmpeg render in this version.
- Update Build library cards to show Video Project readiness.

## Files To Change

- `convex/schema.ts`
- `convex/buildItems.ts`
- `src/App.tsx`
- `src/styles.css`
- `changelog.md`
- `files.md`
- `task.md`

## Edge Cases

- Logged-out users can draft locally but must sign in to save.
- Existing Build items have no Video Project fields and must continue rendering normally.
- EDL is stored as text so users can paste/edit JSON even before render workers exist.
- Long transcripts should be user-managed for now; future versions should split transcript artifacts into child rows or storage.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-12 20:56 UTC - Added optional Build item video project fields in Convex, wired save/edit support, added the Build tab Video Project Builder UI, added local draft generation for transcript/strategy/EDL/checklist/memory, added readiness chips on saved cards, updated docs, and verified with local checks.
