import { GITHUB_API } from '../constants/github';
import { validateGitHubUsername } from '../utils/validators';

export interface GitHubUser {
	login: string;
	avatar_url: string;
	name?: string | null;
	bio?: string | null;
}

const cache = new Map<string, GitHubUser>();
const pendingRequests = new Map<string, Promise<GitHubUser>>();

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
