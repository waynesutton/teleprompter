# Teleprompt

Teleprompt is an open source browser teleprompter for writing, organizing, generating, and reading scripts.

It is built for one person recording a talk, product update, tutorial, or video script who wants the script editor and the live prompter in the same app.

## Features

- Browser teleprompter with live scroll, page controls, fit-to-window, mirror, guide line, and dock hide/show.
- RSVP reading mode with one-word-at-a-time playback and red ORP pivot-letter highlighting.
- Script editor with preview, page breaks, color formatting, markdown export, counters, and app-driven undo.
- Shared script library with folders, save, load, and delete.
- Keyboard shortcuts for playback, tab switching, sizing, speed, pages, RSVP, help, undo, counter visibility, and control-bar visibility.
- Optional AI script generator using OpenAI, Claude, OpenRouter, and Firecrawl URL context.
- Built-in Script Voice Profiles for AI generation: WayneSutton.ai, Teleprompter Natural, Founder Update, YouTube Intro, Investor Pitch, Educator, and High-Energy Creator.
- Custom Script Voice Profiles saved in Convex with audience, tone, pacing, banned words, preferred phrases, examples, structure, and default length.
- Optional ElevenLabs voice setup gate for narration features.
- Tab 3 app docs, shortcut reference, saved defaults, and About feature table.
- Graphite-styled UI with Phosphor Icons and accessible font options.
- Convex static hosting for serving the built Vite app.

## How the app works

Use **Tab 2 Script** to write, paste, save, load, format, preview, or generate a script.

Use **Tab 1 Prompter** to read it live. Scroll mode behaves like a standard teleprompter. RSVP mode shows one word at a time with a red pivot letter.

Use **Tab 3 Help** for app docs, keyboard shortcuts, defaults, and the About section.

AI is optional. Without AI environment variables, the core teleprompter still works. If a user clicks an AI-only feature before setup, the app shows an in-app setup message.

## Script voice vs narration voice

**Script Voice Profiles** control how generated scripts are written.

They affect tone, pacing, audience, structure, preferred phrases, banned words, and examples.

**Narration voice** is separate. It only matters when ElevenLabs voice features are configured.

## Stack

- React 19
- Vite 7
- TypeScript
- Convex
- `@convex-dev/static-hosting`
- Phosphor Icons
- Fontsource fonts
- ESLint

## Convex components

| Component | Use |
| --- | --- |
| `@convex-dev/static-hosting` | Serves the built Vite app from Convex storage. |

The app also uses regular Convex functions for prompt state, saved scripts, custom Script Voice Profiles, AI setup checks, AI generation, RSVP rewriting, and voice setup checks.

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

Optional AI and voice features:

```bash
OPENAI_API_KEY=
OPENAI_SCRIPT_MODEL=

ANTHROPIC_API_KEY=
ANTHROPIC_SCRIPT_MODEL=

OPENROUTER_API_KEY=
OPENROUTER_SCRIPT_MODEL=
OPENROUTER_SITE_URL=
OPENROUTER_APP_NAME=

FIRECRAWL_API_KEY=
ELEVENLABS_API_KEY=
```

The app works without the optional keys. Those controls show setup messages instead of blocking the main teleprompter.

## Scripts

```bash
npm run typecheck
npm run lint
npm run build
npm run deploy:static:dev
npm run deploy:static
```

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
