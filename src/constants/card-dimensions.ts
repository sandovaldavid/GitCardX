/**
 * Card export dimensions and preview-to-export asset scaling.
 *
 * GitHub's official "Social preview" image recommendation is 1280x640px
 * (2:1 aspect ratio, minimum 640x320px, <1MB). See constants/github.ts.
 */

export const CARD_EXPORT = {
	WIDTH: 1280,
	HEIGHT: 640,
	ASPECT_RATIO: 2,
	SCALE_FACTOR: 1.5,
} as const;

/** Preview (on-screen) px size -> export (rendered PNG) px size for card assets. */
export const ASSET_SIZES = {
	profilePic: { preview: 40, export: 80 },
	statIcon: { preview: 14, export: 28 },
	languageBar: { preview: 6, export: 12 },
} as const;

export const EXPORT_TEXT_SIZES = {
	repoName: { fontSizeRem: 2.5 },
	username: { fontSizeRem: 2.0 },
	description: { fontSizeRem: 2.0, lineHeight: 1.6 },
	statCount: { fontSizeRem: 1.4 },
} as const;
