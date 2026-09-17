import { STORAGE_KEY } from '../constants/defaults';
import { cardStore, colorStore, imageStore, type CardData, type ColorData, type ImageData } from '../stores/cardState';
import { validateColor, validateDescription, validateGitHubUsername, validateRepoName } from '../utils/validators';
import { DEFAULT_BG_OPACITY, DEFAULT_CARD, DEFAULT_COLORS } from '../constants/defaults';
import { GITHUB_API } from '../constants/github';

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

function isStorageAvailable(): boolean {
	try {
		const testKey = '__storage_test__';
		localStorage.setItem(testKey, testKey);
		localStorage.removeItem(testKey);
		return true;
	} catch {
		return false;
	}
}

/** Saves the current store values to localStorage under STORAGE_KEY. */
export function save(): boolean {
	if (!isStorageAvailable()) return false;

	const card = cardStore.get();
	const colors = colorStore.get();
	const images = imageStore.get();

	const data: PersistedState = {
		colors,
		card: {
			username: card.username,
			repoName: card.repoName,
			projectDescription: card.projectDescription,
			showStats: card.showStats,
			starCount: card.starCount,
			forkCount: card.forkCount,
			primaryLanguage: card.primaryLanguage,
			primaryLanguageColor: card.primaryLanguageColor,
			showLanguageBar: card.showLanguageBar,
		},
		images,
	};

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		return true;
	} catch (error) {
		console.error('Error saving data:', error);
		return false;
	}
}

/** Loads saved preferences from localStorage and applies them to the stores. */
export function load(): boolean {
	if (!isStorageAvailable()) return false;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return false;

		const parsed = JSON.parse(stored) as Partial<PersistedState>;

		if (parsed.colors) {
			const colorKeys: (keyof ColorData)[] = ['projectColor', 'borderColor', 'bgColor'];
			for (const key of colorKeys) {
				const value = parsed.colors[key];
				if (value && validateColor(value).isValid) {
					colorStore.setKey(key, value);
				}
			}
		}

		if (parsed.card) {
			const {
				username,
				repoName,
				projectDescription,
				showStats,
				starCount,
				forkCount,
				primaryLanguage,
				primaryLanguageColor,
				showLanguageBar,
			} = parsed.card;

			if (username !== undefined && validateGitHubUsername(username).isValid) {
				cardStore.setKey('username', username);
			}
			if (repoName !== undefined && validateRepoName(repoName).isValid) {
				cardStore.setKey('repoName', repoName);
			}
			if (projectDescription !== undefined && validateDescription(projectDescription).isValid) {
				cardStore.setKey('projectDescription', projectDescription);
			}
			if (showStats !== undefined) {
				cardStore.setKey('showStats', Boolean(showStats));
			}
			if (starCount !== undefined) {
				cardStore.setKey('starCount', Math.max(0, Number(starCount) || 0));
			}
			if (forkCount !== undefined) {
				cardStore.setKey('forkCount', Math.max(0, Number(forkCount) || 0));
			}
			if (primaryLanguage !== undefined) {
				cardStore.setKey('primaryLanguage', primaryLanguage === null ? '' : String(primaryLanguage));
			}
			if (primaryLanguageColor !== undefined) {
				cardStore.setKey('primaryLanguageColor', primaryLanguageColor === null ? DEFAULT_CARD.primaryLanguageColor : String(primaryLanguageColor));
			}
			if (showLanguageBar !== undefined) {
				cardStore.setKey('showLanguageBar', Boolean(showLanguageBar));
			}
		}

		if (parsed.images) {
			imageStore.set({ ...imageStore.get(), ...parsed.images });
		}

		return true;
	} catch (error) {
		console.error('Error loading data:', error);
		clear();
		return false;
	}
}

/** Removes saved preferences from localStorage. */
export function clear(): boolean {
	if (!isStorageAvailable()) return false;
	try {
		localStorage.removeItem(STORAGE_KEY);
		return true;
	} catch (error) {
		console.error('Error clearing data:', error);
		return false;
	}
}

/** Resets all stores to their default values and clears saved storage. */
export function reset(): void {
	cardStore.set({
		...DEFAULT_CARD,
		avatarUrl: GITHUB_API.DEFAULT_AVATAR,
		profileLoaded: false,
	});
	colorStore.set({ ...DEFAULT_COLORS });
	imageStore.set({
		logoDataUrl: null,
		logoName: null,
		backgroundDataUrl: null,
		backgroundName: null,
		backgroundOpacity: DEFAULT_BG_OPACITY,
	});
	clear();
}
