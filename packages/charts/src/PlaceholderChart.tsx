export interface PlaceholderChartProps {
  label: string;
}

export function PlaceholderChart({ label }: PlaceholderChartProps) {
  return <svg width={120} height={40} role="img" aria-label={label} />;
}
