import { useLayoutEffect, useRef } from 'react';

const DURATION = 350;
const EASING = 'cubic-bezier(0.23, 1, 0.32, 1)'; /* --ease-out */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Coloca un único indicador (posición absoluta dentro de `container`) bajo el
 * elemento activo `[aria-current="page"]`. El ancho final se fija de una vez y
 * el desplazamiento se anima con transform (FLIP con translateX + scaleX), así
 * que solo se compone en GPU. Si el cambio llega a mitad de camino, parte de
 * donde el indicador está en ese momento.
 */
export function useSlidingIndicator<C extends HTMLElement, I extends HTMLElement>(activeKey: string) {
  const containerRef = useRef<C>(null);
  const indicatorRef = useRef<I>(null);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const place = (animate: boolean) => {
      const active = container.querySelector<HTMLElement>('[aria-current="page"]');
      if (!active || active.offsetWidth === 0) {
        indicator.style.opacity = '0';
        placed.current = false;
        return;
      }
      const x = active.offsetLeft;
      const w = active.offsetWidth;

      let from: { x: number; w: number } | null = null;
      if (animate && placed.current && !prefersReducedMotion()) {
        const box = indicator.getBoundingClientRect();
        const origin = container.getBoundingClientRect();
        from = { x: box.left - origin.left - container.clientLeft, w: box.width };
      }

      indicator.getAnimations().forEach(a => a.cancel());
      indicator.style.width = `${w}px`;
      indicator.style.transform = `translateX(${x}px)`;
      indicator.style.opacity = '1';
      placed.current = true;

      if (from && (Math.abs(from.x - x) > 0.5 || Math.abs(from.w - w) > 0.5)) {
        indicator.animate(
          [
            { transform: `translateX(${from.x}px) scaleX(${from.w / w})` },
            { transform: `translateX(${x}px) scaleX(1)` }
          ],
          { duration: DURATION, easing: EASING }
        );
      }
    };

    place(true);

    /* La primera notificación llega al observar: se ignora para no cortar la animación recién lanzada. */
    let first = true;
    const observer = new ResizeObserver(() => {
      if (first) first = false;
      else place(false);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeKey]);

  return { containerRef, indicatorRef };
}
