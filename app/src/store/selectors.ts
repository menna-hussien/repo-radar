import type { RootState } from './store';

export const selectTrackedRepositories = (state: RootState) =>
  state.repositories.trackedRepositories;

export const selectStatsStateByRepoId = (state: RootState) => state.repositories.statsStateByRepoId;

export const selectIsTracked = (state: RootState, repoId: number) =>
  state.repositories.trackedRepositories.some((repository) => repository.id === repoId);
