Created: 2026-05-31 19:04 UTC
Last Updated: 2026-05-31 19:04 UTC
Status: Done

# App Metadata And README Refresh

## Problem

The app has a default title and no favicon, share thumbnail, Open Graph metadata, Twitter card metadata, structured data, robots policy, or current README coverage for the latest features.

## Root Cause

The initial Vite scaffold kept `index.html` minimal, and recent product work added major features faster than the public metadata and README were updated.

## Proposed Solution

- Add a custom SVG favicon.
- Add a large social thumbnail for Open Graph and Twitter cards.
- Add SEO/AEO/GEO metadata to `index.html`.
- Add JSON-LD structured data for the software app and key questions.
- Add `robots.txt`.
- Update `README.md` with the latest feature set and current optional environment variables.

## Files To Change

- `index.html`
- `public/favicon.svg`
- `public/social-card.svg`
- `public/robots.txt`
- `README.md`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Social platforms may vary in SVG thumbnail support, but the SVG remains valid and self-contained.
- Metadata should not reference unavailable routes or missing image files.
- README should mention optional AI and voice setup without implying they are required.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Confirm referenced static asset paths exist.
- Deploy static build if verification passes.

## Task Completion Log

- 2026-05-31 19:04 UTC - Added SVG favicon, large SVG social card, robots policy, sitemap, expanded head metadata, JSON-LD app/FAQ data, and refreshed README.
- 2026-05-31 19:04 UTC - Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and static hosting deploy.
