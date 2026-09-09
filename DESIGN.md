---
name: GitCardX
description: A CI pipeline for building your GitHub social-preview card — fields turn from pending to passing like a build going green.
colors:
  graphite-base: "#0b0d10"
  page-bg: "#0d1117"
  surface: "#161b22"
  surface-hover: "#1c232c"
  border-muted: "#232a33"
  border-deep: "#06070a"
  text-body: "#c9d1d9"
  text-label: "#8b96a3"
  build-accent: "#2dd4bf"
  build-accent-hover: "#22b8a6"
  secondary: "#1c232c"
  secondary-hover: "#232c37"
  danger: "#f85149"
  danger-hover: "#da3633"
  status-pending: "#94a3b0"
  status-running: "#d29922"
  status-passing: "#3fb950"
  status-failing: "#f85149"
  shadow-ink: "#000000"
  overlay-white: "#ffffff"
  footer-heading: "#f5f5f5"
  footer-link-muted: "#aaaaaa"
  footer-caption: "#b3b3b3"
  selection-ink: "#f2f6f8"
typography:
  body:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.2
  label-mono:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.7rem"
    fontWeight: 600
    letterSpacing: "0.08em"
  scale:
    input: "0.875rem"
    small-action: "0.8rem"
    label-mono-lg: "0.75rem"
    headline-md: "1.8rem"
    headline-sm: "1.6rem"
    caption: "0.9rem"
    subhead-lg: "1.4rem"
    subhead: "1.2rem"
    toast-icon: "18px"
rounded:
  sm: "6px"
  md: "12px"
  pill: "999px"
  circle: "50%"
  xxs: "4px"
  chip: "8px"
  brand-mark: "10px"
  control-track: "3px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.build-accent}"
    textColor: "{colors.graphite-base}"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
  button-primary-hover:
    backgroundColor: "{colors.build-accent-hover}"
  button-action:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-body}"
    rounded: "{rounded.sm}"
    padding: "10px 15px"
  button-download:
    backgroundColor: "{colors.secondary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
  stage-pill-passing:
    textColor: "{colors.status-passing}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
    typography: "{typography.label-mono}"
  stage-pill-failing:
    textColor: "{colors.status-failing}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
    typography: "{typography.label-mono}"
---

# Design System: GitCardX

## Overview

**Creative North Star: "CI Pipeline / Status Graph"**

GitCardX exists because GitHub ships a blank, generic social-preview card by default; this tool's own chrome earns the right to sit next to that fix by reading as technically credible rather than as a toy banner-maker. The shipped world takes that credibility literally: filling in the card's fields is framed as watching a CI run, not filling out a form. A near-black graphite base (`#0b0d10` / `#0d1117`) reads as a terminal/dashboard surface; one teal accent (`#2dd4bf`) stands in for "build/active," used sparingly against the graphite so its rarity keeps its meaning; a four-state semantic status system (pending → gray, running → amber, passing → green, failing → red) drives real field validity everywhere a panel needs to say whether its own inputs are valid, not just a decorative badge scheme. JetBrains Mono is reserved for stage labels, status pills, and technical readouts (never headings or prose); Manrope carries all prose and headings. This is a working system, not a plain dark-GitHub reskin — the previous incumbent (`#0d1117` / `#00a0ff`) is gone from active use except where two variable names (`--border-color`/`--bg-color`) are deliberately left pointed at the *exported card's own* independent theme (see Boundary, below).

The signature mechanism is the stage-rail: three pipeline nodes (Configure → Style → Assets) feeding into the card-preview artifact, each node's pill driven by the same `stageStatusStore` a panel already uses for its own local pill, so the rail and each panel physically cannot drift out of sync. The rail's own terminus is not a fourth duplicate pill — it is a plain arrow that points at the live card preview, which lights its own "BUILD ARTIFACT" tag from the identical status derivation, so the pipeline visibly resolves into the real artifact instead of ending at another badge.

