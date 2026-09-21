import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChartCard } from './ChartCard';

function BrokenChart(): never {
  throw new Error('chart failed to render');
}

describe('ChartCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows an error in the failing card only, leaving other charts working', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <>
        <ChartCard icon={null} title="Broken chart" subheader="fails">
          <BrokenChart />
        </ChartCard>
        <ChartCard icon={null} title="Working chart" subheader="fine">
          <p>chart content</p>
        </ChartCard>
      </>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent("This chart couldn't be loaded");
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByText('chart content')).toBeInTheDocument();
    expect(screen.getByText('Working chart')).toBeInTheDocument();
  });
});
