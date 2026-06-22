# PromptDeck

PromptDeck is an open source browser teleprompter for writing, organizing, generating, and reading scripts.

It is built for one person recording a talk, product update, tutorial, or camera-ready script who wants the script editor and the live prompter in the same app.

## Features

- Browser teleprompter with live scroll, page controls, fit-to-window, mirror, guide line, and dock hide/show.
- Mini popup prompter view with synced scroll/RSVP state, playback state, page progress, and keyboard shortcuts.
- RSVP reading mode with one-word-at-a-time playback and red ORP pivot-letter highlighting.
- Script editor with preview, page breaks, color formatting, markdown export, counters, and app-driven undo.
- Per-user script library with folders, save, load, and delete after GitHub login.
- Keyboard shortcuts for playback, tab switching, sizing, speed, pages, mini view, RSVP, About, undo, counter visibility, and control-bar visibility.
- Optional AI script generator using OpenAI, Claude, OpenRouter, and Firecrawl URL context.
- Built-in Script Voice Profiles for AI generation: Teleprompter Natural, Founder Update, YouTube Intro, Investor Pitch, Educator, High-Energy Creator, DevRel, and Viral Video.
- GitHub login with per-user saved scripts, folders, default settings, API keys, and custom Script Voice Profiles.
- Bring-your-own-key setup for OpenAI, Claude, OpenRouter, Firecrawl, and ElevenLabs.
- Logged-in Build workspace for generating, saving, editing, archiving, restoring, and deleting script Build items.
- Custom Script Voice Profiles saved per user in Convex with audience, tone, pacing, banned words, preferred phrases, examples, structure, and default length.
- Optional ElevenLabs voice setup gate for narration features.
- About docs, shortcut reference, and open source feature table.
- PromptDeck-styled UI with Phosphor Icons and accessible font options.
- Convex static hosting for serving the built Vite app.

## How the app works

Use **Tab 2 Script** to write, paste, save, load, format, preview, or generate a script.

Use **Tab 1 Prompter** to read it live. Scroll mode behaves like a standard teleprompter. RSVP mode shows one word at a time with a red pivot letter. The mini view opens a compact synced popup for recording setups where the full app should stay out of the way.

Use **Build** to generate scripts and save reusable script Build items from links, docs, scripts, notes, or prompts. Build requires GitHub login for saving. URL context needs Firecrawl, and AI generation needs OpenAI, Claude, or OpenRouter.

Use **About** for app docs, keyboard shortcuts, and the open source feature table.

Use **Account** after GitHub login to manage profile actions, default script settings, BYOK provider keys, and custom setup.

AI is optional. Without login, the core teleprompter still works. Logged-in users add their own provider keys in Account settings.

## Script voice vs narration voice

**Script Voice Profiles** control how generated scripts are written.

They affect tone, pacing, audience, structure, preferred phrases, banned words, and examples.

**Narration voice** is separate. It only matters when ElevenLabs voice features are configured.

## Stack

- React 19
- Vite 7
- TypeScript
- [Convex](https://www.convex.dev/)
- [Convex Auth](https://docs.convex.dev/auth/convex-auth)
- [`@convex-dev/static-hosting`](https://www.convex.dev/components/static-hosting)
- Phosphor Icons
- Fontsource fonts
- ESLint

## Convex components

| Component | Use |
| --- | --- |
| [`@convex-dev/static-hosting`](https://www.convex.dev/components/static-hosting) | Serves the built Vite app from Convex storage. |

See the [Convex Components directory](https://www.convex.dev/components) for the component catalog.

PromptDeck also uses regular Convex app code for private script data, user settings, BYOK setup, AI generation, RSVP rewriting, and voice setup checks.

| Convex area | How PromptDeck uses it | Docs |
| --- | --- | --- |
| Convex backend | Queries, mutations, actions, schema validation, and generated TypeScript APIs. | [Functions](https://docs.convex.dev/functions), [schemas](https://docs.convex.dev/database/schemas), [TypeScript](https://docs.convex.dev/understanding/best-practices/typescript) |
| Convex Auth | GitHub login for private scripts, folders, Build items, custom voices, defaults, and BYOK settings. | [Convex Auth](https://docs.convex.dev/auth/convex-auth) |
| Convex database | Per-user prompt state, saved scripts, folders, Build items, custom Script Voice Profiles, prompt settings, and encrypted key records. | [Database](https://docs.convex.dev/database) |
| Convex actions | Server-side AI provider calls, Firecrawl URL context, RSVP rewrite, and ElevenLabs setup checks. | [Actions](https://docs.convex.dev/functions/actions) |
| Convex static hosting | Production and development uploads for the built Vite app. | [Static hosting component](https://www.convex.dev/components/static-hosting) |

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

The app works without login for local paste/type/read workflows. Saving, loading, Build items, AI, Firecrawl, voice setup, defaults, and custom voice profiles require GitHub login.

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
