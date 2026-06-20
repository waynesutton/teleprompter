Created: 2026-06-15 17:46 UTC
Last Updated: 2026-06-15 18:18 UTC
Status: Done

# Script Library Save Guardrails

## Problem

The Script tab has save/export actions split between the top header and the Your library section. Saving also relies on title/folder matching, which can accidentally overwrite an existing saved script when the user pastes or imports a different draft while the old title is still in the field.

## Root Cause

The current save flow treats title plus folder as the saved-script identity. It does not clearly distinguish a new draft from a loaded/saved library item, and it patches matching saved scripts without requiring the client to prove which saved item is being updated.

## Proposed Solution

- Keep only `New Script` in the Script tab header.
- Move Markdown export into the Your library section next to library save/load actions.
- Keep New Script guarded by a PromptDeck modal that warns the existing script will be cleared.
- Track the saved script identity currently associated with the editor.
- Clear that saved identity when the user types, pastes, or imports different script text.
- Update the Convex save mutation to accept an optional expected saved script id.
- Allow updates only when the expected saved script id matches the existing title/folder record.
- Block save attempts that would overwrite another script with the same title/folder.
- Return explicit mutation statuses so the UI can show clear messages.
- Add an explicit `Save As` action in Your library for intentional script copies and variants.
- Treat `Save As` as create-only: if the chosen title/folder already exists, ask the user for a new title or folder instead of updating an existing saved script.

## Files To Change

- `src/App.tsx`
- `convex/teleprompter.ts`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Saving an unchanged loaded script should be idempotent.
- Saving changes to a loaded script should update that exact saved script.
- Saving pasted/generated text with an existing title/folder should require a new title or folder.
- Renaming a loaded script should work only when the new title/folder does not collide with another saved script.
- Save As should create a separate saved script only when the chosen title/folder is unique.
- Save As should return a conflict if the chosen title/folder already exists, even when the script body is unchanged.
- Signed-out users should still be able to export Markdown but not save/load/delete library items.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-15 18:01 UTC - Moved Script tab save/export actions into Your library, kept New Script as the only header action, updated the New Script warning modal, and added editor-linked save guardrails for title/folder collisions.
- 2026-06-15 18:01 UTC - Updated `saveSharedScript` to return explicit `created`, `saved`, `conflict`, `missing`, or `invalid` states and block unsafe overwrites unless the client is updating the expected saved script.
- 2026-06-15 18:01 UTC - Verified with `npx convex dev --once`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- 2026-06-15 18:18 UTC - Added `Save As` as a create-only library action and added a Convex `saveAs` guard so matching title/folder records return a conflict instead of updating the existing script.
