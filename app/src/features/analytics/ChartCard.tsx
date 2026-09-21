import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CircularProgress, Stack } from '@mui/material';
import { ErrorState } from '@repo-radar/ui';
import { ErrorBoundary } from 'react-error-boundary';

export interface ChartCardProps {
  icon: ReactNode;
  title: string;
  subheader: string;
  children: ReactNode;
}

const chartFallback = (
  <Stack alignItems="center" justifyContent="center" sx={{ width: '100%', py: 6 }}>
    <CircularProgress size={24} aria-label="Loading chart" />
  </Stack>
);

// Each chart gets its own boundary so one chart failing doesn't take down the others.
// A failed lazy() download must not blank the app either; React caches a failed import,
// so re-rendering can't retry it, but reloading can (and picks up new file names after
// a deploy).
export function ChartCard({ icon, title, subheader, children }: ChartCardProps) {
  return (
    <Card variant="outlined">
      <CardHeader avatar={icon} title={title} subheader={subheader} />
      <CardContent>
        <ErrorBoundary
          fallback={
            <ErrorState
              message="This chart couldn't be loaded. Check your connection and reload the page."
              onRetry={() => window.location.reload()}
            />
          }
        >
          <Suspense fallback={chartFallback}>{children}</Suspense>
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
}
