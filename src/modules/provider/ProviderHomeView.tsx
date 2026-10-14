import React, { useState } from 'react';
import { MapPin, Clock, Share, Info, CheckCircle, Sparkles, Wrench } from 'lucide-react';
import { PageHero } from '../../components/layout/PageHero';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
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

  const handleInterest = (id: string) => {
    setInterestId(id);
    setTimeout(() => {
      setOpportunities(prev => prev.filter(req => req.id !== id));
      setInterestId(null);
    }, 1500);
  };

  return (
    <div className="pv-page">
      <PageHero
        tone="almendra"
        eyebrow={<><Sparkles size={14} aria-hidden="true" /> Oportunidades</>}
        title="Oportunidades cerca de ti"
        subtitle="Personas cerca de tu zona de cobertura necesitan ayuda ahora mismo."
        stickers={[
          { icon: <Wrench size={26} />, tone: 'fuego', style: { top: '14%', right: '7%', rotate: '-10deg' } },
          { icon: <MapPin size={24} />, tone: 'amarillo', style: { top: '52%', right: '17%', rotate: '8deg' } },
          { icon: <>{opportunities.length} cerca</>, tone: 'blanco', pill: true, style: { top: '20%', right: '24%', rotate: '-4deg' } }
        ]}
      />

      {/* ALERTAS */}
      <section aria-labelledby="pv-alerts-title">
        <div className="oy-section-head" style={{ marginTop: 0 }}>
          <h2 id="pv-alerts-title" className="oy-section-title oy-display">Alertas y oportunidades</h2>
        </div>
        <div className="pv-alerts">
          <div className="pv-alert" role="status">
            <span className="pv-alert__icon"><Info size={16} aria-hidden="true" /></span>
            <span>Nueva solicitud de <strong>Plomería</strong> a 1.2 km de ti.</span>
          </div>
          <div className="pv-alert pv-alert--esmeralda">
            <span className="pv-alert__icon"><CheckCircle size={16} aria-hidden="true" /></span>
            <span>Un colega te recomendó para una solicitud de Electricidad.</span>
          </div>
        </div>
      </section>

      {/* LISTA DE SOLICITUDES (TARJETAS) */}
      <section aria-labelledby="pv-opps-title">
        <div className="oy-section-head">
          <div>
            <h2 id="pv-opps-title" className="oy-section-title oy-display">Solicitudes abiertas</h2>
            <p className="oy-section-sub">Responde rápido: los clientes eligen a quien muestra interés primero.</p>
          </div>
          <span className="pv-tag pv-tag--fuego">{opportunities.length} disponibles</span>
        </div>

        {opportunities.length === 0 ? (
          <div className="oy-empty">
            <MascotAvatar size="md" expression="alegre" />
            <h3 className="oy-empty__title oy-display">No hay más oportunidades nuevas</h3>
            <p className="oy-empty__text">Te notificaremos cuando alguien publique una solicitud cerca de ti.</p>
          </div>
        ) : (
          <div className="pv-grid">
            {opportunities.map(req => (
              <article key={req.id} className="pv-ticket" data-busy={interestId === req.id}>
                <div className="pv-ticket__band pv-row pv-row--between">
                  <span className="pv-tag pv-tag--solid">{req.tradeLabel}</span>
                  <span className="pv-muted" style={{ fontSize: '13px' }}>{req.postedAt}</span>
                </div>

                <p className="pv-ticket__quote">"{req.problem}"</p>

                <div className="pv-ticket__meta">
                  <span><MapPin size={16} aria-hidden="true" /> {req.zone} • {req.distance} km</span>
                  <span><Clock size={16} aria-hidden="true" /> {req.urgency}</span>
                </div>

                <div className="pv-ticket__budget">Presupuesto: {req.budget}</div>

                <div className="pv-ticket__actions">
                  <button
                    type="button"
                    onClick={() => handleInterest(req.id)}
                    className="btn btn-primary"
                    disabled={interestId === req.id}
                  >
                    {interestId === req.id ? 'Contactando...' : 'Me interesa'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRecommend(req.id)}
                    className="btn btn-secondary"
                    title="Recomendar a un colega si no es de tu especialidad"
                  >
                    <Share size={16} aria-hidden="true" /> Recomendar
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
