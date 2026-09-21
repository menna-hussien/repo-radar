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

export function StarsVsIssuesChart({ data, height = 360 }: StarsVsIssuesChartProps) {
  if (data.length === 0) {
    return <EmptyChartMessage />;
  }

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
      xAxis={[{ label: 'Stars', scaleType: 'symlog' }]}
      yAxis={[{ label: 'Open issues', scaleType: 'symlog' }]}
      hideLegend
      height={height}
    />
  );
}