**Key Characteristics:**
- Near-black graphite base with one teal accent used only for the active/build state, never as decoration
- A single semantic status vocabulary (pending/running/passing/failing) reused for pills, rail nodes, and the artifact tag — never a second ad hoc badge scheme
- JetBrains Mono strictly for stage labels, status text, and dimension/technical readouts; Manrope everywhere else
- Flat, bordered surfaces on the graphite base, not shadows-as-depth (a soft ambient shadow exists but is not the system's depth language)
- The stage-rail/`stageStatusStore` pairing is this build's one distinctive, product-specific pattern

## Colors

The palette is a dark graphite base with a single active accent and a four-step semantic status ramp; there is no secondary/tertiary decorative color family.

### Primary
- **Build Teal** (`#2dd4bf`, hover `#22b8a6`): the one active/build accent — primary buttons, hover states on interactive chrome, the card-preview border glow when the build passes, link and heading accents in the footer. Used narrowly; it is not a background color.

### Neutral
- **Graphite Base** (`#0b0d10`): the app's true page-level dark, named `--color-light-gray`/`--light-gray` in code (kept from the prior palette's naming so existing components didn't need renaming) — page background, input backgrounds.
- **Page Ink** (`#0d1117`): `--bg-color`/`--color-bg` — reserved for the exported card's own background (see Boundary); not used as app-chrome background.
- **Panel Surface** (`#161b22`): `--neutral-bg` — the background of every stage panel, the header, the stage-rail track.
- **Panel Surface Hover** (`#1c232c`): `--neutral-bg-hover` / also doubles as `--secondary-color` — hover state for panel-toned buttons and secondary actions.
- **Border Muted** (`#232a33`): `--medium-gray` — the standard 1px border on panels, cards, inputs, the rail track.
- **Deepest Ink** (`#06070a`): `--dark-gray` — footer background only.
- **Body Text** (`#c9d1d9`): `--body-color` — default text color on the graphite base.
- **Label Text** (`#8b96a3`): `--label-color` — form labels, rail node labels, dimension readouts, muted secondary text.
- **Danger** (`#f85149`, hover `#da3633`): destructive actions (reset button) and doubles as the `failing` status color — intentional reuse, not two separate reds.
- **Shadow Ink** (`#000000`): the base color behind every box-shadow's rgba tint in the app (`rgba(0,0,0,0.35)` panel-ambient, `rgba(0,0,0,0.15)` toast lift) — shadows are documented separately under Elevation & Depth, but the underlying color is canon here so a shadow's alpha can vary without the color itself reading as undocumented drift.
- **Overlay White** (`#ffffff`): the base for translucent light-on-dark overlays (`rgba(255,255,255,0.1)` footer border/social-icon fill) — distinct from the near-white footer text tones below, which are opaque.

### Footer On-Dark Text (a small, footer-scoped neutral ramp)
The footer sits on `--dark-gray` and needs its own near-white text steps, separate from the graphite-base `text-body`/`text-label` pair used everywhere else in the app chrome:
- **Footer Heading** (`#f5f5f5`): footer logo wordmark (`.footer-logo h3`).
- **Footer Link (idle)** (`#aaaaaa`): footer link text before hover (hover goes to solid white).
- **Footer Caption** (`#b3b3b3`): the `.footer-bottom` copyright/credit line, the footer's most muted text.
- **Selection Ink** (`#f2f6f8`): `::selection` text color, chosen for contrast against the teal-tinted `::selection` background — a one-off browser-chrome color, not reused elsewhere.

### Semantic status (the system's core vocabulary)
- **Pending** (`#94a3b0`): untouched/neutral state — a stage nobody has interacted with yet.
- **Running** (`#d29922`, amber): a stage currently being validated/typed into.
- **Passing** (`#3fb950`, green): a stage whose real validation succeeded.
- **Failing** (`#f85149`, red): a stage whose real validation failed — shares its hex with the Danger neutral role above.

### Named Rules
**The One Accent Rule.** Teal (`#2dd4bf`) is the only color that means "active/build." It never appears as a passive background fill or a decorative flourish — every use is tied to an interactive or build-state moment.

**The Single Status Vocabulary Rule.** Any UI element that needs to say "is this valid" — a rail node, a panel's local pill, a toast, the artifact tag — reads its state from the same four `status-*` tokens and the same `stageStatusStore`. A new indicator that invents its own color for "valid" is a system violation.

## Typography

**Display/Headline Font:** Manrope (with `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` fallback)
**Body Font:** Manrope (same stack)
**Label/Mono Font:** JetBrains Mono (with `monospace` fallback) — loaded via Google Fonts CDN, not self-hosted (see Known Gaps)

**Character:** Manrope carries every heading and paragraph with a plain, confident weight scale (400/600/700/800 available, 600 used for most headings); JetBrains Mono is never decorative — it appears exactly where the CI metaphor needs a "console readout" register: stage labels, status-pill text, and the card-preview's dimension/artifact tags.

### Hierarchy
- **Headline** (600, 2.25rem / 1.8rem at ≤768px / 1.6rem at ≤480px, line-height ~1.2): the app's `<h1>` (product name) and panel `<h2>`s.
- **Title** (600, default body size, line-height 1.6): panel section headings, footer column headings.
- **Body** (400, 1rem, line-height 1.6): form labels' surrounding prose, footer link text, card description text.
- **Label/Mono** (600, 0.7–0.75rem, letter-spacing 0.02–0.08em, uppercase for rail labels): stage-pill text, rail-node labels, the card-preview's "BUILD ARTIFACT" tag and "1280 × 640 px" dimension readout (both render at 0.75rem/12px, the ramp's `label-mono-lg` step).
- **Input** (0.875rem/14px): the value text inside text inputs, textareas, and the color-hex/filename readouts next to file/color pickers — one step below body, distinguishing form-field content from surrounding prose.
- **Small Action** (0.8rem): compact destructive/secondary buttons (`.btn-small`, dropzone's small remove button) where the 44px touch target is taller than the label needs.
- **Subhead** (1.2–1.4rem): footer column headings (`.footer-links h4`, `.footer-social h4` at 1.2rem; `.footer-logo h3` at 1.4rem, 1.2rem at ≤480px) — one step below the app headline, for secondary section titles outside the stage panels.
- **Caption** (0.9rem): the rail terminus arrow, footer link icons, and the footer-bottom copyright line — small supporting text that isn't mono/technical.
- **Toast Icon** (18px): the status icon glyph inside a toast notification.

### Named Rules
**The Mono-Means-Machine Rule.** JetBrains Mono only ever labels something the pipeline metaphor treats as machine-generated output (a status, a stage name, a pixel dimension). It never sets a heading, a button label, or a paragraph — that would blur the "human prose vs. build readout" distinction the whole metaphor depends on.

## Layout

The app is a fixed three-panel workbench under a stage-rail header strip. `.app-layout` is a CSS grid, `3fr 5fr 2fr` (Configure/Assets panels flanking a wider center preview) at desktop width, collapsing to `1fr 1fr` with the right panel spanning both columns at ≤1200px, and a single stacked column (Configure → Preview → Style/Assets) at ≤768px. The stage-rail itself is a horizontal flex track of three nodes plus connectors at desktop, becoming a vertical stack (each node as a row, connectors as short vertical bars) at ≤768px — matching the direction contract's stated "horizontal desktop, vertical mobile" shape exactly. Page background is a sticky-footer flex column (`body { display:flex; flex-direction:column }`, `.container { flex: 1 0 auto }`) so a short page's footer still sits at the true bottom of the viewport. Panels and the rail track share a consistent internal padding of 1.5rem (panels) / 1.25rem–1.5rem (rail track), and a repeating breakpoint cascade of 480/600/768/992/1200px is used throughout.

## Elevation & Depth

Flat by default: surfaces are distinguished by a 1px `--medium-gray` border and a slightly lighter background tone (`--neutral-bg` panels on `--light-gray` page), not by shadow stacking. One soft ambient shadow (`0 4px 15px rgba(0,0,0,0.35)`) sits under the side panels and the card-preview frame as a mild lift off the page, and a second, accent-tinted shadow (`0 4px 20px color-mix(in srgb, var(--status-passing) 25%, transparent)`) appears on the card-preview frame specifically when the build status is passing — an intentional status signal, not a generic hover effect.

### Named Rules
**The Status-Earns-Glow Rule.** The only shadow that changes color in this system is the card-preview's passing-state glow. A shadow's color is never decorative; if it shifts, it is reporting a real status.

## Shapes

Two radius steps cover most of the app: a small `6px` on inputs, buttons, and stage panels' inner controls, and a larger `12px` on top-level surfaces (stage panels, the rail track, the card-preview frame). Status pills and the rail-node dots are fully round (`999px` / `50%`) — round shape is reserved for status/identity indicators (pills, avatar, logo), never for containers. Borders are uniformly 1px solid `--medium-gray`, except the card-preview frame's bottom edge, which carries a thick 2rem border in the user's own chosen `--border-color` (this belongs to the exported card's theme, not this system — see Boundary).

