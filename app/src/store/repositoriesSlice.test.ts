import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import {
  fetchRepositoryStats,
  repositoriesReducer,
  repositoryTracked,
  repositoryUntracked,
  trackedRepositoriesHydrated,
} from './repositoriesSlice';
import type { Repository } from '../types';

function createTestStore() {
  return configureStore({ reducer: { repositories: repositoriesReducer } });
}

function makeRepository(overrides: Partial<Repository> = {}): Repository {
  return {
    id: 1,
    fullName: 'octocat/hello-world',
    description: 'A test repository',
    avatarUrl: 'https://example.com/avatar.png',
    htmlUrl: 'https://github.com/octocat/hello-world',
    stars: 10,
    openIssues: 2,
    lastCommitDate: null,
    lastUpdated: null,
    ...overrides,
  };
}

describe('repositoriesSlice', () => {
  it('tracks a new repository', () => {
    const store = createTestStore();
    const repository = makeRepository();

    store.dispatch(repositoryTracked(repository));

    expect(store.getState().repositories.trackedRepositories).toEqual([repository]);
  });

  it('does not add a duplicate when the repository is already tracked', () => {
    const store = createTestStore();
    const repository = makeRepository();

    store.dispatch(repositoryTracked(repository));
    store.dispatch(repositoryTracked(repository));

    expect(store.getState().repositories.trackedRepositories).toHaveLength(1);
  });

  it('untracks a repository and clears its stats state', () => {
    const store = createTestStore();
    const repository = makeRepository();
    store.dispatch(repositoryTracked(repository));
    store.dispatch(fetchRepositoryStats.pending('request-id', repository.id));

    store.dispatch(repositoryUntracked(repository.id));

    const state = store.getState().repositories;
    expect(state.trackedRepositories).toEqual([]);
    expect(state.statsStateByRepoId[repository.id]).toBeUndefined();
  });

  it('replaces the tracked list on hydration', () => {
    const store = createTestStore();
    store.dispatch(repositoryTracked(makeRepository({ id: 1 })));
    const hydrated = [makeRepository({ id: 2 })];

    store.dispatch(trackedRepositoriesHydrated(hydrated));

    expect(store.getState().repositories.trackedRepositories).toEqual(hydrated);
  });

  describe('fetchRepositoryStats', () => {
    it('sets loading status on pending without touching repository data', () => {
      const store = createTestStore();
      const repository = makeRepository({ stars: 42 });
      store.dispatch(repositoryTracked(repository));

      store.dispatch(fetchRepositoryStats.pending('request-id', repository.id));

      const state = store.getState().repositories;
      expect(state.statsStateByRepoId[repository.id]).toEqual({ status: 'loading', error: null });
      expect(state.trackedRepositories[0]).toEqual(repository);
    });

    it('updates repository fields and marks success on fulfilled', () => {
      const store = createTestStore();
      const repository = makeRepository({
        stars: 1,
        openIssues: 1,
        lastCommitDate: null,
        description: null,
      });
      store.dispatch(repositoryTracked(repository));

      store.dispatch(
        fetchRepositoryStats.fulfilled(
          {
            repoId: repository.id,
            stats: {
              stars: 99,
              openIssues: 3,
              lastCommitDate: '2026-01-01T00:00:00Z',
              description: 'Updated description',
            },
          },
          'request-id',
          repository.id,
        ),
      );

      const state = store.getState().repositories;
      const updated = state.trackedRepositories[0]!;
      expect(updated.stars).toBe(99);
      expect(updated.openIssues).toBe(3);
      expect(updated.lastCommitDate).toBe('2026-01-01T00:00:00Z');
      expect(updated.description).toBe('Updated description');
      expect(updated.lastUpdated).not.toBeNull();
      expect(state.statsStateByRepoId[repository.id]).toEqual({ status: 'success', error: null });
    });

    it('does not recreate stats state when a fetch succeeds after the repository was untracked', () => {
      const store = createTestStore();
      const repository = makeRepository();
      store.dispatch(repositoryTracked(repository));
      store.dispatch(fetchRepositoryStats.pending('request-id', repository.id));
      store.dispatch(repositoryUntracked(repository.id));

      store.dispatch(
        fetchRepositoryStats.fulfilled(
          {
            repoId: repository.id,
            stats: { stars: 1, openIssues: 1, lastCommitDate: null, description: null },
          },
          'request-id',
          repository.id,
        ),
      );

      expect(store.getState().repositories.statsStateByRepoId).toEqual({});
    });

    it('does not recreate stats state when a fetch fails after the repository was untracked', () => {
      const store = createTestStore();
      const repository = makeRepository();
      store.dispatch(repositoryTracked(repository));
      store.dispatch(fetchRepositoryStats.pending('request-id', repository.id));
      store.dispatch(repositoryUntracked(repository.id));

      store.dispatch(
        fetchRepositoryStats.rejected(new Error('Network error'), 'request-id', repository.id),
      );

      expect(store.getState().repositories.statsStateByRepoId).toEqual({});
    });

    it('preserves existing repository data and sets an error on rejected', () => {
      const store = createTestStore();
      const repository = makeRepository({ stars: 55, openIssues: 4, description: 'original' });
      store.dispatch(repositoryTracked(repository));

      store.dispatch(
        fetchRepositoryStats.rejected(new Error('Network error'), 'request-id', repository.id),
      );

      const state = store.getState().repositories;
      expect(state.trackedRepositories[0]).toEqual(repository);
      expect(state.statsStateByRepoId[repository.id]).toEqual({
        status: 'error',
        error: 'Network error',
      });
    });
  });
});
