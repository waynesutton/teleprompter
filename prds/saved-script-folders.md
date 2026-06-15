Created: 2026-05-31 04:50 UTC
Last Updated: 2026-05-31 04:55 UTC
Status: Done

# Saved Script Folders

## Problem

Tab 2 saved scripts are all in one shared list. As the library grows, users need a lightweight way to group scripts by custom folder names.

## Root Cause

Saved script documents only store title, script text, and timestamps. The editor UI has no folder field or folder filter.

## Proposed Solution

- Add optional folder metadata to saved scripts.
- Add a Folder input beside Script title in Tab 2.
- Add a Saved folder filter above the saved script selector.
- Keep existing scripts valid by treating missing folders as "No folder."
- Keep the UI aligned with the current PromptDeck styling.

## Files To Change

- `convex/schema.ts`
- `convex/teleprompter.ts`
- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Existing saved scripts should still load and delete.
- Saving the same title in a different folder should create a separate saved script.
- Empty folder input should save as no folder.
- Folder filtering should not lose the selected script unexpectedly.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npx convex dev --once`
- Static hosting deploy

## Task Completion Log

- 2026-05-31 04:55 UTC - Added optional folder fields to saved scripts and updated save/load behavior.
- 2026-05-31 04:55 UTC - Added Tab 2 Folder input, saved folder filter, and folder-aware saved script labels.
- 2026-05-31 04:55 UTC - Verified with `npm run typecheck`, `npm run lint`, `npm run build`, pushed Convex functions, and deployed static hosting.
