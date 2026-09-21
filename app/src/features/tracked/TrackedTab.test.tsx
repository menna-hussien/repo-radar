import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TrackedTab } from './TrackedTab';
import type { Repository } from '../../types';
import type { RepositoriesState } from '../../store/repositories.types';
import { renderWithRepositories } from '../../test-utils/renderWithRepositories';

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

interface RenderOptions {
  state?: Partial<RepositoriesState>;
  onUntrack?: (id: number) => void;
  onRefresh?: (id: number) => void;
  onRefreshAll?: () => void;
  onGoToSearch?: () => void;
}

function renderTrackedTab({
  state,
  onUntrack = vi.fn(),
  onRefresh = vi.fn(),
  onRefreshAll = vi.fn(),
  onGoToSearch = vi.fn(),
}: RenderOptions = {}) {
  return renderWithRepositories(
    <TrackedTab
      onUntrack={onUntrack}
      onRefresh={onRefresh}
      onRefreshAll={onRefreshAll}
      onGoToSearch={onGoToSearch}
    />,
    state,
  );
}

describe('TrackedTab', () => {
  it('shows an empty state with a call to action when nothing is tracked', async () => {
    const onGoToSearch = vi.fn();
    renderTrackedTab({ onGoToSearch });

    expect(screen.getByText('No tracked repositories yet')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Search repositories' }));
    expect(onGoToSearch).toHaveBeenCalledTimes(1);
  });

  it('renders a card for each tracked repository', () => {
    renderTrackedTab({
      state: { trackedRepositories: [makeRepository({ id: 1 }), makeRepository({ id: 2 })] },
    });

    expect(screen.getByText('owner/repo-1')).toBeInTheDocument();
    expect(screen.getByText('owner/repo-2')).toBeInTheDocument();
  });

  it('lists the most recently tracked repository first', () => {
    renderTrackedTab({
      state: {
        trackedRepositories: [
          makeRepository({ id: 1, fullName: 'owner/first-tracked' }),
          makeRepository({ id: 2, fullName: 'owner/second-tracked' }),
          makeRepository({ id: 3, fullName: 'owner/third-tracked' }),
        ],
      },
    });

    const names = screen
      .getAllByRole('article')
      .map((card) => within(card).getByText(/^owner\//).textContent);
    expect(names).toEqual(['owner/third-tracked', 'owner/second-tracked', 'owner/first-tracked']);
  });

  it('filters tracked repositories by name, and shows an empty state when nothing matches', async () => {
    renderTrackedTab({
      state: {
        trackedRepositories: [
          makeRepository({ id: 1, fullName: 'facebook/react' }),
          makeRepository({ id: 2, fullName: 'vuejs/vue' }),
        ],
      },
    });

    const filterInput = screen.getByRole('searchbox', { name: 'Filter tracked repositories' });
    await userEvent.type(filterInput, 'react');

    expect(screen.getByText('facebook/react')).toBeInTheDocument();
    expect(screen.queryByText('vuejs/vue')).not.toBeInTheDocument();

    await userEvent.clear(filterInput);
    await userEvent.type(filterInput, 'does-not-exist');

    expect(screen.getByText('No tracked repositories match')).toBeInTheDocument();
  });

  it('reveals more repositories with Load more, and hides the button once all are shown', async () => {
    renderTrackedTab({
      state: {
        trackedRepositories: Array.from({ length: 7 }, (_, index) =>
          makeRepository({ id: index + 1 }),
        ),
      },
    });

    expect(screen.getByText('owner/repo-2')).toBeInTheDocument();
    expect(screen.queryByText('owner/repo-1')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Load more' }));

    expect(screen.getByText('owner/repo-1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  it('calls onRefreshAll when the Refresh all button is clicked', async () => {
    const onRefreshAll = vi.fn();
    renderTrackedTab({ state: { trackedRepositories: [makeRepository({ id: 1 })] }, onRefreshAll });

    await userEvent.click(screen.getByRole('button', { name: 'Refresh all' }));
    expect(onRefreshAll).toHaveBeenCalledTimes(1);
  });

  it('calls onRefresh and onUntrack with the correct repository id', async () => {
    const onRefresh = vi.fn();
    const onUntrack = vi.fn();
    renderTrackedTab({
      state: { trackedRepositories: [makeRepository({ id: 42, fullName: 'owner/answer' })] },
      onRefresh,
      onUntrack,
    });

    const card = screen.getByText('owner/answer').closest('article') as HTMLElement;
    await userEvent.click(within(card).getByRole('button', { name: /refresh/i }));
    await userEvent.click(within(card).getByRole('button', { name: /untrack/i }));

    expect(onRefresh).toHaveBeenCalledWith(42);
    expect(onUntrack).toHaveBeenCalledWith(42);
  });

  it('keeps stale stats visible while a repository is refreshing and surfaces its error', () => {
    renderTrackedTab({
      state: {
        trackedRepositories: [
          makeRepository({ id: 1, fullName: 'owner/loading-repo', stars: 250 }),
        ],
        statsStateByRepoId: { 1: { status: 'error', error: 'Failed to fetch repository stats.' } },
      },
    });

    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch repository stats.')).toBeInTheDocument();
  });
});
