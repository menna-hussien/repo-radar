import type { ReactNode } from 'react';

export interface PlaceholderPanelProps {
  children: ReactNode;
}

export function PlaceholderPanel({ children }: PlaceholderPanelProps) {
  return <div style={{ border: '1px dashed currentColor', padding: '1rem' }}>{children}</div>;
}
