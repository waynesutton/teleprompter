# About Stack Section

Created: 2026-06-15 01:02 UTC
Last Updated: 2026-06-15 01:02 UTC
Status: Done

## Problem

The About section lists product features, but it does not clearly show what PromptDeck is built with or which Convex pieces power the app.

## Root Cause

The About content was focused on user-facing features. Stack details existed in README and file docs, but not in the in-app About page.

## Proposed Solution

Add a Stack section at the bottom of About that names the app stack, states that PromptDeck is built with Codex and Convex, links to the Convex Codex docs, and calls out the Convex components currently used or planned.

## Files To Change

- `src/App.tsx`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Do not imply planned R2 or Mux component work is already wired.
- Keep the wording short enough for the existing About layout.
- Use normal links with `target="_blank"` and `rel="noreferrer"`.

## Verification Steps

- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm run build`.

## Task Completion Log

- 2026-06-15 01:02 UTC - Added a Stack section to the in-app About page and synced project tracking docs.
