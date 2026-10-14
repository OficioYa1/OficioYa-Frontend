import React, { useState } from 'react';
import { Search, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Worker, TradeCategory, Coordinates } from '../../types';
import { SeekerDirectory } from './SeekerDirectory';

interface SeekerHomeViewProps {
  workers: Worker[];
  userLocation: Coordinates;
  onSelectWorker: (worker: Worker) => void;
  onOpenSendRequest: (workers?: Worker[]) => void;
  onChangeTradeCategory: (trade?: TradeCategory) => void;
}

export const SeekerHomeView: React.FC<SeekerHomeViewProps> = ({
  workers,
  userLocation,
  onSelectWorker,
  onOpenSendRequest,
  onChangeTradeCategory
}) => {
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<TradeCategory | ''>('');
  const [location, setLocation] = useState('Bogotá D.C.');
  const [urgency, setUrgency] = useState('Ahora');

  const handlePostRequest = () => {
    if (!problemDescription) return;
    onOpenSendRequest();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '48px' }}>
      
      {/* HERO SECTION: Buscador Protagonista */}
      <section style={{
        marginTop: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '800px' }}>
          <Search 
            size={28} 
            color="var(--color-text-muted)" 
            style={{ 
              position: 'absolute', 
              left: '24px', 
              top: '50%', 
              transform: 'translateY(-50%)' 
            }} 
          />
          <input
            type="text"
            className="input-base"
            placeholder="¿Qué necesitas solucionar?"
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePostRequest();
            }}
            style={{
              width: '100%',
              height: '80px',
              fontSize: '24px',
              paddingLeft: '72px',
              paddingRight: '24px',
              borderRadius: '40px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-main)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
            }}
          />
        </div>
      </section>

      {/* PROFESIONALES DISPONIBLES CERCA */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Profesionales disponibles cerca de ti
          </h2>
        </div>
        
        {/* Usamos el SeekerDirectory pero podemos filtrar solo los disponibles si queremos.
            Como SeekerDirectory ya tiene todo el diseño editorial orgánico, lo incrustamos y
            luego en App.tsx manejamos las pestañas.
        */}
        <SeekerDirectory
          workers={workers}
          userLocation={userLocation}
          onSelectWorker={onSelectWorker}
          onOpenSendRequest={onOpenSendRequest}
          onChangeTradeCategory={onChangeTradeCategory}
        />
      </section>

    </div>
  );
};
