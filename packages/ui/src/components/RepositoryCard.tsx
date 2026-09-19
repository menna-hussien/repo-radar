import { memo } from 'react';
import BookmarkRemoveOutlinedIcon from '@mui/icons-material/BookmarkRemoveOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

export interface RepositoryCardProps {
  id: number;
  fullName: string;
  description: string | null;
  avatarUrl: string;
  htmlUrl: string;
  stars: number | null;
  openIssues: number | null;
  lastCommitDate: string | null;
  lastUpdated: string | null;
  isRefreshing?: boolean;
  error?: string | null;
  onRefresh: (id: number) => void;
  onUntrack: (id: number) => void;
}

function formatCount(value: number | null): string {
  if (value === null) {
    return '—';
  }
  return new Intl.NumberFormat(undefined, { notation: 'compact' }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function RepositoryCardComponent({
  id,
  fullName,
  description,
  avatarUrl,
  htmlUrl,
  stars,
  openIssues,
  lastCommitDate,
  lastUpdated,
  isRefreshing = false,
  error = null,
  onRefresh,
  onUntrack,
}: RepositoryCardProps) {
  return (
    <Card
      variant="outlined"
      component="article"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <CardHeader
        avatar={<Avatar src={avatarUrl} alt="" />}
        sx={{ '& .MuiCardHeader-content': { minWidth: 0 } }}
        title={
          <Typography
            variant="subtitle1"
            component="span"
            sx={{
              display: 'block',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {fullName}
          </Typography>
        }
        subheader={
          description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {description}
            </Typography>
          )
        }
        action={
          <Tooltip title={`View ${fullName} on GitHub`}>
            <IconButton
              component="a"
              href={htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${fullName} on GitHub`}
              size="small"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap alignItems="center">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <StarOutlineIcon fontSize="small" color="action" />
            <Typography variant="body2">{formatCount(stars)}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ReportProblemOutlinedIcon fontSize="small" color="action" />
            <Typography variant="body2">{formatCount(openIssues)} open issues</Typography>
          </Stack>
          {isRefreshing && <CircularProgress size={16} aria-label="Refreshing stats" />}
        </Stack>
        <Stack spacing={0.25} sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            Last commit At: {formatDate(lastCommitDate)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Stats last updated At: {formatDate(lastUpdated)}
          </Typography>
        </Stack>
        {error && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }} role="alert">
            <ErrorOutlineIcon fontSize="small" color="error" />
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          </Stack>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          size="small"
          onClick={() => onRefresh(id)}
          disabled={isRefreshing}
          startIcon={
            isRefreshing ? (
              <CircularProgress size={14} aria-hidden="true" />
            ) : (
              <RefreshIcon fontSize="small" />
            )
          }
        >
          Refresh
        </Button>
        <Button
          size="small"
          color="error"
          onClick={() => onUntrack(id)}
          startIcon={<BookmarkRemoveOutlinedIcon fontSize="small" />}
        >
          Untrack
        </Button>
      </CardActions>
    </Card>
  );
}

export const RepositoryCard = memo(RepositoryCardComponent);
