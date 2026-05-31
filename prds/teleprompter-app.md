# Teleprompter App PRD

Created: 2026-05-28T18:54:38Z

## Goal

Build a local black and white teleprompter app inspired by Teleprompter Pro basics: script editing, clean prompting, scroll control, font size control, playback speed, and presentation-focused reading.

## Requirements

- Tab 1 shows the teleprompter.
- Tab 2 lets the user add and edit script text.
- Teleprompter surface is black with white text.
- User can adjust scroll position, font size, and scroll speed from the teleprompter view.
- Script and settings persist through Convex.
- UI should avoid browser default prompts and keep controls production-ready.

## Implementation

- Use Vite, React, TypeScript, and Convex.
- Store a single local prompt document in Convex with a stable key.
- Use an indexed Convex query for the local prompt lookup.
- Keep controls visible on the prompter stage.
- Include mirror and reading guide toggles as basic prompter features.
