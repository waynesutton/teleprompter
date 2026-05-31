# Shared Script Library PRD

Created: 2026-05-28 20:47 UTC
Last Updated: 2026-05-28 20:47 UTC
Status: Done

## Problem

Tab 2 only edits the current teleprompter script. Users need a way to save reusable scripts and load them later. The requested behavior is shared across all users, so the saved library should not be scoped to a local browser session or a single user.

## Root Cause

The current Convex schema stores one local prompt document keyed as `local-main`. There is no table for reusable scripts, no query for listing saved scripts, and no UI for selecting a script to load.

## Proposed Solution

Add a global `savedScripts` Convex table. Scripts will be saved by title and shared across all app users. Saving an existing title updates that saved script; saving a new title creates a new shared script. Tab 2 will add a title input, Save Script button, saved-script selector, and Load Script button.

## Files To Change

- `convex/schema.ts`
- `convex/teleprompter.ts`
- `src/App.tsx`
- `src/styles.css`
- `files.md`
- `changelog.md`
- `task.md`

## Edge Cases

- Empty script titles should be auto-derived from the first script line.
- Empty scripts should not be saved.
- Loading should be disabled until a saved script is selected.
- Existing current-script save behavior should continue to work.
- The shared library should list newest updates first.

## Verification Steps

- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm run build`.
- Push Convex schema/functions to the local dev deployment.
- Browser-test saving a shared script and loading it back into Tab 2.

## Task Completion Log

- 2026-05-28 20:47 UTC - PRD created.
- 2026-05-28 20:47 UTC - Added `savedScripts` schema, Convex save/list functions, Tab 2 library controls, and browser-tested save/load.
