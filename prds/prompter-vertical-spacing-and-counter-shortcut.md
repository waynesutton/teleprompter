# Prompter Vertical Spacing And Counter Shortcut

Created: 2026-05-31 06:47 UTC
Last Updated: 2026-05-31 06:49 UTC
Status: Done

## Problem

The Tab 1 countdown/progress counter, main control bar, and tab row are too close together. Users also need a keyboard shortcut to hide and show the counter without opening Tab 3 settings.

## Root Cause

- The prompter bottom stack sits only a few pixels above the fixed tab row.
- The counter-to-control-bar gap is smaller than the desired visual rhythm.
- The counter visibility control exists in UI, but not in the keyboard shortcut handler or shortcut lists.

## Proposed Solution

- Increase the prompter bottom stack offset so the main bar has clear space above the tab row.
- Use the same spacing token between counter and main bar for a balanced vertical rhythm.
- Add `C` as the counter hide/show shortcut.
- Add the shortcut to the shared shortcut list so Tab 1 modal and Tab 3 Help both stay in sync.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Shortcuts should not fire while typing in inputs or textareas.
- Counter toggle should still work when the main bar is visible.
- Existing start/pause and hide-bar shortcuts must keep working.
- Compact height layouts should keep the controls usable.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy:static:dev`

## Task Completion Log

- 2026-05-31 06:49 UTC - Increased spacing between the Tab 1 counter, main control bar, and tab row, added the `C` counter shortcut, and updated shortcut lists. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and static hosting deploy.
