import React, { useState } from 'react';
import { Zap, Wrench, Paintbrush, Key, MapPin } from 'lucide-react';
import type { Worker, TradeCategory } from '../../types';
import type { Coordinates } from '../../utils/geo';
import { PageHero } from '../../components/layout/PageHero';
import { Seek } from '../../components/ui';
import { SeekerDirectory } from './SeekerDirectory';
import './Seeker.css';

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

  const handlePostRequest = () => {
    if (!problemDescription) return;
    onOpenSendRequest();
  };

  const availableCount = workers.filter(w => w.available && !w.isPaused).length;

  return (
    <div className="seeker-home">
      <PageHero
        tone="marino"
        eyebrow={<><MapPin size={14} aria-hidden="true" /> Bogotá D.C. · {availableCount} disponibles ahora</>}
        title={<>Encuentra a tu<br />experto</>}
        subtitle="Cuéntanos qué necesitas solucionar y te conectamos con oficios verificados cerca de ti."
        stickers={[
          { icon: <Zap size={26} />, tone: 'amarillo', style: { top: '12%', right: '6%', rotate: '-10deg' } },
          { icon: <Wrench size={26} />, tone: 'esmeralda', style: { top: '40%', right: '16%', rotate: '9deg' } },
          { icon: <Paintbrush size={26} />, tone: 'fuego', style: { top: '10%', right: '26%', rotate: '5deg' } },
          { icon: <Key size={24} />, tone: 'almendra', style: { top: '44%', right: '3%', rotate: '-6deg' } }
        ]}
      >
        <div className="seeker-hero-search-wrap">
          <Seek
            placeholder="¿Qué necesitas solucionar?"
            value={problemDescription}
            onChange={setProblemDescription}
            onSearch={handlePostRequest}
            width={480}
          />
        </div>
      </PageHero>

      <section aria-labelledby="seeker-home-nearby">
        <div className="oy-section-head seeker-home__head">
          <div>
            <h2 id="seeker-home-nearby" className="oy-section-title seeker-home__title">
              <span className="seeker-live-dot" aria-hidden="true" />
              Profesionales disponibles cerca de ti
            </h2>
            <p className="oy-section-sub">Filtra por oficio, zona, tarifa y reputación verificada.</p>
          </div>
        </div>

        <SeekerDirectory
          workers={workers}
          userLocation={userLocation}
          onSelectWorker={onSelectWorker}
          onOpenSendRequest={onOpenSendRequest}
          onChangeTradeCategory={onChangeTradeCategory}
          showHero={false}
        />
      </section>
    </div>
  );
};
