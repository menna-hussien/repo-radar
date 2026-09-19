import { Stack } from '@mui/material';
import { EmptyState, ErrorState, RepositoryListSkeleton, SearchResultCard } from '@repo-radar/ui';
import type { Repository } from '../../types';
import type { SearchStatus } from './search.types';

export interface SearchResultsProps {
  repositories: Repository[];
  status: SearchStatus;
  error: string | null;
  isTracked: (id: number) => boolean;
  onToggleTrack: (id: number) => void;
}

export function SearchResults({
  repositories,
  status,
  error,
  isTracked,
  onToggleTrack,
}: SearchResultsProps) {
  if (status === 'loading') {
    return <RepositoryListSkeleton count={5} />;
  }

  if (status === 'error') {
    return <ErrorState message={error ?? 'Failed to search repositories.'} />;
  }

  if (repositories.length === 0) {
    return (
      <EmptyState
        title="No repositories match your search"
        description="Try a different search term."
      />
    );
  }

  return (
    <Stack spacing={1.5}>
      {repositories.map((repository) => (
        <SearchResultCard
          key={repository.id}
          id={repository.id}
          fullName={repository.fullName}
          description={repository.description}
          avatarUrl={repository.avatarUrl}
          htmlUrl={repository.htmlUrl}
          stars={repository.stars}
          openIssues={repository.openIssues}
          isTracked={isTracked(repository.id)}
          onToggleTrack={onToggleTrack}
        />
      ))}
    </Stack>
  );
}
