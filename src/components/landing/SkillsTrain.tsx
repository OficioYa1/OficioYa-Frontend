
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Zap, KeyRound, PaintBucket, Sparkles, Tv2, ArrowRight, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { BRAND_ASSETS } from '../../utils/assets';
import './SkillsTrain.css';

export interface SkillsTrainProps {
  onSelectTrade?: (trade: string) => void;
}

interface WagonItem {
  id: string;
  number: string;
  title: string;
  type: string;
  activeCount: string;
  icon: React.ReactNode;
}

const WAGONS: WagonItem[] = [
  {
    id: 'electricidad',
    number: '01',
    title: 'Electricidad',
    type: 'electricidad',
    activeCount: 'Técnicos certificados',
    icon: <Zap size={20} />
  },
  {
    id: 'plomeria',
    number: '02',
    title: 'Plomería',
    type: 'plomeria',
    activeCount: 'Plomeros calificados',
    icon: <Wrench size={20} />
  },
  {
    id: 'cerrajeria',
    number: '03',
    title: 'Cerrajería',
    type: 'cerrajeria',
    activeCount: 'Atención emergencias',
    icon: <KeyRound size={20} />
  },
  {
    id: 'pintura',
    number: '04',
    title: 'Pintura',
    type: 'pintura',
    activeCount: 'Pintores y estucadores',
    icon: <PaintBucket size={20} />
  },
  {
    id: 'aseo',
    number: '05',
    title: 'Aseo y Desinfección',
    type: 'aseo',
    activeCount: 'Personal verificado',
    icon: <Sparkles size={20} />
  },
  {
    id: 'electrodomesticos',
    number: '06',
    title: 'Línea Blanca',
    type: 'electrodomesticos',
    activeCount: 'Servicio técnico',
    icon: <Tv2 size={20} />
  }
];

/**
 * SkillsTrain inspirado en la famosa caravana / tren de habilidades de Martin Ollivere (ollivere.webflow.io).
 * Presenta el convoy de oficios rodando por los rieles de Bogotá, conducido por Many el Castor.
 */
