Created: 2026-06-15 05:16 UTC
Last Updated: 2026-06-15 05:16 UTC
Status: Done

# Script-Only Focus And Voice Library

## Problem

PromptDeck has strong script generation, prompting, saved library, BYOK, and Script Voice Profile features, but the active UI and docs still describe planning workflows outside the current script-first product. The Account page also lets users save custom Script Voice Profiles without a clear list to reload or delete them later.

## Root Cause

The Build tab previously explored broader media planning before the app had a matching production workflow. Later script-first changes simplified parts of Build, but references remained in Account BYOK, About docs, README, file map, changelog, and Build library cards. Custom voice CRUD exists in Convex and helper functions, but the Account UI only exposes the editor and selected-profile actions.

## Proposed Solution

- Add Account-owned custom Script Voice Profile cards with load and delete actions.
- Add built-in `DevRel` and `Viral Video` Script Voice options from the provided writing guidance, keeping labels generic and app-safe.
- Make the Account BYOK Service selector open upward.
- Make `Send to Script` close the generator, switch to Script, and show the imported generated script.
- Refocus Build on scripts only:
  - keep source-first script generation
  - keep save/edit/archive/delete for script Build items
  - remove active planning panels and provider setup copy outside script generation
  - keep backend-compatible fields dormant instead of forcing a schema migration
- Update About, README, task, changelog, and file map to describe PromptDeck as a script app.
- Leave notes in this PRD so broader planning features can be restored from git history if the product direction changes.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `README.md`
- `task.md`
- `changelog.md`
- `files.md`
- `prds/script-only-focus-and-voice-library.md`

## Edge Cases

- Existing saved Build items with old kinds should not break the UI.
- Built-in Script Voices should not be deletable.
- Deleting a custom profile from the new Account list should not rely on a stale selected-profile state.
- Existing saved API key records for no-longer-shown services may still exist in Convex; the UI should simply stop promoting those setup paths.
- Generated script review should preserve the generated text until the user sends, copies, saves markdown, or closes.

## Re-Enable Notes

If broader planning features are needed later, restore the UI from git history around the Build tab sections for planning cards, advanced project fields, and provider setup notes. Keep it behind logged-in-only gates, add dedicated job tables before exposing any final output action, and avoid mixing those controls into the core script creator.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Manual review:
  - Account custom voices can be saved, listed, loaded, and deleted.
  - Account Service dropdown opens upward.
  - Generated script `Send to Script` switches to Script.
  - Build and About no longer promote inactive planning workflows.
  - New built-in Script Voices appear in the Generate Script dropdown.

## Task Completion Log

- 2026-06-15 05:16 UTC - Started script-only focus cleanup, custom voice library UI, new built-in Script Voices, and generated-script send flow fix.
- 2026-06-15 05:16 UTC - Added Account saved voice cards, DevRel and Viral Video built-ins, upward Account Service selector, generated-script Script tab handoff, script-only Build/About/README copy, removed inactive setup docs, and verified with `npm run typecheck`, `npm run lint`, and `npm run build`.
