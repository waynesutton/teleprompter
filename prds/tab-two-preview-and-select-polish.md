# Tab Two Preview And Select Polish

Created: 2026-05-31T04:58:00Z
Completed: 2026-05-31T05:05:00Z

## Goal

Polish Tab 2 so the editor controls feel consistent with the PromptDeck UI, avoid browser-default dropdowns, and add a fast script preview next to the editor label.

## Scope

- Add an edit/preview toggle beside the Script text label.
- Keep Whole text and Selection formatting controls on one compact row when space allows.
- Add a darker grey text color option for whole-script and selected text formatting.
- Replace native select controls with a styled reusable select component.
- Keep the teleprompter reading surface behavior unchanged.

## Verification

- Run Convex generation once after schema changes.
- Run typecheck, lint, and production build.
- Deploy the static app after checks pass.
