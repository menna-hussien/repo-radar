import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnalyticsTab } from './AnalyticsTab';
import { renderWithRepositories } from '../../test-utils/renderWithRepositories';
import type { Repository } from '../../types';

function makeRepository(overrides: Partial<Repository> = {}): Repository {
  return {
    id: 1,
    fullName: 'octocat/hello-world',
    description: null,
    avatarUrl: 'https://example.com/avatar.png',
    htmlUrl: 'https://github.com/octocat/hello-world',
    stars: 10,
    openIssues: 2,
    lastCommitDate: null,
    lastUpdated: null,
    ...overrides,
  };
}

describe('AnalyticsTab', () => {
  it('shows an empty state when nothing is tracked', () => {
    renderWithRepositories(<AnalyticsTab />);

    expect(screen.getByRole('heading', { name: 'No analytics yet' })).toBeInTheDocument();
    expect(screen.queryByText('Stars by Repository')).not.toBeInTheDocument();
  });

  it('shows the three chart cards when repositories are tracked', () => {
    renderWithRepositories(<AnalyticsTab />, { trackedRepositories: [makeRepository()] });

    expect(screen.getByText('Stars by Repository')).toBeInTheDocument();
    expect(screen.getByText('Open Issues by Repository')).toBeInTheDocument();
    expect(screen.getByText('Stars vs. Open Issues')).toBeInTheDocument();
  });
});
