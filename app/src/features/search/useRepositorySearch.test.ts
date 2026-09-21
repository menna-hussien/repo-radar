import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRepositorySearch } from './useRepositorySearch';

const { searchRepositoriesMock } = vi.hoisted(() => ({
  searchRepositoriesMock: vi.fn(),
}));

// Pin the debounce so these timing-based tests don't depend on the app's tuning.
vi.mock('../../constants', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../constants')>()),
  SEARCH_DEBOUNCE_MS: 300,
}));

vi.mock('../../services/github', () => ({
  searchRepositories: searchRepositoriesMock,
  isRequestCancelled: (error: unknown) =>
    error instanceof DOMException && error.name === 'AbortError',
  GitHubApiError: class GitHubApiError extends Error {},
}));

function resultAfter<T>(value: T, delayMs: number, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => resolve(value), delayMs);
    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

describe('useRepositorySearch', () => {
  afterEach(() => {
    searchRepositoriesMock.mockReset();
  });

  it('stays idle and does not search while the query is empty', () => {
    const { result } = renderHook(() => useRepositorySearch());

    expect(result.current.isSearching).toBe(false);
    expect(result.current.status).toBe('idle');
    expect(searchRepositoriesMock).not.toHaveBeenCalled();
  });

  it('debounces typing before searching', async () => {
    searchRepositoriesMock.mockResolvedValue({ repositories: [], totalPages: 1 });
    const { result } = renderHook(() => useRepositorySearch());

    act(() => result.current.onQueryChange('r'));
    act(() => result.current.onQueryChange('re'));
    act(() => result.current.onQueryChange('react'));

    expect(searchRepositoriesMock).not.toHaveBeenCalled();

    await waitFor(() => expect(searchRepositoriesMock).toHaveBeenCalledTimes(1));
    expect(searchRepositoriesMock).toHaveBeenCalledWith('react', 1, expect.any(AbortSignal));
  });

  it('never requests the old page number for a new query', async () => {
    searchRepositoriesMock.mockResolvedValue({ repositories: [], totalPages: 5 });
    const { result } = renderHook(() => useRepositorySearch());

    act(() => result.current.onQueryChange('react'));
    await waitFor(() => expect(result.current.status).toBe('success'));
    act(() => result.current.onPageChange(3));
    await waitFor(() =>
      expect(searchRepositoriesMock).toHaveBeenLastCalledWith('react', 3, expect.any(AbortSignal)),
    );

    act(() => result.current.onQueryChange('vue'));
    await waitFor(() =>
      expect(searchRepositoriesMock).toHaveBeenLastCalledWith('vue', 1, expect.any(AbortSignal)),
    );

    expect(searchRepositoriesMock).not.toHaveBeenCalledWith('vue', 3, expect.any(AbortSignal));
    expect(result.current.page).toBe(1);
  });

  it('does not let a stale request overwrite a newer one', async () => {
    searchRepositoriesMock.mockImplementation(
      (query: string, _page: number, signal: AbortSignal) => {
        if (query === 'react') {
          // Deliberately slower than the second query's own debounce window (300ms),
          // so it's still in flight (and thus abortable) when 'react native' commits.
          return resultAfter(
            { repositories: [{ id: 1, fullName: 'facebook/react' }], totalPages: 1 },
            600,
            signal,
          );
        }
        return resultAfter(
          { repositories: [{ id: 2, fullName: 'facebook/react-native' }], totalPages: 1 },
          20,
          signal,
        );
      },
    );

    const { result } = renderHook(() => useRepositorySearch());

    act(() => result.current.onQueryChange('react'));
    await waitFor(() => expect(searchRepositoriesMock).toHaveBeenCalledTimes(1));

    act(() => result.current.onQueryChange('react native'));

    await waitFor(() => expect(result.current.status).toBe('success'), { timeout: 2000 });
    expect(result.current.repositories).toEqual([{ id: 2, fullName: 'facebook/react-native' }]);
  });

  it('surfaces an error and clears loading state when the request fails', async () => {
    const { GitHubApiError } = await import('../../services/github');
    searchRepositoriesMock.mockRejectedValue(new GitHubApiError('Repository not found.'));

    const { result } = renderHook(() => useRepositorySearch());
    act(() => result.current.onQueryChange('react'));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Repository not found.');
  });
});
