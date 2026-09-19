import { beforeEach, describe, expect, it } from 'vitest';
import { loadTrackedRepositories, saveTrackedRepositories } from './trackedRepositoriesStorage';
import { TRACKED_REPOSITORIES_STORAGE_KEY } from '../../constants';
import type { Repository } from '../../types';

function makeRepository(overrides: Partial<Repository> = {}): Repository {
  return {
    id: 1,
    fullName: 'octocat/hello-world',
    description: 'A test repository',
    avatarUrl: 'https://example.com/avatar.png',
    htmlUrl: 'https://github.com/octocat/hello-world',
    stars: 10,
    openIssues: 1,
    lastCommitDate: '2026-01-01T00:00:00Z',
    lastUpdated: '2026-01-02T00:00:00Z',
    ...overrides,
  };
}

describe('trackedRepositoriesStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty array when nothing is stored', () => {
    expect(loadTrackedRepositories()).toEqual([]);
  });

  it('persists only the minimal stable fields', () => {
    saveTrackedRepositories([makeRepository()]);

    const raw = localStorage.getItem(TRACKED_REPOSITORIES_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toEqual([
      {
        id: 1,
        fullName: 'octocat/hello-world',
        avatarUrl: 'https://example.com/avatar.png',
        htmlUrl: 'https://github.com/octocat/hello-world',
      },
    ]);
  });

  it('round-trips a saved repository with stats fields reset to null', () => {
    saveTrackedRepositories([makeRepository()]);

    expect(loadTrackedRepositories()).toEqual([
      {
        id: 1,
        fullName: 'octocat/hello-world',
        description: null,
        avatarUrl: 'https://example.com/avatar.png',
        htmlUrl: 'https://github.com/octocat/hello-world',
        stars: null,
        openIssues: null,
        lastCommitDate: null,
        lastUpdated: null,
      },
    ]);
  });

  it('treats malformed JSON as an empty tracked collection', () => {
    localStorage.setItem(TRACKED_REPOSITORIES_STORAGE_KEY, '{not valid json');

    expect(loadTrackedRepositories()).toEqual([]);
  });

  it('treats a non-array stored value as an empty tracked collection', () => {
    localStorage.setItem(TRACKED_REPOSITORIES_STORAGE_KEY, JSON.stringify({ not: 'an array' }));

    expect(loadTrackedRepositories()).toEqual([]);
  });

  it('filters out malformed entries within an otherwise valid array', () => {
    localStorage.setItem(
      TRACKED_REPOSITORIES_STORAGE_KEY,
      JSON.stringify([
        { id: 1, fullName: 'ok/repo', avatarUrl: 'a', htmlUrl: 'h' },
        { id: 'not-a-number', fullName: 'bad/repo' },
        null,
      ]),
    );

    const loaded = loadTrackedRepositories();

    expect(loaded).toHaveLength(1);
    expect(loaded[0]!.id).toBe(1);
  });
});
