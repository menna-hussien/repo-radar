import { useId } from 'react';
import { SvgIcon } from '@mui/material';
import type { SvgIconProps } from '@mui/material';

export function SearchIllustration(props: SvgIconProps) {
  const gradientId = useId();
  const stroke = `url(#${gradientId})`;

  return (
    <SvgIcon viewBox="0 0 120 120" {...props}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill={stroke} fillOpacity="0.08" />
      <circle
        cx="60"
        cy="60"
        r="44"
        fill="none"
        stroke={stroke}
        strokeOpacity="0.25"
        strokeWidth="1.5"
        strokeDasharray="3 5"
      />
      <circle cx="26" cy="38" r="4" fill="#F59E0B" />
      <circle cx="96" cy="30" r="3" fill="#10B981" />
      <circle cx="98" cy="82" r="4" fill="#EF4444" fillOpacity="0.85" />
      <circle cx="54" cy="54" r="22" fill="white" fillOpacity="0.9" />
      <circle cx="54" cy="54" r="22" fill="none" stroke={stroke} strokeWidth="6" />
      <circle
        cx="54"
        cy="54"
        r="12"
        fill="none"
        stroke={stroke}
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <circle cx="54" cy="54" r="3" fill="#6366F1" />
      <circle cx="62" cy="46" r="2.5" fill="#0EA5E9" />
      <line x1="71" y1="71" x2="90" y2="90" stroke={stroke} strokeWidth="9" strokeLinecap="round" />
    </SvgIcon>
  );
}
