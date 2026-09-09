# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Individual developers and open-source maintainers who maintain one or a few of their own GitHub repositories and want that repo's social preview image to look polished and intentional instead of GitHub's generic/blank default.

## Product Purpose

GitCardX lets a developer customize and export a GitHub-compliant social preview image (1280×640px, 2:1 ratio — GitHub's documented recommended size for a repository's Settings → Social preview) for their project: pick the GitHub avatar/username, repo name, project name/description, brand colors, logo and background image, see it update live, then download it as a PNG ready to upload. Success is an exported image that looks noticeably more branded/professional than GitHub's default blank preview, with zero design tooling or skill required.

## Positioning

GitHub does not generate an attractive social preview by default — a repo without one uploaded shows a plain, generic card whenever it's shared (on social media, in a README badge, in search previews). GitCardX is a purpose-built, no-signup, no-design-skill editor for exactly that one image, at exactly GitHub's own required dimensions — not a generic banner/graphic maker repurposed for the job.

## Operating Context

Static, client-only web app (Astro `output: 'static'`) — no backend, no accounts/auth, no database. Runs entirely in the browser: fetches only the public, unauthenticated GitHub REST API (`GET /users/{username}`) for avatar/username lookup; export is done in-browser via html2canvas (DOM → canvas → PNG download); draft state (colors, text fields, uploaded images) autosaves to `localStorage` so a maintainer can leave and resume. Single-page flow — no routing, no user accounts.

## Capabilities and Constraints

- The exported PNG's exact 1280×640px (2:1) dimensions are non-negotiable — this is GitHub's documented social-preview requirement (min 640×320px, PNG/JPG under 1MB) and the app's entire reason to exist; never alter it during visual work.
- English-only UI; no i18n system exists.
- MIT-licensed, public repository (`sandovaldavid/GitCardX`).
- Smart/dumb Astro component architecture with `nanostores` for cross-island state — structural, not visual; a redesign changes look, not this architecture.
- Tailwind CSS v4 (CSS-first `@theme` config, `@tailwindcss/vite`) is the current styling system.

## Brand Commitments

Product name **GitCardX** and its existing wordmark/logo asset (`public/images/logo-github-card-generator.webp`) stay. No other visual element is binding — the current dark GitHub-toned look (background `#0d1117`, accent `#00a0ff`) is incumbent implementation, not a confirmed brand commitment, and is open to replacement.

## Evidence on Hand

`README.md` (feature list, usage instructions, a demo screenshot at `assets/image.png`) and `LICENSE` (MIT, author Juan David Sandoval Salvador / `@sandovaldavid`) are the only existing product documents. No user research, testimonials, case studies, or usage metrics exist — do not fabricate any of these during design work.

## Product Principles

1. The exported PNG is the product — every visual decision in the editor serves making that one 1280×640 image look great; the editor chrome is secondary.
2. Zero design skill required — sensible defaults and a small number of clear controls beat a blank-canvas/Figma-like surface.
3. Solo-maintainer speed — no signup, no server round-trip beyond the public GitHub API, instant live preview, nothing that adds friction for a one-person workflow.
4. Developer-credible, not GitHub-impersonating — the tool's own identity should read as technically trustworthy to a developer audience without imitating GitHub's own official branding.
5. Respect GitHub's actual constraints — dimensions/format must always match what GitHub's Settings → Social preview accepts; this is a hard technical fact, not a style choice.

## Accessibility & Inclusion

WCAG AA baseline already established (text/UI contrast, visible keyboard focus, ≥44×44px touch targets, `prefers-reduced-motion` support) — a durable requirement to maintain through any redesign, not regress.
