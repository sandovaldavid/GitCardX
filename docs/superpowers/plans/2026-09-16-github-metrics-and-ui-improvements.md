# GitHub Metrics & UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable comprehensive control over GitHub social preview metrics (stars, forks, primary language dot and language bar) with manual and auto-loaded inputs, native SVG Octicons, style presets, interactive stage-rail navigation, and clipboard export.

**Architecture:** Extend `cardStore` and `storage` with metrics fields (`showStats`, `starCount`, `forkCount`, `primaryLanguage`, `primaryLanguageColor`, `showLanguageBar`). Update `lib/github.ts` to extract repository primary language. Replace CDN FontAwesome icons in the preview with inline SVG Octicons and compact number formatting. Add metrics controls to `CardEditorPanel`, color presets to `ColorControlsPanel`, smooth-scrolling rail navigation to `index.astro`, and "Copy Image" to `ExportControls`.

**Tech Stack:** Astro, TypeScript, Nanostores, Tailwind CSS v4, html2canvas.

## Global Constraints

- The exported PNG's exact 1280×640px (2:1 ratio) dimensions are non-negotiable.
- Maintain existing CI Pipeline / Status Graph design system (`DESIGN.md`).
- Client-only static app (Astro `output: 'static'`) — no backend, zero runtime server requirements.
- Pure inline SVGs for card icons to eliminate canvas export font-loading failures.
- TypeScript strict checking via `npx astro check` must pass cleanly with 0 errors.

---

### Task 1: Core State, Constants, and Number Formatter

**Files:**
- Modify: `src/constants/defaults.ts`
- Modify: `src/stores/cardState.ts`
- Create: `src/utils/formatters.ts`
- Create: `scripts/test-formatters.mjs`

**Interfaces:**
- Produces:
  - `formatCompactNumber(num: number): string`
  - `CardData.showStats: boolean`
  - `CardData.primaryLanguage: string`
  - `CardData.primaryLanguageColor: string`
  - `CardData.showLanguageBar: boolean`

- [ ] **Step 1: Write the number formatter test script**

Create `scripts/test-formatters.mjs`:
```javascript
import assert from 'node:assert/strict';
import { formatCompactNumber } from '../src/utils/formatters.ts';

assert.equal(formatCompactNumber(0), '0');
assert.equal(formatCompactNumber(42), '42');
assert.equal(formatCompactNumber(999), '999');
assert.equal(formatCompactNumber(1000), '1k');
assert.equal(formatCompactNumber(1240), '1.2k');
assert.equal(formatCompactNumber(10500), '10.5k');
assert.equal(formatCompactNumber(100000), '100k');
assert.equal(formatCompactNumber(1500000), '1.5M');
console.log('✓ formatCompactNumber tests passed successfully.');
```

- [ ] **Step 2: Run test to verify it fails before implementation**

Run: `node scripts/test-formatters.mjs`
Expected: FAIL (Cannot find module `../src/utils/formatters.ts`)

- [ ] **Step 3: Implement `src/utils/formatters.ts`**

```typescript
/**
 * Formats integer counts into compact GitHub-style strings (e.g. 1200 -> "1.2k", 15400 -> "15.4k").
 */
export function formatCompactNumber(num: number): string {
	if (isNaN(num) || num <= 0) return '0';
	if (num < 1000) return String(num);

	if (num < 1_000_000) {
		const k = num / 1000;
		// If exact thousands or >= 100k, avoid decimal point (e.g. 100k, 10k)
		if (num >= 100_000 || Number.isInteger(k)) {
			return `${Math.floor(k)}k`;
		}
		return `${k.toFixed(1).replace(/\.0$/, '')}k`;
	}

	const m = num / 1_000_000;
	return `${m.toFixed(1).replace(/\.0$/, '')}M`;
}
```

- [ ] **Step 4: Update `src/constants/defaults.ts` & `src/stores/cardState.ts`**

In `src/constants/defaults.ts`:
```typescript
export const DEFAULT_CARD = {
	username: '',
	repoName: '',
	projectDescription: '',
	showStats: true,
	starCount: 0,
	forkCount: 0,
	primaryLanguage: '',
	primaryLanguageColor: '#2dd4bf',
	showLanguageBar: true,
	languages: [] as LanguageSlice[],
};
```

In `src/stores/cardState.ts`:
Update `CardData` interface to include the new fields.

- [ ] **Step 5: Run tests and typecheck to verify success**

