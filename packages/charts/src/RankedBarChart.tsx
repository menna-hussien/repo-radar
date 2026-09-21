import { BarChart } from '@mui/x-charts/BarChart';
import { EmptyChartMessage } from './EmptyChartMessage';
import type { ChartDatum } from './types';

export interface RankedBarChartProps {
  data: ChartDatum[];
  valueLabel?: string;
  color?: string;
  minHeight?: number;
  // Show only the top N bars after ranking. Omit to show every item.
  limit?: number;
}

// The y-axis reserves its own label area via `width` (MUI X defaults this to
// just 45px, independent of `margin`), so long labels like repository full
// names get silently ellipsized unless we widen it explicitly. 200px fits about
// 30 characters; anything longer is ellipsized.
const Y_AXIS_WIDTH = 200;

// Each bar needs a fixed row of its own, otherwise a long list squeezes the
// labels into overlapping text. The chart grows with the data, never below minHeight.
const BAR_ROW_HEIGHT = 28;
const CHART_CHROME_HEIGHT = 100;

// Horizontal bars: category labels (e.g. repository names) get the full width
// of the axis to render on, so they never overlap the way they would rotated
// along a vertical bar chart's x-axis.
export function RankedBarChart({
  data,
  valueLabel = 'Value',
  color,
  minHeight = 360,
  limit,
}: RankedBarChartProps) {
  if (data.length === 0) {
    return <EmptyChartMessage />;
  }

  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, limit);
  const height = Math.max(minHeight, sorted.length * BAR_ROW_HEIGHT + CHART_CHROME_HEIGHT);

  return (
    <BarChart
      layout="horizontal"
      yAxis={[{ data: sorted.map((datum) => datum.label), scaleType: 'band', width: Y_AXIS_WIDTH }]}
      xAxis={[{ label: valueLabel }]}
      series={[
        {
          data: sorted.map((datum) => datum.value),
          label: valueLabel,
          color,
        },
      ]}
      hideLegend
      height={height}
      margin={{ left: 8, right: 40 }}
    />
  );
}
