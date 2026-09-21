const MISSING_VALUE = '—';

export function formatCount(value: number | null): string {
  if (value === null) {
    return MISSING_VALUE;
  }
  return new Intl.NumberFormat(undefined, { notation: 'compact' }).format(value);
}

export function formatDate(value: string | null): string {
  if (!value) {
    return MISSING_VALUE;
  }
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
