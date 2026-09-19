import type { Repository } from '../types';

export interface StatsRequestState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

export interface RepositoriesState {
  trackedRepositories: Repository[];
  statsStateByRepoId: Record<number, StatsRequestState>;
}
