import { githubClient, normalizeGitHubError } from './client';
import type { GitHubCommitDto, GitHubRepositoryDto } from './github.types';

export interface RepositoryStats {
  stars: number;
  openIssues: number;
  lastCommitDate: string | null;
  description: string | null;
}

export async function getLastCommitDate(fullName: string): Promise<string | null> {
  try {
    const response = await githubClient.get<GitHubCommitDto[]>(`/repos/${fullName}/commits`, {
      params: { per_page: 1 },
    });
    const latestCommit = response.data[0];
    return latestCommit?.commit.committer?.date ?? latestCommit?.commit.author?.date ?? null;
  } catch (error) {
    throw normalizeGitHubError(error);
  }
}

export async function getRepositoryStats(fullName: string): Promise<RepositoryStats> {
  try {
    const [repoResponse, lastCommitDate] = await Promise.all([
      githubClient.get<GitHubRepositoryDto>(`/repos/${fullName}`),
      getLastCommitDate(fullName),
    ]);

    return {
      stars: repoResponse.data.stargazers_count ?? 0,
      openIssues: repoResponse.data.open_issues_count ?? 0,
      lastCommitDate,
      description: repoResponse.data.description ?? null,
    };
  } catch (error) {
    throw normalizeGitHubError(error);
  }
}