export const SkillsTrain: React.FC<SkillsTrainProps> = ({ onSelectTrade }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeSpeed, setActiveSpeed] = useState<'normal' | 'fast'>('normal');

  const togglePause = () => setIsPaused(prev => !prev);

  const scrollTrack = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = direction === 'left' ? -320 : 320;
    trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const renderConvoySet = (setIndex: number) => (
    <div className="ollivere-train-convoy" key={`convoy-set-${setIndex}`}>
      {/* Locomotora Many el Castor */}
      <div className="ollivere-wagon-engine" data-cursor-text="¡Vamos!">
        {/* Chimenea con vapor animado */}
        <div className="ollivere-engine__chimney" aria-hidden="true">
          <span className="ollivere-steam-puff puff-1" />
          <span className="ollivere-steam-puff puff-2" />
          <span className="ollivere-steam-puff puff-3" />
        </div>

        {/* Faro delantero con haz de luz */}
        <div className="ollivere-engine__headlight" aria-hidden="true">
          <span className="ollivere-headlight-lens" />
          <span className="ollivere-headlight-beam" />
        </div>

        {/* Many el castor conductor con bocadillo lúdico */}
        <div className="ollivere-engine__mascot-wrap">
          <img
            src={BRAND_ASSETS.manyWave}
            alt="Many conductor"
            className="ollivere-wagon-engine__mascot"
          />
          <span className="ollivere-whistle-tag" aria-hidden="true">¡Puuu-puuu!</span>
        </div>

        <div className="ollivere-wagon-engine__label">OFICIOYA EXPRESS</div>
        <div className="ollivere-wagon-engine__tag">BOGOTÁ D.C. · 2026</div>

        {/* Ruedas mecánicas animadas */}
        <div className="ollivere-wagon__wheels">
          <span className="ollivere-wagon__wheel">
            <span className="ollivere-wheel-rim" />
          </span>
          <span className="ollivere-wagon__wheel">
            <span className="ollivere-wheel-rim" />
          </span>
        </div>
      </div>

      {/* Vagones de oficios rotulados */}
      {WAGONS.map((w, idx) => (
        <motion.div
          key={`${w.id}-${setIndex}`}
          className={`ollivere-wagon ollivere-wagon--${w.type}`}
          style={{ '--wagon-i': idx } as React.CSSProperties}
          whileHover={{ y: -8, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectTrade?.(w.id)}
          data-cursor-text="Explorar"
        >
          {/* Enganche mecánico con el vagón anterior */}
          <span className="ollivere-wagon__coupler" aria-hidden="true" />

          <div className="ollivere-wagon__top">
            <div className="ollivere-wagon__icon">{w.icon}</div>
            <span className="ollivere-wagon__number">{w.number}</span>
          </div>

          <div>
            <h3 className="ollivere-wagon__title">{w.title}</h3>
            <div className="ollivere-wagon__meta">
              <span>{w.activeCount}</span>
              <ArrowRight size={12} className="ollivere-wagon__arrow" />
            </div>
          </div>

          <div className="ollivere-wagon__wheels">
            <span className="ollivere-wagon__wheel">
              <span className="ollivere-wheel-rim" />
            </span>
            <span className="ollivere-wagon__wheel">
              <span className="ollivere-wheel-rim" />
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <section className="ollivere-train-section" aria-label="Caravana de Oficios de OficioYa">
      <div className="ollivere-train-header">
        <div className="ollivere-train-header-top">
          <div className="ollivere-train-kicker">
            <span className="ollivere-kicker-dot" />
            <span>El convoy de los oficios · Trato directo sin comisiones</span>
          </div>

          {/* Barra de control interactiva para pausar / acelerar el convoy */}
          <div className="ollivere-train-controls" aria-label="Controles del tren de oficios">
            <button
              type="button"
              className="ollivere-ctrl-btn"
              onClick={() => scrollTrack('left')}
              title="Mover hacia atrás"
              aria-label="Desplazar tren a la izquierda"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              className={`ollivere-ctrl-btn ollivere-ctrl-btn--toggle ${isPaused ? 'is-paused' : ''}`}
              onClick={togglePause}
              title={isPaused ? 'Reanudar convoy' : 'Pausar convoy'}
              aria-label={isPaused ? 'Reanudar marcha del tren' : 'Pausar marcha del tren'}
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
            </button>

            <button
              type="button"
              className={`ollivere-ctrl-btn ${activeSpeed === 'fast' ? 'is-active' : ''}`}
              onClick={() => setActiveSpeed(prev => (prev === 'normal' ? 'fast' : 'normal'))}
              title="Cambiar velocidad de la marcha"
              aria-label="Cambiar velocidad del tren"
            >
              <span>{activeSpeed === 'fast' ? '⚡ 2x' : '1x'}</span>
            </button>

            <button
              type="button"
              className="ollivere-ctrl-btn"
              onClick={() => scrollTrack('right')}
              title="Mover hacia adelante"
              aria-label="Desplazar tren a la derecha"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <h2 className="ollivere-train-title">
          Todos los saberes del barrio en movimiento
        </h2>
        <p className="ollivere-train-sub">
          Desde destapes de urgencia a medianoche hasta remodelaciones completas. Pasa el cursor para inspeccionar cualquier vagón o pulsa para conectar con los especialistas verificados activos en Bogotá.
        </p>
      </div>

      {/* Rieles y convoy interactivo con movimiento continuo */}
      <div
        className={`ollivere-train-track ${isPaused ? 'is-paused' : ''} ${activeSpeed === 'fast' ? 'speed-fast' : ''}`}
        ref={trackRef}
        role="region"
        aria-label="Pista de tren interactiva con oficios"
      >
        {/* Riel inferior continuo con traviesas / durmientes */}
        <div className="ollivere-train-rails" aria-hidden="true" />

        {/* Stream continuo animado con dos sets de convoy para bucle sin fin */}
        <div className={`ollivere-train-stream ${isPaused ? 'is-paused' : ''}`}>
          {renderConvoySet(1)}
          {renderConvoySet(2)}
        </div>
      </div>
    </section>
  );
};

