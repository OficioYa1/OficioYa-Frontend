import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { canUseWebGL, prefersReducedMotion } from './landingUtils';
import './LiquidField.css';

const PlasmaWarp = React.lazy(() => import('../../components/background/PlasmaWarp'));

type Palette = [string, string, string, string, string];

/* Colores del manual: base + Almendra, Canario, Esmeralda, Ámbar (claro);
   lienzo nocturno + Azul Marino, Many, Esmeralda, Ámbar (oscuro). */
const PALETTES: Record<'light' | 'dark', Palette> = {
  light: ['#FBF4EA', '#F8D8A8', '#FFC72C', '#10B981', '#F59E0B'],
  dark: ['#0B1430', '#1E3A8A', '#C9622A', '#10B981', '#F59E0B'],
};

interface LiquidFieldProps {
  /** Usa el shader WebGL (cargado aparte) cuando el equipo lo permite. */
  webgl?: boolean;
  className?: string;
}

/**
 * Campo líquido de la marca. Siempre pinta un degradado CSS con manchas que
 * derivan despacio; si hay WebGL y no se pidió movimiento reducido, encima se
 * funde el shader PlasmaWarp en cuanto termina de cargar.
 */
export const LiquidField: React.FC<LiquidFieldProps> = ({ webgl = false, className = '' }) => {
  const { theme } = useTheme();
  const [useShader] = useState(() => webgl && !prefersReducedMotion() && canUseWebGL());
  const dark = theme === 'dark';

  return (
    <div className={`lq-field ${className}`} aria-hidden="true">
      <span className="lq-blob lq-blob--a" />
      <span className="lq-blob lq-blob--b" />
      <span className="lq-blob lq-blob--c" />
      <span className="lq-blob lq-blob--d" />
      {useShader && (
        <React.Suspense fallback={null}>
          <PlasmaWarp
            className="lq-canvas"
            colors={PALETTES[dark ? 'dark' : 'light']}
            intensity={dark ? 0.8 : 0.92}
          />
        </React.Suspense>
      )}
    </div>
  );
};
