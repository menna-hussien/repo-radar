import { describe, expect, it } from 'vitest';
import { mapRepositoryDto } from './mappers';
import type { GitHubRepositoryDto } from './github.types';

function makeDto(overrides: Partial<GitHubRepositoryDto> = {}): GitHubRepositoryDto {
  return {
    id: 1,
    full_name: 'octocat/hello-world',
    description: 'A test repository',
    html_url: 'https://github.com/octocat/hello-world',
    owner: { avatar_url: 'https://example.com/avatar.png' },
    stargazers_count: 42,
    open_issues_count: 3,
    ...overrides,
  };
}

describe('mapRepositoryDto', () => {
  it('maps all fields from the GitHub DTO', () => {
    const dto = makeDto();

    expect(mapRepositoryDto(dto)).toEqual({
      id: 1,
      fullName: 'octocat/hello-world',
      description: 'A test repository',
      avatarUrl: 'https://example.com/avatar.png',
      htmlUrl: 'https://github.com/octocat/hello-world',
      stars: 42,
      openIssues: 3,
      lastCommitDate: null,
      lastUpdated: null,
    });
  });

  it('defaults a null description to null', () => {
    const repository = mapRepositoryDto(makeDto({ description: null }));

    expect(repository.description).toBeNull();
  });

  it('defaults missing stats to null (the default feed endpoint omits them)', () => {
    const repository = mapRepositoryDto(
      makeDto({ stargazers_count: undefined, open_issues_count: undefined }),
    );

    expect(repository.stars).toBeNull();
    expect(repository.openIssues).toBeNull();
  });
});
