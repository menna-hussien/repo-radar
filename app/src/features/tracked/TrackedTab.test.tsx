import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TrackedTab } from './TrackedTab';
import type { Repository } from '../../types';
import type { StatsRequestState } from '../../store/repositories.types';

function makeRepository(overrides: Partial<Repository> = {}): Repository {
  return {
    id: overrides.id ?? 1,
    fullName: overrides.fullName ?? `owner/repo-${overrides.id ?? 1}`,
    description: null,
    avatarUrl: 'https://example.com/avatar.png',
    htmlUrl: 'https://github.com/owner/repo',
    stars: 10,
    openIssues: 1,
    lastCommitDate: null,
    lastUpdated: null,
    ...overrides,
  };
}

const noStatsState: Record<number, StatsRequestState> = {};

describe('TrackedTab', () => {
  it('shows an empty state with a call to action when nothing is tracked', async () => {
    const onGoToSearch = vi.fn();
    render(
      <TrackedTab
        trackedRepositories={[]}
        statsStateByRepoId={noStatsState}
        onUntrack={vi.fn()}
        onRefresh={vi.fn()}
        onRefreshAll={vi.fn()}
        onGoToSearch={onGoToSearch}
      />,
    );

    expect(screen.getByText('No tracked repositories yet')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Search repositories' }));
    expect(onGoToSearch).toHaveBeenCalledTimes(1);
  });

  it('renders a card for each tracked repository', () => {
    const repositories = [makeRepository({ id: 1 }), makeRepository({ id: 2 })];
    render(
      <TrackedTab
        trackedRepositories={repositories}
        statsStateByRepoId={noStatsState}
        onUntrack={vi.fn()}
        onRefresh={vi.fn()}
        onRefreshAll={vi.fn()}
        onGoToSearch={vi.fn()}
      />,
    );

    expect(screen.getByText('owner/repo-1')).toBeInTheDocument();
    expect(screen.getByText('owner/repo-2')).toBeInTheDocument();
  });

  it('reveals more repositories with Load more, and hides the button once all are shown', async () => {
    const repositories = Array.from({ length: 7 }, (_, index) => makeRepository({ id: index + 1 }));
    render(
      <TrackedTab
        trackedRepositories={repositories}
        statsStateByRepoId={noStatsState}
        onUntrack={vi.fn()}
        onRefresh={vi.fn()}
        onRefreshAll={vi.fn()}
        onGoToSearch={vi.fn()}
      />,
    );

    expect(screen.getByText('owner/repo-6')).toBeInTheDocument();
    expect(screen.queryByText('owner/repo-7')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Load more' }));

    expect(screen.getByText('owner/repo-7')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  it('calls onRefreshAll when the Refresh all button is clicked', async () => {
    const onRefreshAll = vi.fn();
    render(
      <TrackedTab
        trackedRepositories={[makeRepository({ id: 1 })]}
        statsStateByRepoId={noStatsState}
        onUntrack={vi.fn()}
        onRefresh={vi.fn()}
        onRefreshAll={onRefreshAll}
        onGoToSearch={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Refresh all' }));
    expect(onRefreshAll).toHaveBeenCalledTimes(1);
  });

  it('calls onRefresh and onUntrack with the correct repository id', async () => {
    const onRefresh = vi.fn();
    const onUntrack = vi.fn();
    render(
      <TrackedTab
        trackedRepositories={[makeRepository({ id: 42, fullName: 'owner/answer' })]}
        statsStateByRepoId={noStatsState}
        onUntrack={onUntrack}
        onRefresh={onRefresh}
        onRefreshAll={vi.fn()}
        onGoToSearch={vi.fn()}
      />,
    );

    const card = screen.getByText('owner/answer').closest('article') as HTMLElement;
    await userEvent.click(within(card).getByRole('button', { name: /refresh/i }));
    await userEvent.click(within(card).getByRole('button', { name: /untrack/i }));

    expect(onRefresh).toHaveBeenCalledWith(42);
    expect(onUntrack).toHaveBeenCalledWith(42);
  });

  it('keeps stale stats visible while a repository is refreshing and surfaces its error', () => {
    const repository = makeRepository({ id: 1, fullName: 'owner/loading-repo', stars: 250 });
    render(
      <TrackedTab
        trackedRepositories={[repository]}
        statsStateByRepoId={{ 1: { status: 'error', error: 'Failed to fetch repository stats.' } }}
        onUntrack={vi.fn()}
        onRefresh={vi.fn()}
        onRefreshAll={vi.fn()}
        onGoToSearch={vi.fn()}
      />,
    );

    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch repository stats.')).toBeInTheDocument();
  });
});
