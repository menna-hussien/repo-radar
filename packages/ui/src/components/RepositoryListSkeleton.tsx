import { Card, CardContent, CardHeader, Skeleton, Stack } from '@mui/material';

export interface RepositoryListSkeletonProps {
  count?: number;
}

export function RepositoryListSkeleton({ count = 3 }: RepositoryListSkeletonProps) {
  return (
    <Stack spacing={2} aria-label="Loading repositories" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} variant="outlined">
          <CardHeader
            avatar={<Skeleton variant="circular" width={40} height={40} />}
            title={<Skeleton variant="text" width="60%" />}
          />
          <CardContent>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="30%" />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
