import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
import {
  Wrench, Zap, KeyRound, PaintBucket, Sparkles,
  Tv, Hammer, PhoneCall, CheckCircle2, ArrowRight
} from 'lucide-react';
import { playRotaryRatchet, playChime, playTactileClick } from '../../utils/audioChimes';
import { triggerHaptic } from '../../utils/haptics';
import type { TradeCategory } from '../../types';
import './RotaryDial.css';

export interface RotaryDialItem {
  id: string;
  number: string;
  category: TradeCategory | 'urgencias';
  name: string;
  tagline: string;
  eta: string;
  icon: React.ReactNode;
  verifiedCount: number;
}

const DEFAULT_DIAL_ITEMS: RotaryDialItem[] = [
  {
    id: 'd-1',
    number: '1',
    category: 'plomeria',
    name: 'Plomería 24/7',
    tagline: 'Fugas urgentes, bajantes y tuberías de cobre sin romper baldosas.',
    eta: '15-20 min',
    icon: <Wrench size={18} />,
    verifiedCount: 42
  },
  {
    id: 'd-2',
    number: '2',
    category: 'electricidad',
    name: 'Electricidad RETIE',
    tagline: 'Cortocircuitos, cajas de tacos y certificación técnica residencial.',
    eta: '25 min',
    icon: <Zap size={18} />,
    verifiedCount: 38
  },
  {
    id: 'd-3',
    number: '3',
    category: 'cerrajeria',
    name: 'Cerrajería Express',
    tagline: 'Aperturas de emergencia y chapas de alta seguridad sin daño.',
    eta: '12 min',
    icon: <KeyRound size={18} />,
    verifiedCount: 29
  },
  {
    id: 'd-4',
    number: '4',
    category: 'pintura',
    name: 'Pintura & Estuco',
    tagline: 'Resanes, techos hidrófugos y aplicación a rodillo o compresor.',
    eta: 'Mismo día',
    icon: <PaintBucket size={18} />,
    verifiedCount: 31
  },
  {
    id: 'd-5',
    number: '5',
    category: 'aseo',
    name: 'Aseo a Vapor',
    tagline: 'Desinfección profunda de mudanzas, tapetes y colchones.',
    eta: 'Programable',
    icon: <Sparkles size={18} />,
    verifiedCount: 25
  },
  {
    id: 'd-6',
    number: '6',
    category: 'electrodomesticos',
    name: 'Línea Blanca',
    tagline: 'Diagnóstico en casa de lavadoras, neveras y calentadores.',
    eta: '40 min',
    icon: <Tv size={18} />,
    verifiedCount: 19
  },
  {
    id: 'd-7',
    number: '7',
    category: 'albanileria',
    name: 'Albañilería & Drywall',
    tagline: 'Goteras en tejas, pegado de enchapes y mampostería limpia.',
    eta: 'Mismo día',
    icon: <Hammer size={18} />,
    verifiedCount: 22
  },
  {
    id: 'd-8',
    number: '8',
    category: 'urgencias',
    name: 'SOS Directo Bogotá',
    tagline: 'Canal prioritario de emergencias domésticas en tu localidad.',
    eta: 'Inmediato',
    icon: <PhoneCall size={18} />,
    verifiedCount: 64
  }
];

export interface RotaryDialProps {
  onSelectTrade?: (category: TradeCategory | 'urgencias') => void;
  className?: string;
}

/**
 * RotaryDial — Selector mecánico rotatorio inspirado en bleibtgleich.dev
 * Traduce el dial telefónico analógico clásico al directorio moderno de oficios técnicos de OficioYa.
 */
