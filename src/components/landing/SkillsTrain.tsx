import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Zap, KeyRound, PaintBucket, Sparkles, Tv2, ArrowRight } from 'lucide-react';
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
    activeCount: 'Atención de emergencias',
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

  return (
    <section className="ollivere-train-section" aria-label="Caravana de Oficios de OficioYa">
      <div className="ollivere-train-header">
        <div className="ollivere-train-kicker">
          <span>El convoy de los oficios · Trato directo sin comisiones</span>
        </div>
        <h2 className="ollivere-train-title">
          Todos los saberes del barrio en movimiento
        </h2>
        <p className="ollivere-train-sub">
          Desde destapes de urgencia a medianoche hasta remodelaciones completas. Arrastra la caravana para descubrir la red de artesanos activos hoy en Bogotá.
        </p>
      </div>

      {/* Rieles y convoy interactivo */}
      <div className="ollivere-train-track" ref={trackRef}>
        <div className="ollivere-train-rails" />

        <div className="ollivere-train-convoy">
          
          {/* Locomotora Many el Castor */}
          <div className="ollivere-wagon-engine" data-cursor-text="¡Vamos!">
            <img
              src={BRAND_ASSETS.manyWave}
              alt="Many conductor"
              className="ollivere-wagon-engine__mascot"
            />
            <div className="ollivere-wagon-engine__label">OFICIOYA EXPRESS</div>
            <div className="ollivere-wagon-engine__tag">BOGOTÁ D.C. · 2026</div>
            <div className="ollivere-wagon__wheels">
              <span className="ollivere-wagon__wheel" />
              <span className="ollivere-wagon__wheel" />
            </div>
          </div>

          {/* Vagones de oficios rotulados */}
          {WAGONS.map((w) => (
            <motion.div
              key={w.id}
              className={`ollivere-wagon ollivere-wagon--${w.type}`}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectTrade?.(w.id)}
              data-cursor-text="Ver"
            >
              <div className="ollivere-wagon__top">
                <div className="ollivere-wagon__icon">{w.icon}</div>
                <span className="ollivere-wagon__number">{w.number}</span>
              </div>

              <div>
                <h3 className="ollivere-wagon__title">{w.title}</h3>
                <div className="ollivere-wagon__meta">
                  <span>{w.activeCount}</span>
                  <ArrowRight size={12} />
                </div>
              </div>

              <div className="ollivere-wagon__wheels">
                <span className="ollivere-wagon__wheel" />
                <span className="ollivere-wagon__wheel" />
              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
};
