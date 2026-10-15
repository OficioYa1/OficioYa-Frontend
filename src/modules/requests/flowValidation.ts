/** Props de accesibilidad de un campo con posible error (y pista opcional). */
export const fieldA11y = (errorId: string, message?: string, hintId?: string) => ({
  'aria-invalid': message ? true : undefined,
  'aria-describedby': [message ? errorId : '', hintId ?? ''].filter(Boolean).join(' ') || undefined
});

/** Fecha local de hoy en formato yyyy-mm-dd. */
export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Latencia simulada del mock al enviar (ms). */
export const MOCK_SUBMIT_MS = 900;

/** Lleva el foco al primer campo con error (por id) y lo centra en la hoja. */
export const focusFirstError = (ids: string[]) => {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      return;
    }
  }
};
