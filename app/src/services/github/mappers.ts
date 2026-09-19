import type { Repository } from '../../types';
import type { GitHubRepositoryDto } from './github.types';

export function mapRepositoryDto(dto: GitHubRepositoryDto): Repository {
  return {
    id: dto.id,
    fullName: dto.full_name,
    description: dto.description ?? null,
    avatarUrl: dto.owner.avatar_url,
    htmlUrl: dto.html_url,
    stars: dto.stargazers_count ?? null,
    openIssues: dto.open_issues_count ?? null,
    lastCommitDate: null,
    lastUpdated: null,
  };
}
