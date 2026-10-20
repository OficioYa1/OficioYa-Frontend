import React from 'react';
import type { ReactNode } from 'react';
import { Search, Wrench, WifiOff, Award } from 'lucide-react';
import { MascotAvatar } from './MascotAvatar';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './ManyState.css';

export type ManyStateVariant = 'sin-resultados' | 'error' | 'sin-conexion' | 'celebracion';

interface ManyStateProps {
  variant: ManyStateVariant;
  title: string;
  message: string;
  actions?: ReactNode;
  /** Para errores bloqueantes usar 'alert'; para estados vacíos y celebraciones, 'status'. */
  role?: 'status' | 'alert';
  imageOverride?: string;
  className?: string;
}

const VARIANT_ICON: Record<ManyStateVariant, ReactNode> = {
  'sin-resultados': <Search size={20} aria-hidden="true" />,
  error: <Wrench size={20} aria-hidden="true" />,
  'sin-conexion': <WifiOff size={20} aria-hidden="true" />,
  celebracion: <Award size={20} aria-hidden="true" />,
};

const VARIANT_POSE = {
  'sin-resultados': 'lupa',
  error: 'plomero',
  'sin-conexion': 'cable',
  celebracion: 'exito',
} as const;

const CONFETTI_PIECES = 18;

export const ManyState: React.FC<ManyStateProps> = ({
  variant,
  title,
  message,
  actions,
  role = 'status',
  imageOverride,
  className = ''
}) => {
  const reduced = useReducedMotion();
  const celebrate = variant === 'celebracion';

  return (
    <section
      className={`many-state many-state--${variant} ${className}`}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
    >
      {/* Confeti ligero renderizado exclusivamente en CSS para celebraciones */}
      {celebrate && !reduced && (
        <div className="many-state__confetti" aria-hidden="true">
          {Array.from({ length: CONFETTI_PIECES }, (_, i) => (
            <span key={i} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>
      )}

      <div className="many-state__figure">
        {imageOverride ? (
          <img src={imageOverride} alt="" className="many-state__custom-img" />
        ) : (
          <MascotAvatar
            size="lg"
            forceImage={VARIANT_POSE[variant]}
            animate={reduced ? 'none' : celebrate ? 'bounce' : 'idle'}
          />
        )}
        <span className="many-state__badge" aria-hidden="true">
          {VARIANT_ICON[variant]}
        </span>
      </div>

      <h2 className="many-state__title">{title}</h2>
      <p className="many-state__message">{message}</p>

      {actions && <div className="many-state__actions">{actions}</div>}
    </section>
  );
};
