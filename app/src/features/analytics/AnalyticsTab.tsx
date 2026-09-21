import { lazy, Suspense } from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import BugReportIcon from '@mui/icons-material/BugReport';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import StarRateIcon from '@mui/icons-material/StarRate';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { EmptyState, ErrorState } from '@repo-radar/ui';
import { ErrorBoundary } from 'react-error-boundary';
import { OPEN_ISSUES_CHART_LIMIT } from '../../constants';
import type { Repository } from '../../types';

// @mui/x-charts is the largest dependency in the bundle; it's only needed once the
// user opens this tab, so it's split into its own chunk rather than loaded up front.
const RankedBarChart = lazy(() =>
  import('@repo-radar/charts').then((module) => ({ default: module.RankedBarChart })),
);
const StarsVsIssuesChart = lazy(() =>
  import('@repo-radar/charts').then((module) => ({ default: module.StarsVsIssuesChart })),
);

const chartFallback = (
  <Stack alignItems="center" justifyContent="center" sx={{ width: '100%', py: 6 }}>
    <CircularProgress size={24} aria-label="Loading chart" />
  </Stack>
);

export interface AnalyticsTabProps {
  trackedRepositories: Repository[];
}

export function AnalyticsTab({ trackedRepositories }: AnalyticsTabProps) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" component="h2">
            Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Macro-level insights across all of your tracked repositories.
          </Typography>
        </Box>

        {trackedRepositories.length === 0 ? (
          <EmptyState
            icon={<BarChartIcon sx={{ fontSize: 56 }} color="disabled" />}
            title="No analytics yet"
            description="Track a repository to see stars, open issues, and correlations here."
          />
        ) : (
          // A failed chart download must not take the whole app down. React.lazy caches a
          // failed import, so re-rendering can't retry it; reloading can, and it also picks
          // up the new file names after a deploy.
          <ErrorBoundary
            fallback={
              <ErrorState
                message="The charts couldn't be loaded. Check your connection and reload the page."
                onRetry={() => window.location.reload()}
              />
            }
          >
            <AnalyticsCharts trackedRepositories={trackedRepositories} />
          </ErrorBoundary>
        )}
      </Stack>
    </Container>
  );
}

function AnalyticsCharts({ trackedRepositories }: AnalyticsTabProps) {
  const starsData = trackedRepositories.map((repository) => ({
    label: repository.fullName,
    value: repository.stars ?? 0,
  }));
  const openIssuesData = trackedRepositories.map((repository) => ({
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
      <Card variant="outlined">
        <CardHeader
          avatar={<StarRateIcon color="warning" />}
          title="Stars by Repository"
          subheader="Total stars for your tracked repositories"
        />
        <CardContent>
          <Suspense fallback={chartFallback}>
            <RankedBarChart data={starsData} valueLabel="Stars" color="#F59E0B" />
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
          <CardHeader
            avatar={<BugReportIcon color="error" />}
            title="Open Issues by Repository"
            subheader={`Top ${OPEN_ISSUES_CHART_LIMIT} by number of open issues`}
          />
          <CardContent>
            <Suspense fallback={chartFallback}>
              <RankedBarChart
                data={openIssuesData}
                valueLabel="Open issues"
                color="#EF4444"
                limit={OPEN_ISSUES_CHART_LIMIT}
              />
            </Suspense>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader
            avatar={<ScatterPlotIcon color="secondary" />}
            title="Stars vs. Open Issues"
            subheader="Relationship between stars and open issues"
          />
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
