import { map } from 'nanostores';
import { DEFAULT_BG_OPACITY, DEFAULT_CARD, DEFAULT_COLORS } from '../constants/defaults';
import { GITHUB_API } from '../constants/github';
import type { LanguageSlice } from '../lib/github';

export interface CardData {
	username: string;
	repoName: string;
	projectDescription: string;
	avatarUrl: string;
	profileLoaded: boolean;
	starCount: number;
	forkCount: number;
	languages: LanguageSlice[];
}

export const cardStore = map<CardData>({
	...DEFAULT_CARD,
	avatarUrl: GITHUB_API.DEFAULT_AVATAR,
	profileLoaded: false,
});

export interface ColorData {
	projectColor: string;
	borderColor: string;
	bgColor: string;
}

export const colorStore = map<ColorData>({ ...DEFAULT_COLORS });

export interface ImageData {
	logoDataUrl: string | null;
	logoName: string | null;
	backgroundDataUrl: string | null;
	backgroundName: string | null;
	backgroundOpacity: number;
}

export const imageStore = map<ImageData>({
	logoDataUrl: null,
	logoName: null,
	backgroundDataUrl: null,
	backgroundName: null,
	backgroundOpacity: DEFAULT_BG_OPACITY,
});

// CI Pipeline / Status Graph world: each smart panel is a pipeline "stage"
// and reports its own real field validity here. The stage-rail widget in
// index.astro reads this store to render each stage's pill; it never
// re-runs validation itself, it only reflects what the owning panel found.
export type StageStatus = 'pending' | 'running' | 'passing' | 'failing';

export interface StageStatusData {
	configure: StageStatus;
	style: StageStatus;
	assets: StageStatus;
}

export const stageStatusStore = map<StageStatusData>({
	configure: 'pending',
	style: 'pending',
	assets: 'pending',
});

export function setStageStatus(stage: keyof StageStatusData, status: StageStatus): void {
	stageStatusStore.setKey(stage, status);
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: number;
	message: string;
	type: ToastType;
}

export interface ToastState {
	toasts: Toast[];
}

export const toastStore = map<ToastState>({ toasts: [] });

let toastIdCounter = 0;

export function pushToast(message: string, type: ToastType = 'info'): void {
	const id = ++toastIdCounter;
	toastStore.setKey('toasts', [...toastStore.get().toasts, { id, message, type }]);
}

export function dismissToast(id: number): void {
	toastStore.setKey(
		'toasts',
		toastStore.get().toasts.filter((toast) => toast.id !== id)
	);
}
