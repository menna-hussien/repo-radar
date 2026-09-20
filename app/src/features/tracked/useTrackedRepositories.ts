import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchRepositoryStats,
  repositoryTracked,
  repositoryUntracked,
  trackedRepositoriesHydrated,
} from '../../store/repositoriesSlice';
import { selectStatsStateByRepoId, selectTrackedRepositories } from '../../store/selectors';
import {
  loadTrackedRepositories,
  saveTrackedRepositories,
} from '../../services/storage/trackedRepositoriesStorage';
import { STATS_FRESH_FOR_MS } from '../../constants';
import type { Repository } from '../../types';

function isStatsFresh(lastUpdated: string | null): boolean {
  return lastUpdated !== null && Date.now() - Date.parse(lastUpdated) < STATS_FRESH_FOR_MS;
}

export function useTrackedRepositories() {
  const dispatch = useAppDispatch();
  const trackedRepositories = useAppSelector(selectTrackedRepositories);
  const statsStateByRepoId = useAppSelector(selectStatsStateByRepoId);

  const hasHydratedRef = useRef(false);

  useEffect(() => {
    // Skip the very first run: at that point trackedRepositories is still
    // Redux's initial [], and hydration (below) hasn't loaded the real
    // persisted data yet. Saving here would overwrite it with [] before it's
    // ever read back.
    if (!hasHydratedRef.current) {
      return;
    }
    saveTrackedRepositories(trackedRepositories);
  }, [trackedRepositories]);

  useEffect(() => {
    const persisted = loadTrackedRepositories();
    hasHydratedRef.current = true;
    if (persisted.length === 0) {
      return;
    }
    dispatch(trackedRepositoriesHydrated(persisted));
    persisted
      .filter((repository) => !isStatsFresh(repository.lastUpdated))
      .forEach((repository) => {
        void dispatch(fetchRepositoryStats({ repoId: repository.id }));
      });
    // Hydration runs once when the dashboard mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isTracked = useCallback(
    (repoId: number) => trackedRepositories.some((repository) => repository.id === repoId),
    [trackedRepositories],
  );

  const track = useCallback(
    (repository: Repository) => {
      dispatch(repositoryTracked(repository));
      void dispatch(fetchRepositoryStats({ repoId: repository.id, reuseKnownStats: true }));
    },
    [dispatch],
  );

  const untrack = useCallback(
    (repoId: number) => {
      dispatch(repositoryUntracked(repoId));
    },
    [dispatch],
  );

  const refreshOne = useCallback(
    (repoId: number) => {
      void dispatch(fetchRepositoryStats({ repoId }));
    },
    [dispatch],
  );

  const refreshAll = useCallback(() => {
    trackedRepositories.forEach((repository) => {
      void dispatch(fetchRepositoryStats({ repoId: repository.id }));
    });
  }, [dispatch, trackedRepositories]);

  return {
    trackedRepositories,
    statsStateByRepoId,
    isTracked,
    track,
    untrack,
    refreshOne,
    refreshAll,
  };
}
