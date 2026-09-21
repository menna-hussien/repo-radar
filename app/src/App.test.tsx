import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { App } from './App';
import { repositoriesReducer } from './store/repositoriesSlice';

function renderApp() {
  const store = configureStore({ reducer: { repositories: repositoriesReducer } });
  return render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
}

function setMobileViewport(isMobile: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: isMobile,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the app title and defaults to the search tab', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: 'Repo Radar' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Search', selected: true })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Discover amazing repositories' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Start typing to search' })).toBeInTheDocument();
  });

  it('links each tab to a labelled tab panel that shows its content', async () => {
    renderApp();

    const searchTab = screen.getByRole('tab', { name: 'Search' });
    const searchPanel = screen.getByRole('tabpanel', { name: 'Search' });
    expect(searchTab).toHaveAttribute('aria-controls', searchPanel.id);

    await userEvent.click(screen.getByRole('tab', { name: 'Analytics' }));

    const analyticsPanel = screen.getByRole('tabpanel', { name: 'Analytics' });
    expect(screen.getByRole('tab', { name: 'Analytics' })).toHaveAttribute(
      'aria-controls',
      analyticsPanel.id,
    );
    expect(screen.queryByRole('tabpanel', { name: 'Search' })).not.toBeInTheDocument();
  });

  it('shows an icon beside each tab name on larger screens', () => {
    setMobileViewport(false);
    renderApp();

    const searchTab = screen.getByRole('tab', { name: 'Search' });
    expect(within(searchTab).getByTestId('SearchIcon')).toBeInTheDocument();
  });

  it('hides the tab icons on mobile', () => {
    setMobileViewport(true);
    renderApp();

    const searchTab = screen.getByRole('tab', { name: 'Search' });
    expect(within(searchTab).queryByTestId('SearchIcon')).not.toBeInTheDocument();
  });
});
