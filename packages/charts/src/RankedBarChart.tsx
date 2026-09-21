import { useMediaQuery, useTheme } from '@mui/material';
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

// The y-axis reserves its own label area via `width` (MUI X defaults this to just
// 45px, independent of `margin`), so long labels like repository full names get
// silently ellipsized unless we widen it. The width is estimated from the longest
// label rather than fixed, so short names don't waste space in a narrow card.
// Tick labels are 12px sans-serif, roughly 6-7px per character (7 is a slightly
// generous estimate); the padding covers the tick mark (6px), the gap (2px) and slack.
// Capped at 200px (about 30 characters); anything longer is ellipsized.
const Y_AXIS_CHAR_WIDTH = 7;
const Y_AXIS_PADDING = 24;
const MAX_Y_AXIS_WIDTH = 200;

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (data.length === 0) {
    return <EmptyChartMessage />;
  }

  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, limit);
  const height = Math.max(minHeight, sorted.length * BAR_ROW_HEIGHT + CHART_CHROME_HEIGHT);
  const longestLabelLength = Math.max(...sorted.map((datum) => datum.label.length));
  // On a phone the label area would leave too little room for the bars, so the
  // axis keeps MUI X's compact default width and labels are ellipsized to fit.
  // The full name is still shown in the tooltip.
  const yAxisWidth = isMobile
    ? undefined
    : Math.min(MAX_Y_AXIS_WIDTH, longestLabelLength * Y_AXIS_CHAR_WIDTH + Y_AXIS_PADDING);

  return (
    <BarChart
      layout="horizontal"
      yAxis={[{ data: sorted.map((datum) => datum.label), scaleType: 'band', width: yAxisWidth }]}
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