Run: `node scripts/test-formatters.mjs && npx astro check`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/constants/defaults.ts src/stores/cardState.ts src/utils/formatters.ts scripts/test-formatters.mjs
git commit -m "feat(store): add metrics fields and compact number formatter"
```

---

### Task 2: Storage Persistence & GitHub API Repo Language Extraction

**Files:**
- Modify: `src/lib/storage.ts`
- Modify: `src/lib/github.ts`

**Interfaces:**
- Consumes: `CardData` fields from Task 1.
- Produces: `GitHubRepo.language: string | null`, persistent storage for `showStats`, `starCount`, `forkCount`, `primaryLanguage`, `primaryLanguageColor`, and `showLanguageBar`.

- [ ] **Step 1: Update `src/lib/github.ts` to capture `language`**

Update `GitHubRepo`:
```typescript
export interface GitHubRepo {
	full_name: string;
	description: string | null;
	stargazers_count: number;
	forks_count: number;
	language: string | null;
}
```

- [ ] **Step 2: Update `src/lib/storage.ts` to save and load all metrics fields**

In `PersistedState`:
```typescript
interface PersistedState {
	colors: ColorData;
	card: Pick<
		CardData,
		| 'username'
		| 'repoName'
		| 'projectDescription'
		| 'showStats'
		| 'starCount'
		| 'forkCount'
		| 'primaryLanguage'
		| 'primaryLanguageColor'
		| 'showLanguageBar'
	>;
	images: ImageData;
}
```

Update `save()` and `load()` to handle the metrics fields.

- [ ] **Step 3: Verify with `npx astro check`**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/github.ts src/lib/storage.ts
git commit -m "feat(storage): persist metrics state and capture repo language"
```

---

### Task 3: Inline Octicon SVGs & Card Preview Metrics

**Files:**
- Modify: `src/components/ui/CardPreview.astro`
- Modify: `src/constants/card-dimensions.ts`
- Modify: `src/lib/export.ts`

**Interfaces:**
- Consumes: `cardStore`, `colorStore`, `formatCompactNumber`.
- Produces: Crisp DOM rendering with SVG Octicons, language chip, formatted star/fork counts, and reactive visibility for `showStats` and `showLanguageBar`.

- [ ] **Step 1: Replace CDN icon tags with inline SVG Octicons in `CardPreview.astro`**

In `#statsRow`:
- Include inline GitHub Octicon for Star (16x16 path: `M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z`).
- Include inline GitHub Octicon for Fork (16x16 path: `M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h4.5A2.25 2.25 0 0 0 12.5 6.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878ZM10.5 3.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM5 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.122a2.25 2.25 0 1 0-1.5 0V9.25a.75.75 0 0 1 1.5 0v5.622Z`).
- Add Language Chip container: `<span id="langChip" class="stat-chip"><span id="langDot" class="lang-dot"></span><span id="displayLanguage">TypeScript</span></span>`.

- [ ] **Step 2: Wire `cardStore.subscribe` in `CardPreview.astro`**

Update the subscription to:
- Show/hide `#statsRow` based on `state.showStats`.
- Update `#displayStarCount` with `formatCompactNumber(state.starCount)`.
- Update `#displayForkCount` with `formatCompactNumber(state.forkCount)`.
- If `state.primaryLanguage` is present, display `#langChip`, set text to `state.primaryLanguage`, and set background of `#langDot` to `state.primaryLanguageColor`. If empty, hide `#langChip`.
- Show/hide `#languageBar` based on `state.showLanguageBar && state.languages.length > 0`.

- [ ] **Step 3: Update `src/lib/export.ts` for export scaling**

In `scaleCardElements`:
- Scale `.stat-chip svg` and `.lang-dot` alongside text elements for 1280×640 export.

- [ ] **Step 4: Verify with `npx astro check` and `npm run build`**

Run: `npx astro check && npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/CardPreview.astro src/constants/card-dimensions.ts src/lib/export.ts
git commit -m "feat(card): add native SVG Octicons, language badge, and compact stats"
```

---

### Task 4: Metrics Controls in Editor Panel

**Files:**
- Modify: `src/components/smart/CardEditorPanel.astro`

**Interfaces:**
- Consumes: `cardStore`, `getRepository`, `getRepositoryLanguages`, `getLanguageColor`.
- Produces: User controls for `showStats`, `starCount`, `forkCount`, `primaryLanguage`, `primaryLanguageColor`, `showLanguageBar`.

