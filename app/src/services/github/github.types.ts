export interface GitHubRepositoryOwnerDto {
  avatar_url: string;
}

export interface GitHubRepositoryDto {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  owner: GitHubRepositoryOwnerDto;
  stargazers_count?: number;
  open_issues_count?: number;
}

export interface GitHubSearchRepositoriesResponseDto {
  total_count: number;
  items: GitHubRepositoryDto[];
}

export interface GitHubCommitDto {
  commit: {
    committer: { date: string } | null;
    author: { date: string } | null;
  };
}
