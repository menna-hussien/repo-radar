import { githubClient, isRequestCancelled, normalizeGitHubError } from './client';
import { mapRepositoryDto } from './mappers';
import type { GitHubSearchRepositoriesResponseDto } from './github.types';
import type { Repository } from '../../types';
import { GITHUB_SEARCH_MAX_RESULTS, SEARCH_PAGE_SIZE } from '../../constants';

export interface SearchRepositoriesPage {
  repositories: Repository[];
  totalPages: number;
}

export async function searchRepositories(
  query: string,
  page: number,
  signal: AbortSignal,
): Promise<SearchRepositoriesPage> {
  try {
    const response = await githubClient.get<GitHubSearchRepositoriesResponseDto>(
      '/search/repositories',
      {
        params: { q: query, page, per_page: SEARCH_PAGE_SIZE },
        signal,
      },
    );
    const availableResults = Math.min(response.data.total_count, GITHUB_SEARCH_MAX_RESULTS);
    return {
      repositories: response.data.items.map(mapRepositoryDto),
      totalPages: Math.max(1, Math.ceil(availableResults / SEARCH_PAGE_SIZE)),
    };
  } catch (error) {
    if (isRequestCancelled(error)) {
      throw error;
    }
    throw normalizeGitHubError(error);
  }
}
