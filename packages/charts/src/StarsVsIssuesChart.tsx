import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { EmptyChartMessage } from './EmptyChartMessage';

export interface StarsVsIssuesDatum {
  label: string;
  stars: number;
  openIssues: number;
}

export interface StarsVsIssuesChartProps {
  data: StarsVsIssuesDatum[];
  height?: number;
}

// The x-axis is fitted to the data instead of starting at 0, so the points spread
// across the plot instead of crowding against the right edge. The padding keeps the
// smallest and largest repositories off the axis lines.
const X_AXIS_LOWER_PADDING = 0.5;
const X_AXIS_UPPER_PADDING = 1.3;

export function StarsVsIssuesChart({ data, height = 360 }: StarsVsIssuesChartProps) {
  if (data.length === 0) {
    return <EmptyChartMessage />;
  }

  const stars = data.map((datum) => datum.stars);
  const xMin = Math.floor(Math.min(...stars) * X_AXIS_LOWER_PADDING);
  const xMax = Math.max(Math.ceil(Math.max(...stars) * X_AXIS_UPPER_PADDING), xMin + 1);

  const labelById = new Map(data.map((datum, index) => [index, datum.label]));

  return (
    <ScatterChart
      series={[
        {
          label: 'Repositories',
          data: data.map((datum, index) => ({
            id: index,
            x: datum.stars,
            y: datum.openIssues,
          })),
          valueFormatter: (value) =>
            value
              ? `${labelById.get(value.id as number)}: ${value.x} stars, ${value.y} open issues`
              : null,
        },
      ]}
      xAxis={[{ label: 'Stars', scaleType: 'symlog', min: xMin, max: xMax }]}
      yAxis={[{ label: 'Open issues', scaleType: 'symlog' }]}
      hideLegend
      height={height}
    />
  );
}
