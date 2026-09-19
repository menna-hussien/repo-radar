import { useCallback, useEffect } from 'react';
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
import type { Repository } from '../../types';

export function useTrackedRepositories() {
  const dispatch = useAppDispatch();
  const trackedRepositories = useAppSelector(selectTrackedRepositories);
  const statsStateByRepoId = useAppSelector(selectStatsStateByRepoId);

  useEffect(() => {
    saveTrackedRepositories(trackedRepositories);
  }, [trackedRepositories]);

  useEffect(() => {
    const persisted = loadTrackedRepositories();
    if (persisted.length === 0) {
      return;
    }
    dispatch(trackedRepositoriesHydrated(persisted));
    persisted.forEach((repository) => {
      void dispatch(fetchRepositoryStats(repository.id));
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
      void dispatch(fetchRepositoryStats(repository.id));
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
      void dispatch(fetchRepositoryStats(repoId));
    },
    [dispatch],
  );

  const refreshAll = useCallback(() => {
    trackedRepositories.forEach((repository) => {
      void dispatch(fetchRepositoryStats(repository.id));
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
