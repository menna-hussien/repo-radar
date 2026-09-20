import type { ReactNode } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTrackedRepositories } from './useTrackedRepositories';
import { repositoriesReducer } from '../../store/repositoriesSlice';
import { STATS_FRESH_FOR_MS, TRACKED_REPOSITORIES_STORAGE_KEY } from '../../constants';
import type { Repository } from '../../types';

const { getRepositoryStats, getLastCommitDate } = vi.hoisted(() => ({
  getRepositoryStats: vi.fn(),
  getLastCommitDate: vi.fn(),
}));

vi.mock('../../services/github', () => ({ getRepositoryStats, getLastCommitDate }));

function createWrapper() {
  const store = configureStore({ reducer: { repositories: repositoriesReducer } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

function readStoredRepositories(): Repository[] {
  return JSON.parse(localStorage.getItem(TRACKED_REPOSITORIES_STORAGE_KEY) ?? '[]') as Repository[];
}

const seededRepository: Repository = {
  id: 1,
  fullName: 'octocat/hello-world',
  description: 'A test repository',
  avatarUrl: 'https://example.com/avatar.png',
  htmlUrl: 'https://github.com/octocat/hello-world',
  stars: 10,
  openIssues: 2,
  lastCommitDate: '2026-01-01T00:00:00Z',
  lastUpdated: '2026-01-02T00:00:00Z',
};

describe('useTrackedRepositories', () => {
  beforeEach(() => {
    localStorage.clear();
    getRepositoryStats.mockReset();
    getRepositoryStats.mockResolvedValue({
      stars: 1,
      openIssues: 1,
      lastCommitDate: null,
      description: null,
    });
    getLastCommitDate.mockReset();
    getLastCommitDate.mockResolvedValue('2026-02-01T00:00:00Z');
  });

  it('does not wipe persisted tracked repositories on mount', () => {
    localStorage.setItem(TRACKED_REPOSITORIES_STORAGE_KEY, JSON.stringify([seededRepository]));

    renderHook(() => useTrackedRepositories(), { wrapper: createWrapper() });

    expect(readStoredRepositories()).toEqual([seededRepository]);
  });

  it('hydrates tracked repositories from localStorage into Redux state', () => {
    localStorage.setItem(TRACKED_REPOSITORIES_STORAGE_KEY, JSON.stringify([seededRepository]));

    const { result } = renderHook(() => useTrackedRepositories(), { wrapper: createWrapper() });

    expect(result.current.trackedRepositories).toHaveLength(1);
    expect(result.current.trackedRepositories[0]?.fullName).toBe('octocat/hello-world');
  });

  it('still persists newly tracked repositories when nothing was previously stored', async () => {
    const { result } = renderHook(() => useTrackedRepositories(), { wrapper: createWrapper() });

    result.current.track({
      id: 2,
      fullName: 'octocat/second-repo',
      description: null,
      avatarUrl: 'https://example.com/avatar2.png',
      htmlUrl: 'https://github.com/octocat/second-repo',
      stars: 5,
      openIssues: 0,
      lastCommitDate: null,
      lastUpdated: null,
    });

    await waitFor(() => {
      const stored = readStoredRepositories();
      expect(stored).toHaveLength(1);
      expect(stored[0]?.fullName).toBe('octocat/second-repo');
    });
  });

  it('keeps the last known stats visible when a refresh fails, instead of blanking them', async () => {
    localStorage.setItem(TRACKED_REPOSITORIES_STORAGE_KEY, JSON.stringify([seededRepository]));
    getRepositoryStats.mockRejectedValue(new Error('GitHub API rate limit exceeded.'));

    const { result } = renderHook(() => useTrackedRepositories(), { wrapper: createWrapper() });

    expect(result.current.trackedRepositories[0]?.stars).toBe(seededRepository.stars);

    await waitFor(() => {
      expect(result.current.statsStateByRepoId[1]?.status).toBe('error');
    });

    expect(result.current.trackedRepositories[0]?.stars).toBe(seededRepository.stars);
    expect(result.current.trackedRepositories[0]?.openIssues).toBe(seededRepository.openIssues);
    expect(result.current.trackedRepositories[0]?.lastCommitDate).toBe(
      seededRepository.lastCommitDate,
    );
  });

  describe('rate-limit budget', () => {
    const searchResult: Repository = {
      ...seededRepository,
      id: 2,
      fullName: 'octocat/from-search',
      lastCommitDate: null,
      lastUpdated: null,
    };

    it('fetches only the last commit date when tracking a repository from a search result', async () => {
      const { result } = renderHook(() => useTrackedRepositories(), { wrapper: createWrapper() });

      result.current.track(searchResult);

      await waitFor(() => {
        expect(result.current.trackedRepositories[0]?.lastCommitDate).toBe('2026-02-01T00:00:00Z');
      });
      expect(getLastCommitDate).toHaveBeenCalledExactlyOnceWith('octocat/from-search');
      expect(getRepositoryStats).not.toHaveBeenCalled();
      expect(result.current.trackedRepositories[0]?.stars).toBe(searchResult.stars);
      expect(result.current.trackedRepositories[0]?.lastUpdated).not.toBeNull();
    });

    it('falls back to the full stats fetch when the search result has no stats', async () => {
      const { result } = renderHook(() => useTrackedRepositories(), { wrapper: createWrapper() });

      result.current.track({ ...searchResult, stars: null, openIssues: null });

      await waitFor(() => expect(getRepositoryStats).toHaveBeenCalledTimes(1));
      expect(getLastCommitDate).not.toHaveBeenCalled();
    });

    it('does a full refresh, never commit-only, even when the repository has never been fetched', async () => {
      getLastCommitDate.mockRejectedValue(new Error('GitHub API rate limit exceeded.'));
      const { result } = renderHook(() => useTrackedRepositories(), { wrapper: createWrapper() });
      result.current.track(searchResult);
      await waitFor(() => expect(result.current.statsStateByRepoId[2]?.status).toBe('error'));
      expect(result.current.trackedRepositories[0]?.lastUpdated).toBeNull();

      result.current.refreshOne(searchResult.id);

      await waitFor(() => expect(getRepositoryStats).toHaveBeenCalledTimes(1));
      expect(getLastCommitDate).toHaveBeenCalledTimes(1);
    });

    it('does a full fetch on load for a repository that has never been fetched', async () => {
      localStorage.setItem(
        TRACKED_REPOSITORIES_STORAGE_KEY,
        JSON.stringify([{ ...seededRepository, lastUpdated: null }]),
      );

      renderHook(() => useTrackedRepositories(), { wrapper: createWrapper() });

      await waitFor(() => expect(getRepositoryStats).toHaveBeenCalledTimes(1));
      expect(getLastCommitDate).not.toHaveBeenCalled();
    });

    it('does a full refresh for Refresh all', async () => {
      localStorage.setItem(
        TRACKED_REPOSITORIES_STORAGE_KEY,
        JSON.stringify([{ ...seededRepository, lastUpdated: new Date().toISOString() }]),
      );
      const { result } = renderHook(() => useTrackedRepositories(), { wrapper: createWrapper() });
      expect(getRepositoryStats).not.toHaveBeenCalled();

      result.current.refreshAll();

      await waitFor(() => expect(getRepositoryStats).toHaveBeenCalledTimes(1));
      expect(getLastCommitDate).not.toHaveBeenCalled();
    });

    it('does not refetch on load for repositories whose stats are still fresh', async () => {
      const fresh = { ...seededRepository, id: 1, lastUpdated: new Date().toISOString() };
      const stale = {
        ...seededRepository,
        id: 2,
        fullName: 'octocat/stale-repo',
        lastUpdated: new Date(Date.now() - STATS_FRESH_FOR_MS - 60_000).toISOString(),
      };
      localStorage.setItem(TRACKED_REPOSITORIES_STORAGE_KEY, JSON.stringify([fresh, stale]));

      renderHook(() => useTrackedRepositories(), { wrapper: createWrapper() });

      await waitFor(() => expect(getRepositoryStats).toHaveBeenCalledTimes(1));
      expect(getRepositoryStats).toHaveBeenCalledWith('octocat/stale-repo');
    });
  });
});
