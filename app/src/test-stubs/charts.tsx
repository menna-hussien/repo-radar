// Test-only stand-in for @repo-radar/charts (see vite.config.ts `test.alias`).
// The real package pulls in @mui/x-charts, whose .mjs build fails to resolve
// under Node's strict ESM loader in the test environment. Charts have no
// interesting behavior to unit test here anyway — that belongs in the
// charts package's own tests — so tests exercising components that render
// them only need a harmless stand-in.
export function StarsChart() {
  return null;
}

export function OpenIssuesChart() {
  return null;
}

export function StarsVsIssuesChart() {
  return null;
}
