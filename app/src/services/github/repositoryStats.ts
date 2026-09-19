import { githubClient, normalizeGitHubError } from './client';
import type { GitHubCommitDto, GitHubRepositoryDto } from './github.types';

export interface RepositoryStats {
  stars: number;
  openIssues: number;
  lastCommitDate: string | null;
  description: string | null;
}

export async function getRepositoryStats(fullName: string): Promise<RepositoryStats> {
  try {
    const [repoResponse, commitsResponse] = await Promise.all([
      githubClient.get<GitHubRepositoryDto>(`/repos/${fullName}`),
      githubClient.get<GitHubCommitDto[]>(`/repos/${fullName}/commits`, {
        params: { per_page: 1 },
      }),
    ]);

    const latestCommit = commitsResponse.data[0];
    const lastCommitDate =
      latestCommit?.commit.committer?.date ?? latestCommit?.commit.author?.date ?? null;

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
