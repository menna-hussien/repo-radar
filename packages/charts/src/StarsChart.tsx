import { BarChart } from '@mui/x-charts/BarChart';
import { EmptyChartMessage } from './EmptyChartMessage';
import type { ChartDatum } from './types';

export interface StarsChartProps {
  data: ChartDatum[];
  height?: number;
}

export function StarsChart({ data, height = 320 }: StarsChartProps) {
  if (data.length === 0) {
    return <EmptyChartMessage />;
  }

  return (
    <BarChart
      xAxis={[{ data: data.map((datum) => datum.label), scaleType: 'band' }]}
      yAxis={[{ label: 'Stars' }]}
      series={[{ data: data.map((datum) => datum.value), label: 'Stars' }]}
      height={height}
    />
  );
}
