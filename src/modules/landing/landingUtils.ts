/** Anclas de las secciones de la landing (ids del DOM). */
export const SECTIONS = [
  { id: 'como-funciona', key: 'landing.nav.how' },
  { id: 'oficios', key: 'landing.nav.trades' },
  { id: 'reputacion', key: 'landing.nav.trust' },
  { id: 'profesionales', key: 'landing.nav.pros' },
  { id: 'preguntas', key: 'landing.nav.faq' },
  { id: 'contacto', key: 'landing.nav.contact' },
] as const;

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function canUseWebGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Lleva a una sección y mueve el foco a su título para quien navega con teclado. */
export function scrollToSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return;
  section.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  const heading = section.querySelector<HTMLElement>('h1, h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}
