import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode
} from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { X, type LucideIcon } from 'lucide-react';
import './StaggeredMenu.css';

export interface StaggeredMenuItem {
  id: string;
  label: string;
  ariaLabel?: string;
  icon?: LucideIcon;
  /** Contador (p. ej. mensajes sin leer). */
  badge?: number;
  /** Pestaña actual: se marca con aria-current y el acento del rol. */
  active?: boolean;
}

export interface StaggeredMenuProps {
  items: StaggeredMenuItem[];
  onSelect: (id: string) => void;
  position?: 'left' | 'right';
  /** Capas previas (de fuera hacia dentro). Amarillo Canario y Azul Marino. */
  colors?: string[];
  /** Acento de ítems activos y numeración. Color del rol por defecto. */
  accentColor?: string;
  displayItemNumbering?: boolean;
  /** Título del panel (también es su nombre accesible). */
  title?: string;
  menuLabel?: string;
  closeLabel?: string;
  /** El botón solo se ve en móvil (≤ 767 px). */
  mobileOnly?: boolean;
  footer?: ReactNode;
  className?: string;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

const DEFAULT_COLORS = ['var(--oy-amarillo-canario)', 'var(--oy-azul-marino)'];

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Menú de navegación a pantalla completa: capas de color que entran
 * escalonadas, panel en superficie y titulares grandes que suben uno a uno
 * (GSAP). Se monta en un portal, atrapa el foco, cierra con Escape o al
 * tocar fuera y devuelve el foco al botón que lo abrió.
 */
export const StaggeredMenu = ({
  items,
  onSelect,
  position = 'right',
  colors = DEFAULT_COLORS,
  accentColor = 'var(--role-primary)',
  displayItemNumbering = true,
  title = 'Navegación',
  menuLabel = 'Menú',
  closeLabel = 'Cerrar',
  mobileOnly = false,
  footer,
  className = '',
  onMenuOpen,
  onMenuClose
}: StaggeredMenuProps) => {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const panelId = useId();
  const titleId = useId();

  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);
  const restoreFocusRef = useRef(false);

  const offscreen = position === 'left' ? -100 : 100;

  const openMenu = useCallback(() => {
    setRendered(true);
    setOpen(true);
    onMenuOpen?.();
  }, [onMenuOpen]);

  const closeMenu = useCallback(
    (restoreFocus = true) => {
      restoreFocusRef.current = restoreFocus;
      setOpen(false);
      onMenuClose?.();
    },
    [onMenuClose]
  );

  // Entrada / salida con GSAP (o instantánea con movimiento reducido).
  useLayoutEffect(() => {
    if (!rendered) return undefined;
    const panel = panelRef.current;
    const scrim = scrimRef.current;
    if (!panel || !scrim) return undefined;
    const layers = Array.from(layersRef.current?.querySelectorAll<HTMLElement>('.oy-smenu__layer') ?? []);
    const labels = Array.from(panel.querySelectorAll<HTMLElement>('.oy-smenu__label'));
    const numbers = Array.from(panel.querySelectorAll<HTMLElement>('.oy-smenu__num'));
    const reduced = prefersReduced();

    tlRef.current?.kill();

    if (open) {
      if (reduced) {
        gsap.set([...layers, panel], { xPercent: 0 });
        gsap.set(scrim, { opacity: 1 });
        gsap.set(labels, { yPercent: 0, rotate: 0 });
        gsap.set(numbers, { opacity: 1 });
      } else {
        gsap.set([...layers, panel], { xPercent: offscreen });
        gsap.set(scrim, { opacity: 0 });
        gsap.set(labels, { yPercent: 140, rotate: 8 });
        gsap.set(numbers, { opacity: 0 });
        const tl = gsap.timeline();
        tl.to(scrim, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0);
        layers.forEach((el, i) => tl.to(el, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07));
        const panelAt = layers.length ? (layers.length - 1) * 0.07 + 0.08 : 0;
        tl.to(panel, { xPercent: 0, duration: 0.6, ease: 'power4.out' }, panelAt);
        const itemsAt = panelAt + 0.1;
        tl.to(labels, { yPercent: 0, rotate: 0, duration: 0.9, ease: 'power4.out', stagger: 0.08 }, itemsAt);
        tl.to(numbers, { opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.06 }, itemsAt + 0.1);
        tlRef.current = tl;
      }
      const first = panel.querySelector<HTMLElement>('[aria-current="page"]') ?? panel.querySelector<HTMLElement>('.oy-smenu__item');
      first?.focus({ preventScroll: true });
      return undefined;
    }

    const finish = () => {
      setRendered(false);
      if (restoreFocusRef.current) toggleRef.current?.focus({ preventScroll: true });
    };
    if (reduced) {
      finish();
      return undefined;
    }
    tlRef.current = gsap.to([...layers, panel], {
      xPercent: offscreen,
      duration: 0.3,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: finish
    });
    gsap.to(scrim, { opacity: 0, duration: 0.3, ease: 'power2.in' });
    return undefined;
  }, [open, rendered, offscreen]);

