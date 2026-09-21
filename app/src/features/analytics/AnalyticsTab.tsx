import { lazy } from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import BugReportIcon from '@mui/icons-material/BugReport';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import StarRateIcon from '@mui/icons-material/StarRate';
import { Box, Container, Stack, Typography } from '@mui/material';
import { EmptyState } from '@repo-radar/ui';
import { OPEN_ISSUES_CHART_LIMIT } from '../../constants';
import { useAppSelector } from '../../store/hooks';
import { selectTrackedRepositories } from '../../store/selectors';
import type { Repository } from '../../types';
import { ChartCard } from './ChartCard';

// @mui/x-charts is the largest dependency in the bundle; it's only needed once the
// user opens this tab, so it's split into its own chunk rather than loaded up front.
const RankedBarChart = lazy(() =>
  import('@repo-radar/charts').then((module) => ({ default: module.RankedBarChart })),
);
const StarsVsIssuesChart = lazy(() =>
  import('@repo-radar/charts').then((module) => ({ default: module.StarsVsIssuesChart })),
);

export function AnalyticsTab() {
  const trackedRepositories = useAppSelector(selectTrackedRepositories);

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
          <AnalyticsCharts trackedRepositories={trackedRepositories} />
        )}
      </Stack>
    </Container>
  );
}

function AnalyticsCharts({ trackedRepositories }: { trackedRepositories: Repository[] }) {
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
      <ChartCard
        icon={<StarRateIcon color="warning" />}
        title="Stars by Repository"
        subheader="Total stars for your tracked repositories"
      >
        <RankedBarChart data={starsData} valueLabel="Stars" color="#F59E0B" />
      </ChartCard>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        <ChartCard
          icon={<BugReportIcon color="error" />}
          title="Open Issues by Repository"
          subheader={`Top ${OPEN_ISSUES_CHART_LIMIT} by number of open issues`}
        >
          <RankedBarChart
            data={openIssuesData}
            valueLabel="Open issues"
            color="#EF4444"
            limit={OPEN_ISSUES_CHART_LIMIT}
          />
        </ChartCard>

        <ChartCard
          icon={<ScatterPlotIcon color="secondary" />}
          title="Stars vs. Open Issues"
          subheader="Relationship between stars and open issues"
        >
          <StarsVsIssuesChart data={starsVsIssuesData} />
        </ChartCard>
      </Box>
    </Stack>
  );
}
