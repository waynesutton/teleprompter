Created: 2026-05-31 04:12 UTC
Last Updated: 2026-05-31 04:20 UTC
Status: Done

# PromptDeck UI and New Script Flow

## Problem

Tab 2 needs a clean way to start a fresh script without accidentally losing the current script. The app also needs to adopt the PromptDeck UI system for controls and panels while preserving the strong live prompter reading surface.

## Root Cause

The editor currently supports save, load, delete, and export, but not a guarded "new script" workflow. The visual system is still mostly the previous black/white glass style instead of the flat PromptDeck palette and typography in `promptdeck-ui.md`.

## Proposed Solution

- Add a New Script button to Tab 2.
- When the current editor has content, open an in-app dialog asking whether to save first, discard, or cancel.
- Reuse the existing save mutation so matching script titles overwrite the previous saved script.
- Clear the script body, title, selected saved script, page index, and scroll after confirmation.
- Add PromptDeck as a reading font option while keeping System, Lexend, and OpenDyslexic.
- Apply PromptDeck tokens to tabs, controls, buttons, panels, fields, and modals without changing the main scrolling text layout.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `convex/schema.ts`
- `convex/teleprompter.ts`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Cancel must leave the current script untouched.
- Save first should not clear the editor if the save fails.
- Existing saved titles should keep overwrite behavior.
- Empty scripts should clear immediately without an unnecessary save prompt.
- Existing default settings using older fonts must continue to load.
- The PromptDeck style must not reduce prompter text readability.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-05-31 04:20 UTC - Added the guarded Tab 2 New Script flow with Save First, Don't Save, and Cancel actions.
- 2026-05-31 04:20 UTC - Added PromptDeck as a font option, bundled the PromptDeck fonts, and updated Convex validators/schema for saved/default settings.
- 2026-05-31 04:20 UTC - Applied PromptDeck UI styling to tabs, controls, buttons, panels, fields, and modals while preserving the main prompter text surface.
- 2026-05-31 04:20 UTC - Verified with `npm run typecheck`, `npm run lint`, `npm run build`, pushed Convex functions, and deployed static hosting.
