import React, { type ReactNode } from 'react';
import { StrokeText } from '../ui/StrokeText';

export type PageHeroTone = 'marino' | 'almendra' | 'esmeralda' | 'amarillo' | 'fuego' | 'gris';

export interface PageHeroSticker {
  icon: ReactNode;
  tone?: 'amarillo' | 'esmeralda' | 'fuego' | 'marino' | 'almendra' | 'blanco';
  /** Posición y giro: { top: '12%', right: '8%', rotate: '-8deg' } */
  style: React.CSSProperties;
  pill?: boolean;
}

export interface PageHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  tone?: PageHeroTone;
  actions?: ReactNode;
  stickers?: PageHeroSticker[];
  children?: ReactNode;
  className?: string;
  /**
   * Dibuja el título con StrokeText (trazo + relleno) si es un texto corto
   * (≤ 28 caracteres). En móvil se ve el h1 normal; el h1 siempre existe.
   */
  stroke?: boolean;
}

const STROKE_MAX_CHARS = 28;

/**
 * Banda que abre cada vista: titular display aplastado, etiqueta en
 * píldora, stickers estáticos y acciones. Colores del manual sobre
 * lavados planos (docs/STYLE_REFERENCE.md).
 */
export const PageHero: React.FC<PageHeroProps> = ({
  eyebrow,
  title,
  subtitle,
  tone = 'marino',
  actions,
  stickers = [],
  children,
  className = '',
  stroke = false
}) => {
  const strokeTitle = stroke && typeof title === 'string' && title.length <= STROKE_MAX_CHARS ? title : null;
  return (
  <section className={`oy-hero oy-hero--${tone}${className ? ` ${className}` : ''}`}>
    {stickers.length > 0 && (
      <div className="oy-hero__stickers" aria-hidden="true">
        {stickers.map((s, i) => (
          <span
            key={i}
            className={`oy-sticker oy-sticker--${s.tone ?? 'amarillo'}${s.pill ? ' oy-sticker--pill' : ''}`}
            style={s.style}
          >
            {s.icon}
          </span>
        ))}
      </div>
    )}
    <div className="oy-hero__inner">
      <div className="oy-hero__text">
        {eyebrow && <span className="oy-eyebrow">{eyebrow}</span>}
        <h1 className="oy-display oy-hero__title">
          {strokeTitle ? (
            <StrokeText
              text={strokeTitle}
              tone={tone === 'fuego' || tone === 'amarillo' ? 'cacao' : 'marino'}
              fontSize={84}
              letterSpacing={-3}
              strokeWidth={1.75}
            />
          ) : (
            title
          )}
        </h1>
        {subtitle && <p className="oy-hero__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="oy-hero__actions">{actions}</div>}
    </div>
    {children}
  </section>
  );
};

export default PageHero;
