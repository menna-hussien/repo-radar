import axios, { isAxiosError } from 'axios';
import { GITHUB_API_BASE_URL } from '../../constants';

export const githubClient = axios.create({
  baseURL: GITHUB_API_BASE_URL,
  headers: {
    Accept: 'application/vnd.github+json',
  },
});

export class GitHubApiError extends Error {}

export function isRequestCancelled(error: unknown): boolean {
  return axios.isCancel(error);
}

export function normalizeGitHubError(error: unknown): GitHubApiError {
  if (error instanceof GitHubApiError) {
    return error;
  }
  if (isAxiosError(error)) {
    if (error.response?.status === 403) {
      return new GitHubApiError('GitHub API rate limit exceeded. Please try again later.');
    }
    if (error.response?.status === 404) {
      return new GitHubApiError('Repository not found.');
    }
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return new GitHubApiError(message ?? 'Failed to reach the GitHub API.');
  }
  return new GitHubApiError('An unexpected error occurred while contacting GitHub.');
}
