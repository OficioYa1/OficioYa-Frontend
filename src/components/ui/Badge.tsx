import React from 'react';
import { ShieldCheck } from 'lucide-react';
import './ui.css';

type BadgeTone = 'verified' | 'available' | 'unavailable' | 'neutral' | 'warm';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  uppercase?: boolean;
  icon?: React.ReactNode;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  uppercase = false,
  icon,
  dot = false,
  className = '',
  children,
  ...rest
}) => (
  <span
    className={['oy-badge', `oy-badge--${tone}`, uppercase ? 'oy-badge--upper' : '', className]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  >
    {dot && <span className="oy-badge__dot" aria-hidden="true" />}
    {icon}
    {children}
  </span>
);

/** Etiqueta "Profesional verificado" del manual. */
export const VerifiedBadge: React.FC<{ label?: string }> = ({ label = 'Verificado' }) => (
  <Badge tone="verified" icon={<ShieldCheck size={12} aria-hidden="true" />}>
    {label}
  </Badge>
);

/** Estado de disponibilidad: color + punto + texto (no depende solo del color). */
export const AvailabilityBadge: React.FC<{ available: boolean }> = ({ available }) => (
  <Badge tone={available ? 'available' : 'unavailable'} dot>
    {available ? 'Disponible ahora' : 'No disponible'}
  </Badge>
);
