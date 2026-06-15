Created: 2026-06-15 06:14 UTC
Last Updated: 2026-06-15 06:28 UTC
Status: Done

# Script Save And Local Draft Persistence

## Problem

Saving a script after sending generated output into the Script tab can appear not to work. Signed-out users also do not have browser-local draft persistence, so their script/pro prompts can reset even though they are not allowed to use the logged-in library features.

## Root Cause

- Saved scripts are correctly owner-filtered in Convex, but the client can leave the saved-script dropdown filtered to a different folder after saving a generated script with no folder.
- Signed-out users start from the default script and currently rely only on in-memory state.
- The app reads the authenticated current prompt from Convex but does not save current prompt edits back to Convex.

## Proposed Solution

- Keep Convex saved scripts private by `ownerId`.
- Add browser-local persistence for signed-out draft text, title, folder, and prompter settings.
- Save the authenticated current prompt state to Convex after draft/settings changes, once the authenticated prompt query has loaded.
- When saving a script with no folder, move the saved-script filter to `No folder` so the saved item is visible.
- After sending generated output to Script, save the current prompt state for signed-in users.

## Files To Change

- `src/App.tsx`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- New signed-in users with no saved prompt should still see the default Welcome to PromptDeck script from Convex.
- Signed-out browser-local drafts should not be uploaded to Convex.
- Logged-in users should only see their own saved scripts because list/save/delete use authenticated `ownerId`.
- Saved scripts without folders should remain visible after saving.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-15 06:18 UTC - Added browser-local signed-out draft/settings persistence, authenticated current-prompt persistence, immediate generated-script prompt persistence, and saved-library filter correction for no-folder saves.
- 2026-06-15 06:18 UTC - Verified with `npm run typecheck`, `npm run lint`, and `npm run build`.
- 2026-06-15 06:28 UTC - Deployed production with `npm run deploy` and smoke checked the production bundle for `https://befitting-dodo-95.convex.cloud`.
