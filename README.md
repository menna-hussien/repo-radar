# Repo Radar

A GitHub repository dashboard for searching repositories, tracking favorites, monitoring their latest statistics, and visualizing tracked-repository data.

**Live demo:** https://repo-radar-eight-navy.vercel.app/

## Tech Stack

- **React 19 + TypeScript**
- **Vite**
- **Redux Toolkit**
- **Material UI + MUI X Charts**
- **GitHub REST API**
- **Axios**
- **npm Workspaces** — monorepo
- **Vitest + React Testing Library**
- **ESLint + Prettier**
- **GitHub Actions** for CI

## Getting Started

Requires **Node.js 22 or newer**.

```bash
npm install
npm run dev
```

The application will start using Vite's development server.

### Available Scripts

| Command                 | Description                         |
| ----------------------- | ----------------------------------- |
| `npm run dev`           | Start the development server        |
| `npm run build`         | Type-check and build all workspaces |
| `npm run typecheck`     | Type-check all workspaces           |
| `npm run test`          | Run the test suite                  |
| `npm run test:coverage` | Run tests with coverage             |
| `npm run lint`          | Run ESLint                          |
| `npm run format`        | Format the repository               |
| `npm run format:check`  | Check formatting                    |

No environment variables are required for the deployed application. GitHub's REST API is accessed without authentication.

For local development, an optional GitHub token can be provided to increase the API rate limit:

```bash
cp app/.env.example app/.env.local
```

Set `VITE_GITHUB_TOKEN` in `.env.local`.

The token is intentionally **not used in production**, because Vite exposes `VITE_*` variables to the client bundle.

## Beyond the Requirements

In addition to the required features, the app includes:

- **Light/dark theme switching**
- **Additional charts** — a ranked open-issues bar chart and a stars-vs-open-issues scatter plot, in a dedicated Analytics tab
- **Filtering and "Load more"** on the Tracked tab, which lists the most recently tracked repository first
- **Rate-limit-aware fetching**, with stale data kept on screen when a refresh fails
- **Accessible tabs** with tab/tabpanel relationships
- **Husky + lint-staged + Commitlint** commit workflow

## Deployment

The application is deployed on **Vercel**:

https://repo-radar-eight-navy.vercel.app/

The production deployment uses unauthenticated GitHub API requests. A production setup requiring higher API limits would keep a GitHub token server-side behind a small API/proxy layer.

## Monorepo Structure

```text
app/
  src/
    features/
      search/
      tracked/
      analytics/
    services/
      github/
      storage/
    store/
    hooks/
    types.ts
    constants.ts
    theme.ts

packages/
  ui/
  charts/
```

### `app`

Contains application-specific features, state management, API integration, persistence, and composition.

### `packages/ui`

Reusable, domain-agnostic presentational components such as:

- `RepositoryCard`
- `SearchResultCard`
- `SearchInput`
- `RepositoryListSkeleton`
- `ErrorState`
- `EmptyState`

The package has no knowledge of Redux, GitHub, Axios, or localStorage.

### `packages/charts`

Reusable chart components built on MUI X Charts.

The package receives generic chart data and has no knowledge of GitHub repositories.

This keeps the shared packages reusable independently from the Repo Radar application.

## Architecture & Technical Decisions

### Domain Model

The application uses a canonical `Repository` domain model, while GitHub-specific DTOs remain isolated within the API layer.

GitHub API response types are mapped into the domain model at the API boundary, preventing GitHub-specific field names from leaking throughout the application.

### State Management

Redux Toolkit manages the state that needs to be shared across features:

```ts
interface RepositoriesState {
  trackedRepositories: Repository[];
  statsStateByRepoId: Record<number, StatsRequestState>;
}
```

`trackedRepositories` remains an ordered array because ordering is meaningful to the UI.

Request state is normalized by repository ID so each repository can independently represent:

- idle
- loading
- success
- error

Search state remains local to the search feature because it is transient and isn't required by other parts of the application.

### Independent Repository Refresh

Repository statistics are fetched through a single async thunk per repository.

"Refresh All" dispatches one request per repository without awaiting them sequentially. This means requests can run concurrently while each repository maintains its own loading and error state.

A failed refresh does not remove or clear the repository's last-known statistics.

### Search

Repository search is debounced by 500ms.

When the query or page changes, the previous request is cancelled using `AbortController`. Cancelled requests are treated as cancellation rather than application errors, preventing stale responses from overwriting newer search results.

A new query resets the page to 1 during render rather than in a separate effect. This avoids briefly fetching the new query with the previous page number and wasting an additional API request.

GitHub's Search API pagination is used directly, with the API's 1,000-result search limit respected.

### Persistence

Tracked repositories are persisted to `localStorage`, including their last-known statistics and `lastUpdated` timestamp.

During application startup:

- Recently fetched statistics are reused.
- Statistics older than 15 minutes are refreshed.
- Invalid or malformed localStorage data is safely ignored.

This allows the application to continue displaying useful stale data even when a refresh fails or the GitHub API rate limit has been reached.

### GitHub API Rate Limit

Unauthenticated GitHub API requests are limited to 60 requests per hour per visitor IP.

The implementation therefore avoids unnecessary requests:

- Tracking a search result reuses the statistics already returned by search and only requests the missing last-commit date.
- Hydration only refreshes stale statistics.
- Manual refreshes always request fresh data.
- Refresh failures preserve the previously known statistics.

A full repository statistics refresh requires two GitHub API requests: repository details and the latest commit.

## Analytics

The Analytics tab contains reusable chart components from `@repo-radar/charts`.

It currently provides:

- **Stars per repository** — required bar chart
- **Open issues per repository** — ranked bar chart (top 10)
- **Stars vs. open issues** — scatter chart

Charts consume the repository data already available in the application state, so analytics does not introduce additional GitHub API requests.

The analytics feature is lazy-loaded so the charting dependency is not included in the initial application bundle. An error boundary isolates failed chart chunk loads so they don't take down the rest of the application.

## Testing

Tests focus primarily on observable behavior and important state transitions.

Coverage includes:

- Redux state transitions
- Independent repository request states
- GitHub DTO mapping
- localStorage edge cases
- Search debounce and request cancellation
- Pagination and query changes
- Rate-limit-aware fetching behavior
- Tracked repository ordering and filtering
- Per-repository refresh/untrack actions
- Analytics states
- Accessibility relationships between tabs and tab panels

The chart package is stubbed in application tests because MUI X Charts' ESM build does not resolve cleanly in the Node test environment. As a result, chart rendering itself is not unit-tested.

## Assumptions & Limitations

- **GitHub API:** Production uses unauthenticated requests and is therefore subject to GitHub's public rate limit.
- **Search:** GitHub Search API results are limited to the first 1,000 results.
- **Browse feed:** The application intentionally provides repository search rather than an unfiltered repository feed.
- **Theme:** Light/dark theme preference is not persisted.
- **Authentication:** No GitHub user authentication is required because the task only requires public repository data.
- **Deployment:** CI and the Vercel deployment run in parallel, so production deploys are not gated on CI passing. Vercel's own build still type-checks and builds the app, but lint and tests only run in CI.

## Future Improvements

For a production version, I would consider:

- A server-side GitHub API proxy for secure authenticated requests and higher rate limits.
- Gating production deploys on CI, using Vercel Deployment Checks or a deploy step in the GitHub Actions workflow.
- Storybook for the shared UI package.
- Additional repository analytics and historical statistics.
- Persisted user preferences such as theme and analytics settings.
