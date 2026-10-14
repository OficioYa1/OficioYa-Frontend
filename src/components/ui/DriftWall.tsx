import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent
} from 'react';
import { Pause, Play } from 'lucide-react';
import './DriftWall.css';

export interface DriftWallItem {
  image: string;
  title?: string;
  href?: string;
}

export interface DriftWallProps {
  items: DriftWallItem[];
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  radius?: number;
  tilt?: number;
  turn?: number;
  roll?: number;
  perspective?: number;
  depth?: number;
  /** px/s de cada columna. */
  speed?: number;
  direction?: 'up' | 'down';
  variance?: number;
  parallax?: number;
  pauseOnHover?: boolean;
  lift?: number;
  /** 0-1: desvanecido de los bordes del muro. */
  fade?: number;
  /** Opacidad de las fichas en reposo. */
  dim?: number;
  grayscale?: boolean;
  /** Color plano sobre las fichas en reposo (Cacao por defecto). */
  overlayColor?: string;
  /** Botón visible para pausar/reanudar (WCAG 2.2.2). */
  showPauseControl?: boolean;
  /** Al elegir una ficha sin href. */
  onItemClick?: (item: DriftWallItem) => void;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

interface ColumnMeta { copyHeight: number; copies: number }

const columnFactor = (index: number, variance: number): number => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
  return 1 + variance * pseudo;
};

/**
 * Muro de fotos en 3D cuyas columnas se deslizan en sentidos alternos.
 * Se pausa con el puntero encima, al enfocar una ficha y con el botón de
 * pausa; con movimiento reducido queda quieto. Solo la primera copia de
 * cada columna es accesible: las repeticiones del bucle son decorativas.
 */