  useEffect(() => () => {
    tlRef.current?.kill();
  }, []);

  // Bloquea el scroll de la página y escucha Escape aunque el foco esté fuera del panel.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, closeMenu]);

  const onPanelKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeMenu();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])') ?? []
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const handleSelect = (id: string) => {
    // La navegación mueve la vista: el foco no vuelve al botón.
    closeMenu(false);
    onSelect(id);
  };

  const layerColors = colors.length ? colors.slice(0, 3) : DEFAULT_COLORS;
  const rootStyle = { '--sm-accent': accentColor } as CSSProperties;

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={`oy-smenu-toggle${mobileOnly ? ' oy-smenu-toggle--mobile' : ''}${className ? ` ${className}` : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={rendered ? panelId : undefined}
        onClick={() => (open ? closeMenu() : openMenu())}
      >
        <span>{menuLabel}</span>
        <span className="oy-smenu-toggle__icon" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>

      {rendered &&
        createPortal(
          <div className="oy-smenu" data-position={position} style={rootStyle}>
            <div ref={scrimRef} className="oy-smenu__scrim" onClick={() => closeMenu()} aria-hidden="true" />
            <div ref={layersRef} className="oy-smenu__layers" aria-hidden="true">
              {layerColors.map((c, i) => (
                <div key={i} className="oy-smenu__layer" style={{ background: c }} />
              ))}
            </div>
            <aside
              ref={panelRef}
              id={panelId}
              className="oy-smenu__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onKeyDown={onPanelKeyDown}
            >
              <div className="oy-smenu__head">
                <h2 id={titleId} className="oy-smenu__title">{title}</h2>
                <button type="button" className="oy-icon-btn oy-smenu__close" onClick={() => closeMenu()} aria-label={closeLabel}>
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <nav aria-label={title}>
                <ul className="oy-smenu__list" data-numbering={displayItemNumbering || undefined}>
                  {items.map((it, idx) => {
                    const Icon = it.icon;
                    return (
                      <li className="oy-smenu__row" key={it.id}>
                        <button
                          type="button"
                          className="oy-smenu__item"
                          aria-label={it.ariaLabel ?? (it.badge ? `${it.label}, ${it.badge} sin leer` : undefined)}
                          aria-current={it.active ? 'page' : undefined}
                          onClick={() => handleSelect(it.id)}
                        >
                          <span className="oy-smenu__label">
                            {Icon && <Icon className="oy-smenu__icon" size={26} strokeWidth={2.2} aria-hidden="true" />}
                            {it.label}
                            {it.badge ? (
                              <span className="oy-smenu__badge" aria-hidden="true">{it.badge}</span>
                            ) : null}
                          </span>
                          {displayItemNumbering && (
                            <span className="oy-smenu__num" aria-hidden="true">{String(idx + 1).padStart(2, '0')}</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {footer && <div className="oy-smenu__footer">{footer}</div>}
            </aside>
          </div>,
          document.body
        )}
    </>
  );
};

export default StaggeredMenu;
