import { useEffect, useState } from 'react';
import { MicroSlats } from './MicroSlats';
import './BrandBackground.css';

interface BackgroundColors {
  color: string;
  glint: string;
  background: string;
}

const readColors = (): BackgroundColors => {
  const css = getComputedStyle(document.documentElement);
  return {
    color: css.getPropertyValue('--bg-slats-color').trim() || '#F8D8A8',
    glint: css.getPropertyValue('--bg-slats-glint').trim() || '#FFC72C',
    background: css.getPropertyValue('--color-bg').trim() || '#F8FAFC',
  };
};

const prefersFinePointer = () => window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false;

/**
 * Fondo animado de la marca para toda la app. Toma los colores de los tokens
 * del manual (Almendra y Amarillo Canario en claro, Azul Marino y Ámbar en
 * oscuro) y se actualiza al cambiar de tema.
 */
export const BrandBackground = () => {
  const [colors, setColors] = useState<BackgroundColors>(readColors);

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="brand-background" aria-hidden="true">
      <MicroSlats
        preset="tide"
        color={colors.color}
        glintColor={colors.glint}
        backgroundColor={colors.background}
        slatWidth={8}
        slatHeight={22}
        gap={4}
        speed={0.35}
        fog={0.6}
        interactive={prefersFinePointer()}
        cursorStrength={0.8}
        cursorSize={48}
        lean={0.4}
        introDuration={1.8}
      />
    </div>
  );
};