- [ ] **Step 1: Add "Repository Metrics" section markup in `CardEditorPanel.astro`**

Add markup under Project Information:
- Section header: `<h3><i class="fas fa-chart-bar"></i> Repository Metrics</h3>`.
- Toggle switch for `showStats`.
- Grid with Star Count and Fork Count inputs (`type="number"`, min="0").
- Primary Language input with `<datalist id="commonLanguages">` containing popular languages.
- Primary Language color picker/dot.
- Toggle switch for `showLanguageBar`.

- [ ] **Step 2: Bind input listeners and store updates**

- Listen on `input`/`change` for `starCountInput`, `forkCountInput`, `primaryLanguageInput`, `showStatsToggle`, `showLanguageBarToggle`.
- When `primaryLanguage` changes, automatically look up `getLanguageColor(name)` and update `primaryLanguageColor`.
- In `loadProfileBtn` click handler:
  - Populate `starCount` and `forkCount` from `repoResult.value`.
  - Extract primary language: `repoResult.value.language || languagesResult.value[0]?.name || ''`.
  - Set `primaryLanguageColor` accordingly.

- [ ] **Step 3: Verify with `npx astro check` and `npm run build`**

Run: `npx astro check && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/smart/CardEditorPanel.astro
git commit -m "feat(editor): add metrics inputs, toggles, and auto-population"
```

---

### Task 5: Style Presets & Stage Rail Interactivity

**Files:**
- Modify: `src/components/smart/ColorControlsPanel.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `colorStore`, `setStageStatus`.
- Produces: 1-click theme presets and smooth navigation from stage-rail nodes to target panels.

- [ ] **Step 1: Add Quick Theme Presets to `ColorControlsPanel.astro`**

Define presets:
- GitHub Dark (`#0d1117` bg, `#30363d` border, `#ffffff` title)
- Terminal Teal (`#0b0d10` bg, `#2dd4bf` border, `#ffffff` title)
- Midnight Navy (`#0a0f1d` bg, `#38bdf8` border, `#f8fafc` title)
- Monokai Cyber (`#1e1f29` bg, `#a6e22e` border, `#f8f8f2` title)
- Clean Light (`#ffffff` bg, `#0969da` border, `#1f2328` title)

Add preset chip buttons with swatch previews and click handlers that set `colorStore` keys.

- [ ] **Step 2: Wire stage rail interactivity in `src/pages/index.astro`**

- Add click listeners to `.rail-node[data-stage]`.
- On click:
  - Find corresponding section (`.left-panel` for configure, `#stylePanel` for style, `#assetsPanel` for assets).
  - Call `element.scrollIntoView({ behavior: 'smooth', block: 'center' })`.
  - Add a temporary highlight class (`panel-focus-pulse`) that glows with `--primary-color`.

- [ ] **Step 3: Verify with `npx astro check` and `npm run build`**

Run: `npx astro check && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/smart/ColorControlsPanel.astro src/pages/index.astro
git commit -m "feat(ui): add theme presets and interactive stage-rail navigation"
```

---

### Task 6: Export Controls Enhancement (Copy Image to Clipboard)

**Files:**
- Modify: `src/lib/export.ts`
- Modify: `src/components/smart/ExportControls.astro`

**Interfaces:**
- Produces: `copyCardToClipboard(cardId: string): Promise<void>`.

- [ ] **Step 1: Implement `copyCardToClipboard` in `src/lib/export.ts`**

Render offscreen canvas at 1280×640 (same as `exportToPNG`), convert to Blob (`image/png`), and write via `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])`.
Provide clear error handling if the browser clipboard API is blocked.

- [ ] **Step 2: Add "Copy Image" button to `ExportControls.astro`**

Add button with clipboard icon, wire event listener with loading state and toast feedback ("Image copied to clipboard!").

- [ ] **Step 3: Verify with `npx astro check` and `npm run build`**

Run: `npx astro check && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/export.ts src/components/smart/ExportControls.astro
git commit -m "feat(export): add copy image to clipboard button with toast feedback"
```

---

### Task 7: End-to-End Verification & Finish Review

**Files:**
- All modified files

- [ ] **Step 1: Execute full test and build check**

Run:
```bash
node scripts/test-formatters.mjs
npx astro check
npm run build
```
Expected: All commands exit with code 0.

- [ ] **Step 2: Verify git status is clean and inspect diff**

Run: `git status && git log -n 6 --oneline`

- [ ] **Step 3: Final commit / integration check**

```bash
git status
```