export const RotaryDial: React.FC<RotaryDialProps> = ({ onSelectTrade, className = '' }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isDialing, setIsDialing] = useState<boolean>(false);
  const rotMotion = useMotionValue(0);
  const smoothRot = useSpring(rotMotion, { stiffness: 220, damping: 20 });
  const dialRef = useRef<HTMLDivElement>(null);

  const selectedItem = DEFAULT_DIAL_ITEMS[selectedIndex];

  // Cálculo de posiciones angulares: 8 agujeros distribuidos en círculo
  const totalItems = DEFAULT_DIAL_ITEMS.length;
  const angleStep = 360 / totalItems;

  const handleDialHole = (index: number) => {
    if (isDialing) return;
    setIsDialing(true);
    triggerHaptic('selection');
    playTactileClick();

    // Ángulo de rotación simulando tirar del dial hacia el tope metálico (~60° a 180° según la distancia)
    const targetPullAngle = 140 + index * 18;

    // Sonido de trinquete mientras rota
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      playRotaryRatchet(1 + (ticks % 3) * 0.2);
      triggerHaptic('light');
      if (ticks >= 6) clearInterval(interval);
    }, 45);

    // Animación de ida: tirar hacia el tope
    animate(rotMotion, targetPullAngle, {
      duration: 0.35,
      ease: [0.25, 1, 0.5, 1],
      onComplete: () => {
        clearInterval(interval);
        // Animación de regreso con rebote mecánico elástico
        animate(rotMotion, 0, {
          duration: 0.55,
          ease: [0.34, 1.56, 0.64, 1],
          onComplete: () => {
            setSelectedIndex(index);
            setIsDialing(false);
            playChime();
            triggerHaptic('success');
            onSelectTrade?.(DEFAULT_DIAL_ITEMS[index].category);
          }
        });
      }
    });
  };

  const handleCtaClick = () => {
    playChime();
    triggerHaptic('success');
    onSelectTrade?.(selectedItem.category);
  };

  return (
    <div className={`oy-rotary-section ${className}`}>
      <div className="oy-rotary-header">
        <div className="oy-rotary-badge">
          <span className="oy-rotary-badge-pulse" />
          DISCO TELEFÓNICO ANALÓGICO · OFICIO DIRECTO
        </div>
        <h2 className="oy-rotary-title">
          Gira el disco para contactar al especialista de guardia
        </h2>
        <p className="oy-rotary-subtitle">
          Inspirado en la ingeniería analógica de <strong style={{ color: 'var(--oy-gold)' }}>bleibtgleich.dev</strong>.
          Haz clic o pulsa en cualquiera de los orificios para marcar el oficio deseado en tiempo real.
        </p>
      </div>

      <div className="oy-rotary-layout">
        {/* Contenedor del disco giratorio */}
        <div className="oy-rotary-wrapper" ref={dialRef}>
          {/* Tope metálico de tope de dedo (Finger Stop) clásico de teléfonos de disco */}
          <div className="oy-rotary-finger-stop" aria-hidden="true">
            <div className="oy-finger-stop-bracket" />
            <span className="oy-finger-stop-tip" />
          </div>

          {/* Disco rotatorio animado con Framer Motion */}
          <motion.div
            className="oy-rotary-disc"
            style={{ rotate: smoothRot }}
            aria-label="Disco selector de oficios"
          >
            {/* Anillo de fondo con textura y marcas */}
            <div className="oy-rotary-outer-ring" />

            {/* Agujeros del disco posicionados trigonométricamente */}
            {DEFAULT_DIAL_ITEMS.map((item, idx) => {
              const angleDeg = idx * angleStep - 60; // Desfase inicial para ergonomía
              const isSelected = selectedIndex === idx;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`oy-rotary-hole ${isSelected ? 'is-active' : ''}`}
                  style={{
                    transform: `rotate(${angleDeg}deg) translateY(calc(-1 * var(--rotary-radius))) rotate(${-angleDeg}deg)`
                  }}
                  onClick={() => handleDialHole(idx)}
                  aria-label={`Marcar oficio ${item.name} (Número ${item.number})`}
                  title={`${item.number}: ${item.name}`}
                  disabled={isDialing}
                >
                  <span className="oy-hole-number">{item.number}</span>
                  <span className="oy-hole-icon">{item.icon}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Centro fijo del disco con visor y logotipo */}
          <div className="oy-rotary-center-hub">
            <div className="oy-hub-inner">
              <span className="oy-hub-number-display">{selectedItem.number}</span>
              <span className="oy-hub-category-label">{selectedItem.name}</span>
            </div>
          </div>
        </div>

        {/* Tarjeta de información técnica del oficio seleccionado */}
        <div className="oy-rotary-card" role="region" aria-live="polite">
          <div className="oy-card-top-bar">
            <div className="oy-card-num-pill">
              LÍNEA DIRECTA #{selectedItem.number}
            </div>
            <div className="oy-card-eta">
              <span className="oy-eta-dot" />
              Llegada est.: <strong>{selectedItem.eta}</strong>
            </div>
          </div>

          <h3 className="oy-card-trade-title">
            {selectedItem.icon}
            <span>{selectedItem.name}</span>
          </h3>

          <p className="oy-card-desc">{selectedItem.tagline}</p>

          <div className="oy-card-stats-grid">
            <div className="oy-card-stat">
              <span className="oy-stat-label">Técnicos verificados</span>
              <span className="oy-stat-val">
                <CheckCircle2 size={14} className="oy-stat-icon-check" />
                {selectedItem.verifiedCount} en Bogotá
              </span>
            </div>
            <div className="oy-card-stat">
              <span className="oy-stat-label">Comisión de plataforma</span>
              <span className="oy-stat-val oy-stat-val--free">$0 COP (100% libre)</span>
            </div>
          </div>

          <button
            type="button"
            className="oy-rotary-action-btn"
            onClick={handleCtaClick}
          >
            <span>Conectar con profesional #{selectedItem.number}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
