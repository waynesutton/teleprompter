Created: 2026-05-31 14:33 UTC
Last Updated: 2026-05-31 14:33 UTC
Status: Done

# Script Voice Profiles

## Problem

The AI script generator has provider, model, length, and freeform style notes, but no reusable writing voice system. Users need built-in tone presets and saved custom profiles so generated scripts can match a specific voice such as WayneSutton.ai, a founder update, or a high-energy creator style without mixing that writing tone with ElevenLabs narration voice.

## Root Cause

The current generator sends only ad hoc instructions to the Convex AI action. There is no stored profile data model, no profile selector in the modal, and no help documentation explaining the difference between script voice and narration voice.

## Proposed Solution

- Add built-in script voice profiles in the frontend.
- Add a Convex `scriptVoiceProfiles` table and functions for saved custom profiles.
- Add a Script Voice selector and custom profile editor in the Tab 2 AI generator modal.
- Pass the selected profile to `generateScript` and merge it into the provider system prompt.
- Add an app docs section at the top of Tab 3 explaining the app workflow, AI generation, script voices, RSVP, shortcuts, and narration setup.

## Files To Change

- `convex/schema.ts`
- `convex/scriptVoices.ts`
- `convex/aiScripts.ts`
- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- No AI providers configured: profile UI can exist, but generation still shows the setup modal.
- No saved profiles: built-in profiles remain available.
- Duplicate custom profile names: update the existing canonical profile instead of inserting duplicates.
- Empty custom profile fields: prevent saving and show an inline message.
- Deleted selected profile: fall back to Teleprompter Natural.
- ElevenLabs configured or missing: script profiles remain separate from narration voice setup.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Manual check: Tab 2 generator shows built-in and custom profiles.
- Manual check: saving, loading, and deleting custom script voice profiles works.
- Manual check: Tab 3 docs section appears above settings and about.

## Task Completion Log

- 2026-05-31 14:33 UTC - Added Convex custom Script Voice Profile storage, built-in profiles, Tab 2 generator profile selection/editor, profile-aware AI prompting, and top-of-Tab-3 app docs.
- 2026-05-31 14:33 UTC - Verified with `npx convex dev --once`, `npm run typecheck`, `npm run lint`, and `npm run build`.
