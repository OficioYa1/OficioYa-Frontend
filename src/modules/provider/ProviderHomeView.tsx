import React, { useRef, useState } from 'react';
import { MapPin, Clock, Share, Info, CheckCircle, Sparkles, Wrench, Zap } from 'lucide-react';
import { PageHero } from '../../components/layout/PageHero';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { useReveal } from '../../hooks/useReveal';
import './Provider.css';
import type { TradeCategory } from '../../types';

interface ProviderHomeViewProps {
  onRecommend: (requestId: string) => void;
}

// Mock de oportunidades cercanas
const MOCK_OPPORTUNITIES = [
  {
    id: 'req-101',
    clientName: 'María López',
    problem: 'Necesito reparar una fuga de agua debajo del lavaplatos. Se está inundando la cocina.',
    trade: 'plomeria' as TradeCategory,
    tradeLabel: 'Plomería',
    zone: 'Chapinero',
    distance: 1.2,
    urgency: 'Urgente (Hoy)',
    postedAt: 'Hace 12 min',
    budget: '$40.000 - $60.000'
  },
  {
    id: 'req-102',
    clientName: 'Carlos Gómez',
    problem: 'Instalar 4 tomacorrientes nuevos en la sala y revisar si hay un cortocircuito porque se disparan los breakers.',
    trade: 'electricidad' as TradeCategory,
    tradeLabel: 'Electricidad',
    zone: 'Teusaquillo',
    distance: 2.5,
    urgency: 'Flexible',
    postedAt: 'Hace 45 min',
    budget: 'Por cotizar'
  },
  {
    id: 'req-103',
    clientName: 'Ana Rodríguez',
    problem: 'Pintar un apartamento vacío de 60m2. Ya tengo la pintura.',
    trade: 'pintura' as TradeCategory,
    tradeLabel: 'Pintura',
    zone: 'Usaquén',
    distance: 3.8,
    urgency: 'Esta semana',
    postedAt: 'Hace 2 horas',
    budget: '$300.000 (Mano de obra)'
  }
];

export const ProviderHomeView: React.FC<ProviderHomeViewProps> = ({ onRecommend }) => {
  const [opportunities, setOpportunities] = useState(MOCK_OPPORTUNITIES);
  const [interestId, setInterestId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef, [opportunities.length]);

  const handleInterest = (id: string) => {
    setInterestId(id);
    setTimeout(() => {
      setOpportunities(prev => prev.filter(req => req.id !== id));
      setInterestId(null);
    }, 1500);
  };

  const urgentCount = opportunities.filter(o => o.urgency.startsWith('Urgente')).length;
  const nearest = opportunities.reduce<number | null>(
    (min, o) => (min === null || o.distance < min ? o.distance : min),
    null
  );

  return (
    <div ref={rootRef} className="container pv-page">
      <PageHero
        tone="fuego"
        eyebrow={<><Sparkles size={14} aria-hidden="true" /> Oportunidades</>}
        title="Trabajo cerca de ti"
        subtitle="Personas en tu zona de cobertura necesitan ayuda ahora mismo. Responde primero y gana el trabajo."
      />

      <div className="pv-bento pv-bento--home">
        <div className="pv-tile pv-tile--stat" data-reveal style={{ '--reveal-i': 0 } as React.CSSProperties}>
          <span className="pv-tile__icon pv-tile__icon--fuego" aria-hidden="true"><Wrench size={20} /></span>
          <span className="pv-figure pv-figure--md">{opportunities.length}</span>
          <span className="pv-kicker">Solicitudes abiertas</span>
        </div>
        <div className="pv-tile pv-tile--stat" data-reveal style={{ '--reveal-i': 1 } as React.CSSProperties}>
          <span className="pv-tile__icon pv-tile__icon--amarillo" aria-hidden="true"><Zap size={20} /></span>
          <span className="pv-figure pv-figure--md">{urgentCount}</span>
          <span className="pv-kicker">Urgentes hoy</span>
        </div>
        <div className="pv-tile pv-tile--stat" data-reveal style={{ '--reveal-i': 2 } as React.CSSProperties}>
          <span className="pv-tile__icon pv-tile__icon--marino" aria-hidden="true"><MapPin size={20} /></span>
          <span className="pv-figure pv-figure--md">
            {nearest === null ? '—' : nearest.toLocaleString('es-CO')}<span className="pv-figure__unit"> km</span>
          </span>
          <span className="pv-kicker">La más cercana</span>
        </div>

        <section
          className="pv-tile pv-tile--alerts"
          data-reveal
          style={{ '--reveal-i': 3 } as React.CSSProperties}
          aria-labelledby="pv-alerts-title"
        >
          <h2 id="pv-alerts-title" className="pv-tile__title">Alertas</h2>
          <ul className="pv-alerts">
            <li className="pv-alert">
              <span className="pv-tile__icon pv-tile__icon--marino" aria-hidden="true"><Info size={16} /></span>
              <span>Nueva solicitud de <strong>Plomería</strong> a 1,2 km de ti.</span>
            </li>
            <li className="pv-alert">
              <span className="pv-tile__icon pv-tile__icon--esmeralda" aria-hidden="true"><CheckCircle size={16} /></span>
              <span>Un colega te recomendó para una solicitud de <strong>Electricidad</strong>.</span>
            </li>
          </ul>
        </section>
      </div>

      <section className="pv-section" aria-labelledby="pv-opps-title">
        <div className="oy-section-head" data-reveal>
          <div>
            <h2 id="pv-opps-title" className="oy-section-title oy-display">Solicitudes abiertas</h2>
            <p className="oy-section-sub">Los clientes eligen a quien muestra interés primero.</p>
          </div>
          <span className="pv-tag pv-tag--fuego" role="status">{opportunities.length} disponibles</span>
        </div>

        {opportunities.length === 0 ? (
          <div className="oy-empty" data-reveal>
            <MascotAvatar size="md" expression="alegre" />
            <h3 className="oy-empty__title">No hay más oportunidades nuevas</h3>
            <p className="oy-empty__text">Te notificaremos cuando alguien publique una solicitud cerca de ti.</p>
          </div>
        ) : (
          <div className="pv-grid">
            {opportunities.map((req, i) => (
              <article
                key={req.id}
                className="pv-ticket"
                data-busy={interestId === req.id}
                data-reveal
                style={{ '--reveal-i': i } as React.CSSProperties}
              >
                <div className="pv-ticket__top">
                  <span className="pv-tag pv-tag--solid">{req.tradeLabel}</span>
                  <span className="pv-muted pv-caption">{req.postedAt}</span>
                </div>

                <p className="pv-ticket__quote">{req.problem}</p>

                <div className="pv-ticket__meta">
                  <span><MapPin size={14} aria-hidden="true" /> {req.zone} · {req.distance.toLocaleString('es-CO')} km</span>
                  <span><Clock size={14} aria-hidden="true" /> {req.urgency}</span>
                </div>

                <div className="pv-ticket__foot">
                  <span className="pv-ticket__budget">{req.budget}</span>
                  <span className="pv-muted pv-caption">{req.clientName}</span>
                </div>

                <div className="pv-ticket__actions">
                  <button
                    type="button"
                    onClick={() => onRecommend(req.id)}
                    className="btn btn-secondary"
                    title="Recomendar a un colega si no es de tu especialidad"
                  >
                    <Share size={16} aria-hidden="true" /> Recomendar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInterest(req.id)}
                    className="btn btn-primary"
                    disabled={interestId === req.id}
                  >
                    {interestId === req.id ? 'Contactando…' : 'Me interesa'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
