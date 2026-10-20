import React, { useEffect, useState } from 'react';
import type { MascotExpression, TradeCategory } from '../../types';
import { BRAND_ASSETS } from '../../utils/assets';
import './MascotAvatar.css';

interface MascotAvatarProps {
  expression?: MascotExpression;
  trade?: TradeCategory;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  onClick?: () => void;
  showHalo?: boolean;
  animate?: 'float' | 'wave' | 'bounce' | 'idle' | 'none';
  /** Force a specific image key regardless of trade/expression */
  forceImage?:
    | 'wave'
    | 'base'
    | 'electricista'
    | 'plomero'
    | 'carpintero'
    | 'cerrajero'
    | 'pintura'
    | 'electrodomesticos'
    | 'jardinero'
    | 'tecnologia'
    | 'modista'
    | 'hogar'
    | 'mascotas'
    | 'aseo'
    | 'albanileria'
    | 'clases'
    | 'cable'
    | 'llave'
    | 'lupa'
    | 'exito'
    | 'disponible'
    | 'escudo'
    | 'soporte'
    | 'cierre';
}

/* ─── Image configs ─────────────────────────────────────────────
   Configuración de imagen y encuadre para cada oficio y estado
   ─────────────────────────────────────────────────────────────── */
interface ImgConfig {
  src: string;
  objectPosition: string;
  scale: number;
}

const CONFIGS: Record<string, ImgConfig> = {
  wave: { src: BRAND_ASSETS.manyWave, objectPosition: 'center 10%', scale: 1.1 },
  base: { src: BRAND_ASSETS.manyWave, objectPosition: 'center 10%', scale: 1.1 },
  electricista: { src: BRAND_ASSETS.manyElectricista, objectPosition: 'center 15%', scale: 1.05 },
  plomero: { src: BRAND_ASSETS.manyPlomero, objectPosition: 'center 15%', scale: 1.05 },
  carpintero: { src: BRAND_ASSETS.manyCarpintero, objectPosition: 'center 15%', scale: 1.05 },
  cerrajero: { src: BRAND_ASSETS.manyCerrajero, objectPosition: 'center 15%', scale: 1.05 },
  pintura: { src: BRAND_ASSETS.manyPintura, objectPosition: 'center 15%', scale: 1.05 },
  electrodomesticos: { src: BRAND_ASSETS.manyElectrodomesticos, objectPosition: 'center 15%', scale: 1.05 },
  jardinero: { src: BRAND_ASSETS.manyJardinero, objectPosition: 'center 15%', scale: 1.05 },
  tecnologia: { src: BRAND_ASSETS.manyTecnologia, objectPosition: 'center 15%', scale: 1.05 },
  modista: { src: BRAND_ASSETS.manyModista, objectPosition: 'center 15%', scale: 1.05 },
  hogar: { src: BRAND_ASSETS.manyHogar, objectPosition: 'center 15%', scale: 1.05 },
  mascotas: { src: BRAND_ASSETS.manyMascotas, objectPosition: 'center 15%', scale: 1.05 },
  aseo: { src: BRAND_ASSETS.manyAseo, objectPosition: 'center 15%', scale: 1.05 },
  albanileria: { src: BRAND_ASSETS.manyAlbanileria, objectPosition: 'center 15%', scale: 1.05 },
  clases: { src: BRAND_ASSETS.manyClases, objectPosition: 'center 15%', scale: 1.05 },
  cable: { src: BRAND_ASSETS.manyCable, objectPosition: 'center 15%', scale: 1.05 },
  llave: { src: BRAND_ASSETS.manyLlave, objectPosition: 'center 15%', scale: 1.05 },
  lupa: { src: BRAND_ASSETS.manyLupa, objectPosition: 'center 15%', scale: 1.05 },
  exito: { src: BRAND_ASSETS.manyExito, objectPosition: 'center 15%', scale: 1.05 },
  disponible: { src: BRAND_ASSETS.manyDisponible, objectPosition: 'center 15%', scale: 1.05 },
  escudo: { src: BRAND_ASSETS.manyEscudo, objectPosition: 'center 15%', scale: 1.05 },
  soporte: { src: BRAND_ASSETS.manySoporte, objectPosition: 'center 15%', scale: 1.05 },
  cierre: { src: BRAND_ASSETS.manyCierre, objectPosition: 'center 15%', scale: 1.05 },
};

function getConfig(
  trade?: TradeCategory,
  _expression?: MascotExpression,
  forceImage?: string
): ImgConfig {
  if (forceImage && CONFIGS[forceImage]) return CONFIGS[forceImage];
  if (trade === 'electricidad') return CONFIGS.electricista;
  if (trade === 'plomeria') return CONFIGS.plomero;
  if (trade === 'cerrajeria') return CONFIGS.cerrajero;
  if (trade === 'pintura') return CONFIGS.pintura;
  if (trade === 'electrodomesticos') return CONFIGS.electrodomesticos;
  if (trade === 'jardineria') return CONFIGS.jardinero;
  if (trade === 'computacion') return CONFIGS.tecnologia;
  if (trade === 'hogar') return CONFIGS.hogar;
  if (trade === 'mascotas') return CONFIGS.mascotas;
  if (trade === 'aseo') return CONFIGS.aseo;
  if (trade === 'albanileria') return CONFIGS.albanileria;
  if (trade === 'clases') return CONFIGS.clases;
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
  const dim    = SIZE_MAP[size] || SIZE_MAP.md;
  const config = getConfig(trade, expression, forceImage);

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

  const style = {
    width: dim.width,
    height: dim.height,
    borderRadius: dim.borderRadius,
    animation: currentAnim,
  };
  const image = (
    <img
      src={config.src}
      alt={onClick ? '' : 'Many el Castor de OficioYa'}
      className="many-avatar__img"
      style={{ objectPosition: config.objectPosition, transform: `scale(${config.scale})` }}
      draggable={false}
    />
  );

  return (
    <div className={`many-avatar-wrap many-avatar-wrap--${size} ${className}`}>
      {onClick ? (
        <button
          type="button"
          className="many-avatar many-avatar--button"
          onClick={handleClick}
          style={style}
          aria-label="Many, el Castor de OficioYa"
          title="Many — El Castor de OficioYa"
        >
          {image}
        </button>
      ) : (
        <div className="many-avatar" style={style} title="Many — El Castor de OficioYa">
          {image}
        </div>
      )}
    </div>
  );
};
