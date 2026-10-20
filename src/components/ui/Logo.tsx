import React from 'react';
import { BRAND_ASSETS } from '../../utils/assets';
import './ui.css';

export interface LogoProps {
  /** Tamaño del icono (rostro de Many) en px. */
  size?: number;
  /** Mostrar el nombre junto al icono. */
  showWordmark?: boolean;
  /** Para fondos azules u oscuros. */
  inverse?: boolean;
  className?: string;
}

/**
 * Identificador oficial: rostro de Many sobre amarillo + "Oficio" "Ya".
 * El icono se usa tal cual (sin recortar, rotar ni cambiar el fondo).
 */
export const Logo: React.FC<LogoProps> = ({
  size = 36,
  showWordmark = true,
  inverse = false,
  className = '',
}) => (
  <span
    className={['oy-logo', inverse ? 'oy-logo--inverse' : '', className].filter(Boolean).join(' ')}
    role={showWordmark ? undefined : 'img'}
    aria-label={showWordmark ? undefined : 'OficioYa'}
  >
    <img
      src={BRAND_ASSETS.logo}
      alt=""
      width={size}
      height={size}
      className="oy-logo__mark"
      decoding="async"
    />
    {showWordmark && (
      <span className="oy-logo__word" style={{ fontSize: Math.round(size * 0.58) }}>
        <span className="oy-logo__oficio">Oficio</span>
        <span className="oy-logo__ya">Ya</span>
      </span>
    )}
  </span>
);
