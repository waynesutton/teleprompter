Created: 2026-05-30 23:06 UTC
Last Updated: 2026-05-30 23:12 UTC
Status: Done

# One Row Phosphor Control Dock

## Problem

The Tab 1 action row is too large, wraps into multiple rows, and the tab bar feels oversized. The app also uses Lucide icons while the requested direction is Phosphor Icons.

## Root Cause

The prompter dock still uses large touch targets, labeled primary playback, generous range containers, and mixed icon sizing. The icon library is imported from `lucide-react`.

## Proposed Solution

- Install and use `@phosphor-icons/react`.
- Replace the app icon imports/usages with Phosphor icons.
- Make the Tab 1 dock a single compact row on desktop.
- Convert Start/Pause to an icon-only primary action.
- Shrink bottom tabs while preserving readable labels and focus states.
- Keep the timer/counter behavior unchanged.

## Files To Change

- `package.json`
- `package-lock.json`
- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Desktop should stay one row without overlap.
- Smaller screens may wrap only where needed for usability.
- Icon-only controls must keep accessible labels and tooltips.
- Static hosting deployment must still build with the correct Convex URL.

## Verification Steps

- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm run build`.
- Deploy with static hosting.

## Task Completion Log

- 2026-05-30 23:06 UTC - PRD created and implementation started.
- 2026-05-30 23:12 UTC - Installed Phosphor icons, removed Lucide, converted app icons, shrank the bottom tabs, made Start/Pause icon-only, compacted the Tab 1 dock into a one-row desktop layout, verified, and deployed static hosting.
