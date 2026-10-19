import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Zap, KeyRound, PaintBucket, Tv2, BookOpen, ShieldCheck, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { playTactileClick, playChime } from '../../utils/audioChimes';
import { HoloCard3D } from '../ui/HoloCard3D';
import './RetroInspector.css';

export interface RetroInspectorProps {
  selectedTrade?: string;
  onSelectTrade?: (trade: string) => void;
  onExploreExperts?: (trade: string) => void;
}

interface TradeSpec {
  id: string;
  name: string;
  icon: React.ReactNode;
  image: string;
  kit: string;
  response: string;
  warranty: string;
  certification: string;
  rating: string;
}

const TRADE_SPECS: TradeSpec[] = [
  {
    id: 'electricidad',
    name: 'Electricidad Certificada RETIE',
    icon: <Zap size={18} />,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
    kit: 'Multímetro Fluke True-RMS, Pinza amperimétrica, Herramienta aislada 1000V',
    response: '< 20 minutos en Bogotá',
    warranty: 'Garantía de circuito y tablero eléctrico',
    certification: 'Matrícula Conte / Retie validada',
    rating: '4.8 / 5 (480+ servicios)'
  },
  {
    id: 'plomeria',
    name: 'Plomería & Redes Hidráulicas',
    icon: <Wrench size={18} />,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
    kit: 'Sonda eléctrica Ridgid, Llave Stilson 18", Termofusora de tubería PPR',
    response: '< 18 minutos en Bogotá',
    warranty: '30 días de garantía de mano de obra',
    certification: 'Cédula verificada + 3 referencias reales',
    rating: '4.9 / 5 (620+ servicios)'
  },
  {
    id: 'pintura',
    name: 'Pintura & Acabados Finos',
    icon: <PaintBucket size={18} />,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
    kit: 'Turbina Airless Graco, Lijadora con aspiración ciclónica, Medidor de humedad',
    response: '< 25 minutos para cotización',
    warranty: 'Garantía de adherencia y cero manchas',
    certification: 'Portafolio de obras finalizadas validado',
    rating: '5.0 / 5 (340+ servicios)'
  },
  {
    id: 'cerrajeria',
    name: 'Cerrajería de Emergencia 24/7',
    icon: <KeyRound size={18} />,
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80',
    kit: 'Ganzúa multipunto eléctrica, Duplicadora computarizada, Extractores de cilindro',
    response: '< 15 minutos en Bogotá',
    warranty: 'Apertura limpia sin daño de puerta',
    certification: 'Antecedentes judiciales limpios 100%',
    rating: '4.9 / 5 (210+ servicios)'
  },
  {
    id: 'electrodomesticos',
    name: 'Electrodomésticos & Línea Blanca',
    icon: <Tv2 size={18} />,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    kit: 'Tester digital de circuitos, Manómetros de refrigeración, Bomba de vacío',
    response: '< 30 minutos en Bogotá',
    warranty: '90 días en repuestos y mano de obra',
    certification: 'Técnico certificado por fabricantes',
    rating: '4.8 / 5 (190+ servicios)'
  },
  {
    id: 'clases',
    name: 'Clases Particulares & Asistencia',
    icon: <BookOpen size={18} />,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    kit: 'Material pedagógico interactivo, Guías de refuerzo, Evaluación diagnóstica',
    response: 'Agendamiento inmediato en tu zona',
    warranty: 'Garantía de progreso y primera sesión de prueba',
    certification: 'Título profesional y antecedentes verificados',
    rating: '5.0 / 5 (410+ servicios)'
  }
];

