import type { ReactElement } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { RepositoriesState } from '../store/repositories.types';
import { repositoriesReducer } from '../store/repositoriesSlice';

export function renderWithRepositories(ui: ReactElement, state: Partial<RepositoriesState> = {}) {
  const store = configureStore({
    reducer: { repositories: repositoriesReducer },
    preloadedState: {
      repositories: { trackedRepositories: [], statsStateByRepoId: {}, ...state },
    },
  });
  return render(<Provider store={store}>{ui}</Provider>);
}
