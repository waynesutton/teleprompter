# About Shortcuts Layout Polish

Created: 2026-06-15 01:22 UTC
Last Updated: 2026-06-15 01:22 UTC
Status: Done

## Problem

The About tab has a loose “About and shortcuts” header that sits too close to the Video setup panel above it. The “Shortcut-ready prompting” section also does not match the width or boxed treatment of the other About sections.

## Root Cause

The shortcuts area is split across a standalone `editor-header` and a `settings-grid`. Because the grid only has one child, the shortcuts panel occupies the first grid column instead of the full page width.

## Proposed Solution

Replace the floating header and narrow grid with one full-width `settings-panel` that contains the section heading and shortcut list together.

## Files To Change

- `src/App.tsx`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Keep the existing keyboard shortcut content unchanged.
- Keep the same About page max width as the other sections.
- Preserve mobile shortcut row wrapping.

## Verification Steps

- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm run build`.

## Task Completion Log

- 2026-06-15 01:22 UTC - Converted the About shortcuts area into a full-width boxed panel that matches the rest of the About page.
