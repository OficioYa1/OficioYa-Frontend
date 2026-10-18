import { useEffect, useRef, useState } from 'react';
import { Check, Minus, Play, Star, X } from 'lucide-react';
import { assetUrl } from '../../utils/assets';
import { TRADE_LABELS } from '../../utils/workerProfile';
import { formatCOP } from '../../utils/formatters';
import { INITIAL_WORKERS } from '../../services/mockData';
import { StrokeText } from '../../components/ui';
import type { TradeCategory } from '../../types';
import './LandingStory.css';

export const MEDIA = {
  trailer: assetUrl('assets/media/trailer.mp4'),
  trailerLoop: assetUrl('assets/media/trailer-loop.mp4'),
  trailerLoopWebm: assetUrl('assets/media/trailer-loop.webm'),
  trailerPoster: assetUrl('assets/media/paso-1-fuga.webp'),
  loopPoster: assetUrl('assets/media/trailer-loop-poster.webp'),
  step1: assetUrl('assets/media/paso-1-fuga.webp'),
  step2: assetUrl('assets/media/paso-2-many-mapa.webp'),
  step3: assetUrl('assets/media/paso-3-resuelto.webp'),
  pro: assetUrl('assets/media/profesional-reparando.webp'),
} as const;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Video del hero: bucle mudo; con movimiento reducido queda la portada ── */
export function HeroVideo({ onOpenTrailer }: { onOpenTrailer: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;
    // Solo se reproduce mientras se ve: ahorra datos y batería en el celular
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => undefined);
      else video.pause();
    }, { threshold: 0.25 });
    obs.observe(video);
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <figure className="ls-hero-video">
      {reduced ? (
        <img src={MEDIA.loopPoster} alt="Many aparece listo para ayudar en una cocina inundada" />
      ) : (
        <video
          ref={ref}
          poster={MEDIA.loopPoster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Many encuentra un plomero cerca y el problema queda resuelto"
        >
          <source src={MEDIA.trailerLoopWebm} type="video/webm" />
          <source src={MEDIA.trailerLoop} type="video/mp4" />
        </video>
      )}
      <button type="button" className="ls-play" onClick={onOpenTrailer}>
        <span className="ls-play__icon" aria-hidden="true"><Play size={16} fill="currentColor" /></span>
        Ver cómo funciona
      </button>
    </figure>
  );
}

/* ── Trailer completo en un diálogo nativo (Escape lo cierra, foco atrapado) ── */
export function TrailerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      videoRef.current?.play().catch(() => undefined);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="ls-dialog"
      aria-label="Video: así funciona OficioYa"
      onClose={() => { videoRef.current?.pause(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) ref.current?.close(); }}
    >
      <div className="ls-dialog__frame">
        <button type="button" className="ls-dialog__close" onClick={() => ref.current?.close()} aria-label="Cerrar video">
          <X size={20} />
        </button>
        <video ref={videoRef} src={MEDIA.trailer} poster={MEDIA.trailerPoster} controls playsInline preload="none" />
      </div>
    </dialog>
  );
}

/* ── Cómo funciona: tres escenas del trailer ── */
const STEPS = [
  { img: MEDIA.step1, title: 'Se daña algo en casa', text: 'Una fuga, un corto o una puerta trabada. Abres OficioYa desde el celular.', alt: 'Una vecina preocupada mira una fuga en su cocina' },
  { img: MEDIA.step2, title: 'Many te muestra quién está cerca', text: 'Ves profesionales de tu zona con su distancia, tarifa y reseñas por oficio.', alt: 'Many sobre un mapa con los profesionales cercanos' },
  { img: MEDIA.step3, title: 'Lo resuelves y pagas directo', text: 'Acuerdan el precio por chat y le pagas al profesional, sin comisiones.', alt: 'La vecina y el plomero se dan la mano junto a Many' },
];

