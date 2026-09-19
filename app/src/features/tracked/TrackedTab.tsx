import { lazy, Suspense, useState } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { EmptyState, RepositoryCard } from '@repo-radar/ui';
import type { Repository } from '../../types';
import type { StatsRequestState } from '../../store/repositories.types';
import { TRACKED_INITIAL_VISIBLE_COUNT, TRACKED_LOAD_MORE_STEP } from '../../constants';

// @mui/x-charts is the largest dependency in the bundle; it's only needed once the
// user opens this tab, so it's split into its own chunk rather than loaded up front.
const StarsChart = lazy(() =>
  import('@repo-radar/charts').then((module) => ({ default: module.StarsChart })),
);
const OpenIssuesChart = lazy(() =>
  import('@repo-radar/charts').then((module) => ({ default: module.OpenIssuesChart })),
);
const StarsVsIssuesChart = lazy(() =>
  import('@repo-radar/charts').then((module) => ({ default: module.StarsVsIssuesChart })),
);

const chartFallback = (
  <Stack alignItems="center" sx={{ py: 4 }}>
    <CircularProgress size={24} aria-label="Loading chart" />
  </Stack>
);

export interface TrackedTabProps {
  trackedRepositories: Repository[];
  statsStateByRepoId: Record<number, StatsRequestState>;
  onUntrack: (id: number) => void;
  onRefresh: (id: number) => void;
  onRefreshAll: () => void;
  onGoToSearch: () => void;
}

export function TrackedTab({
  trackedRepositories,
  statsStateByRepoId,
  onUntrack,
  onRefresh,
  onRefreshAll,
  onGoToSearch,
}: TrackedTabProps) {
  const [visibleCount, setVisibleCount] = useState(TRACKED_INITIAL_VISIBLE_COUNT);

  if (trackedRepositories.length === 0) {
    return (
      <EmptyState
        title="No tracked repositories yet"
        description="Search GitHub and track repositories to monitor their latest statistics."
        action={
          <Button variant="contained" startIcon={<SearchIcon />} onClick={onGoToSearch}>
            Search repositories
          </Button>
        }
      />
    );
  }

  const isAnyRefreshing = Object.values(statsStateByRepoId).some(
    (state) => state.status === 'loading',
  );
  const visibleRepositories = trackedRepositories.slice(0, visibleCount);
  const starsChartData = trackedRepositories.map((repository) => ({
    label: repository.fullName,
    value: repository.stars ?? 0,
  }));
  const openIssuesChartData = trackedRepositories.map((repository) => ({
    label: repository.fullName,
    value: repository.openIssues ?? 0,
  }));
  const starsVsIssuesData = trackedRepositories.map((repository) => ({
    label: repository.fullName,
    stars: repository.stars ?? 0,
    openIssues: repository.openIssues ?? 0,
  }));

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
      >
        <Box>
          <Typography variant="h6" component="h2">
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

      <Card variant="outlined">
        <CardContent>
          <Box
            sx={{
              maxHeight: { xs: 480, md: 640 },
              overflowY: 'auto',
              pr: 0.5,
            }}
          >
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
          </Box>

          {visibleCount < trackedRepositories.length && (
            <Stack alignItems="center" sx={{ pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setVisibleCount((count) => count + TRACKED_LOAD_MORE_STEP)}
              >
                Load more
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Stars by Repository" />
        <CardContent>
          <Suspense fallback={chartFallback}>
            <StarsChart data={starsChartData} />
          </Suspense>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        <Card variant="outlined">
          <CardHeader title="Open Issues Distribution" />
          <CardContent>
            <Suspense fallback={chartFallback}>
              <OpenIssuesChart data={openIssuesChartData} />
            </Suspense>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="Stars vs. Open Issues" />
          <CardContent>
            <Suspense fallback={chartFallback}>
              <StarsVsIssuesChart data={starsVsIssuesData} />
            </Suspense>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
