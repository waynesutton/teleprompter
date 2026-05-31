Created: 2026-05-30 22:45 UTC
Last Updated: 2026-05-30 22:49 UTC
Status: Done

# Prompter Control Bar Polish

## Problem

The Tab 1 control bar looks crowded. The `Center` control visually runs into the `Size` label, making it read like `CenterSize`, and the button hierarchy feels less polished than the prompter surface.

## Root Cause

The control deck uses a single dense grid for transport buttons, sliders, view toggles, and display toggles. Mixed control widths inside one grid cause labels and buttons to collide as viewport width changes.

## Proposed Solution

- Split the prompter controls into grouped clusters: transport, scroll, view, typography, speed, and display.
- Make secondary view controls icon-led and compact, while keeping Start as the primary labeled command.
- Use flexible wrapping with stable touch targets so controls do not collide on desktop, 1024x600, or mobile.
- Tune button shape, active states, spacing, and range labels for a cleaner black-and-white prompter control surface.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- The bar must remain usable at compact Elgato-style 1024x600 viewports.
- Secondary icon controls still need accessible labels and tooltips.
- Mobile layout must keep touch targets at least 44px.

## Verification Steps

- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm run build`.
- Deploy static dev hosting.

## Task Completion Log

- 2026-05-30 22:45 UTC - PRD created and implementation started.
- 2026-05-30 22:49 UTC - Rebuilt the Tab 1 control bar into grouped transport, scroll, view, typography, speed, and display clusters. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and deployed static hosting.
