Created: 2026-05-31 04:05 UTC
Last Updated: 2026-05-31 04:08 UTC
Status: Done

# Shortcut Help Modal

## Problem

Tab 1 has keyboard shortcuts, but users have to leave the prompter view and open Tab 3 to see them. The live prompting controls need a small `?` helper at the far right that opens the shortcut list without disrupting the prompter.

## Root Cause

Keyboard help currently exists only as static content in the help/settings tab. The prompter control dock does not expose a contextual help action, and the global keyboard handler does not support a help shortcut.

## Proposed Solution

- Add a compact Phosphor `?` button at the far right of the Tab 1 control dock.
- Open a focused modal containing only the keyboard shortcuts.
- Support `Command + ?` and `Control + ?` to open the modal.
- Support `Esc` to close the modal before other escape behavior runs.
- Keep the existing timer/progress display and prompter controls unchanged.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- `Command + ?` should work even when focus is inside a text field.
- `Esc` should close the shortcut modal instead of resetting the prompter while the modal is open.
- The modal should fit small screens without horizontal overflow.
- The new icon-only button must keep an accessible label.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Deploy with Convex static hosting.

## Task Completion Log

- 2026-05-31 04:08 UTC - Added the Tab 1 far-right shortcut help button, shortcut modal, `Command + ?` / `Control + ?` open handling, and `Esc` modal close handling.
- 2026-05-31 04:08 UTC - Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and deployed with `npm run deploy:static:dev`.
