import React, { useEffect, useState } from 'react';
import type { MascotExpression, TradeCategory } from '../../types';

interface MascotAvatarProps {
  expression?: MascotExpression;
  trade?: TradeCategory;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  onClick?: () => void;
  showHalo?: boolean;
  animate?: 'float' | 'wave' | 'bounce' | 'idle' | 'none';
  /** Force a specific image key regardless of trade/expression */
  forceImage?: 'wave' | 'base' | 'electricista' | 'plomero';
}

/* ─── Image configs ─────────────────────────────────────────────
   All source images are character-design sheets.
   objectPosition + scale crop to the HERO pose (large left figure).
   ─────────────────────────────────────────────────────────────── */
interface ImgConfig {
  src: string;
  objectPosition: string;
  scale: number;
}

const CONFIGS: Record<string, ImgConfig> = {
  // Many 3D saludando con cinturón de herramientas
  wave: {
    src: '/assets/mascot/many-wave.png',
    objectPosition: 'center 10%',
    scale: 1.1,
  },
  // Base character
  base: {
    src: '/assets/mascot/many-wave.png',
    objectPosition: 'center 10%',
    scale: 1.1,
  },
  // Electricista
  electricista: {
    src: '/assets/mascot/many-electricista.png',
    objectPosition: 'center 15%',
    scale: 1.15,
  },
  // Plomero
  plomero: {
    src: '/assets/mascot/many-plomero.png',
    objectPosition: 'center 15%',
    scale: 1.15,
  },
};

function getConfig(
  trade?: TradeCategory,
  expression?: MascotExpression,
  forceImage?: string
): ImgConfig {
  if (forceImage && CONFIGS[forceImage]) return CONFIGS[forceImage];
  if (trade === 'electricidad') return CONFIGS.electricista;
  if (trade === 'plomeria')     return CONFIGS.plomero;
  // default: best single-character 3D image
  return CONFIGS.wave;
}

/* ─── Sizes ──────────────────────────────────────────────────── */
const SIZE_MAP: Record<string, { width: number; height: number; borderRadius: string }> = {
  xs:   { width: 36,  height: 36,  borderRadius: '50%'  },
  sm:   { width: 52,  height: 52,  borderRadius: '50%'  },
  md:   { width: 76,  height: 76,  borderRadius: '20px' },
  lg:   { width: 116, height: 116, borderRadius: '26px' },
  hero: { width: 220, height: 220, borderRadius: '36px' },
};

const SHADOWS: Record<string, string> = {
  xs:   '0 2px 8px rgba(255,199,44,0.3)',
  sm:   '0 4px 14px rgba(255,199,44,0.38)',
  md:   '0 6px 20px rgba(255,199,44,0.42)',
  lg:   '0 10px 30px rgba(255,199,44,0.46)',
  hero: '0 24px 56px rgba(255,199,44,0.52), 0 8px 20px rgba(0,0,0,0.18)',
};

/* ─── Animation strings ──────────────────────────────────────── */
const ANIM: Record<string, string> = {
  float:  'many-float 3.2s ease-in-out infinite',
  wave:   'many-wave 0.65s cubic-bezier(0.34,1.56,0.64,1) 1 forwards',
  bounce: 'many-bounce 0.9s cubic-bezier(0.34,1.56,0.64,1) infinite',
  idle:   'many-idle 4.5s ease-in-out infinite',
  none:   'none',
};

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  expression,
  trade,
  size = 'md',
  className = '',
  onClick,
  animate = 'float',
  forceImage,
}) => {
  const [isWaving, setIsWaving]   = useState(false);
  const [is3DOn,   setIs3DOn]     = useState(false);
  const dim    = SIZE_MAP[size] || SIZE_MAP.md;
  const config = getConfig(trade, expression, forceImage);
  const canTilt = size === 'hero' || size === 'lg';

  // Auto-wave on first render for hero
  useEffect(() => {
    if (size === 'hero') {
      const t = setTimeout(() => {
        setIsWaving(true);
        setTimeout(() => setIsWaving(false), 750);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [size]);

  const handleClick = () => {
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 750);
    onClick?.();
  };

  const currentAnim = isWaving ? ANIM.wave : (ANIM[animate] ?? ANIM.float);

  return (
    <div
      className={`many-avatar-wrap ${className}`}
      style={{
        display: 'inline-flex',
        position: 'relative',
        transform: is3DOn
          ? 'perspective(640px) rotateY(-9deg) rotateX(4deg) scale(1.05)'
          : 'perspective(640px) rotateY(0deg) rotateX(0deg) scale(1)',
        transition: 'transform 0.38s cubic-bezier(0.34,1.56,0.64,1)',
      }}
      onMouseEnter={() => canTilt && setIs3DOn(true)}
      onMouseLeave={() => canTilt && setIs3DOn(false)}
    >
      {/* Ground shadow — gives 3D depth */}
      {size === 'hero' && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -18,
            left: '20%',
            right: '20%',
            height: 22,
            background: 'rgba(245,158,11,0.22)',
            borderRadius: '50%',
            filter: 'blur(14px)',
            animation: 'many-shadow-pulse 3.2s ease-in-out infinite',
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        className="many-avatar"
        onClick={onClick ? handleClick : undefined}
        style={{
          width: dim.width,
          height: dim.height,
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: dim.borderRadius,
          boxShadow: SHADOWS[size] || SHADOWS.md,
          cursor: onClick ? 'pointer' : 'default',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #FFD145 0%, #F59E0B 100%)',
          border: '3px solid rgba(255,255,255,0.95)',
          flexShrink: 0,
          animation: currentAnim,
        }}
        title="Many — El Castor de OficioYa"
      >
        <img
          src={config.src}
          alt="Many el Castor de OficioYa"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: config.objectPosition,
            transform: `scale(${config.scale})`,
            transformOrigin: 'center center',
            transition: 'object-position 0.45s ease, transform 0.45s ease',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />

        {/* Pulse ring — hero only */}
        {size === 'hero' && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: -10,
              borderRadius: 'inherit',
              border: '2.5px solid rgba(255,199,44,0.3)',
              animation: 'many-pulse-ring 3s ease-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
};
