# Repo Radar

A dashboard for searching, tracking, and monitoring GitHub repositories.

This is currently a **bootstrap only**: the monorepo, build tooling, and a minimal
placeholder screen. No Repo Radar feature logic (search, tracking, refresh, charts,
persistence, Redux state) has been implemented yet — those are being designed
separately before implementation.

## Stack

- React 19 + TypeScript
- Vite
- Redux Toolkit
- Material UI
- Axios (for the GitHub REST API)
- npm workspaces (monorepo, no Turborepo)

## Structure

```
app/              React application (Vite)

packages/
  ui/             Reusable, domain-agnostic UI components (@repo-radar/ui)
  charts/         Reusable charting components (@repo-radar/charts)
```

The GitHub API/data layer will live in `app/src/services/github/` rather than
a separate package, since the project doesn't yet warrant that split.

## Scripts

Run from the repo root:

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the web app's Vite dev server      |
| `npm run build`        | Type-check and build all workspaces      |
| `npm run typecheck`    | Type-check all workspaces                |
| `npm run lint`         | Lint the whole repo with ESLint          |
| `npm run format`       | Format the whole repo with Prettier      |
| `npm run format:check` | Check formatting without writing changes |

## Getting started

```bash
npm install
npm run dev
```

## Optional next steps

- Husky + lint-staged to run lint/format checks on commit (not set up yet, low
  complexity to add later if wanted).
