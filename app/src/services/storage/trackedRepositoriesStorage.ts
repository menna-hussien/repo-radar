import type { Repository } from '../../types';
import { TRACKED_REPOSITORIES_STORAGE_KEY } from '../../constants';

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === 'number';
}

function isStoredRepository(value: unknown): value is Repository {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.fullName === 'string' &&
    typeof candidate.avatarUrl === 'string' &&
    typeof candidate.htmlUrl === 'string' &&
    isNullableString(candidate.description) &&
    isNullableNumber(candidate.stars) &&
    isNullableNumber(candidate.openIssues) &&
    isNullableString(candidate.lastCommitDate) &&
    isNullableString(candidate.lastUpdated)
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
    return parsed.filter(isStoredRepository);
  } catch {
    return [];
  }
}

export function saveTrackedRepositories(repositories: Repository[]): void {
  localStorage.setItem(TRACKED_REPOSITORIES_STORAGE_KEY, JSON.stringify(repositories));
}
