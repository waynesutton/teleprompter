# Build video setup

This guide defines the production path for turning links, docs, scripts, and prompts into generated videos inside Teleprompt.

## What Build should do

Build is the logged-in workspace for everything that creates new assets:

- Generate a prompt-ready script from notes, URLs, markdown links, or saved scripts.
- Save per-user API keys for AI, scraping, narration, video delivery, and avatar providers.
- Save scripts, videos, combined Build items, and Video Project Builder drafts to the signed-in user's private library.
- Plan video jobs from source material without blocking the normal teleprompter workflow.
- Track video job status in Convex so the UI updates in real time.

Anonymous users should still be able to paste or type a script and use Prompter. Saving, Build items, Video Project Builder drafts, AI, Firecrawl, narration, transcription, and video building require GitHub login.

## What requires keys or external services

| Feature | Requirement |
| --- | --- |
| Save scripts, videos, or both | GitHub login. Saved Build items are private to the user. |
| Transcript to strategy to EDL from pasted script text | GitHub login to save. No AI key is required for the current local draft helper. |
| URL or markdown-link context | GitHub login plus a Firecrawl API key. |
| AI-assisted script, strategy, shot list, or EDL | GitHub login plus OpenAI, Claude, or OpenRouter. |
| Word-level media transcription | GitHub login plus a transcription provider such as ElevenLabs Scribe or another worker-backed speech-to-text service. |
| Final MP4 rendering | External render worker/provider such as HyperFrames, Remotion, ffmpeg, R2, and Mux. The browser and Convex actions should not render final MP4 files. |

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
   - Use HyperFrames when the agent writes HTML/CSS video compositions from source material.
   - Use Remotion when the app needs React-based video templates and cloud rendering.
   - Do not render MP4s inside Convex actions. Run render workers outside Convex and write job state back to Convex.

5. **Store artifacts**
   - Use Cloudflare R2 through the Convex R2 component for large render outputs, frame captures, audio files, and intermediate artifacts.
   - Store only metadata and storage keys in Convex tables.

6. **Deliver playback**
   - Use the Mux Convex component for uploaded assets, playback IDs, webhooks, thumbnails, and video status.
   - Keep Mux API credentials user-owned when rendering is BYOK, or deployment-owned if the app later offers managed video hosting.

## Provider roles

| Provider | Role | Notes |
| --- | --- | --- |
| Firecrawl | Source capture | Scrapes URLs into markdown before script/video planning. |
| OpenAI, Claude, OpenRouter | Writing and planning | Generates scripts, outlines, shot lists, and composition specs. |
| HyperFrames | Agent-authored rendering | Best for deterministic HTML-to-video workflows and self-correcting render loops. |
| Remotion | React video rendering | Best for React templates and Lambda or Cloud Run render backends. |
| Cloudflare R2 | Artifact storage | Best for MP4s, frames, audio, and source bundles. |
| Mux | Playback and asset sync | Best for uploads, asset metadata, playback IDs, webhooks, and streaming. |
| HeyGen | Optional avatar/narration | Keep separate from Script Voice Profiles and ElevenLabs narration voice. |

## Convex tables to add later

Build items now store video project planning artifacts. Add dedicated job tables only when rendering workers are wired.

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
- BYOK settings for OpenAI, Claude, OpenRouter, Firecrawl, ElevenLabs, Mux, and HeyGen.
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
