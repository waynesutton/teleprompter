Created: 2026-06-15 17:00 UTC
Last Updated: 2026-06-15 17:30 UTC
Status: Done

# Generate Script Result Actions

## Problem

After a script is generated, the modal still shows bottom actions labeled "Cancel" and "Generate". That is clear before generation, but confusing after a result exists because the user's next decision is whether to use, copy, save, close, or regenerate the result.

## Root Cause

The Generate Script modal uses the same footer actions before and after generation. It does not track whether the generated result has already been handled through Send to Script, Copy, or Save Markdown.

## Proposed Solution

- Keep the initial modal footer as `Cancel` and primary `Generate`.
- After a successful generation:
  - Keep `Send to Script` as the primary action inside the generated result.
  - Keep `Copy` and `Save Markdown` as secondary actions inside the generated result.
  - Change the footer secondary action to `Close`.
  - Change the footer generation action to `Regenerate` and make it visually secondary.
- If generation fails, show `Try Again` while keeping the error message and user inputs unchanged.
- Confirm only when closing an unhandled generated result.

## Files To Change

- `src/App.tsx`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- `Esc`, backdrop click, the X button, and footer close should use the same close behavior.
- Copying or saving Markdown should count as handling the generated result.
- Regeneration should keep the modal inputs unchanged and replace only the generated result.
- Closing after sending to Script should not show a confirmation because the modal closes as part of the send flow.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-15 17:03 UTC - Updated the Generate Script modal footer states so initial generation shows `Cancel`/`Generate`, successful results show `Close`/`Regenerate`, failures show `Try Again`, and unused generated results require confirmation before closing.
- 2026-06-15 17:03 UTC - Verified with `npm run typecheck`, `npm run lint`, and `npm run build`.
- 2026-06-15 17:30 UTC - Uploaded development static hosting with `npm run deploy:static:dev`, deployed production with `npm run deploy`, and smoke checked the production bundle for `https://befitting-dodo-95.convex.cloud` plus the new modal labels.
