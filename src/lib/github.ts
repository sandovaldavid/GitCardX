import { GITHUB_API } from '../constants/github';
import { getLanguageColor } from '../constants/languageColors';
import { validateGitHubUsername } from '../utils/validators';

export interface GitHubUser {
	login: string;
	avatar_url: string;
	name?: string | null;
	bio?: string | null;
}

export interface GitHubRepo {
	full_name: string;
	description: string | null;
	stargazers_count: number;
	forks_count: number;
	language: string | null;
}

export interface LanguageSlice {
	name: string;
	bytes: number;
	percentage: number;
	color: string;
}

const cache = new Map<string, GitHubUser>();
const pendingRequests = new Map<string, Promise<GitHubUser>>();

const repoCache = new Map<string, GitHubRepo>();
const pendingRepoRequests = new Map<string, Promise<GitHubRepo>>();

const languagesCache = new Map<string, LanguageSlice[]>();
const pendingLanguagesRequests = new Map<string, Promise<LanguageSlice[]>>();

/**
 * Fetches a GitHub user's public profile, with an in-memory cache and
 * de-duplication of concurrent requests for the same username.
 */
export async function getUser(username: string): Promise<GitHubUser> {
	const validation = validateGitHubUsername(username);
	if (!validation.isValid) {
		throw new Error(validation.message);
	}

	const cacheKey = `user_${username}`;
	const cached = cache.get(cacheKey);
	if (cached) {
		return cached;
	}

	const pending = pendingRequests.get(cacheKey);
	if (pending) {
		return pending;
	}

	const request = fetchUserData(username, cacheKey);
	pendingRequests.set(cacheKey, request);

	try {
		return await request;
	} finally {
		pendingRequests.delete(cacheKey);
	}
}

async function fetchUserData(username: string, cacheKey: string): Promise<GitHubUser> {
	try {
		const response = await fetch(`${GITHUB_API.BASE_URL}/users/${username}`);

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('GitHub user not found');
			} else if (response.status === 403) {
				throw new Error('GitHub API rate limit exceeded. Please try again later.');
			} else {
				throw new Error(`GitHub API error: ${response.statusText}`);
			}
		}

		const userData = (await response.json()) as GitHubUser;
		cache.set(cacheKey, userData);
		return userData;
	} catch (error) {
		if (error instanceof Error && error.message.includes('API')) {
			throw error;
		}
		throw new Error('Failed to fetch GitHub profile. Check your internet connection.');
	}
}

/**
 * Fetches a GitHub repository's public metadata, with an in-memory cache and
 * de-duplication of concurrent requests for the same repo.
 */
export async function getRepository(owner: string, repo: string): Promise<GitHubRepo> {
	const cacheKey = `repo_${owner}/${repo}`;
	const cached = repoCache.get(cacheKey);
	if (cached) {
		return cached;
	}

	const pending = pendingRepoRequests.get(cacheKey);
	if (pending) {
		return pending;
	}

	const request = fetchRepoData(owner, repo, cacheKey);
	pendingRepoRequests.set(cacheKey, request);

	try {
		return await request;
	} finally {
		pendingRepoRequests.delete(cacheKey);
	}
}

async function fetchRepoData(owner: string, repo: string, cacheKey: string): Promise<GitHubRepo> {
	try {
		const response = await fetch(`${GITHUB_API.BASE_URL}/repos/${owner}/${repo}`);

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('Repository not found');
			} else if (response.status === 403) {
				throw new Error('GitHub API rate limit exceeded. Please try again later.');
			} else {
				throw new Error(`GitHub API error: ${response.statusText}`);
			}
		}

		const repoData = (await response.json()) as GitHubRepo;
		repoCache.set(cacheKey, repoData);
		return repoData;
	} catch (error) {
		if (error instanceof Error && error.message.includes('API')) {
			throw error;
		}
		if (error instanceof Error && error.message === 'Repository not found') {
			throw error;
		}
		throw new Error('Failed to fetch repository. Check your internet connection.');
	}
}

/**
 * Fetches a GitHub repository's language byte-composition and converts it
 * into sorted percentage slices with linguist colors. Resolves to an empty
 * array for repos with no detected languages, rather than throwing.
 */
export async function getRepositoryLanguages(owner: string, repo: string): Promise<LanguageSlice[]> {
	const cacheKey = `languages_${owner}/${repo}`;
	const cached = languagesCache.get(cacheKey);
	if (cached) {
		return cached;
	}

	const pending = pendingLanguagesRequests.get(cacheKey);
	if (pending) {
		return pending;
	}

	const request = fetchLanguagesData(owner, repo, cacheKey);
	pendingLanguagesRequests.set(cacheKey, request);

	try {
		return await request;
	} finally {
		pendingLanguagesRequests.delete(cacheKey);
	}
}

async function fetchLanguagesData(owner: string, repo: string, cacheKey: string): Promise<LanguageSlice[]> {
	try {
		const response = await fetch(`${GITHUB_API.BASE_URL}/repos/${owner}/${repo}/languages`);

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('Repository not found');
			} else if (response.status === 403) {
				throw new Error('GitHub API rate limit exceeded. Please try again later.');
			} else {
				throw new Error(`GitHub API error: ${response.statusText}`);
			}
		}

		const bytesByLanguage = (await response.json()) as Record<string, number>;
		const total = Object.values(bytesByLanguage).reduce((sum, bytes) => sum + bytes, 0);

		const slices: LanguageSlice[] =
			total === 0
				? []
				: Object.entries(bytesByLanguage)
						.map(([name, bytes]) => ({
							name,
							bytes,
							percentage: (bytes / total) * 100,
							color: getLanguageColor(name),
						}))
						.sort((a, b) => b.bytes - a.bytes);

		languagesCache.set(cacheKey, slices);
		return slices;
	} catch (error) {
		if (error instanceof Error && error.message.includes('API')) {
			throw error;
		}
		if (error instanceof Error && error.message === 'Repository not found') {
			throw error;
		}
		throw new Error('Failed to fetch repository languages. Check your internet connection.');
	}
}