A handful of smaller chrome elements need their own micro-scale, since they sit below the 6px floor or between 6px and 12px:
- **`4px` (`xxs`):** the card-preview frame's own tiny overlay tags — the "BUILD ARTIFACT" tag and the "1280 × 640 px" dimension readout — small enough that 6px would look chunky relative to their padding.
- **`3px` (`control-track`):** the opacity slider's native range-input track, rounded just enough to read as a track rather than a bar, distinct from the 24px fully-round thumb it carries.
- **`8px` (`chip`):** the footer logo image and the toast notification body — small raised chips that don't belong on either the 6px control floor or the 12px panel scale.
- **`10px` (`brand-mark`):** the app's own header logo image (`.app-logo`) — one step alone, reserved for the product's own brand mark, not reused elsewhere.

## Components

### Buttons
- **Shape:** 6px radius, 44px minimum height (touch-target floor), `10px 15px` padding by default.
- **Primary** (`.btn-primary`): teal background (`#2dd4bf`) on graphite text, used for the one "commit an action" button per context; hover darkens to `#22b8a6` and lifts 1px.
- **Action / Secondary** (`.btn-action`): panel-surface background (`#161b22`) with body-color text — the default, low-emphasis button (e.g. "Load" profile).
- **Download** (`.btn-download`): `--secondary-color` (`#1c232c`) background, white text — the export action's own tone, distinct from primary teal so "export" doesn't compete visually with in-progress build state.
- **Reset / Small** (`.btn-reset`, `.btn-small`): muted panel tone or danger tone respectively; `.btn-small` reuses the danger color for a destructive small action.

