import React from 'react';
import { MapPin, ShieldCheck, Zap, Star } from 'lucide-react';
import './LivePulseTicker.css';

export interface LivePulseTickerProps {
  onSelectTrade?: (trade: string) => void;
}

interface PulseEvent {
  id: string;
  workerName: string;
  trade: string;
  tradeKey: string;
  action: string;
  zone: string;
  timeAgo: string;
  tagTone: 'esmeralda' | 'marino' | 'fuego';
  rating?: number;
}

const PULSE_EVENTS: PulseEvent[] = [
  {
    id: 'p1',
    workerName: 'Mateo Gómez',
    trade: 'Electricidad',
    tradeKey: 'electricidad',
    action: 'se conectó Disponible Ya',
    zone: 'Chapinero',
    timeAgo: 'hace 3 min',
    tagTone: 'esmeralda'
  },
  {
    id: 'p2',
    workerName: 'Don Carlos Mendoza',
    trade: 'Plomería',
    tradeKey: 'plomeria',
    action: 'completó cambio de tubería con 5.0',
    zone: 'Usaquén',
    timeAgo: 'hace 8 min',
    tagTone: 'marino',
    rating: 5.0
  },
  {
    id: 'p3',
    workerName: 'Luis Fernando Ortiz',
    trade: 'Pintura',
    tradeKey: 'pintura',
    action: 'aceptó solicitud de acabados',
    zone: 'Cedritos',
    timeAgo: 'hace 14 min',
    tagTone: 'fuego'
  },
  {
    id: 'p4',
    workerName: 'Jorge Ramírez',
    trade: 'Cerrajería',
    tradeKey: 'cerrajeria',
    action: 'apertura de chapa en 12 min',
    zone: 'Teusaquillo',
    timeAgo: 'hace 21 min',
    tagTone: 'esmeralda'
  },
  {
    id: 'p5',
    workerName: 'Claudia Morales',
    trade: 'Modistería',
    tradeKey: 'costura',
    action: 'recibió reseña con Trabajo Verificado',
    zone: 'Suba',
    timeAgo: 'hace 28 min',
    tagTone: 'marino',
    rating: 4.9
  }
];

export const LivePulseTicker: React.FC<LivePulseTickerProps> = ({ onSelectTrade }) => {
  // Duplicar lista para efecto infinito continuo sin saltos
  const loopEvents = [...PULSE_EVENTS, ...PULSE_EVENTS];

  return (
    <div className="oy-live-ticker" role="region" aria-label="El pulso de Bogotá en vivo">
      <div className="oy-live-ticker__badge">
        <span className="oy-live-ticker__radar-dot" aria-hidden="true" />
        <span>En Vivo en Bogotá</span>
      </div>

      <div className="oy-live-ticker__track-wrap">
        <div className="oy-live-ticker__track">
          {loopEvents.map((evt, idx) => (
            <div
              key={`${evt.id}-${idx}`}
              className="oy-live-ticker__item"
              onClick={() => onSelectTrade && onSelectTrade(evt.tradeKey)}
              title={`Ver profesionales de ${evt.trade}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSelectTrade) onSelectTrade(evt.tradeKey);
              }}
            >
              <span className={`oy-live-ticker__tag oy-live-ticker__tag--${evt.tagTone}`}>
                {evt.trade}
              </span>
              <strong>{evt.workerName}</strong>
              <span>{evt.action}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, opacity: 0.85 }}>
                <MapPin size={11} aria-hidden="true" /> {evt.zone}
              </span>
              <span style={{ opacity: 0.6, fontSize: '11.5px' }}>({evt.timeAgo})</span>
              {evt.rating && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: 'var(--oy-amarillo-canario)' }}>
                  <Star size={11} fill="currentColor" aria-hidden="true" /> {evt.rating.toFixed(1)}
                </span>
              )}
              <span className="oy-live-ticker__separator" aria-hidden="true">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
