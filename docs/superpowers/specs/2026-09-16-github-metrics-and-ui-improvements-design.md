# Design Spec: GitHub Metrics & UI Improvements for GitCardX

**Date:** 2026-09-16  
**Status:** Approved  
**Author:** David Sandoval & AI Assistant  

---

## 1. Problem Statement

GitCardX is designed to generate 1280×640px social preview cards for GitHub repositories. However:
1. **Missing Metrics & Controls**: In the current implementation, GitHub repository metrics (stars, forks, languages) only display if loaded from the public GitHub API via the "Load" button. There are no UI controls or inputs in the editor for maintainers to set or customize star counts, fork counts, or primary language metrics manually (e.g., for private repos, mockups, offline work, or unauthenticated sessions).
2. **Visual Fidelity in Export**: The preview relies on external FontAwesome webfont icons via CDN (`fa-star`, `fa-code-branch`). In canvas export (`html2canvas`), external webfonts can suffer from CORS delays, layout shifts, or fail to render entirely.
3. **UI Modernization & Flow**:
   - The editor lacks quick style/color presets.
   - The stage-rail pipeline indicators are non-interactive.
   - The export controls lack a quick "Copy Image to Clipboard" feature.

---

## 2. Goals & Success Criteria

- **Manual & Automatic Metrics Control**:
  - Full control over Star Count, Fork Count, Primary Language, and Language Bar visibility.
  - Automatic population when fetching public repos from GitHub API, with full manual override support.
  - Formatted numbers (`1.2k`, `35.4k`) matching GitHub's social preview style.
- **Robust Card Rendering**:
  - Crisp inline SVG Octicons (Star, Fork, Language Dot) embedded directly in the DOM, eliminating webfont CORS/timing issues in `html2canvas`.
- **UI Enhancements**:
  - 1-click Theme/Color Presets in the style panel (GitHub Dark, Terminal Teal, Midnight Navy, Monokai, Clean Light).
  - Interactive stage-rail navigation that smoothly scrolls and highlights target panels.
  - "Copy to Clipboard" button in export controls alongside PNG download.

---

## 3. Architecture & Data Flow

### 3.1 State Management (`src/stores/cardState.ts`)

Extend `CardData`:
```typescript
export interface CardData {
  username: string;
  repoName: string;
  projectDescription: string;
  avatarUrl: string;
  profileLoaded: boolean;
  // Metrics:
  showStats: boolean;             // Toggle stats row visibility
  starCount: number;              // Stargazer count
  forkCount: number;              // Fork count
  primaryLanguage: string;        // Primary language name (e.g. "TypeScript")
  primaryLanguageColor: string;   // Language color hex (e.g. "#3178c6")
  showLanguageBar: boolean;       // Toggle language-bar visibility
  languages: LanguageSlice[];     // Language breakdown
}
```

Update `DEFAULT_CARD` in `src/constants/defaults.ts`:
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

### 3.2 Persistence (`src/lib/storage.ts`)

Persist the new fields (`showStats`, `starCount`, `forkCount`, `primaryLanguage`, `primaryLanguageColor`, `showLanguageBar`) into `localStorage` so users don't lose custom card metrics upon page refresh.

### 3.3 GitHub API Integration (`src/lib/github.ts`)

Update `GitHubRepo` interface to capture `language: string | null`.
When `loadProfile` executes in `CardEditorPanel.astro`:
- Set `starCount: repoResult.value.stargazers_count`.
- Set `forkCount: repoResult.value.forks_count`.
- Determine primary language from `repoResult.value.language` or the highest byte slice from `languagesResult.value`.
- Set `primaryLanguageColor` using `getLanguageColor(name)`.

---

## 4. Component Details

### 4.1 `CardEditorPanel.astro` (Configure Stage)
- Add "Repository Metrics" section:
  - Toggle switch: **Show Metrics** (`showStats`).
  - Input `type="number"`: **Stars** (`starCount`, min=0).
  - Input `type="number"`: **Forks** (`forkCount`, min=0).
  - Input `type="text"` with datalist: **Primary Language** (`primaryLanguage`). Slices/changes automatically update `primaryLanguageColor` using `getLanguageColor`.
  - Toggle switch: **Show Language Bar** (`showLanguageBar`).

### 4.2 `CardPreview.astro` (Artifact Preview)
- Replace FontAwesome icons with native inline SVG Octicons:
  - Star icon (16x16 SVG).
  - Fork icon (16x16 SVG).
  - Language indicator dot (colored SVG or circular badge).
- Implement number formatting utility (e.g., `1200` -> `1.2k`, `25400` -> `25.4k`).
- Display primary language chip if set: `<span class="stat-chip"><span class="lang-dot"></span><span id="displayLanguage">...</span></span>`.
- Respect `showStats` and `showLanguageBar` reactively.

### 4.3 `ColorControlsPanel.astro` (Style Stage)
- Add Quick Presets bar with pre-configured color schemes:
  - **GitHub Dark**: `#0d1117` bg, `#30363d` border, `#ffffff` title.
  - **Terminal Teal**: `#0b0d10` bg, `#2dd4bf` border, `#ffffff` title.
  - **Midnight Navy**: `#0a0f1d` bg, `#38bdf8` border, `#f8fafc` title.
  - **Monokai / Cyber**: `#1e1f29` bg, `#a6e22e` border, `#f8f8f2` title.
  - **Clean Light**: `#ffffff` bg, `#0969da` border, `#1f2328` title.
- Clicking a preset updates `colorStore` and synchronizes all color inputs.

### 4.4 `index.astro` (Stage Rail & Layout)
- Make rail nodes clickable:
  - `data-target="configure"` -> scrolls to `left-panel` / focuses `#username`.
  - `data-target="style"` -> scrolls to `ColorControlsPanel`.
  - `data-target="assets"` -> scrolls to `ImageUploadPanel`.
  - Smooth scroll animation with temporary visual pulse/glow on the focused panel.

### 4.5 `ExportControls.astro` & `lib/export.ts`
- Retain exact 1280×640px PNG export.
- Add "Copy Image" button using `canvas.toBlob` and `navigator.clipboard.write([new ClipboardItem({'image/png': blob})])`.
- Handle clipboard API fallbacks gracefully with toast messaging.

---

## 5. Non-Functional Requirements & Constraints

- Strictly preserve the 1280×640px (2:1 ratio) card export requirement.
- Maintain existing CI Pipeline / Status Graph design system (`DESIGN.md`).
- Ensure WCAG AA contrast compliance across all presets.
- Zero server dependencies — 100% static client-side Astro.
