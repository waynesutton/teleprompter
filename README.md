# Teleprompt

A browser-based teleprompter for writing, saving, formatting, and presenting scripts with a clean reading view.

## Features

- Three-tab workflow: prompter, script editor, and help/settings.
- Smooth scrolling with speed, text size, fit-to-window, mirror, guide, and dock controls.
- Script editor with preview, page breaks, formatting, markdown export, and undo.
- Shared saved script library with folders, load, save, and delete.
- Keyboard shortcuts for prompting, tab switching, help, and script editing.
- Optional AI script generation with OpenAI, Claude, OpenRouter, and Firecrawl URL context.
- Optional ElevenLabs voice setup gate for future voice-follow controls.
- Accessible font choices, including Lexend and OpenDyslexic.
- Convex static hosting for deploying the Vite app.

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

The app also uses regular Convex functions for prompt state, saved scripts, AI setup checks, AI generation, and voice setup checks.

## Getting started

```bash
npm install
npm run convex
```

In another terminal, run the Vite app:

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

The app still works without the optional keys. Those controls show setup messages instead of breaking the main teleprompter flow.

## Scripts

```bash
npm run typecheck
npm run lint
npm run build
npm run deploy:static:dev
npm run deploy:static
```

## Open source

This project is open source: [waynesutton/teleprompter](https://github.com/waynesutton/teleprompter).
