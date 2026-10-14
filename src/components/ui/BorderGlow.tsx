import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import './BorderGlow.css';

export interface BorderGlowProps {
  children?: ReactNode;
  className?: string;
  /** 0-100: qué tan cerca del borde debe estar el puntero para que aparezca el brillo. */
  edgeSensitivity?: number;
  /** Radio del contorno (px). Por defecto, píldora. */
  borderRadius?: number;
  /** Grosor del arco de color alrededor del botón (px). */
  ringWidth?: number;
  /** Alcance del halo suave (px). 0 lo quita. */
  glowRadius?: number;
  /** 0-1: intensidad del halo. */
  glowIntensity?: number;
  /** Apertura del arco que sigue al puntero (%). */
  coneSpread?: number;
  /** Barrido de presentación al montar (se omite con movimiento reducido). */
  animated?: boolean;
  /** Tres colores del manual: Amarillo Canario, Ámbar y Naranja Fuego por defecto. */
  colors?: [string, string, string];
  /** El contenedor ocupa todo el ancho disponible. */
  block?: boolean;
}

const DEFAULT_COLORS: [string, string, string] = [
  'var(--oy-amarillo-canario)',
  'var(--oy-ambar-calido)',
  'var(--oy-naranja-fuego)'
];

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInCubic = (x: number) => x * x * x;

/**
 * Contorno que se ilumina con los colores de acción del manual siguiendo al
 * puntero. Plano: un arco de color fuera del contorno Cacao del botón y un
 * halo tenue de una sola capa (sin sombras apiladas).
 */
export const BorderGlow = ({
  children,
  className = '',
  edgeSensitivity = 25,
  borderRadius = 9999,
  ringWidth = 3,
  glowRadius = 10,
  glowIntensity = 0.55,
  coneSpread = 25,
  animated = false,
  colors = DEFAULT_COLORS,
  block = false
}: BorderGlowProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);

  // Las variables se escriben directo en el estilo: no hay re-render por movimiento.
  const paint = useCallback(
    (angle: number, proximity: number, visible: boolean) => {
      const el = rootRef.current;
      if (!el) return;
      const ringSensitivity = edgeSensitivity + 20;
      const ring = visible ? Math.max(0, (proximity * 100 - ringSensitivity) / (100 - ringSensitivity)) : 0;
      const glow = visible ? Math.max(0, (proximity * 100 - edgeSensitivity) / (100 - edgeSensitivity)) : 0;
      el.style.setProperty('--bg-angle', `${angle.toFixed(2)}deg`);
      el.style.setProperty('--bg-ring', ring.toFixed(3));
      el.style.setProperty('--bg-glow', (glow * glowIntensity).toFixed(3));
      el.dataset.active = visible ? 'true' : 'false';
    },
    [edgeSensitivity, glowIntensity]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== 'mouse') return;
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = e.clientX - rect.left - cx;
      const dy = e.clientY - rect.top - cy;
      const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
      const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
      const proximity = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
      let angle = dx === 0 && dy === 0 ? 0 : Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;
      paint(angle, proximity, true);
    },
    [paint]
  );

  useEffect(() => {
    paint(45, 0, false);
    if (!animated || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    // Barrido de presentación: el arco recorre el contorno una vez.
    const start = performance.now();
    const angleStart = 110;
    const angleEnd = 465;
    let raf = 0;
    const tick = (now: number) => {
      if (hoveredRef.current) return;
      const t = now - start;
      const fadeIn = easeOutCubic(Math.min(t / 500, 1));
      const fadeOut = t > 2500 ? 1 - easeInCubic(Math.min((t - 2500) / 1500, 1)) : 1;
      const sweep = t < 1500
        ? easeInCubic(t / 1500) * 0.5
        : 0.5 + easeOutCubic(Math.min((t - 1500) / 2250, 1)) * 0.5;
      paint(angleStart + (angleEnd - angleStart) * sweep, fadeIn * fadeOut, true);
      if (t < 4000) raf = requestAnimationFrame(tick);
      else paint(angleEnd, 0, false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated, paint]);

  const [c1, c2, c3] = colors;
  const style = {
    '--bg-radius': `${borderRadius}px`,
    '--bg-ring-w': `${ringWidth}px`,
    '--bg-glow-r': `${glowRadius}px`,
    '--bg-spread': `${coneSpread}%`,
    '--bg-c1': c1,
    '--bg-c2': c2,
    '--bg-c3': c3
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`oy-glow${block ? ' oy-glow--block' : ''}${className ? ` ${className}` : ''}`}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerEnter={e => {
        if (e.pointerType === 'mouse') hoveredRef.current = true;
      }}
      onPointerLeave={() => {
        hoveredRef.current = false;
        const el = rootRef.current;
        if (el) paint(parseFloat(el.style.getPropertyValue('--bg-angle')) || 45, 0, false);
      }}
    >
      {glowRadius > 0 && <span className="oy-glow__halo" aria-hidden="true" />}
      <span className="oy-glow__ring" aria-hidden="true" />
      <div className="oy-glow__content">{children}</div>
    </div>
  );
};

export default BorderGlow;
