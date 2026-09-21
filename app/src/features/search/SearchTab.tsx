import { useCallback } from 'react';
import { Box, Container, Pagination, Stack, Typography } from '@mui/material';
import { EmptyState, SearchIllustration, SearchInput } from '@repo-radar/ui';
import type { Repository } from '../../types';
import { SearchResults } from './SearchResults';
import { useRepositorySearch } from './useRepositorySearch';

export interface SearchTabProps {
  isTracked: (id: number) => boolean;
  onTrack: (repository: Repository) => void;
  onUntrack: (id: number) => void;
}

export function SearchTab({ isTracked, onTrack, onUntrack }: SearchTabProps) {
  const {
    query,
    onQueryChange,
    isSearching,
    repositories,
    status,
    error,
    page,
    totalPages,
    onPageChange,
  } = useRepositorySearch();

  // Stable between keystrokes, so the memoized result cards don't all re-render each
  // time the search input changes.
  const handleToggleTrack = useCallback(
    (id: number) => {
      if (isTracked(id)) {
        onUntrack(id);
        return;
      }
      const repository = repositories.find((candidate) => candidate.id === id);
      if (repository) {
        onTrack(repository);
      }
    },
    [isTracked, onTrack, onUntrack, repositories],
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }} gutterBottom>
            Discover amazing repositories
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Search GitHub repositories, explore projects, and track your favorites.
          </Typography>
        </Box>

        <SearchInput value={query} onChange={onQueryChange} isLoading={status === 'loading'} />

        {!isSearching && (
          <EmptyState
            icon={<SearchIllustration sx={{ fontSize: 140 }} />}
            title="Start typing to search"
          />
        )}

        {isSearching && (
          <>
            <SearchResults
              repositories={repositories}
              status={status}
              error={error}
              isTracked={isTracked}
              onToggleTrack={handleToggleTrack}
            />
            {status === 'success' && repositories.length > 0 && totalPages > 1 && (
              <Stack alignItems="center">
                <Pagination
                  page={page}
                  count={totalPages}
                  onChange={(_event, value) => onPageChange(value)}
                  color="primary"
                />
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}
