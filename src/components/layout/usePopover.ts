import { useEffect, useRef } from 'react';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Panel flotante no modal (menú, bandeja): al abrir enfoca su primer control,
 * Esc lo cierra y al cerrar devuelve el foco al disparador.
 */
export function usePopover<T extends HTMLElement>(onClose: () => void) {
  const panelRef = useRef<T>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      const focusLeftWithPanel = !document.activeElement || document.activeElement === document.body
        || panel?.contains(document.activeElement);
      if (trigger && trigger.isConnected && focusLeftWithPanel) trigger.focus({ preventScroll: true });
    };
  }, []);

  return panelRef;
}
