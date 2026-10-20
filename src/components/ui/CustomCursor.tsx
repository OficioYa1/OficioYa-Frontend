import React, { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

/**
 * CustomCursor inspirado en el icónico mousepointer de danilodemarco.com
 * - Puntero de alta fidelidad con punto interior reactivo y aro exterior con interpolación lerp.
 * - Detecta automáticamente elementos interactivos (enlaces, botones, tarjetas, roles).
 * - Soporta micro-etiquetas dinámicas (data-cursor-text).
 * - Se desactiva con elegancia en móviles, táctiles y modo de movimiento reducido.
 */
export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [cursorText, setCursorText] = useState('');

  // Coordenadas del mouse y coordenadas suavizadas del anillo
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Verificar si el dispositivo admite hover y puntero fino
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || isReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible) setIsVisible(true);

      // Posicionar punto directamente en las coordenadas actuales
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Detectar si el elemento bajo el cursor es interactivo
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'a, button, [role="button"], input, select, textarea, .lp-testi-card, .lp-how-card, .lp-sticker, .card, [data-cursor="magnetic"]'
        );
        const textAttr = target.closest('[data-cursor-text]')?.getAttribute('data-cursor-text');

        if (interactive) {
          setIsHovering(true);
          setCursorText(textAttr || '');
        } else {
          setIsHovering(false);
          setCursorText('');
        }
      }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Bucle de renderizado para física suave del aro exterior
    const render = () => {
      // Lerp (Linear interpolation) factor: 0.16 para una física elástica natural
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.16;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.16;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(render);
    };

    rafId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible]);

  return (
    <div
      className="danilo-cursor-container"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.25s ease' }}
      aria-hidden="true"
    >
      <div
        ref={dotRef}
        className={`danilo-cursor-dot ${isHovering ? 'is-hovering' : ''}`}
      />
      <div
        ref={ringRef}
        className={`danilo-cursor-ring ${isHovering ? 'is-hovering' : ''} ${isPressed ? 'is-pressed' : ''} ${cursorText ? 'has-text' : ''}`}
      >
        {cursorText && <span className="danilo-cursor-text">{cursorText}</span>}
      </div>
    </div>
  );
};
