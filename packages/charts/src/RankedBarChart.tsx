import { BarChart } from '@mui/x-charts/BarChart';
import { EmptyChartMessage } from './EmptyChartMessage';
import type { ChartDatum } from './types';

export interface RankedBarChartProps {
  data: ChartDatum[];
  valueLabel?: string;
  color?: string;
  height?: number;
}

// The y-axis reserves its own label area via `width` (MUI X defaults this to
// just 45px, independent of `margin`), so long labels like repository full
// names get silently ellipsized unless we widen it explicitly.
const Y_AXIS_WIDTH = 200;

// Horizontal bars: category labels (e.g. repository names) get the full width
// of the axis to render on, so they never overlap the way they would rotated
// along a vertical bar chart's x-axis.
export function RankedBarChart({
  data,
  valueLabel = 'Value',
  color,
  height = 360,
}: RankedBarChartProps) {
  if (data.length === 0) {
    return <EmptyChartMessage />;
  }

  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <BarChart
      layout="horizontal"
      yAxis={[{ data: sorted.map((datum) => datum.label), scaleType: 'band', width: Y_AXIS_WIDTH }]}
      xAxis={[{ label: valueLabel }]}
      series={[{ data: sorted.map((datum) => datum.value), label: valueLabel, color }]}
      height={height}
      margin={{ left: 8 }}
    />
  );
}
