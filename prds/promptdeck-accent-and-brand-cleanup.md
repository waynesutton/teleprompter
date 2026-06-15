# PromptDeck Accent And Brand Cleanup

Created: 2026-06-14 22:47 UTC
Last Updated: 2026-06-14 22:47 UTC
Status: Done

## Problem

The app still used the previous lime accent, matching focus/border colors, and old style-system naming in tokens, copy, docs, and font option values.

The Help/About section also needed current PromptDeck feature copy and a visible GitHub repository link.

## Root Cause

The visual system was previously named after the imported UI reference. That name leaked into CSS variables, docs, feature descriptions, and the saved font option. The app has since been renamed and branded as PromptDeck, but the old style name remained.

## Proposed Solution

- Rename style tokens from the old UI reference name to PromptDeck tokens.
- Change the accent color to `#33E7A2`.
- Change strong control borders and focus rings to matching `rgba(51, 231, 162, ...)` values.
- Rename the bundled reading font option from the old label/value to `PromptDeck` / `promptdeck`.
- Keep schema safe for existing saved records by allowing string font values in stored documents while only accepting the current enum in write mutations.
- Update Help docs and About copy to use PromptDeck and list current features.
- Add a GitHub repo link in the About section.
- Remove old style-name wording from current project docs.

## Files To Change

- `src/styles.css`
- `src/App.tsx`
- `convex/schema.ts`
- `convex/teleprompter.ts`
- `README.md`
- `changelog.md`
- `task.md`
- `files.md`
- `prds/promptdeck-new-script-flow.md`
- `prds/promptdeck-ui.md`

## Edge Cases

- Existing saved records may contain older font values. The app should not crash if one is loaded.
- PromptDeck font selection should still render with the existing bundled Inter Tight styling.
- No previous lime accent, matching RGB values, or old style-system name references should remain.
- Help/About should not imply AI, Firecrawl, narration, transcription, or rendering work without user setup.

## Verification Steps

- Search the repo for previous accent values and old style-system names.
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-14 22:47 UTC - Started PromptDeck accent, token, naming, and Help/About cleanup.
- 2026-06-14 22:47 UTC - Changed PromptDeck interface tokens to the new teal accent, renamed the font/style references, updated Help/About with current feature copy and GitHub link, synced docs, and verified the app.
