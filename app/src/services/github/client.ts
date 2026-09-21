import axios, { isAxiosError } from 'axios';
import type { AxiosError } from 'axios';
import { GITHUB_API_BASE_URL } from '../../constants';

// Optional, for local development only: raises the rate limit from 60 to 5,000
// requests per hour. Vite inlines VITE_* variables into the client bundle, so the token
// is only read in development; a production build never includes or sends it, even if
// the variable is set by mistake. When unset, no Authorization header is sent.
const githubToken = import.meta.env.DEV ? import.meta.env.VITE_GITHUB_TOKEN : undefined;

export const githubClient = axios.create({
  baseURL: GITHUB_API_BASE_URL,
  headers: {
    Accept: 'application/vnd.github+json',
    ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
  },
});

export class GitHubApiError extends Error {}

export function isRequestCancelled(error: unknown): boolean {
  return axios.isCancel(error);
}

// GitHub reports both its primary limit (60 requests/hour unauthenticated) and its
// secondary limits as 403 or 429, so the status alone isn't enough: a 403 is only a
// rate limit when the rate-limit headers say so. Other 403s are plain access errors.
function isRateLimitError(error: AxiosError): boolean {
  const response = error.response;
  if (!response) {
    return false;
  }
  if (response.status === 429) {
    return true;
  }
  return (
    response.status === 403 &&
    (response.headers['x-ratelimit-remaining'] === '0' ||
      response.headers['retry-after'] !== undefined)
  );
}

function rateLimitMessage(error: AxiosError): string {
  const resetSeconds = Number(error.response?.headers['x-ratelimit-reset']);
  if (!Number.isFinite(resetSeconds) || resetSeconds <= 0) {
    return 'GitHub API rate limit exceeded. Please try again later.';
  }
  const resetTime = new Date(resetSeconds * 1000).toLocaleTimeString(undefined, {
    timeStyle: 'short',
  });
  return `GitHub API rate limit exceeded. Resets at ${resetTime}.`;
}

export function normalizeGitHubError(error: unknown): GitHubApiError {
  if (error instanceof GitHubApiError) {
    return error;
  }
  if (isAxiosError(error)) {
    if (isRateLimitError(error)) {
      return new GitHubApiError(rateLimitMessage(error));
    }
    if (error.response?.status === 404) {
      return new GitHubApiError('Repository not found.');
    }
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return new GitHubApiError(message ?? 'Failed to reach the GitHub API.');
  }
  return new GitHubApiError('An unexpected error occurred while contacting GitHub.');
}
