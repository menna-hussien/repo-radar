import type { Repository } from '../../types';
import { TRACKED_REPOSITORIES_STORAGE_KEY } from '../../constants';

interface StoredRepository {
  id: number;
  fullName: string;
  avatarUrl: string;
  htmlUrl: string;
}

function isStoredRepository(value: unknown): value is StoredRepository {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.fullName === 'string' &&
    typeof candidate.avatarUrl === 'string' &&
    typeof candidate.htmlUrl === 'string'
  );
}

export function loadTrackedRepositories(): Repository[] {
  const raw = localStorage.getItem(TRACKED_REPOSITORIES_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isStoredRepository).map((stored): Repository => ({
      id: stored.id,
      fullName: stored.fullName,
      description: null,
      avatarUrl: stored.avatarUrl,
      htmlUrl: stored.htmlUrl,
      stars: null,
      openIssues: null,
      lastCommitDate: null,
      lastUpdated: null,
    }));
  } catch {
    return [];
  }
}

export function saveTrackedRepositories(repositories: Repository[]): void {
  const toStore: StoredRepository[] = repositories.map((repository) => ({
    id: repository.id,
    fullName: repository.fullName,
    avatarUrl: repository.avatarUrl,
    htmlUrl: repository.htmlUrl,
  }));
  localStorage.setItem(TRACKED_REPOSITORIES_STORAGE_KEY, JSON.stringify(toStore));
}
