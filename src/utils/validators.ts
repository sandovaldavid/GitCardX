/**
 * Form data validation helpers. Ported almost verbatim from
 * static/utils/validators.js — this module was already pure.
 */

export interface ValidationResult {
	isValid: boolean;
	message?: string;
}

const CONFIG = {
	USERNAME: {
		MAX_LENGTH: 39,
		PATTERN: /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
	},
	REPO_NAME: {
		MAX_LENGTH: 100,
		PATTERN: /^[a-zA-Z0-9._-]+$/,
	},
	PROJECT_NAME: {
		MAX_LENGTH: 50,
	},
	DESCRIPTION: {
		MAX_LENGTH: 280,
	},
	IMAGE: {
		MAX_SIZE_MB: 5,
		ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
	},
	COLOR: {
		PATTERN: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
	},
} as const;

export function validateGitHubUsername(username: string): ValidationResult {
	if (!username || username.trim() === '') {
		return { isValid: false, message: 'Please enter a GitHub username' };
	}

	username = username.trim();

	if (username.length > CONFIG.USERNAME.MAX_LENGTH) {
		return {
			isValid: false,
			message: `Username cannot exceed ${CONFIG.USERNAME.MAX_LENGTH} characters`,
		};
	}

	if (!CONFIG.USERNAME.PATTERN.test(username)) {
		return {
			isValid: false,
			message:
				'Username can only contain alphanumeric characters and hyphens, and cannot start with a hyphen',
		};
	}

	return { isValid: true };
}

export function validateRepoName(repoName: string): ValidationResult {
	if (!repoName || repoName.trim() === '') {
		return { isValid: true };
	}

	repoName = repoName.trim();

	if (repoName.length > CONFIG.REPO_NAME.MAX_LENGTH) {
		return {
			isValid: false,
			message: `Repository name cannot exceed ${CONFIG.REPO_NAME.MAX_LENGTH} characters`,
		};
	}

	if (!CONFIG.REPO_NAME.PATTERN.test(repoName)) {
		return {
			isValid: false,
			message:
				'Repository name can only contain alphanumeric characters, periods, hyphens and underscores',
		};
	}

	return { isValid: true };
}

export function validateProjectName(projectName: string): ValidationResult {
	if (!projectName || projectName.trim() === '') {
		return { isValid: true };
	}

	projectName = projectName.trim();

	if (projectName.length > CONFIG.PROJECT_NAME.MAX_LENGTH) {
		return {
			isValid: false,
			message: `Project name cannot exceed ${CONFIG.PROJECT_NAME.MAX_LENGTH} characters`,
		};
	}

	return { isValid: true };
}

export function validateDescription(description: string): ValidationResult {
	if (!description || description.trim() === '') {
		return { isValid: true };
	}

	description = description.trim();

	if (description.length > CONFIG.DESCRIPTION.MAX_LENGTH) {
		return {
			isValid: false,
			message: `Description cannot exceed ${CONFIG.DESCRIPTION.MAX_LENGTH} characters`,
		};
	}

	return { isValid: true };
}

export function validateColor(color: string): ValidationResult {
	if (!color) {
		return { isValid: false, message: 'Color value is required' };
	}

	if (!CONFIG.COLOR.PATTERN.test(color)) {
		return {
			isValid: false,
			message: 'Invalid hex color format (e.g. #RRGGBB or #RGB)',
		};
	}

	return { isValid: true };
}

export function validateImageFile(file: File | null | undefined): ValidationResult {
	if (!file) {
		return { isValid: true };
	}

	if (!CONFIG.IMAGE.ALLOWED_TYPES.includes(file.type as (typeof CONFIG.IMAGE.ALLOWED_TYPES)[number])) {
		return {
			isValid: false,
			message: 'File must be an image (JPG, PNG, GIF, WebP or SVG)',
		};
	}

	const maxSizeBytes = CONFIG.IMAGE.MAX_SIZE_MB * 1024 * 1024;
	if (file.size > maxSizeBytes) {
		return {
			isValid: false,
			message: `Image size must be less than ${CONFIG.IMAGE.MAX_SIZE_MB}MB`,
		};
	}

	return { isValid: true };
}

export function sanitizeText(text: string | null | undefined): string {
	if (!text) return '';

	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
	};

	return text.replace(/[&<>"']/g, (m) => map[m] ?? m);
}

export function isValidURL(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}
