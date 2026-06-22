Created: 2026-06-20 06:56 UTC
Last Updated: 2026-06-20 07:08 UTC
Status: Done

# Video Creator UI Simplification

## Problem

The Video creator form looks too dense and outdated. Every field has equal visual weight, so users have to scan too much before understanding the workflow.

## Root Cause

- The current four-column grid treats required, optional, and advanced fields as peers.
- Source, script, design, settings, upload, and action controls are mixed together.
- The primary action is below a long form instead of attached to the creation flow.
- Status chips sit far from the actual requirements.

## Proposed Solution

- Refactor the Video creator layout into a simple two-column workspace:
  - Left: required title/prompt/script brief.
  - Right: compact setup status, tone/source/settings, and optional context.
- Use existing PromptDeck controls and tokens.
- Make optional URL/design fields visually grouped as supporting context.
- Keep the current data model and handlers unchanged.
- Keep mobile responsive with a single-column layout.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Signed-out users still see the login prompt and setup guide.
- Long pasted scripts should not blow out the layout.
- File upload must remain accessible.
- The primary Generate action should stay reachable on desktop and mobile.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-20 06:56 UTC: PRD created.
- 2026-06-20 07:08 UTC: Reworked the Video creator into a brief-first layout with grouped Shape and Context panels, compact readiness chips, a clearer action dock, and mobile single-column behavior. Verified with `npm run typecheck`, `npm run lint`, and `npm run build`.