export function HowItWorks() {
  return (
    <section className="ls-section ls-how" id="como-funciona" aria-labelledby="ls-how-title">
      <div className="lp-wrap">
        <span className="ls-kicker">Cómo funciona</span>
        <h2 id="ls-how-title" className="oy-display ls-title">
          <StrokeText text="Tres pasos," tone="cacao" trigger="scroll" fontSize={64} />{' '}
          <StrokeText text="cero vueltas." tone="cacao" trigger="scroll" fontSize={64} />
        </h2>
        <ol className="ls-steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="ls-step oy-lift">
              <img src={s.img} alt={s.alt} loading="lazy" decoding="async" width={1280} height={720} />
              <div className="ls-step__body">
                <span className="ls-step__num" aria-hidden="true">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Reputación por oficio (Composite + Strategy) con datos reales de la app ── */
export function TradeReputation({ onExplore }: { onExplore: () => void }) {
  const carlos = INITIAL_WORKERS.find(w => w.id === 'w-2');
  const trades = Object.entries(carlos?.ratingByTrade ?? {}) as [TradeCategory, { rating: number; reviewCount: number }][];
  if (!carlos || trades.length === 0) return null;

  return (
    <section className="ls-section ls-rep" aria-labelledby="ls-rep-title">
      <div className="lp-wrap ls-rep__grid">
        <div>
          <span className="ls-kicker">Reputación justa</span>
          <h2 id="ls-rep-title" className="oy-display ls-title">Una persona, varios oficios, una nota por cada uno.</h2>
          <p className="ls-lead">
            Si buscas plomero, ves su nota como plomero. Las reseñas de un oficio no inflan ni hunden la de otro.
          </p>
          <button type="button" className="ls-link-btn" onClick={onExplore}>Ver profesionales</button>
        </div>
        <article className="ls-rep__card" aria-label={`Reputación de Don ${carlos.name}`}>
          <header>
            <span className="ls-rep__avatar" aria-hidden="true">{carlos.initials}</span>
            <div>
              <strong>Don {carlos.name}</strong>
              <span>{carlos.completedJobsCount} trabajos completados</span>
            </div>
          </header>
          <ul>
            {trades.map(([trade, rep]) => (
              <li key={trade}>
                <span>{TRADE_LABELS[trade]}</span>
                <span className="ls-rep__score">
                  <Star size={16} fill="var(--color-star)" color="var(--oy-cacao-profundo)" aria-hidden="true" />
                  {rep.rating.toFixed(1)}
                  <small>({rep.reviewCount} reseñas)</small>
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

/* ── Comparador: WhatsApp en neutro, nunca en rojo ── */
const COMPARE: [string, string, string][] = [
  ['¿Sabes quién es?', 'Depende de quién responda', 'Perfil con oficio, zona y sello de identidad'],
  ['¿Ves trabajos anteriores?', 'Casi nunca', 'Fotos de trabajos en su perfil'],
  ['¿Las reseñas son reales?', 'No hay reseñas', 'Solo de clientes con un servicio completado'],
  ['¿Sabes qué tan cerca está?', 'No', 'Distancia real desde tu zona'],
  ['¿Cuánto cuesta usarlo?', 'Gratis', 'Gratis, 0 % de comisión'],
];

export function Comparison() {
  const [side, setSide] = useState<'whatsapp' | 'oficioya'>('oficioya');
  return (
    <section className="ls-section ls-compare" aria-labelledby="ls-compare-title">
      <div className="lp-wrap">
        <span className="ls-kicker">La diferencia</span>
        <h2 id="ls-compare-title" className="oy-display ls-title">Buscar a ciegas en WhatsApp o contratar con OficioYa.</h2>
        <div className="ls-compare__switch" role="group" aria-label="Columna visible en el celular">
          <button type="button" aria-pressed={side === 'whatsapp'} onClick={() => setSide('whatsapp')}>Grupos de WhatsApp</button>
          <button type="button" aria-pressed={side === 'oficioya'} onClick={() => setSide('oficioya')}>OficioYa</button>
        </div>
        <table className="ls-compare__table" data-side={side}>
          <thead>
            <tr>
              <th scope="col"><span className="ls-sr-only">Pregunta</span></th>
              <th scope="col" className="ls-col-wa">Grupos de WhatsApp</th>
              <th scope="col" className="ls-col-oy">OficioYa</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE.map(([q, wa, oy]) => (
              <tr key={q}>
                <th scope="row">{q}</th>
                <td className="ls-col-wa"><Minus size={16} aria-hidden="true" /> {wa}</td>
                <td className="ls-col-oy"><Check size={16} aria-hidden="true" /> {oy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ── Calculadora para profesionales: lo que cobras es lo que recibes ── */
export function EarningsCalculator() {
  const [amount, setAmount] = useState(80000);
  return (
    <div className="ls-calc">
      <label htmlFor="ls-calc-input">Si cobras</label>
      <div className="ls-calc__row">
        <span aria-hidden="true">$</span>
        <input
          id="ls-calc-input"
          type="number"
          inputMode="numeric"
          min={0}
          step={5000}
          value={amount}
          onChange={e => setAmount(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>
      <p aria-live="polite">
        te quedas con <strong>{formatCOP(amount)}</strong>. OficioYa no cobra comisión.
      </p>
    </div>
  );
}

export function ProImage() {
  return <img className="ls-pro-img" src={MEDIA.pro} alt="Un plomero repara una tubería en una cocina" loading="lazy" decoding="async" />;
}

