# Tab One Dock Toggle And UI Overflow Fixes

Created: 2026-05-31 05:58 UTC
Last Updated: 2026-05-31 06:05 UTC
Status: Done

## Problem

The Tab 1 speed multiplier menu opens downward and can be clipped by the bottom edge. Tab 2's shared library controls can overflow the card, especially the Delete Script button. Tab 1 also needs a quick way to hide the bottom control bar while reading.

## Root Cause

- The custom select menu always opens downward.
- The saved script library uses a fixed seven-column grid with max-content buttons.
- The Tab 1 control dock has no visibility toggle separate from the counter close button.

## Proposed Solution

- Add an upward menu placement for the speed multiplier select.
- Change the Tab 2 library controls to a wrapping layout that keeps every control inside the panel.
- Add a bottom-right SquareHalfBottom button on Tab 1 that hides or shows the control bar.
- Add a keyboard shortcut for the control bar toggle.
- Keep the floating toggle visible when the bar is hidden.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- The control bar toggle must remain reachable after hiding the bar.
- Keyboard shortcut should not interfere while typing in fields.
- The speed menu should remain readable in compact-height viewports.
- Library controls should wrap without text spilling outside buttons.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-05-31 06:05 UTC - Implemented upward speed select placement, wrapping Tab 2 library controls, and a bottom-right Tab 1 dock toggle with `B` keyboard support. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and static hosting deploy.
