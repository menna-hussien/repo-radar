import type { ReactNode } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTrackedRepositories } from './useTrackedRepositories';
import { repositoriesReducer } from '../../store/repositoriesSlice';
import { TRACKED_REPOSITORIES_STORAGE_KEY } from '../../constants';
import type { Repository } from '../../types';

const { getRepositoryStats } = vi.hoisted(() => ({ getRepositoryStats: vi.fn() }));

vi.mock('../../services/github', () => ({ getRepositoryStats }));

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
});
