import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // @repo-radar/charts is a linked workspace package, so Vite's dependency
    // scanner doesn't always discover its own dependencies proactively — and
    // it's only ever reached behind a React.lazy() dynamic import. Listing it
    // explicitly avoids a dev-server re-optimization hiccup on first load.
    include: ['@mui/x-charts/BarChart', '@mui/x-charts/PieChart', '@mui/x-charts/ScatterChart'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      // The real @mui/x-charts .mjs build fails to resolve under Node's
      // strict ESM loader in the test environment (a directory-import
      // resolution quirk), and charts have no behavior worth unit testing
      // from a consumer component's test anyway. See src/test-stubs/charts.tsx.
      '@repo-radar/charts': path.resolve(import.meta.dirname, 'src/test-stubs/charts.tsx'),
    },
  },
});