export const RetroInspector: React.FC<RetroInspectorProps> = ({ selectedTrade, onSelectTrade, onExploreExperts }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Sync tab with external selectedTrade prop (e.g. from Toolbox Orbit)
  useEffect(() => {
    if (selectedTrade) {
      const idx = TRADE_SPECS.findIndex(t => t.id === selectedTrade);
      if (idx !== -1) {
        setSelectedIdx(idx);
      }
    }
  }, [selectedTrade]);

  const current = TRADE_SPECS[selectedIdx] || TRADE_SPECS[0];

  const handleTabClick = (idx: number) => {
    setSelectedIdx(idx);
    playTactileClick();
    if (idx === 0) playChime();
    onSelectTrade?.(TRADE_SPECS[idx].id);
  };

  return (
    <section id="inspector-section" className="thibaut-inspector-section" aria-labelledby="thibaut-inspector-title">
      <div className="thibaut-inspector-wrap">
        
        {/* Intro */}
        <div className="thibaut-inspector-header">
          <div className="thibaut-inspector-kicker">
            <span>Hardware & Tooling Inspector · Estilo thibaut.cool</span>
          </div>
          <h2 id="thibaut-inspector-title" className="thibaut-inspector-title">
            Ficha técnica & herramientas de cada oficio
          </h2>
          <p className="thibaut-inspector-sub">
            Conoce con qué herramientas y protocolos llega cada artesano a tu hogar. Transparencia técnica total antes de contratar.
          </p>
        </div>

        {/* Consola Translúcida 3D */}
        <HoloCard3D maxTilt={6}>
          <div className="thibaut-console">
            
            {/* Topbar estilo Mac OS clásico */}
            <div className="thibaut-console__topbar">
              <div className="thibaut-console__dots">
                <span className="thibaut-console__dot thibaut-console__dot--red" />
                <span className="thibaut-console__dot thibaut-console__dot--yellow" />
                <span className="thibaut-console__dot thibaut-console__dot--green" />
              </div>
              <div className="thibaut-console__tag">
                SYSTEM SPEC · OFICIOYA OS v2.6 · BOGOTÁ D.C.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#27C93F' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27C93F', boxShadow: '0 0 6px #27C93F' }} />
                <span>EN LÍNEA</span>
              </div>
            </div>

            {/* Pestañas de oficios */}
            <div className="thibaut-console__tabs">
              {TRADE_SPECS.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  className={`thibaut-console__tab-btn ${selectedIdx === idx ? 'is-active' : ''}`}
                  onClick={() => handleTabClick(idx)}
                  data-cursor-text="Specs"
                >
                  {t.icon}
                  <span>{t.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Cuerpo de especificaciones con transición animada */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className="thibaut-console__body"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {/* Pantalla CRT con imagen de trabajo */}
                <div className="thibaut-console__screen">
                  <img
                    src={current.image}
                    alt={current.name}
                    className="thibaut-console__img"
                  />
                  <div className="thibaut-console__scanlines" />
                </div>

                {/* Especificaciones técnicas del oficio */}
                <div className="thibaut-specs">
                  <h3 className="thibaut-specs__trade-name">{current.name}</h3>

                  <div className="thibaut-specs__items">
                    <div className="thibaut-spec-row">
                      <span className="thibaut-spec-row__label">Kit de Herramientas:</span>
                      <span className="thibaut-spec-row__value" style={{ textAlign: 'right', maxWidth: '60%' }}>
                        {current.kit}
                      </span>
                    </div>

                    <div className="thibaut-spec-row">
                      <span className="thibaut-spec-row__label">
                        <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                        Respuesta Promedio:
                      </span>
                      <span className="thibaut-spec-row__value">{current.response}</span>
                    </div>

                    <div className="thibaut-spec-row">
                      <span className="thibaut-spec-row__label">
                        <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                        Garantía:
                      </span>
                      <span className="thibaut-spec-row__value">{current.warranty}</span>
                    </div>

                    <div className="thibaut-spec-row">
                      <span className="thibaut-spec-row__label">
                        <CheckCircle2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                        Filtro de Confianza:
                      </span>
                      <span className="thibaut-spec-row__value">{current.certification}</span>
                    </div>

                    <div className="thibaut-spec-row">
                      <span className="thibaut-spec-row__label">Reputación en Barrio:</span>
                      <span className="thibaut-spec-row__value">{current.rating}</span>
                    </div>

                    <div style={{ marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px dashed rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => onExploreExperts?.(current.id)}
                        className="lp-hero-btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem', gap: '6px' }}
                      >
                        <span>Ver profesionales en {current.name.split(' ')[0]}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </HoloCard3D>

      </div>
    </section>
  );
};
