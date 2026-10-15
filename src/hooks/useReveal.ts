import { useEffect, type RefObject } from 'react';

/**
 * Revela al hacer scroll los elementos con [data-reveal] dentro de `root`
 * (estilos en glass.css). Usa --reveal-i en cada elemento para escalonar.
 * Con movimiento reducido el CSS ya los muestra sin transición.
 */
export function useReveal(root: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const items = Array.from(host.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)'));
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    items.forEach(el => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
