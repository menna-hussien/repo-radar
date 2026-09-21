import { memo } from 'react';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { formatCount } from '../formatters';

export interface SearchResultCardProps {
  id: number;
  fullName: string;
  description: string | null;
  avatarUrl: string;
  htmlUrl: string;
  stars: number | null;
  openIssues: number | null;
  isTracked: boolean;
  onToggleTrack: (id: number) => void;
}

function SearchResultCardComponent({
  id,
  fullName,
  description,
  avatarUrl,
  htmlUrl,
  stars,
  openIssues,
  isTracked,
  onToggleTrack,
}: SearchResultCardProps) {
  return (
    <Card variant="outlined" component="article">
      <CardContent>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <Avatar src={avatarUrl} alt="" />
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fullName}
                </Typography>
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
              </Stack>
              {description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {description}
                </Typography>
              )}
              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <StarOutlineIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatCount(stars)}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ReportProblemOutlinedIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatCount(openIssues)} open issues
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
          {isTracked ? (
            <Tooltip title={`Untrack ${fullName}`}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<BookmarkIcon fontSize="small" />}
                onClick={() => onToggleTrack(id)}
                aria-label={`Untrack ${fullName}`}
                sx={{ flexShrink: 0 }}
              >
                Tracked
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title={`Track ${fullName}`}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<BookmarkBorderIcon fontSize="small" />}
                onClick={() => onToggleTrack(id)}
                aria-label={`Track ${fullName}`}
                sx={{ flexShrink: 0 }}
              >
                Track
              </Button>
            </Tooltip>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export const SearchResultCard = memo(SearchResultCardComponent);