### Stage Pill (signature component)
The one shared primitive: `<span class="stage-pill stage-pill--{pending|running|passing|failing}">`. A leading `currentColor` dot (8px circle) plus mono-set label text, fully rounded, background is the status color at 16% opacity via `color-mix`. It appears in three synchronized places reading the same `stageStatusStore`: the stage-rail nodes (`index.astro`), each smart panel's own local pill (e.g. `CardEditorPanel`'s `#configureStagePill`), and conceptually the card-preview's "BUILD ARTIFACT" tag (which reuses the same four status colors on its `::before` pseudo-element rather than the pill markup itself, since it's a single always-visible tag, not a discrete list item). **To extend:** a fifth stage would add one key to `StageStatusData` in `cardState.ts`, one `.rail-node` in the rail markup, and the panel that owns that field would call `setStageStatus('newKey', ...)`; the pill and rail render automatically from the existing CSS with no new classes needed.

### Stage Panel (signature component)
`.stage-panel` — the shared surface for every "Configure/Style/Assets" panel: `--neutral-bg` background, 1px `--medium-gray` border, 12px radius, 1.5rem padding. Each panel computes its own field validity locally (see `CardEditorPanel`'s `computeConfigureStatus`) and calls `setStageStatus`; it never reads another panel's fields.

### Inputs / Fields
- **Style:** `--light-gray` background, 1px `--medium-gray` border, 6px radius, 10px padding.
- **Focus:** border shifts to teal (`--primary-color`) plus a 3px soft teal glow (`box-shadow: 0 0 0 3px rgba(primary, 0.15)`) — no separate `:focus-visible` treatment beyond the global outline rule.

### Navigation / Footer
Three-column footer grid (logo / links / social — no newsletter column), `repeat(auto-fit, minmax(250px,1fr))` collapsing to 3 → 2 → 1 columns by breakpoint. Footer links and social icons use teal accents on hover; social icons are 44×44px circles meeting the touch-target floor.

## Do's and Don'ts

### Do:
- **Do** keep every validity indicator reading from `stageStatusStore` / the four `status-*` tokens — a new panel or field reuses `.stage-pill`, it never invents a new color for "valid."
- **Do** reserve JetBrains Mono for stage labels, status text, and technical/dimension readouts only.
- **Do** keep the `@theme` and `:root` token names in sync when a color changes — existing components read the `:root` names (`--primary-color`, etc.), Tailwind utilities read the `@theme` names (`--color-primary`); they must stay the same value, updated together.
- **Do** treat `--border-color`/`--bg-color`/`--bg-overlay-opacity` as the exported card's own theme, controlled by `colorStore` and the user's own color pickers — never repoint app chrome to these three tokens.

### Don't:
- **Don't** use teal as a background fill or default surface color — it is the active/build accent only, kept rare on purpose.
- **Don't** add a second badge/status color scheme; every "is this valid" signal in the app must be one of the four semantic status tokens.
- **Don't** style the exported card's inner markup (`.card` / `#githubCard` in `CardPreview.astro`) with this design system's chrome tokens — it is user-controlled content-area theming (`colorStore`), completely separate from the app's own graphite/teal chrome, and must stay that way so a user's card theme choice never leaks into (or gets overridden by) the app's own design system.
- **Don't** treat Font Awesome glyph icons (`<i class="fas fa-*">`, used throughout the header, panels, and footer) as an endorsed system primitive — they are an inherited, pre-redesign dependency the finish review did not remove; new work should not add more of them on the assumption they're part of this design system (see Known Gaps).

## Known Gaps (accepted, non-blocking per finish review)

- **Fonts load from Google Fonts CDN**, not self-hosted (`BaseLayout.astro` `<link href="https://fonts.googleapis.com/...">`). Accepted as a disclosed, non-blocking deviation — not yet resolved.
- **`deriveBuildStatus` is duplicated verbatim** in `index.astro` and `CardPreview.astro` rather than shared from one module. Both copies must be kept in sync by hand if the derivation logic ever changes; flagged non-blocking, not yet consolidated.
- **Font Awesome (`fontawesome... /all.min.css` via CDN) is still loaded** and used for every inline icon glyph across the header, panel headings, buttons, and footer. This predates the redesign and was not addressed by the finish review; see Do's and Don'ts — it is documented here as a carried-over fact, not canonized as this system's icon language.
- **A handful of literal sizes inside `CardPreview.astro`'s exported-card markup (`.card` and its children — `#displayRepoName`, `#displayUsername`, `#displayProjectName`, `.project-description`, `.project-logo`) are waived from design-system linting via scoped `ignore-value` entries** (`1.5rem`, `2.5rem`, `1.1rem` font sizes; `5px` radius), rather than added to this system's type/radius scale. This is intentional, not an oversight: per the Boundary rule above, the exported card's own theme is user-controlled content-area styling, not this system's chrome, so its one-off literal sizes must not be canonized into the app's scale just to silence a lint finding.

## Accessibility Baseline

- WCAG AA text contrast maintained on the graphite base: body text `#c9d1d9` and label text `#8b96a3` both sit at high contrast against `#0b0d10`/`#161b22`; each status color's pill text runs at full opacity against its own 16%-tinted background rather than a solid fill, keeping status text legible.
- All interactive targets (buttons, social icons) hold a ≥44×44px minimum (`min-height: 44px` on buttons, explicit `44px` width/height on social icons).
- `:focus-visible` gets a themed 2px teal outline globally; inputs additionally get a soft teal glow on focus.
- `prefers-reduced-motion: reduce` collapses all animation/transition durations to near-zero globally (`global.css`), covering the `rail-pulse` keyframe and every hover transition in the app.
