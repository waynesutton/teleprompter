Created: 2026-06-15 02:20 UTC
Last Updated: 2026-06-15 02:20 UTC
Status: Done

# Generate Script Modal Simplification

## Problem

The Generate Script modal has too many jobs: provider selection, length selection, model override, one-off style notes, generated script review, and full Script Voice Profile creation. That makes the modal heavy, especially on mobile, and puts reusable profile management in the wrong place.

## Root Cause

Script Voice Profile creation was originally colocated with generation for fast iteration. Now that Account owns BYOK settings and prompt settings, reusable voice management belongs there too. The modal also still exposes a model override even though model choice is now handled in Account BYOK settings.

## Proposed Solution

- Remove the Model override field from the Generate Script modal.
- Keep Generate Script focused on provider, length, Script Voice dropdown, selected voice summary, style notes, loading, and generated-script review.
- Keep `Esc` close behavior for Generate Script.
- Make the Generate Script modal resizable on desktop and responsive on mobile.
- Move Script Voice Profile creation/edit/delete into Account while keeping saved/built-in voices available in the Generate Script dropdown.
- Add a lightweight terminal-style spinner loading state inspired by `Eronred/expo-agent-spinners`, using a fixed-size text spinner for stable layout.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md` if descriptions need updates

## Edge Cases

- Existing custom Script Voice Profiles must still appear in the Generate Script dropdown.
- Built-in voices cannot be deleted.
- Logged-out users still cannot save custom voices.
- Mobile modal must not overflow horizontally.
- Generate button must remain disabled while generation is running.
- Current BYOK saved model settings should continue to drive provider model choice.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Manual check: Generate Script modal has no Model override field.
- Manual check: `Esc` closes Generate Script modal.
- Manual check: modal is resizable on desktop and fits mobile width.
- Manual check: custom Script Voice Profile editor appears in Account and saved voices appear in the Generate Script dropdown.

## Task Completion Log

- 2026-06-15 02:20 UTC - Removed the Generate Script model override, kept provider model selection in Account BYOK settings, moved Script Voice Profile creation/edit/delete into Account, kept the modal voice dropdown as a loader, added desktop resize and mobile sheet behavior, and added a fixed-size terminal-style spinner during generation.
