import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ShieldCheck, MessageCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import './StickyProcess.css';

export interface StickyProcessProps {
  onStart?: () => void;
}

interface StepData {
  number: string;
  pillTitle: string;
  title: string;
  desc: string;
  detail: string;
  icon: React.ReactNode;
}

const STEPS: StepData[] = [
  {
    number: '01',
    pillTitle: '01. Petición en 30s',
    title: 'Describís la necesidad o avería',
    desc: 'Indicas tu localidad en Bogotá o activas tu GPS. Many calcula automáticamente qué profesionales verificados están activos y disponibles a menos de 2 km.',
    detail: 'Respuesta estimada < 20 minutos',
    icon: <MapPin size={24} color="var(--color-brand-primary, #E65100)" />
  },
  {
    number: '02',
    pillTitle: '02. Fotos y Reseñas',
    title: 'Revisas el portafolio real de obras',
    desc: 'Sin sorpresas. Miras fotos de tuberías cambiadas, cableados organizados y calificaciones dejadas por vecinos de tu mismo barrio.',
    detail: '100% reseñas auditadas',
    icon: <ShieldCheck size={24} color="#0277BD" />
  },
  {
    number: '03',
    pillTitle: '03. Trato Directo',
    title: 'Coordinas hora y precio sin vueltas',
    desc: 'Hablas directo por el chat de la app o WhatsApp. Acuerdas la tarifa clara antes de que salgan a tu casa, sin comisiones sorpresa añadidas.',
    detail: 'Cero comisión de plataforma',
    icon: <MessageCircle size={24} color="#2E7D32" />
  },
  {
    number: '04',
    pillTitle: '04. Garantía y Pago',
    title: 'Pagas al terminar y calificas',
    desc: 'Pagas directamente al técnico en efectivo, Nequi, Daviplata o Bre-B. Dejas tu reseña para premiar el buen trabajo y proteger a la comunidad.',
    detail: 'Garantía comunitaria activa',
    icon: <CheckCircle2 size={24} color="#C2185B" />
  }
];

/**
 * StickyProcess inspirado en la famosa sección "How I Work" de Martin Ollivere (ollivere.webflow.io).
 * Cuenta con un encabezado pegajoso (sticky), barra de progreso dinámica sincronizada
 * y tarjetas de flujo de trabajo que explican el proceso sin intermediarios.
 */
export const StickyProcess: React.FC<StickyProcessProps> = ({ onStart }) => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Escuchar el scroll para sincronizar la barra de progreso
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calcular progreso relativo dentro del contenedor
      const totalDist = rect.height - windowHeight;
      if (totalDist <= 0) return;

      const scrolled = -rect.top;
      const progressRatio = Math.min(Math.max(scrolled / totalDist, 0), 1);

      // Determinar paso activo (0, 1, 2, 3)
      const stepIdx = Math.min(Math.floor(progressRatio * 4), 3);
      setActiveStep(stepIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const progressPercent = ((activeStep + 1) / 4) * 100;

  return (
    <section className="ollivere-process-section" ref={containerRef} aria-labelledby="ollivere-process-title">
      <div className="ollivere-process-wrap">
        
        {/* Intro */}
        <div className="ollivere-process-intro">
          <div className="ollivere-process-kicker">
            <span>Metodología sin rodeos · Estilo Ollivere</span>
          </div>
          <h2 id="ollivere-process-title" className="ollivere-process-title">
            Cómo funciona OficioYa: 4 pasos sin vueltas
          </h2>
          <p className="ollivere-process-desc">
            Sin intermediarios que inflen las tarifas ni grupos de chat desorganizados. Una experiencia pensada para resolver averías de hogar en minutos.
          </p>
        </div>

        {/* Encabezado Sticky con Barra de Progreso Viva */}
        <div className="ollivere-sticky-header">
          <div className="ollivere-progress-track">
            <div
              className="ollivere-progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="ollivere-steps-nav">
            {STEPS.map((s, idx) => (
              <button
                key={s.number}
                type="button"
                className={`ollivere-step-pill ${activeStep === idx ? 'is-active' : ''}`}
                onClick={() => setActiveStep(idx)}
              >
                <span className="ollivere-step-pill__num">{s.number}</span>
                <span>{s.pillTitle.replace(/^\d+\.\s*/, '')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grilla de 4 tarjetas de pasos */}
        <div className="ollivere-cards-grid">
          {STEPS.map((s, idx) => (
            <motion.div
              key={s.number}
              className="ollivere-card"
              whileHover={{ y: -6 }}
              onClick={() => setActiveStep(idx)}
              data-cursor-text="Paso"
            >
              <div>
                <div className="ollivere-card__badge">
                  {s.icon}
                  <span>PASO {s.number}</span>
                </div>
                <h3 className="ollivere-card__title">{s.title}</h3>
                <p className="ollivere-card__desc">{s.desc}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div className="ollivere-card__detail">
                  <span>{s.detail}</span>
                </div>
                {onStart && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStart();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontFamily: 'var(--font-text)',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      color: 'var(--color-brand-primary, #E65100)',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Comenzar</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
