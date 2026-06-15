# Prompter Background Options

Created: 2026-06-14 18:46 UTC
Last Updated: 2026-06-14 18:55 UTC
Status: Done

## Problem

The Prompter view always uses a subtle radial grey spotlight. That can be distracting for true teleprompter use, and there is no setting for users who want a pure black or light-background reading surface.

## Root Cause

The current background is hard-coded in `.prompter-stage` CSS and is not represented in `PromptSettings`, Convex prompt state, or default settings.

## Proposed Solution

- Add a `backgroundMode` prompt setting with:
  - `black`: solid black, default.
  - `spotlight`: current black background with grey radial spotlight.
  - `white`: white background with black reading text.
- Add controls to the Tab 1 gear menu.
- Persist the setting in authenticated current prompt state and default settings.
- Keep existing saved Convex documents compatible by making the new schema fields optional and falling back to `black`.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `convex/schema.ts`
- `convex/teleprompter.ts`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Existing users with saved prompt/default settings should get solid black until they choose another background.
- White mode should force readable black prompter text even if the selected text color is white, yellow, grey, or red.
- RSVP mode should remain readable on all backgrounds.
- The reading guide should remain visible on both dark and light backgrounds.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npx convex dev --once`

## Task Completion Log

- Completed 2026-06-14 18:55 UTC.
- Added `backgroundMode` to prompt settings with `black`, `spotlight`, and `white` options.
- Set solid black as the default and moved the previous radial grey circle to the Spotlight option.
- Added the Background group to the Tab 1 gear menu.
- Persisted the setting through Convex prompt/default settings with compatibility fallbacks for old records.
- Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and `npx convex dev --once`.
