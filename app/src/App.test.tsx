import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('App', () => {
  it('renders the app title and defaults to the search tab', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: 'Repo Radar' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Search', selected: true })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Discover amazing repositories' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Start typing to search' })).toBeInTheDocument();
  });
});
