import React, { useState } from 'react';
import { MapPin, Clock, ArrowRight, Share, Info, CheckCircle } from 'lucide-react';
import type { ServiceRequest, TradeCategory } from '../../types';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '48px' }}>
      
      {/* HEADER */}
      <div style={{ marginTop: '24px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '8px', color: 'var(--color-text-main)' }}>
          Oportunidades cerca de ti
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
          Personas cerca de tu zona de cobertura necesitan ayuda ahora mismo.
        </p>
      </div>

      {/* ALERTAS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Alertas y oportunidades</h3>
        
        <div style={{ background: '#EFF6FF', borderLeft: '4px solid #3B82F6', padding: '16px', borderRadius: '0 12px 12px 0', fontSize: '15px', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Info size={18} color="#3B82F6" />
          <span>Nueva solicitud de <strong>Plomería</strong> a 1.2 km de ti.</span>
        </div>
        
        <div style={{ background: '#ECFDF5', borderLeft: '4px solid #10B981', padding: '16px', borderRadius: '0 12px 12px 0', fontSize: '15px', color: '#065F46', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle size={18} color="#10B981" />
          <span>Un colega te recomendó para una solicitud de Electricidad.</span>
        </div>
      </div>

      {/* LISTA DE SOLICITUDES (TARJETAS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {opportunities.map(req => (
          <div key={req.id} style={{
            background: 'var(--color-surface)',
            border: '1px solid rgba(150,150,150,0.15)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
            opacity: interestId === req.id ? 0.5 : 1
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ background: '#F3F4F6', color: '#374151', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                {req.tradeLabel}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {req.postedAt}
              </span>
            </div>

            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)', lineHeight: 1.4, margin: 0 }}>
              "{req.problem}"
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {req.zone} • {req.distance} km</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {req.urgency}</span>
            </div>

            <div style={{ background: '#F9FAFB', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              Presupuesto: {req.budget}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '8px' }}>
              <button 
                onClick={() => handleInterest(req.id)}
                className="btn-provider-interest"
              >
                {interestId === req.id ? 'Contactando...' : 'Me interesa'}
              </button>
              <button 
                onClick={() => onRecommend(req.id)}
                className="btn-provider-recommend"
                title="Recomendar a un colega si no es de tu especialidad"
              >
                <Share size={16} /> Recomendar
              </button>
            </div>
          </div>
        ))}
        {opportunities.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px', background: 'var(--color-surface)', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No hay más oportunidades nuevas</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Te notificaremos cuando alguien publique una solicitud cerca de ti.</p>
          </div>
        )}
      </div>

    </div>
  );
};
