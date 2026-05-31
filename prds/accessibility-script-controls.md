Created: 2026-05-30 22:05 UTC
Last Updated: 2026-05-30 22:25 UTC
Status: Done

# Accessibility Script Controls

## Problem

The teleprompter needs richer script styling, faster speed presets, accessible font options, script paging, markdown export, default script settings, and a compact layout that works on small displays such as Elgato Prompter.

## Root Cause

The current app has one shared prompt state and a simple textarea. It does not store default presentation settings, has no selection formatting tools, and the prompter controls assume a wider browser viewport.

## Proposed Solution

- Extend prompt settings with speed multiplier, text color, font family, and centered-page layout.
- Add a Convex-backed default settings record for new and loaded scripts.
- Add Tab 2 toolbar controls for whole-script color, selected text color, bold, page breaks, and markdown export.
- Add Tab 3 for default settings and keyboard shortcut help.
- Add keyboard controls for playback, reset/stop, font size, speed, and pages.
- Harden responsive CSS for phone widths and 1024x600 prompter displays.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `convex/schema.ts`
- `convex/teleprompter.ts`
- `src/main.tsx`
- `package.json`
- `package-lock.json`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Existing Convex prompt rows may not have new optional fields.
- Keyboard shortcuts must not hijack typing inside inputs or the script editor.
- Formatting selected text must preserve textarea selection and avoid unsafe HTML rendering.
- Long shortcut labels and controls must wrap cleanly on narrow screens.
- Scripts with no page delimiter should behave as a single page.

## Verification Steps

- Run Convex codegen/typecheck after schema changes.
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm run build`.
- Verify the hosted/local app in a browser at desktop, mobile, and 1024x600 style sizes.

## Task Completion Log

- 2026-05-30 22:05 UTC - PRD created and implementation started.
- 2026-05-30 22:25 UTC - Added speed multipliers, script formatting, markdown export, default settings, keyboard help, page controls, responsive styles, and Convex default settings storage. Verified with Convex push, `npm run typecheck`, `npm run lint`, and `npm run build`.
