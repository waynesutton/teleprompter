Created: 2026-06-01 12:37 UTC
Last Updated: 2026-06-01 13:00 UTC
Status: Done

# Build Library Management

## Problem

The Build tab explains script and video generation, but it does not yet give logged-in users a proper workspace for saving, editing, archiving, restoring, and deleting Build content. Users also need a clear choice to create scripts, videos, or both.

## Root Cause

Build currently has generator controls and video workflow planning, but no persisted Build item model. Saved scripts exist separately in Tab 2, and planned video work has no user-owned content table.

## Proposed Solution

- Add a per-user `buildItems` table for Build workspace items.
- Support item kinds: `script`, `video`, and `both`.
- Support item status: `active` and `archived`.
- Add Build tab controls to save, edit, archive, restore, and delete items.
- Let users seed Build items from the current Script text.
- Keep actual video rendering separate until `videoJobs`, R2, Mux webhooks, and render workers are implemented.

## Files To Change

- `convex/schema.ts`
- `convex/buildItems.ts`
- `src/App.tsx`
- `src/styles.css`
- `changelog.md`
- `files.md`
- `task.md`

## Edge Cases

- Logged-out users should see the workflow but need login to save Build items.
- Editing an archived item should keep it archived unless the user restores it.
- Delete should use an in-app confirmation, not a browser prompt.
- Script-only users should not be forced into video fields.
- Video-only users should not need a script snapshot.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy:static:dev`

## Task Completion Log

- 2026-06-01 13:00 UTC - Added the per-user `buildItems` table, Build tab save/edit/archive/restore/delete UI, current-script seeding, script handoff, and in-app delete confirmation. Verified with `npx convex dev --once`, `npm run typecheck`, `npm run lint`, and `npm run build`.
