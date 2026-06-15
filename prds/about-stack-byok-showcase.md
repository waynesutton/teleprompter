Created: 2026-06-15 05:45 UTC
Last Updated: 2026-06-15 05:45 UTC
Status: Done

# About Stack BYOK Showcase

## Problem

The About tab already lists the PromptDeck stack, but the Stack section reads like a plain table. The user wants the same stack information to include BYOK options and look strong enough to screenshot and share.

## Root Cause

The current Stack content is accurate, but it lacks a visual summary layer. BYOK is only shown as a table row, so the provider options do not stand out.

## Proposed Solution

- Keep the existing Stack text and table content.
- Add a compact Stack snapshot panel above the table.
- Show core layers: React/Vite/TypeScript, Convex, Convex Auth, and Convex static hosting.
- Add BYOK chips for OpenAI, Claude, OpenRouter, Firecrawl, and ElevenLabs.
- Use PromptDeck's existing Graphite-style dark surfaces, lime accent, mono labels, and quiet borders.
- Keep the layout responsive for mobile.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- The panel should wrap cleanly on mobile without horizontal scroll.
- The table below should remain available for details.
- BYOK text should not imply keys are required for the core prompter.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-15 05:45 UTC - Added a screenshot-ready About Stack snapshot with BYOK provider chips while preserving the existing Stack copy and table.
- 2026-06-15 05:45 UTC - Verified with `npm run typecheck`, `npm run lint`, and `npm run build`.
