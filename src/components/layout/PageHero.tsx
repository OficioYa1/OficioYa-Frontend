import React, { type ReactNode } from 'react';

export type PageHeroTone = 'marino' | 'almendra' | 'esmeralda' | 'amarillo' | 'fuego' | 'gris';

export interface PageHeroSticker {
  icon: ReactNode;
  tone?: 'amarillo' | 'esmeralda' | 'fuego' | 'marino' | 'almendra' | 'blanco';
  /** Posición: { top: '12%', right: '8%' }. Un `rotate` se ignora (el vidrio no gira). */
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
}

/** Sin el giro decorativo: los iconos flotan rectos como piezas de vidrio. */
const upright = ({ rotate: _rotate, transform: _transform, ...position }: React.CSSProperties) => position;

/**
 * Banda que abre cada vista: panel líquido (.oy-hero en glass.css) con
 * titular editorial grande y ligero, etiqueta en píldora, iconos de
 * vidrio y acciones.
 */
export const PageHero: React.FC<PageHeroProps> = ({
  eyebrow,
  title,
  subtitle,
  tone = 'marino',
  actions,
  stickers = [],
  children,
  className = ''
}) => (
  <section className={`oy-hero oy-hero--${tone}${className ? ` ${className}` : ''}`}>
    {stickers.length > 0 && (
      <div className="oy-hero__stickers" aria-hidden="true">
        {stickers.map((s, i) => (
          <span
            key={i}
            className={`oy-sticker oy-sticker--${s.tone ?? 'amarillo'}${s.pill ? ' oy-sticker--pill' : ''}`}
            style={upright(s.style)}
          >
            {s.icon}
          </span>
        ))}
      </div>
    )}
    <div className="oy-hero__inner">
      <div className="oy-hero__text">
        {eyebrow && <span className="oy-eyebrow">{eyebrow}</span>}
        <h1 className="oy-display oy-hero__title">{title}</h1>
        {subtitle && <p className="oy-hero__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="oy-hero__actions">{actions}</div>}
    </div>
    {children}
  </section>
);

export default PageHero;
