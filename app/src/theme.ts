import { createTheme, type PaletteMode } from '@mui/material';

export function getTheme(mode: PaletteMode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#6366F1' },
      secondary: { main: '#0EA5E9' },
      success: { main: '#10B981' },
      warning: { main: '#F59E0B' },
      error: { main: '#EF4444' },
    },
  });
}
