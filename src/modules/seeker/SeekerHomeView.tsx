import React, { useId, useRef, useState } from 'react';
import { Search, MapPin, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import type { Worker, TradeCategory } from '../../types';
import type { Coordinates } from '../../utils/geo';
import { PageHero } from '../../components/layout/PageHero';
import { useReveal } from '../../hooks/useReveal';
import { saveRequestDraft } from '../requests/requestDraft';
import { SeekerDirectory } from './SeekerDirectory';
import './Seeker.css';

interface SeekerHomeViewProps {
  workers: Worker[];
  userLocation: Coordinates;
  onSelectWorker: (worker: Worker) => void;
  onOpenSendRequest: (workers?: Worker[]) => void;
  onChangeTradeCategory: (trade?: TradeCategory) => void;
}

const QUICK_PROBLEMS = ['Gotera en el baño', 'Cambiar una chapa', 'Pintar una habitación', 'Wi-Fi lento'];

export const SeekerHomeView: React.FC<SeekerHomeViewProps> = ({
  workers,
  userLocation,
  onSelectWorker,
  onOpenSendRequest,
  onChangeTradeCategory
}) => {
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [showError, setShowError] = useState(false);
  useReveal(rootRef);

  const handlePostRequest = () => {
    if (!problemDescription.trim()) {
      setShowError(true);
      inputRef.current?.focus();
      return;
    }
    saveRequestDraft(problemDescription.trim());
    onOpenSendRequest();
  };

  const visible = workers.filter(w => !w.isPaused);
  const availableCount = visible.filter(w => w.available).length;
  const verifiedCount = visible.filter(w => w.verified).length;
  const rated = visible.filter(w => w.reviewCount > 0);
  const avgRating = rated.length ? rated.reduce((sum, w) => sum + w.rating, 0) / rated.length : 0;
  const errorId = `${uid}-error`;

  return (
    <div className="seeker-home" ref={rootRef}>
      <PageHero
        tone="marino"
        className="seeker-home__hero"
        eyebrow={<><MapPin size={14} aria-hidden="true" /> Bogotá D.C. · {availableCount} disponibles ahora</>}
        title={<>Encuentra a tu<br />experto</>}
        subtitle="Cuéntanos qué necesitas solucionar y te conectamos con oficios verificados cerca de ti."
      >
        <form
          className="seeker-hero-search"
          role="search"
          noValidate
          onSubmit={e => {
            e.preventDefault();
            handlePostRequest();
          }}
        >
          <label htmlFor={`${uid}-q`} className="seeker-hero-search__label">¿Qué necesitas solucionar?</label>
          <div className="seeker-hero-search__pill">
            <Search size={22} className="seeker-hero-search__icon" aria-hidden="true" />
            <input
              ref={inputRef}
              id={`${uid}-q`}
              type="text"
              className="seeker-hero-search__input"
              placeholder="Ej. se me daña la luz de la cocina"
              autoComplete="off"
              value={problemDescription}
              aria-invalid={showError && !problemDescription.trim() ? true : undefined}
              aria-describedby={showError ? errorId : undefined}
              onChange={e => {
                setProblemDescription(e.target.value);
                if (e.target.value.trim()) setShowError(false);
              }}
            />
            <button type="submit" className="btn btn-primary seeker-hero-search__submit">
              <span className="seeker-hero-search__submit-text">Solicitar</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          {showError && (
            <p id={errorId} className="seeker-hero-search__error" role="alert">
              Escribe en pocas palabras qué necesitas para avisar a los expertos.
            </p>
          )}
          <div className="seeker-hero-suggest" role="group" aria-label="Ideas rápidas">
            {QUICK_PROBLEMS.map(text => (
              <button
                key={text}
                type="button"
                className="seeker-hero-suggest__chip"
                onClick={() => {
                  setProblemDescription(text);
                  setShowError(false);
                  inputRef.current?.focus();
                }}
              >
                {text}
              </button>
            ))}
          </div>
        </form>

        <dl className="seeker-hero-stats">
          <div>
            <dt>Disponibles ahora</dt>
            <dd><span className="seeker-live-dot" aria-hidden="true" />{availableCount}</dd>
          </div>
          <div>
            <dt>Verificados</dt>
            <dd><ShieldCheck size={18} aria-hidden="true" />{verifiedCount}</dd>
          </div>
          <div>
            <dt>Reputación media</dt>
            <dd><Star size={18} aria-hidden="true" />{avgRating ? avgRating.toFixed(1) : '—'}</dd>
          </div>
        </dl>
      </PageHero>

      <section className="seeker-home__nearby" aria-labelledby="seeker-home-nearby">
        <header className="seeker-home__head" data-reveal>
          <span className="seeker-home__kicker">
            <span className="seeker-live-dot" aria-hidden="true" /> En vivo cerca de ti
          </span>
          <h2 id="seeker-home-nearby" className="seeker-home__title">
            Profesionales disponibles cerca de ti
          </h2>
          <p className="seeker-home__sub">Filtra por oficio, distancia, tarifa y reputación verificada.</p>
        </header>

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
