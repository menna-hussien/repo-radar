import { useState } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { EmptyState, RepositoryCard, SearchInput } from '@repo-radar/ui';
import { useAppSelector } from '../../store/hooks';
import { selectStatsStateByRepoId, selectTrackedRepositories } from '../../store/selectors';
import { TRACKED_INITIAL_VISIBLE_COUNT, TRACKED_LOAD_MORE_STEP } from '../../constants';

export interface TrackedTabProps {
  onUntrack: (id: number) => void;
  onRefresh: (id: number) => void;
  onRefreshAll: () => void;
  onGoToSearch: () => void;
}

export function TrackedTab({ onUntrack, onRefresh, onRefreshAll, onGoToSearch }: TrackedTabProps) {
  const trackedRepositories = useAppSelector(selectTrackedRepositories);
  const statsStateByRepoId = useAppSelector(selectStatsStateByRepoId);
  const [visibleCount, setVisibleCount] = useState(TRACKED_INITIAL_VISIBLE_COUNT);
  const [filterQuery, setFilterQuery] = useState('');

  if (trackedRepositories.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <EmptyState
          title="No tracked repositories yet"
          description="Search GitHub and track repositories to monitor their latest statistics."
          action={
            <Button variant="contained" startIcon={<SearchIcon />} onClick={onGoToSearch}>
              Search repositories
            </Button>
          }
        />
      </Container>
    );
  }

  const isAnyRefreshing = Object.values(statsStateByRepoId).some(
    (state) => state.status === 'loading',
  );
  // Repositories are stored in the order they were tracked, so reversing shows the
  // most recently tracked first.
  const filteredRepositories = [...trackedRepositories]
    .reverse()
    .filter((repository) =>
      repository.fullName.toLowerCase().includes(filterQuery.trim().toLowerCase()),
    );
  const visibleRepositories = filteredRepositories.slice(0, visibleCount);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
        >
          <Box>
            <Typography variant="h5" component="h2">
              Your tracked repositories
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor your favorite repositories and stay up to date.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRefreshAll}
            disabled={isAnyRefreshing}
          >
            Refresh all
          </Button>
        </Stack>

        <SearchInput
          value={filterQuery}
          onChange={setFilterQuery}
          label="Filter tracked repositories"
          placeholder="Filter by name…"
        />

        {filteredRepositories.length === 0 ? (
          <EmptyState title="No tracked repositories match" description="Try a different filter." />
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {visibleRepositories.map((repository) => {
                const statsState = statsStateByRepoId[repository.id];
                return (
                  <RepositoryCard
                    key={repository.id}
                    id={repository.id}
                    fullName={repository.fullName}
                    description={repository.description}
                    avatarUrl={repository.avatarUrl}
                    htmlUrl={repository.htmlUrl}
                    stars={repository.stars}
                    openIssues={repository.openIssues}
                    lastCommitDate={repository.lastCommitDate}
                    lastUpdated={repository.lastUpdated}
                    isRefreshing={statsState?.status === 'loading'}
                    error={statsState?.status === 'error' ? statsState.error : null}
                    onRefresh={onRefresh}
                    onUntrack={onUntrack}
                  />
                );
              })}
            </Box>

            {visibleCount < filteredRepositories.length && (
              <Stack alignItems="center">
                <Button
                  variant="outlined"
                  onClick={() => setVisibleCount((count) => count + TRACKED_LOAD_MORE_STEP)}
                >
                  Load more
                </Button>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}
