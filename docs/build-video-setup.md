# Build video setup

This guide defines the setup path for turning links, docs, scripts, and prompts into video projects inside PromptDeck. Current app features create scripts and planning artifacts only. Real video output should not be exposed until render workers, R2 storage, Mux delivery, and dedicated Convex job tables exist.

## What Build should do

Build is the logged-in workspace for creating scripts first and planning video work second:

- Generate a prompt-ready script from notes, URLs, markdown links, or saved scripts.
- Save per-user API keys for AI, scraping, narration, future storage, future video delivery, and avatar providers.
- Save scripts, video planning notes, combined Build items, and Video Project Builder drafts to the signed-in user's private library.
- Plan future video jobs from source material without blocking the normal teleprompter workflow.
- Do not render, upload, or claim final video output until the infrastructure exists.

Anonymous users should still be able to paste or type a script and use Prompter. Saving, Build items, Video Project Builder drafts, AI, Firecrawl, narration, transcription, R2 setup, Mux setup, and future video building require GitHub login.

## What requires keys or external services

| Feature | Requirement |
| --- | --- |
| Save scripts, video planning notes, or both | GitHub login. Saved Build items are private to the user. |
| Transcript to strategy to EDL from pasted script text | GitHub login to save. No AI key is required for the current local draft helper. |
| URL or markdown-link context | GitHub login plus a Firecrawl API key. |
| AI-assisted script, strategy, shot list, or EDL | GitHub login plus OpenAI, Claude, or OpenRouter. |
| Word-level media transcription | GitHub login plus a transcription provider such as ElevenLabs Scribe or another worker-backed speech-to-text service. |
| R2 artifact storage setup | GitHub login plus Cloudflare R2 access key ID, secret access key, account ID, and bucket name. This is setup-only until the R2 component is wired. |
| Mux delivery setup | GitHub login plus Mux token ID, token secret, and webhook signing secret. This is setup-only until upload/job flows exist. |
| Final MP4 rendering | Not available yet. Requires external render workers/providers, R2 storage, Mux delivery, and dedicated Convex video job tables. The browser and Convex actions should not render final MP4 files. |

## Recommended video pipeline

1. **Gather source**
   - Use pasted text, saved scripts, markdown, or URLs from the Script tab.
   - Use Firecrawl for the first URL or markdown link when the user has saved a Firecrawl key.

2. **Shape the script**
   - Use the existing AI generator and Script Voice Profiles.
   - Ask the model for a script, shot list, caption beats, visual notes, and narration notes.

3. **Draft the video project**
   - Use the Build tab Video Project Builder to create a transcript reading view, edit strategy, EDL JSON, subtitle style, render checklist, output format, and project memory.
   - Pasted script text can seed the draft. Real word-level cut ranges need transcription data from a provider.
   - Review the strategy and EDL before any future worker starts cutting or rendering.

4. **Render the composition**
   - Do not expose render buttons until render workers, R2, Mux, and video job tables are implemented.
   - Use HyperFrames when the agent writes HTML/CSS video compositions from source material.
   - Use Remotion when the app needs React-based video templates and cloud rendering.
   - Do not render MP4s inside Convex actions. Run render workers outside Convex and write job state back to Convex.

5. **Store artifacts**
   - Use Cloudflare R2 through the Convex R2 component for large render outputs, frame captures, audio files, source bundles, and intermediate artifacts.
   - Users should configure R2 in Account before future video workers can store artifacts.
   - Store only metadata and storage keys in Convex tables.

6. **Deliver playback**
   - Use the Mux Convex component for uploaded assets, playback IDs, webhooks, thumbnails, and video status.
   - Users should configure Mux in Account before future video workers can publish assets.
   - Keep Mux API credentials user-owned when rendering is BYOK, or deployment-owned if the app later offers managed video hosting.

## Provider roles

| Provider | Role | Notes |
| --- | --- | --- |
| Firecrawl | Source capture | Scrapes URLs into markdown before script/video planning. |
| OpenAI, Claude, OpenRouter | Writing and planning | Generates scripts, outlines, shot lists, and composition specs. |
| HyperFrames | Agent-authored rendering | Best for deterministic HTML-to-video workflows and self-correcting render loops. |
| Remotion | React video rendering | Best for React templates and Lambda or Cloud Run render backends. |
| Cloudflare R2 | Future artifact storage | Best for MP4s, frames, audio, and source bundles after the R2 component is wired. |
| Mux | Future playback and asset sync | Best for uploads, asset metadata, playback IDs, webhooks, and streaming after upload/job flows exist. |
| HeyGen | Optional avatar/narration | Keep separate from Script Voice Profiles and ElevenLabs narration voice. |

## Convex tables to add later

Build items now store video project planning artifacts. Add dedicated job tables only when rendering workers, R2 storage, and Mux delivery are wired.

```ts
videoJobs: {
  ownerId,
  sourceType,
  sourceText,
  sourceUrl,
  status,
  provider,
  renderer,
  scriptSnapshot,
  shotList,
  muxAssetId,
  r2OutputKey,
  error,
  createdAt,
  updatedAt,
}
```

Suggested indexes:

- `by_ownerId_and_updatedAt`
- `by_ownerId_and_status`
- `by_ownerId_and_provider`

## Convex components to use

Use these when video jobs become real:

- `@mux/convex` for Mux asset, upload, live stream, webhook, and metadata sync.
- `@convex-dev/r2` for large generated video artifacts and source bundles.
- Rate Limiter component for expensive render/generation endpoints.
- Action Cache for repeated script/video plans from the same input.

Use Convex actions for external API calls and job orchestration. Use mutations for job status updates. Use queries for reactive job lists.

## Build tab v1

The current Build tab ships with:

- Script generator moved out of Script.
- BYOK settings for OpenAI, Claude, OpenRouter, Firecrawl, ElevenLabs, Cloudflare R2, Mux, and HeyGen.
- Video Project Builder fields for transcript reading view, edit strategy, EDL JSON, subtitle style, render checklist, output format, and project memory.
- Video workflow docs in the UI and Build item cards that show project readiness.
- Setup guide in this file.

Do not add fake video rendering buttons that imply a video will be produced before render workers, R2, Mux, and job tables exist.

## Sources

- Mux Convex integration: https://www.mux.com/docs/integrations/convex
- Mux API reference: https://www.mux.com/docs/api-reference
- HyperFrames docs: https://hyperframes.video/docs
- HyperFrames pipeline: https://hyperframes.heygen.com/guides/pipeline
- HyperFrames CLI: https://hyperframes.heygen.com/packages/cli
- Remotion API docs: https://www.remotion.dev/docs/api
- Convex components docs: https://docs.convex.dev/components/using
- Convex R2 component: https://github.com/get-convex/r2
