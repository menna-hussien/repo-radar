import { useId } from 'react';
import { SvgIcon } from '@mui/material';
import type { SvgIconProps } from '@mui/material';

export function RepoRadarLogo(props: SvgIconProps) {
  const gradientId = useId();

  return (
    <SvgIcon viewBox="0 0 36 36" titleAccess="Repo Radar" {...props}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill={`url(#${gradientId})`} />
      <circle
        cx="18"
        cy="18"
        r="10"
        fill="none"
        stroke="white"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <circle
        cx="18"
        cy="18"
        r="6"
        fill="none"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      <circle cx="18" cy="18" r="2" fill="white" />
      <circle cx="24" cy="12" r="2" fill="white" />
    </SvgIcon>
  );
}
