# Script Library, BYOK Models, And Legal Footer

Created: 2026-06-14 19:05 UTC
Last Updated: 2026-06-14 19:41 UTC
Status: Complete

## Problem

The Script tab still exposes library controls to logged-out users, the bundled default script is generic, BYOK setup does not explain its security model clearly enough, model selection is a free-form field, and the app needs footer/legal links across non-prompter pages.

## Root Cause

Saved script data is already scoped per authenticated Convex user, but the frontend copy and controls still read like a shared library. BYOK storage is encrypted in Convex actions, but the UI does not make the trust boundary clear. Model IDs are saved as strings with no curated choices.

## Proposed Solution

- Replace the default script with a short PromptDeck script.
- Gate Script library controls behind GitHub login while keeping local writing, new script, preview, and markdown export available.
- Update saved script copy from shared/everyone language to personal library language.
- Add curated model dropdowns for OpenAI, Claude, and OpenRouter, while keeping a custom model field path.
- Make provider configs use safe default model IDs if a user saves a key without a model.
- Add a footer to Script, Build, Help, and Account with auto year, GitHub, Convex, Terms, and Privacy links.
- Add PromptDeck-styled Terms and Privacy modals based on the provided example docs and adapted for PromptDeck.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `convex/aiScripts.ts`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Logged-out users can still type, preview, start a new script, and export markdown.
- Logged-out users cannot save, load, delete, or create folders until login.
- A user who saves an OpenAI, Claude, or OpenRouter key without choosing a model still gets a working default model.
- Raw BYOK keys are never returned to the browser.
- Terms and Privacy modals close through app controls only, not browser dialogs.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npx convex dev --once`

## Task Completion Log

- Completed 2026-06-14 19:41 UTC.
- Replaced the default script with a short PromptDeck intro.
- Gated Script library save/load/delete/folder controls behind GitHub login while preserving local editing, preview, new script, and Markdown export.
- Added curated AI model selectors with custom model entry and safe backend defaults when model fields are blank.
- Added Script, Build, Help, and Account footers with open source, Convex, Terms, and Privacy links.
- Added PromptDeck-styled Terms and Privacy modals adapted for PromptDeck from the provided examples.
- Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and `npx convex dev --once`.
