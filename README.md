# Teleprompt

Teleprompt is an open source browser teleprompter for writing, organizing, generating, and reading scripts.

It is built for one person recording a talk, product update, tutorial, or video script who wants the script editor and the live prompter in the same app.

## Features

- Browser teleprompter with live scroll, page controls, fit-to-window, mirror, guide line, and dock hide/show.
- Mini popup prompter view with synced scroll/RSVP state, playback state, page progress, and keyboard shortcuts.
- RSVP reading mode with one-word-at-a-time playback and red ORP pivot-letter highlighting.
- Script editor with preview, page breaks, color formatting, markdown export, counters, and app-driven undo.
- Shared script library with folders, save, load, and delete.
- Keyboard shortcuts for playback, tab switching, sizing, speed, pages, mini view, RSVP, help, undo, counter visibility, and control-bar visibility.
- Optional AI script generator using OpenAI, Claude, OpenRouter, and Firecrawl URL context.
- Built-in Script Voice Profiles for AI generation: Teleprompter Natural, Founder Update, YouTube Intro, Investor Pitch, Educator, and High-Energy Creator.
- GitHub login with per-user saved scripts, folders, defaults, API keys, and custom Script Voice Profiles.
- Bring-your-own-key AI setup for OpenAI, Claude, OpenRouter, Firecrawl, and ElevenLabs.
- Logged-in Build workspace for saving script, video, or combined project items with edit, archive, restore, and delete controls.
- Logged-in Video Project Builder with transcript reading view, edit strategy, EDL JSON, subtitle style, render checklist, output format, and persistent project memory.
- Custom Script Voice Profiles saved per user in Convex with audience, tone, pacing, banned words, preferred phrases, examples, structure, and default length.
- Optional ElevenLabs voice setup gate for narration features.
- Tab 3 app docs, shortcut reference, saved defaults, and About feature table.
- Graphite-styled UI with Phosphor Icons and accessible font options.
- Convex static hosting for serving the built Vite app.

## How the app works

Use **Tab 2 Script** to write, paste, save, load, format, preview, or generate a script.

Use **Tab 1 Prompter** to read it live. Scroll mode behaves like a standard teleprompter. RSVP mode shows one word at a time with a red pivot letter. The mini view opens a compact synced popup for recording setups where the full app should stay out of the way.

Use **Build** to generate scripts, manage BYOK provider setup, save reusable Build items, and draft video projects from links, docs, scripts, or prompts. Build requires GitHub login for saving. Drafting from pasted script text does not need an AI key after login, but URL context needs Firecrawl, AI-assisted strategy/EDL needs OpenAI, Claude, or OpenRouter, transcription needs a speech-to-text provider, and final video rendering needs an external worker/provider pipeline.

Use **Help** for app docs, keyboard shortcuts, defaults, and the About section.

AI is optional. Without login, the core teleprompter still works. Logged-in users add their own provider keys in Build settings.

## Script voice vs narration voice

**Script Voice Profiles** control how generated scripts are written.

They affect tone, pacing, audience, structure, preferred phrases, banned words, and examples.

**Narration voice** is separate. It only matters when ElevenLabs voice features are configured.

## Stack

- React 19
- Vite 7
- TypeScript
- Convex
- Convex Auth
- `@convex-dev/static-hosting`
- Phosphor Icons
- Fontsource fonts
- ESLint

## Convex components

| Component | Use |
| --- | --- |
| `@convex-dev/static-hosting` | Serves the built Vite app from Convex storage. |

The app also uses regular Convex functions for per-user prompt state, saved scripts, custom Script Voice Profiles, encrypted BYOK setup, AI generation, RSVP rewriting, and voice setup checks.

## Getting started

```bash
npm install
npm run convex
```

In another terminal:

```bash
npm run dev
```

## Environment

Required for the frontend:

```bash
VITE_CONVEX_URL=
```

Required for GitHub login:

```bash
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
SITE_URL=
JWT_PRIVATE_KEY=
JWKS=
USER_KEYS_SECRET=
```

Optional legacy migration:

```bash
LEGACY_OWNER_EMAIL=
LEGACY_OWNER_GITHUB_LOGIN=
```

User-owned optional keys are entered in the app after GitHub login:

```bash
OpenAI
Claude
OpenRouter
Firecrawl
ElevenLabs
```

The app works without login for local paste/type/read workflows. Saving, loading, Build items, Video Project Builder drafts, AI, Firecrawl, voice setup, defaults, and custom voice profiles require GitHub login.

## Scripts

```bash
npm run typecheck
npm run lint
npm run build
npm run deploy
npm run deploy:backend:prod
npm run deploy:static
npm run deploy:static:prod
npm run deploy:static:dev
```

Use `npm run deploy` when backend functions, schema, components, auth routes, or static files changed. It runs the production Convex deploy first, then uploads the production static build.

Use `npm run deploy:static` or `npm run deploy:static:prod` for the production app at `https://befitting-dodo-95.convex.site/`.

Use `npm run deploy:static:dev` only when intentionally uploading to the development app at `https://fearless-dolphin-422.convex.site/`.

Do not run `npm run build` as a separate deploy step before static upload. The static-hosting `--build --prod` flow injects the production `VITE_CONVEX_URL`; a standalone build can use the dev URL from `.env.local`.

## Public metadata

The app includes:

- SVG favicon
- 1200x630 social share image
- Open Graph metadata
- Twitter large image card metadata
- JSON-LD for the software app and common questions
- Robots policy and sitemap

## Open source

This project is open source: [waynesutton/teleprompter](https://github.com/waynesutton/teleprompter).
