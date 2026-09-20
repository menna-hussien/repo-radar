import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getRepositoryStats } from '../services/github';
import type { Repository } from '../types';
import type { RootState } from './store';
import type { RepositoriesState } from './repositories.types';

const initialState: RepositoriesState = {
  trackedRepositories: [],
  statsStateByRepoId: {},
};

export const fetchRepositoryStats = createAsyncThunk<
  { repoId: number; stats: Awaited<ReturnType<typeof getRepositoryStats>> },
  number,
  { state: RootState }
>('repositories/fetchStats', async (repoId, { getState }) => {
  const repository = getState().repositories.trackedRepositories.find((r) => r.id === repoId);
  if (!repository) {
    throw new Error('Repository is no longer tracked.');
  }
  const stats = await getRepositoryStats(repository.fullName);
  return { repoId, stats };
});

const repositoriesSlice = createSlice({
  name: 'repositories',
  initialState,
  reducers: {
    repositoryTracked(state, action: PayloadAction<Repository>) {
      const alreadyTracked = state.trackedRepositories.some((r) => r.id === action.payload.id);
      if (!alreadyTracked) {
        state.trackedRepositories.push(action.payload);
      }
    },
    repositoryUntracked(state, action: PayloadAction<number>) {
      state.trackedRepositories = state.trackedRepositories.filter((r) => r.id !== action.payload);
      delete state.statsStateByRepoId[action.payload];
    },
    trackedRepositoriesHydrated(state, action: PayloadAction<Repository[]>) {
      state.trackedRepositories = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepositoryStats.pending, (state, action) => {
        state.statsStateByRepoId[action.meta.arg] = { status: 'loading', error: null };
      })
      .addCase(fetchRepositoryStats.fulfilled, (state, action) => {
        const { repoId, stats } = action.payload;
        const repository = state.trackedRepositories.find((r) => r.id === repoId);
        // The repository may have been untracked while this request was in flight.
        if (!repository) {
          return;
        }
        repository.stars = stats.stars;
        repository.openIssues = stats.openIssues;
        repository.lastCommitDate = stats.lastCommitDate;
        repository.description = stats.description;
        repository.lastUpdated = new Date().toISOString();
        state.statsStateByRepoId[repoId] = { status: 'success', error: null };
      })
      .addCase(fetchRepositoryStats.rejected, (state, action) => {
        if (!state.trackedRepositories.some((r) => r.id === action.meta.arg)) {
          return;
        }
        state.statsStateByRepoId[action.meta.arg] = {
          status: 'error',
          error: action.error.message ?? 'Failed to fetch repository stats.',
        };
      });
  },
});

export const { repositoryTracked, repositoryUntracked, trackedRepositoriesHydrated } =
  repositoriesSlice.actions;

export const repositoriesReducer = repositoriesSlice.reducer;
