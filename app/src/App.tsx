import { Container, Stack, Typography } from '@mui/material';
import { PlaceholderPanel } from '@repo-radar/ui';
import { PlaceholderChart } from '@repo-radar/charts';

export function App() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={2}>
        <Typography variant="h3" component="h1">
          Repo Radar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monorepo bootstrap placeholder. Feature implementation to follow.
        </Typography>
        <PlaceholderPanel>
          <PlaceholderChart label="bootstrap placeholder chart" />
        </PlaceholderPanel>
      </Stack>
    </Container>
  );
}
