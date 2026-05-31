# True Teleprompter End Scroll

Created: 2026-05-31 06:52 UTC
Last Updated: 2026-05-31 06:53 UTC
Status: Done

## Problem

At 100% scroll on Tab 1, the final script lines can still sit on or below the reading guide. A real teleprompter should let the final text continue past the guide and leave the visible reading area.

## Root Cause

- The scroll reader only has about half a viewport of bottom padding.
- At max scroll, the bottom of the script stops too low on the screen.
- The Fit control measures scroll height, so any end-scroll padding must not break fit-to-window sizing.

## Proposed Solution

- Increase normal scroll mode bottom padding to more than one viewport so the final line can scroll fully out of sight.
- Keep fit-to-window mode using its compact padding.
- Make fit-to-window measurement use the fit layout before calculating size.
- Preserve RSVP mode behavior.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Loaded scripts and newly typed scripts should both get the same end-scroll room.
- The 100% progress calculation should still reflect the full scroll range.
- Fit to window should not be broken by the teleprompter exit padding.
- Compact-height screens should still allow true end scrolling.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy:static:dev`

## Task Completion Log

- 2026-05-31 06:53 UTC - Increased normal scroll mode exit padding so the final script text can pass the guide and leave the visible area, while keeping Fit-to-window measurement on the fit layout. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and static hosting deploy.