export const DriftWall = ({
  items,
  columns = 5,
  tileWidth = 200,
  tileHeight = 140,
  gap = 18,
  radius = 20,
  tilt = 16,
  turn = -14,
  roll = 0,
  perspective = 1200,
  depth = 120,
  speed = 36,
  direction = 'up',
  variance = 0.45,
  parallax = 0.6,
  pauseOnHover = true,
  lift = 56,
  fade = 0.55,
  dim = 0.7,
  grayscale = false,
  overlayColor = 'var(--oy-cacao-profundo)',
  showPauseControl = true,
  onItemClick,
  ariaLabel = 'Muro de fotos',
  className = '',
  style
}: DriftWallProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);

  const offsetsRef = useRef<number[]>([]);
  const velocitiesRef = useRef<number[]>([]);
  const hoveredColRef = useRef(-1);
  const wallHoveredRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerDampedRef = useRef({ x: 0, y: 0 });

  const [containerHeight, setContainerHeight] = useState(480);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Sin pantalla no hay animación: el bucle se detiene fuera de vista.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const columnItems = useMemo<DriftWallItem[][]>(() => {
    const cols: DriftWallItem[][] = Array.from({ length: columns }, () => []);
    items.forEach((item, i) => cols[i % columns].push(item));
    return cols.map((col, c) => (col.length ? col : items.length ? [items[c % items.length]] : []));
  }, [items, columns]);

  const columnMeta = useMemo<ColumnMeta[]>(() => {
    const unit = tileHeight + gap;
    return columnItems.map(col => {
      const copyHeight = Math.max(unit, col.length * unit);
      const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1);
      return { copyHeight, copies };
    });
  }, [columnItems, tileHeight, gap, containerHeight]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setContainerHeight(entry.contentRect.height || 480));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const baseVelocities = useMemo<number[]>(() => {
    const dirSign = direction === 'up' ? 1 : -1;
    return columnItems.map((_, c) => speed * columnFactor(c, variance) * dirSign * (c % 2 === 0 ? 1 : -1));
  }, [columnItems, speed, direction, variance]);

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, c) => meta.copyHeight * ((c * 0.37) % 1));
    velocitiesRef.current = columnItems.map(() => 0);
  }, [columnMeta, columnItems]);

  const applyPlaneTransform = useCallback(
    (px: number, py: number) => {
      const plane = planeRef.current;
      if (!plane) return;
      plane.style.transform =
        `translate(-50%, -50%) scale(1.18) rotateX(${tilt + py}deg) rotateY(${turn + px}deg) ` +
        `rotateZ(${roll}deg) translateZ(${-depth}px)`;
    },
    [tilt, turn, roll, depth]
  );

  const writeTracks = useCallback(() => {
    for (let c = 0; c < trackRefs.current.length; c++) {
      const el = trackRefs.current[c];
      if (el && columnMeta[c]) el.style.transform = `translate3d(0, ${-(offsetsRef.current[c] ?? 0)}px, 0)`;
    }
  }, [columnMeta]);

  useEffect(() => {
    // Movimiento reducido o fuera de vista: una sola pose, sin bucle.
    if (reduced || !inView) {
      applyPlaneTransform(0, 0);
      writeTracks();
      return undefined;
    }

    let raf = 0;
    let last: number | null = null;
    const animate = (ts: number) => {
      if (last === null) last = ts;
      const dt = Math.min(0.05, Math.max(0, ts - last) / 1000);
      last = ts;

      const maxTilt = parallax * 8;
      const damp = 1 - Math.exp(-dt / 0.12);
      const pd = pointerDampedRef.current;
      pd.x += (pointerRef.current.x * maxTilt - pd.x) * damp;
      pd.y += (-pointerRef.current.y * maxTilt - pd.y) * damp;
      applyPlaneTransform(pd.x, pd.y);

      for (let c = 0; c < trackRefs.current.length; c++) {
        const meta = columnMeta[c];
        if (!meta) continue;
        const stopped = paused || (pauseOnHover && wallHoveredRef.current) || hoveredColRef.current === c;
        const target = stopped ? 0 : baseVelocities[c];
        const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
        velocitiesRef.current[c] += (target - velocitiesRef.current[c]) * ease;
        let next = (offsetsRef.current[c] ?? 0) + velocitiesRef.current[c] * dt;
        next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
        offsetsRef.current[c] = next;
        const el = trackRefs.current[c];
        if (el) el.style.transform = `translate3d(0, ${-next}px, 0)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [baseVelocities, columnMeta, pauseOnHover, parallax, reduced, inView, paused, applyPlaneTransform, writeTracks]);

  const activate = useCallback((id: string, col: number) => {
    activeIdRef.current = id;
    hoveredColRef.current = col;
    setActiveId(id);
  }, []);

  const release = useCallback(() => {
    activeIdRef.current = null;
    hoveredColRef.current = -1;
    setActiveId(null);
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== 'mouse') return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (parallax > 0 && !reduced) {
        pointerRef.current = {
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5
        };
      }
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const tile = hit?.closest<HTMLElement>('[data-tile-id]');
      if (!tile) return;
      const id = tile.dataset.tileId ?? null;
      if (id === activeIdRef.current) return;
      activeIdRef.current = id;
      hoveredColRef.current = Number(tile.dataset.col);
      setActiveId(id);
    },
    [parallax, reduced]
  );

  const maskStyle =
    'radial-gradient(ellipse 80% 84% at 50% 46%, #000 var(--dw-edge), transparent 100%), ' +
    'linear-gradient(to top, #000 var(--dw-edge), transparent 100%)';

  const cssVars = useMemo<CSSProperties>(
    () =>
      ({
        '--dw-tile-w': `${tileWidth}px`,
        '--dw-tile-h': `${tileHeight}px`,
        '--dw-gap': `${gap}px`,
        '--dw-radius': `${radius}px`,
        '--dw-lift': `${lift}px`,
        '--dw-dim': dim,
        '--dw-gray': grayscale ? 1 : 0,
        '--dw-overlay': overlayColor,
        '--dw-edge': `${Math.max(0, (1 - fade) * 100)}%`,
        '--dw-mask': maskStyle,
        '--dw-persp': `${perspective}px`,
        ...style
      }) as CSSProperties,
    [tileWidth, tileHeight, gap, radius, lift, dim, grayscale, overlayColor, fade, perspective, maskStyle, style]
  );

  const renderTile = (item: DriftWallItem, id: string, col: number, decorative: boolean) => {
    const inner = (
      <span className="oy-drift__inner">
        <img
          src={item.image}
          alt={decorative ? '' : item.title ?? ''}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="oy-drift__img"
        />
        <span className="oy-drift__overlay" aria-hidden="true" />
      </span>
    );
    const className = `oy-drift__tile${activeId === id ? ' is-active' : ''}`;
    const common = {
      className,
      'data-tile-id': id,
      'data-col': col,
      onFocus: () => activate(id, col),
      onBlur: release
    };

    if (decorative) {
      return (
        <div key={id} className={className} data-tile-id={id} data-col={col} aria-hidden="true">
          {inner}
        </div>
      );
    }
    if (item.href) {
      return (
        <a key={id} href={item.href} target="_blank" rel="noreferrer noopener" {...common}>
          {inner}
        </a>
      );
    }
    if (onItemClick) {
      const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onItemClick(item);
        }
      };
      return (
        <div
          key={id}
          role="button"
          tabIndex={0}
          aria-label={item.title ?? 'Ver trabajo'}
          onClick={() => onItemClick(item)}
          onKeyDown={onKeyDown}
          {...common}
        >
          {inner}
        </div>
      );
    }
    return (
      <div key={id} role="listitem" {...common} onFocus={undefined} onBlur={undefined}>
        {inner}
      </div>
    );
  };

  const isMoving = !reduced && !paused;

  return (
    <div
      ref={containerRef}
      className={`oy-drift${className ? ` ${className}` : ''}`}
      style={cssVars}
      onPointerMove={handlePointerMove}
      onPointerEnter={e => {
        if (e.pointerType === 'mouse') wallHoveredRef.current = true;
      }}
      onPointerLeave={() => {
        wallHoveredRef.current = false;
        pointerRef.current = { x: 0, y: 0 };
        release();
      }}
      role="group"
      aria-label={ariaLabel}
    >
      <div className="oy-drift__mask">
        <div ref={planeRef} className="oy-drift__plane">
          {columnItems.map((col, c) => {
            const meta = columnMeta[c];
            return (
              <div className="oy-drift__col" key={`col-${c}`} role={onItemClick ? undefined : 'list'}>
                <div
                  className="oy-drift__track"
                  ref={el => {
                    trackRefs.current[c] = el;
                  }}
                >
                  {Array.from({ length: meta.copies }).map((_, copy) =>
                    col.map((item, i) => renderTile(item, `${c}-${copy}-${i}`, c, copy > 0))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showPauseControl && !reduced && (
        <button
          type="button"
          className="oy-drift__toggle oy-icon-btn"
          aria-pressed={paused}
          aria-label={isMoving ? 'Pausar el movimiento del muro' : 'Reanudar el movimiento del muro'}
          onClick={() => setPaused(p => !p)}
        >
          {isMoving ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
};

export default DriftWall;
