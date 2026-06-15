# Tab One Compact Options Menu

Created: 2026-05-31 06:28 UTC
Last Updated: 2026-05-31 06:31 UTC
Status: Done

## Problem

The Tab 1 control bar is too long after adding RSVP, voice, and AI controls. The bottom-right dock toggle is hard to see because it sits at the same edge as the bottom tab bar. Tab 3 also shows RSVP instructions as a separate section instead of keeping them in the existing feature/about area.

## Root Cause

- Secondary display controls live in the main one-row dock.
- The dock toggle uses a fixed bottom-right position that can compete with the tab bar.
- RSVP help copy was added as a standalone settings panel instead of the About feature table.

## Proposed Solution

- Add a Phosphor Gear control to Tab 1 that opens a PromptDeck-styled options menu.
- Move Fit, Center, Mirror, Guide, Shortcuts, and AI RSVP rewrite into the Gear menu.
- Keep primary controls visible: transport, scroll/RSVP position, reading mode, size, speed/WPM, speed multiplier, and voice.
- Raise the SquareHalfBottom dock toggle above the bottom tabs while the dock is visible, and keep it in the corner when the dock is hidden.
- Remove the separate RSVP instructions panel and fold the instructions into the Tab 3 About feature table.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Gear menu should close when focus leaves it.
- Hidden dock toggle must remain visible and clickable.
- Keyboard shortcut help must remain reachable from the Gear menu and `Command + ?`.
- AI RSVP rewrite must still show the setup modal when AI is not configured.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy:static:dev`

## Task Completion Log

- 2026-05-31 06:31 UTC - Added the Tab 1 Gear menu, moved secondary controls into it, raised the dock toggle above the bottom tabs, and folded RSVP instructions into the About feature table. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and static hosting deploy.
