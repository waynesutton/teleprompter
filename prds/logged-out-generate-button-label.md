Created: 2026-06-15 06:33 UTC
Last Updated: 2026-06-15 06:42 UTC
Status: Done

# Logged Out Generate Button Label

## Problem

Signed-out users can see the Build Script generator, but the button still says "Generate Script". That makes it look like generation should work without login.

## Root Cause

The button relies on the existing `openAiGenerator` login gate, but the visible label and disabled state do not explain that login is required before AI generation.

## Proposed Solution

- Change the signed-out Build generator button label to "Log in to use".
- Keep the existing PromptDeck login-required modal when the user clicks it.
- Keep signed-in behavior unchanged: users still need source text, login, and a saved provider key to generate.

## Files To Change

- `src/App.tsx`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Signed-out users should be able to click the button even if no source is entered, because login is the first requirement.
- Signed-in users should still see "Generate Script" and should not be able to generate without source text.
- The existing login modal should remain the only auth prompt.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-15 06:33 UTC - Changed the signed-out Build generator button to read "Log in to use" and remain clickable so it opens the existing login-required modal.
- 2026-06-15 06:33 UTC - Verified with `npm run typecheck`, `npm run lint`, and `npm run build`.
- 2026-06-15 06:42 UTC - Deployed production with `npm run deploy` and smoke checked the deployed bundle for `https://befitting-dodo-95.convex.cloud` plus the new `Log in to use` label.
