# AI Prompt Architecture

Created: 2026-06-14 19:02 UTC
Last Updated: 2026-06-14 19:02 UTC
Status: Done

## Problem

PromptDeck has multiple AI-facing features, and it is not obvious where the model prompts live or how the frontend options become system and user prompts.

The app needs a short source map that explains:

- where script generation prompts are defined
- where RSVP rewrite prompts are defined
- which frontend controls feed those prompts
- how URL scraping and provider calls fit into the flow
- what data is sent to models

## Root Cause

The UI labels live in `src/App.tsx`, while the actual model-facing prompt strings are built in Convex actions in `convex/aiScripts.ts`. That split is correct for security because BYOK provider keys stay server-side, but it makes the prompt flow harder to inspect quickly.

## Current Prompt Files

| File | Purpose |
| --- | --- |
| `convex/aiScripts.ts` | Owns the model-facing system prompts, user prompts, Firecrawl scrape step, provider selection, and OpenAI/Claude/OpenRouter calls. |
| `src/App.tsx` | Owns the UI controls for provider, model override, length, Script Voice Profile, custom instructions, Build source text, and RSVP rewrite actions. |
| `convex/scriptVoices.ts` | Stores user-created Script Voice Profiles that can be selected in the generator UI. |
| `convex/userApiKeys.ts` | Stores encrypted per-user BYOK provider keys and optional model metadata used by `convex/aiScripts.ts`. |

## Script Generation Flow

1. The user adds source material in the Build or Script workflow.
2. The frontend checks login and provider setup.
3. The frontend calls `api.aiScripts.generateScript` with:
   - `input`
   - `provider`
   - `modelOverride`
   - `length`
   - selected `scriptVoiceProfile`
   - optional `instructions`
4. `convex/aiScripts.ts` verifies the user is logged in.
5. It loads the user's encrypted API keys through `internal.userApiKeys.getForCurrentUser`.
6. It detects the first plain URL or markdown link.
7. If a URL exists, it scrapes that URL with Firecrawl using the user's Firecrawl key.
8. It builds:
   - a system prompt from length, global writing rules, selected Script Voice Profile, and custom style notes
   - a user prompt from the pasted notes or scraped markdown plus user notes
9. It calls OpenAI, Claude, or OpenRouter.
10. It strips code fences from the returned text and returns only the script body to the client.

## Main Script System Prompt

The main script generation system prompt is built by `getSystemPrompt` in `convex/aiScripts.ts`.

It includes:

- one-viewer framing
- spoken, camera-ready language rules
- banned AI-style words and phrases
- output-only instructions
- page break guidance using `---`
- short bracketed direction note guidance
- length target rules
- selected Script Voice Profile details
- user-entered style notes

## Script Voice Prompt

The selected writing voice is converted into prompt text by `getScriptVoicePrompt` in `convex/aiScripts.ts`.

It can include:

- profile name
- audience
- tone
- pacing
- banned words or phrases
- preferred phrases or moves
- example notes
- preferred structure

Built-in profiles are defined in `src/App.tsx`. User-created profiles are saved in Convex and merged into the same selector before generation.

## User Prompt

For normal topic or notes input, the user prompt is:

```text
Create a teleprompter-ready script from this source.

User topic or notes:
...
```

For URL or markdown-link input, the user prompt includes:

```text
Create a teleprompter-ready script from this source.

Source URL: ...

Scraped page markdown:
...

User notes:
...
```

Long source material is truncated before it is sent to the model.

## RSVP Rewrite Flow

RSVP mode itself does not need AI. The optional AI rewrite uses `api.aiScripts.rewriteForRsvp`.

The RSVP rewrite system prompt is built by `getRsvpSystemPrompt` in `convex/aiScripts.ts`.

It tells the model to:

- preserve meaning and order
- make the script easier to read one word at a time
- prefer short spoken phrases
- remove filler and overly long clauses
- keep useful direction notes
- keep `---` page breaks only when helpful
- output only the rewritten script body

The user prompt is:

```text
Rewrite this script for RSVP one-word-at-a-time reading:

...
```

## Provider Calls

`convex/aiScripts.ts` maps the same system and user prompt pair to each provider:

- OpenAI uses `/v1/responses`
- Claude uses `/v1/messages`
- OpenRouter uses `/api/v1/chat/completions`

The model comes from:

1. the UI model override, when provided
2. the user's saved BYOK model setting
3. the app's safe default model for that provider

## Security Notes

- Raw API keys are never sent to the browser.
- Provider keys are decrypted only inside the Convex action.
- Logged-out users cannot call AI generation or RSVP rewrite.
- Firecrawl scraping requires login plus a saved Firecrawl key.
- The model receives only the selected source text, selected voice profile fields, style notes, and scraped markdown when a URL is used.

## Files To Change

No behavior changes were needed for this PRD.

Created:

- `prds/ai-prompt-architecture.md`

## Edge Cases

- Empty input returns an inline validation message before calling a provider.
- URL input without a Firecrawl key returns setup guidance.
- Provider selected in the UI but not configured for the user returns setup guidance.
- Empty provider output returns a provider error.
- Provider markdown code fences are stripped before replacing the editor draft.

## Verification Steps

- Confirmed prompt builders and provider calls in `convex/aiScripts.ts`.
- Confirmed frontend option wiring in `src/App.tsx`.
- Confirmed no source behavior changes were made.

## Task Completion Log

- 2026-06-14 19:02 UTC - Documented the PromptDeck AI prompt architecture, including script generation, RSVP rewrite, Script Voice Profiles, Firecrawl context, provider calls, and BYOK security boundaries.
