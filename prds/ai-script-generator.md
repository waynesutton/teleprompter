Created: 2026-05-31 04:39 UTC
Last Updated: 2026-05-31 04:48 UTC
Status: Done

# AI Script Generator

## Problem

Tab 2 can edit scripts, but users still need to draft content elsewhere when they only have a topic, notes, URL, or markdown link. The app needs optional AI generation without breaking the non-AI editing flow.

## Root Cause

There is no Convex action for provider-backed generation, no setup detection for AI keys, and no Tab 2 UI for choosing generation length, model provider, or writing guidance.

## Proposed Solution

- Add a Convex action for provider status and script generation.
- Support OpenAI, Claude, and OpenRouter via Convex environment variables.
- Scrape the first URL or markdown link with Firecrawl when present.
- Add a Graphite-styled Generate Script control and advanced modal on Tab 2.
- Replace the editor draft only after generation succeeds.
- Add character, word, estimated time, and page counters below the script box.
- Keep the existing non-AI app behavior unchanged when AI env vars are missing.

## Files To Change

- `convex/aiScripts.ts`
- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Empty script input should not open the AI modal.
- Missing provider env vars should show the setup modal.
- URLs require `FIRECRAWL_API_KEY`; missing Firecrawl config should show the setup modal.
- Provider failures must keep the current draft unchanged.
- Generated script output should not include code fences or explanations.
- `Command + ?` should keep opening the shortcut modal.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npx convex dev --once`
- Static hosting deploy

## Task Completion Log

- 2026-05-31 04:48 UTC - Added Convex AI provider status and generation actions for OpenAI, Claude, OpenRouter, and Firecrawl URL scraping.
- 2026-05-31 04:48 UTC - Added Tab 2 Generate Script panel, advanced generation modal, setup warning modal, and draft replacement flow.
- 2026-05-31 04:48 UTC - Added character, word, estimated read time, and page counters below the script editor.
- 2026-05-31 04:48 UTC - Verified with `npm run typecheck`, `npm run lint`, `npm run build`, pushed Convex functions, and deployed static hosting.
