# RSVP Reading Mode

Created: 2026-05-31 06:08 UTC
Last Updated: 2026-05-31 06:15 UTC
Status: Done

## Problem

Tab 1 only supports scrolling teleprompter reading. Users also need an optional RSVP speed reading mode that shows one word at a time with ORP highlighting. Basic RSVP must work without AI setup, while AI-enabled installs can optionally rewrite the script for easier RSVP reading.

## Root Cause

- The prompter renderer is line/scroll based.
- There is no word-level reading state or ORP/pivot calculation.
- Existing AI generation is focused on Tab 2 script creation, not Tab 1 reading optimization.

## Proposed Solution

- Add a session-only Tab 1 reading mode toggle for Scroll and RSVP.
- Split the active page script into words, calculate each word's ORP pivot letter, and render one word with the pivot highlighted red.
- Drive RSVP playback from the existing start/pause flow with a dedicated WPM control derived from existing speed settings.
- Add help copy and keyboard shortcut docs for using RSVP.
- Add an optional AI action that rewrites the current script for RSVP readability when AI providers are configured.
- Keep ElevenLabs voice controls available in RSVP mode without making voice required for RSVP.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `convex/aiScripts.ts`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Empty scripts should show a clear RSVP empty state.
- Changing pages, scripts, or modes should reset the RSVP word position safely.
- Direction notes and markdown formatting should not break word splitting.
- AI setup failure should use the existing setup modal and leave the draft unchanged.
- Voice setup state should not block local RSVP playback.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npx convex dev --once`
- `npm run deploy:static:dev`

## Task Completion Log

- 2026-05-31 06:15 UTC - Added local RSVP reading mode, ORP pivot highlighting, WPM playback, V shortcut, Tab 3 instructions, optional AI RSVP rewrite action, and voice-compatible copy. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, `npx convex dev --once`, and static hosting deploy.
