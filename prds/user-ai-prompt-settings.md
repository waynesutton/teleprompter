# User AI Prompt Settings

Created: 2026-06-15 01:25 UTC
Last Updated: 2026-06-15 01:25 UTC
Status: Done

## Problem

The AI script generator has a strong default system prompt in `convex/aiScripts.ts`, but logged-in users cannot see it, adjust it, or save their own default rules. The app also supports Script Voice Profiles, but users need a clearer way to add a skill-style source, like a linked `SKILL.md`, and have it guide generated scripts.

Generated output also replaces the script too quickly. Users need simple post-generation actions: copy, save as Markdown, and send to the Script editor.

## Root Cause

The current prompt is hard-coded server-side. That is good for security, but it gives users no owned prompt settings. The generator modal also treats success as an immediate editor replacement, so there is no review step.

## Proposed Solution

- Add a per-user `aiPromptSettings` table.
- Add Convex functions for:
  - getting the default and active prompt
  - saving the user prompt
  - resetting to the default prompt
  - importing skill text from a URL with the user's Firecrawl key
- Let logged-in users manage the default script generator prompt from Account.
- Let users paste a skill URL, import the readable markdown, and save it as generator context.
- Update `generateScript` to use the user's saved prompt and saved skill context when present.
- Keep the Script Voice Profile and one-off style notes as additive controls.
- Stage generated output in the modal before replacing the Script editor.
- Add Copy, Save Markdown, and Send to Script actions after generation.
- Update About copy to mention skill-supported scripts.

## Files To Change

- `convex/schema.ts`
- `convex/aiScripts.ts`
- `convex/aiPromptSettings.ts`
- `convex/users.ts`
- `src/App.tsx`
- `src/styles.css`
- `files.md`
- `task.md`
- `changelog.md`

## Edge Cases

- Logged-out users should not see or save user prompt settings.
- A user without Firecrawl can still paste skill notes manually, but URL import should show setup guidance.
- Empty prompt save should be rejected.
- Imported skill content should be truncated before storage and before model use.
- Generated output should not overwrite the editor until the user clicks Send to Script.
- Existing users with no prompt settings should continue using the default `aiScripts.ts` prompt.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npx convex dev --once`
- Manual check:
  - Account page shows the default prompt for signed-in users.
  - Save/reset prompt controls work.
  - Skill URL import requires Firecrawl and saves imported markdown.
  - Script generation uses saved prompt settings.
  - Generated result can be copied, exported as Markdown, and sent to Script.
  - About mentions skill-supported scripts.

## Task Completion Log

- 2026-06-15 01:25 UTC - Created implementation PRD.
- 2026-06-15 01:38 UTC - Added per-user AI prompt settings, Firecrawl skill URL import, prompt-aware generation, generated-script review actions, Account UI, About copy, and documentation updates.
