import type { LanguageSlice } from '../lib/github';

export const NOTIFICATION_DURATION_MS = 3000;
export const ANIMATION_DELAY_MS = 500;

export const DEFAULT_COLORS = {
	projectColor: '#ffffff',
	borderColor: '#00a0ff',
	bgColor: '#0d1117',
} as const;

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

export const DEFAULT_BG_OPACITY = 0.6;

export const STORAGE_KEY = 'gitcardx-settings';

export const AUTOSAVE_DEBOUNCE_MS = 400;
