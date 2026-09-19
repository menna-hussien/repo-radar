import type { ReactNode } from 'react';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { Box, Stack, Typography } from '@mui/material';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon = <InboxOutlinedIcon fontSize="large" />,
  action,
}: EmptyStateProps) {
  return (
    <Stack spacing={1} alignItems="center" sx={{ py: 4, color: 'text.secondary' }}>
      {icon}
      <Typography variant="subtitle1">{title}</Typography>
      {description && (
        <Typography variant="body2" align="center">
          {description}
        </Typography>
      )}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  );
}
