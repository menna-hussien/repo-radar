import { PieChart } from '@mui/x-charts/PieChart';
import { EmptyChartMessage } from './EmptyChartMessage';
import type { ChartDatum } from './types';

export interface OpenIssuesChartProps {
  data: ChartDatum[];
  height?: number;
}

export function OpenIssuesChart({ data, height = 280 }: OpenIssuesChartProps) {
  if (data.length === 0) {
    return <EmptyChartMessage />;
  }

  return (
    <PieChart
      series={[
        {
          data: data.map((datum, index) => ({
            id: index,
            value: datum.value,
            label: datum.label,
          })),
          innerRadius: 40,
          arcLabel: 'value',
        },
      ]}
      height={height}
    />
  );
}
