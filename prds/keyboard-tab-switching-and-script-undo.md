# Keyboard Tab Switching And Script Undo

Created: 2026-05-31 05:12 UTC
Last Updated: 2026-05-31 05:19 UTC
Status: Done

## Problem

Keyboard shortcut help lists the current prompter controls, but there is no keyboard path for switching between Tab 1, Tab 2, and Tab 3. Tab 2 also has app-driven script edits such as selected-text color, page break insertion, loading saved scripts, AI replacement, and New Script clearing. Those changes are React state updates, so browser-native textarea undo does not reliably cover them.

## Proposed Solution

- Add `Command/Ctrl + 1`, `Command/Ctrl + 2`, and `Command/Ctrl + 3` to switch tabs.
- Add those shortcuts to the shared `SHORTCUTS` array so both the Tab 3 help panel and keyboard shortcut modal update together.
- Add a small script undo stack for app-driven changes to the Script text.
- Handle `Command/Ctrl + Z` on Tab 2 when the app-driven undo stack has a previous draft.
- Keep normal typing in the textarea on native browser undo behavior.

## Files To Change

- `src/App.tsx`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Shortcuts should work even when an input is focused, except normal text editing should remain natural.
- Escape should keep closing modals before any other shortcut handling.
- Undo should keep the current draft visible until the previous script body is restored.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-05-31 05:19 UTC - Added tab switching shortcuts, shared shortcut help copy, and app-driven Tab 2 script undo. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and static hosting deploy.
