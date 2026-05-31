# Tab One Tabbar Layout Toggle

Created: 2026-05-31 06:39 UTC
Last Updated: 2026-05-31 06:41 UTC
Status: Done

## Problem

The floating SquareHalfBottom control is still hard to find on Tab 1. Users need an obvious hide/show control beside the Tab 1 tab so they can start prompting, hide the main control bar, and keep using keyboard shortcuts.

## Root Cause

- The hide/show control is floating away from the tab navigation.
- Hiding the dock also hides the tab bar, which makes the show control less discoverable.
- The shortcut list only says `B`, while users expect a direct hide bar shortcut.

## Proposed Solution

- Replace the floating SquareHalfBottom control with a Phosphor Layout control placed before the Tab 1 tab in the bottom tab bar.
- Keep the bottom tab bar visible on Tab 1 even when the main control bar is hidden.
- Keep the shortcut handler working while the bar is hidden and support both `H` and `B` for hide/show.
- Update shortcut copy and project docs.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- The Layout toggle should only show in the Tab 1 tab bar.
- Keyboard shortcuts should keep working when the main bar is hidden.
- The toggle must clearly show active state when the main bar is hidden.
- Tab switching should still work normally.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy:static:dev`

## Task Completion Log

- 2026-05-31 06:41 UTC - Replaced the floating hide/show control with a Layout icon beside the Tab 1 tab, kept the tab bar visible while the main bar is hidden, and added `H` support alongside `B`. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and static hosting deploy.
