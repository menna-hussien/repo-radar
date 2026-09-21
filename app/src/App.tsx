import { useMemo, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import BookmarksOutlinedIcon from '@mui/icons-material/BookmarksOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  Tab,
  Tabs,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type { PaletteMode } from '@mui/material';
import { RepoRadarLogo } from '@repo-radar/ui';
import { AnalyticsTab } from './features/analytics/AnalyticsTab';
import { SearchTab } from './features/search/SearchTab';
import { TrackedTab } from './features/tracked/TrackedTab';
import { useTrackedRepositories } from './features/tracked/useTrackedRepositories';
import { getTheme } from './theme';

type ActiveTab = 'search' | 'tracked' | 'analytics';

const tabProps = (tab: ActiveTab) => ({
  value: tab,
  iconPosition: 'start' as const,
  id: `tab-${tab}`,
  'aria-controls': `tabpanel-${tab}`,
});

function TabPanel({ tab, children }: { tab: ActiveTab; children: ReactNode }) {
  return (
    <Box role="tabpanel" id={`tabpanel-${tab}`} aria-labelledby={`tab-${tab}`}>
      {children}
    </Box>
  );
}

export function App() {
  const [mode, setMode] = useState<PaletteMode>('light');
  const theme = useMemo(() => getTheme(mode), [mode]);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeTab, setActiveTab] = useState<ActiveTab>('search');
  const {
    trackedRepositories,
    statsStateByRepoId,
    isTracked,
    track,
    untrack,
    refreshOne,
    refreshAll,
  } = useTrackedRepositories();

  const themeToggle = (
    <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
      <IconButton
        onClick={() => setMode((current) => (current === 'light' ? 'dark' : 'light'))}
        aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );

  const tabIconProps = (icon: ReactElement) => (isMobile ? {} : { icon });

  const tabs = (
    <Tabs
      value={activeTab}
      onChange={(_event, value: ActiveTab) => setActiveTab(value)}
      aria-label="Repo Radar sections"
      variant={isMobile ? 'fullWidth' : 'standard'}
      sx={{ width: { xs: '100%', sm: 'auto' } }}
    >
      <Tab
        {...tabIconProps(<SearchIcon fontSize="small" />)}
        label="Search"
        {...tabProps('search')}
      />
      <Tab
        {...tabIconProps(<BookmarksOutlinedIcon fontSize="small" />)}
        label="Tracked Repositories"
        {...tabProps('tracked')}
      />
      <Tab
        {...tabIconProps(<BarChartIcon fontSize="small" />)}
        label="Analytics"
        {...tabProps('analytics')}
      />
    </Tabs>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <AppBar position="static" color="default" elevation={2}>
          <Toolbar
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1,
              py: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                flex: { sm: 1 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <RepoRadarLogo sx={{ fontSize: 36 }} />
                <Typography
                  variant="h6"
                  component="h1"
                  sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  Repo Radar
                </Typography>
              </Box>
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>{themeToggle}</Box>
            </Box>

            {tabs}

            <Box sx={{ flex: 1, display: { xs: 'none', sm: 'flex' }, justifyContent: 'flex-end' }}>
              {themeToggle}
            </Box>
          </Toolbar>
        </AppBar>

        {activeTab === 'search' && (
          <TabPanel tab="search">
            <SearchTab isTracked={isTracked} onTrack={track} onUntrack={untrack} />
          </TabPanel>
        )}
        {activeTab === 'tracked' && (
          <TabPanel tab="tracked">
            <TrackedTab
              trackedRepositories={trackedRepositories}
              statsStateByRepoId={statsStateByRepoId}
              onUntrack={untrack}
              onRefresh={refreshOne}
              onRefreshAll={refreshAll}
              onGoToSearch={() => setActiveTab('search')}
            />
          </TabPanel>
        )}
        {activeTab === 'analytics' && (
          <TabPanel tab="analytics">
            <AnalyticsTab trackedRepositories={trackedRepositories} />
          </TabPanel>
        )}
      </Box>
    </ThemeProvider>
  );
}
