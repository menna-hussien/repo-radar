import { useEffect, useState } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { GitHubApiError, isRequestCancelled, searchRepositories } from '../../services/github';
import type { Repository } from '../../types';
import type { SearchStatus } from './search.types';
import { SEARCH_DEBOUNCE_MS } from '../../constants';

export function useRepositorySearch() {
  const [inputValue, setInputValue] = useState('');
  const debouncedInputValue = useDebouncedValue(inputValue, SEARCH_DEBOUNCE_MS);
  const query = debouncedInputValue.trim();

  const [pageState, setPageState] = useState({ query, page: 1 });
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // A new query always starts back at page 1. Resetting during render (rather than
  // in an effect) means the fetch effect never sees the new query with the old page.
  if (pageState.query !== query) {
    setPageState({ query, page: 1 });
  }
  const page = pageState.page;

  useEffect(() => {
    if (query === '') {
      setRepositories([]);
      setStatus('idle');
      setError(null);
      return;
    }

    const controller = new AbortController();
    setStatus('loading');
    setError(null);

    async function run() {
      try {
        const result = await searchRepositories(query, page, controller.signal);
        setRepositories(result.repositories);
        setTotalPages(result.totalPages);
        setStatus('success');
      } catch (fetchError) {
        if (isRequestCancelled(fetchError)) {
          return;
        }
        setStatus('error');
        setError(
          fetchError instanceof GitHubApiError ? fetchError.message : 'Something went wrong.',
        );
      }
    }

    void run();

    return () => controller.abort();
  }, [query, page]);

  return {
    query: inputValue,
    onQueryChange: setInputValue,
    isSearching: query !== '',
    repositories,
    status,
    error,
    page,
    totalPages,
    onPageChange: (nextPage: number) => setPageState({ query, page: nextPage }),
  };
}
