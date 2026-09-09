/**
 * GitHub API + "Social preview" image standard.
 * Source: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repositorys-social-media-preview
 * Recommended: 1280x640px, minimum 640x320px, PNG/JPG under 1MB.
 */
export const GITHUB_API = {
	BASE_URL: 'https://api.github.com',
	DEFAULT_AVATAR: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
} as const;
