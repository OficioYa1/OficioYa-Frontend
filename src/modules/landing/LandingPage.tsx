import React, { useState, useEffect, useRef } from 'react';
import type { TradeCategory } from '../../types';
import {
  Wrench, Zap, PaintBucket, KeyRound, MapPin,
  ArrowRight, UserCheck, Award, Star, Tv2, BookOpen,
  CheckCircle2, TrendingUp, Plus, Minus,
} from 'lucide-react';
import './LandingPage.css';
import './LandingSticker.css';
import { AppFooter } from '../../components/layout/AppFooter';
import { TrueFocus } from '../../components/ui/TrueFocus';
import { BRAND_ASSETS } from '../../utils/assets';
import { PixelSwap } from '../../components/ui/PixelSwap';
import { StrokeText, BorderGlow, DriftWall } from '../../components/ui';
import type { DriftWallItem } from '../../components/ui';
import { INITIAL_WORKERS } from '../../services/mockData';

const PlasmaWarp = React.lazy(() => import('../../components/background/PlasmaWarp'));

interface LandingPageProps { onEnterApp: (role?: 'seeker' | 'provider') => void; }

interface TradeOption {
  key: TradeCategory; label: string; icon: React.ReactNode;
  tagline: string;
}

const TRADES: TradeOption[] = [
  { key: 'electricidad',    label: 'Electricidad',    icon: <Zap size={15} />,        tagline: 'Instalaciones eléctricas, cableado y circuitos seguros.' },
  { key: 'plomeria',        label: 'Plomería',        icon: <Wrench size={15} />,      tagline: 'Destapes, fugas y redes hidráulicas con garantía de trabajo.' },
  { key: 'pintura',         label: 'Pintura',         icon: <PaintBucket size={15} />, tagline: 'Acabados finos y pintura arquitectónica para tu hogar.' },
  { key: 'cerrajeria',      label: 'Cerrajería',      icon: <KeyRound size={15} />,    tagline: 'Aperturas de emergencia 24 horas, sin daño a tus cerraduras.' },
  { key: 'electrodomesticos', label: 'Electrodomésticos', icon: <Tv2 size={15} />,    tagline: 'Reparación de lavadoras, neveras y aires acondicionados.' },
  { key: 'clases',          label: 'Clases',          icon: <BookOpen size={15} />,    tagline: 'Profesores particulares verificados para todas las materias.' },
];

const STATS = [
  { label: 'Profesionales activos',  value: '2.400+',  icon: <UserCheck size={22} />,    tone: 'trust' },
  { label: 'Servicios completados',  value: '18.000+', icon: <CheckCircle2 size={22} />, tone: 'status' },
  { label: 'Calificación promedio',  value: '4.8 / 5', icon: <Star size={22} />,         tone: 'accent' },
  { label: 'Tiempo de respuesta',    value: '< 20 min',icon: <TrendingUp size={22} />,   tone: 'action' },
];

const FAQS = [
  { q: '¿Cómo verifican a los profesionales?', a: 'Validamos antecedentes judiciales, revisamos su cédula de ciudadanía y requerimos al menos 3 reseñas de clientes reales antes de activar su perfil.' },
  { q: '¿Cuánto cobra OficioYa de comisión?', a: 'Cero. El trato es 100% directo entre tú y el profesional. OficioYa no cobra comisiones ni intermediaciones.' },
  { q: '¿Puedo contratar para hoy mismo?', a: 'Sí. El filtro de disponibilidad te muestra únicamente quienes están activos en este momento y pueden atenderte hoy.' },
  { q: '¿En qué zonas de Bogotá funciona?', a: 'Actualmente operamos en todas las localidades de Bogotá D.C. y municipios del área metropolitana como Chía, Soacha y Cota.' },
];

// Fotos de portafolio de los trabajadores semilla (sin repetir URL).
const PORTFOLIO: DriftWallItem[] = (() => {
  const seen = new Set<string>();
  const out: DriftWallItem[] = [];
  INITIAL_WORKERS.forEach(w => w.gallery.forEach(url => {
    if (seen.has(url)) return;
    seen.add(url);
    out.push({ image: url, title: `${w.tradeLabel}: trabajo de ${w.name}` });
  }));
  return out;
})();

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  // Sin IntersectionObserver o con movimiento reducido, el contenido se muestra de una vez.
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const el = ref.current; if (!el || visible) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// Texto con efecto hover de color (solo con puntero fino, ver LandingSticker.css)
type HoverTone = 'action' | 'trust' | 'accent' | 'status' | 'energy';
function HoverText({ children, tone = 'action' }: { children: React.ReactNode; tone?: HoverTone }) {
  return <span className={`lp-hover lp-hover--${tone}`}>{children}</span>;
}

// Item desplegable FAQ
// Many cambia de pose por píxeles al elegir un oficio: dos caras que se
// alternan, la entrante recibe la pose nueva y PixelSwap la revela.
function ManySwap({ src, alt, imgClassName, onClick }: { src: string; alt: string; imgClassName: string; onClick: () => void }) {
  const [faces, setFaces] = useState<[{ src: string; alt: string }, { src: string; alt: string }]>([{ src, alt }, { src, alt }]);
  const [front, setFront] = useState(false);

  useEffect(() => {
    const shown = faces[front ? 1 : 0];
    if (shown.src === src) return;
    const next = !front;
    setFaces(prev => {
      const copy: typeof prev = [prev[0], prev[1]];
      copy[next ? 1 : 0] = { src, alt };
      return copy;
    });
    setFront(next);
  }, [src]);

  const face = (f: { src: string; alt: string }) => (
    <img src={f.src} alt={f.alt} className={imgClassName} onClick={onClick} draggable={false} />
  );

  return (
    <PixelSwap
      className="lp-many-swap"
      firstContent={face(faces[0])}
      secondContent={face(faces[1])}
      active={front}
      trigger="manual"
      aspectRatio="1 / 1"
      pattern="bottom-to-top"
      randomness={0.35}
      pixelSize={22}
      pixelRadius={0}
      pixelScale={0.2}
      duration={760}
      pixelDuration={320}
      fadeOutgoing
    />
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lp-faq-item" data-open={open ? '' : undefined}>
      <button type="button" className="lp-faq-q" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <span className="lp-faq-icon" aria-hidden="true">{open ? <Minus size={18} /> : <Plus size={18} />}</span>
      </button>
      <div className="lp-faq-fold">
        <div className="lp-faq-fold-inner">
          <p className="lp-faq-a">{a}</p>
        </div>
      </div>
    </div>
  );
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [selectedTrade, setSelectedTrade] = useState<TradeCategory>('electricidad');
  const [manyAnimate, setManyAnimate] = useState<'float' | 'wave'>('float');
  const [heroVisible, setHeroVisible] = useState(false);

  const statsReveal  = useReveal();
  const stepsReveal  = useReveal();
  const faqReveal    = useReveal();
  const ctaReveal    = useReveal();

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleStartAsSeeker   = () => onEnterApp('seeker');
  const handleStartAsProvider = () => onEnterApp('provider');

  const handleTradeSelect = (trade: TradeCategory) => {
    setSelectedTrade(trade);
    setManyAnimate('wave');
    setTimeout(() => setManyAnimate('float'), 800);
  };
  const triggerWave = () => { setManyAnimate('wave'); setTimeout(() => setManyAnimate('float'), 800); };
  const currentTrade = TRADES.find(t => t.key === selectedTrade)!;

  return (
    <div className="lp-root">

      {/* ── MARQUESINA (único movimiento continuo, estilo sticker) ── */}
      <div className="lp-marquee" aria-hidden="true">
        <div className="lp-marquee-track">
          {[0, 1].map(copy => (
            <span key={copy} className="lp-marquee-run">
              {['Plomería', 'Electricidad', 'Pintura', 'Cerrajería', 'Electrodomésticos', 'Clases', 'Reputación verificada', 'Pago directo'].map(w => (
                <span key={w} className="lp-marquee-item">{w}<span className="lp-marquee-dot">✦</span></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <div className="lp-brand">
            <img src={BRAND_ASSETS.logo} alt="OficioYa" className="lp-brand-logo" />
            <div>
              <span className="lp-brand-name">Oficio<span className="lp-brand-ya">Ya</span></span>
              <span className="lp-brand-tagline">Directorio Inteligente</span>
            </div>
          </div>

          {/* Nav links con hover de color — sin recuadros */}
          <div className="lp-nav-actions">
            <button type="button" className="lp-nav-link" onClick={handleStartAsSeeker}>Buscar</button>
            <button type="button" className="lp-nav-link" onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })}>Preguntas</button>
            <button type="button" className="lp-nav-link" onClick={handleStartAsProvider}>Para trabajadores</button>
            <button onClick={handleStartAsSeeker} className="lp-btn-cta">
              Explorar <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={`lp-hero lp-hero-band ${heroVisible ? 'lp-hero--in' : ''}`}>
        {/* Stickers decorativos con la paleta del manual (estáticos, rotados) */}
        <div className="lp-stickers" aria-hidden="true">
          <span className="lp-sticker lp-sticker--amarillo lp-sticker--a"><Wrench size={28} /></span>
          <span className="lp-sticker lp-sticker--esmeralda lp-sticker--b"><UserCheck size={26} /></span>
          <span className="lp-sticker lp-sticker--fuego lp-sticker--c"><Zap size={26} /></span>
          <span className="lp-sticker lp-sticker--marino lp-sticker--d"><Award size={26} /></span>
          <span className="lp-sticker lp-sticker--almendra lp-sticker--pill lp-sticker--e">★ 4.9</span>
        </div>

        {/* Badge ciudad — texto suelto, sin recuadro opaco */}
        <div className="lp-hero-city">
          <span className="lp-hero-city-dot" />
          Bogotá D.C.
        </div>

        {/* Wordmark */}
        <h1 className="oy-display lp-wordmark" aria-label="OficioYa">
          <span className="lp-wordmark-oficio">Oficio</span>
          <span className="lp-wordmark-ya">Ya</span>
        </h1>

        {/* Eslogan */}
        <div className="lp-hero-slogan">
          <TrueFocus
            sentence="El talento de tu zona a un click de distancia"
            blurAmount={3}
            borderColor="var(--stroke-ink)"
            animationDuration={0.4}
          />
        </div>

        {/* Texto descriptivo — sin recuadro, flotante */}
        <p className="lp-hero-copy">
          Plomeros, electricistas, pintores y más — con{' '}
          <span className="lp-hero-copy-strong"><HoverText>reputación verificada</HoverText></span>
          {' '}y geolocalización en tiempo real.
        </p>

        {/* CTAs */}
        <div className="lp-hero-ctas">
          <BorderGlow animated>
            <button
              onClick={handleStartAsSeeker}
              className="lp-hero-btn-primary"
            >
              Buscar expertos
            </button>
          </BorderGlow>
          <button
            onClick={handleStartAsProvider}
            className="lp-hero-btn-ghost"
          >
            Soy trabajador independiente
          </button>
        </div>

        {/* Many mascot */}
        <div className="lp-hero-many">

          <ManySwap
            src={selectedTrade === 'plomeria' ? BRAND_ASSETS.manyPlomero : selectedTrade === 'electricidad' ? BRAND_ASSETS.manyElectricista : BRAND_ASSETS.manyWave}
            alt={selectedTrade === 'plomeria' ? 'Many plomero' : selectedTrade === 'electricidad' ? 'Many electricista' : 'Many saludando'}
            imgClassName={`lp-many-hero-img ${manyAnimate === 'wave' ? 'lp-many-waving' : ''}`}
            onClick={triggerWave}
          />

          {/* Tagline del oficio — texto suelto */}
          <p className="lp-hero-tagline">
            {currentTrade.tagline}
          </p>

          {/* Selector oficios */}
          <div className="lp-trade-row">
            {TRADES.map(t => (
              <button
                key={t.key}
                onClick={() => handleTradeSelect(t.key)}
                className="lp-trade-chip"
                aria-pressed={selectedTrade === t.key}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS — texto flotante, sin cards ── */}
      <div ref={statsReveal.ref} className={`lp-numbers ${statsReveal.visible ? 'lp-numbers--in' : ''}`}>
        <div className="lp-wrap">
          {/* Título suelto, sin recuadro */}
          <p className="lp-numbers-kicker">
            OficioYa en números
          </p>
          <div className="lp-numbers-grid">
            {STATS.map((s, i) => (
              <div key={s.label} className="lp-number" style={{ '--lp-i': i } as React.CSSProperties}>
                <div className={`lp-number-value lp-number-value--${s.tone}`}>
                  {s.value}
                </div>
                <div className="lp-number-label">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CÓMO FUNCIONA ── */}
      <section ref={stepsReveal.ref} className={`lp-how ${stepsReveal.visible ? 'lp-how--in' : ''}`}>
        <div className="lp-wrap">
          {/* Título + subtítulo sueltos */}
          <div className="lp-how-head">
            <p className="lp-how-kicker">
              Simple y transparente
            </p>
            <h2 className="lp-stroke-title lp-how-title">
              <StrokeText text="Tres pasos," trigger="scroll" fontSize={56} />{' '}
              <StrokeText text="cero intermediarios." trigger="scroll" fontSize={56} />
            </h2>
            <p className="lp-how-sub">
              Sin comisiones ocultas, sin grupos de WhatsApp incómodos.
            </p>
          </div>

          <div className="lp-how-grid">
            {([
              { n: '01', icon: <MapPin size={22} />, tone: 'trust', title: 'Búsqueda hiperlocal', desc: 'Activa tu GPS o selecciona tu localidad. Ves en tiempo real quién está disponible a menos de 2 km.' },
              { n: '02', icon: <Award size={22} />, tone: 'accent', title: 'Reputación verificada', desc: 'Calificaciones reales de vecinos, fotos de trabajos terminados y antecedentes validados.' },
              { n: '03', icon: <UserCheck size={22} />, tone: 'status', title: 'Trato directo', desc: 'Contactas, acordás la tarifa y pagás en efectivo, transferencia o Bre-B. Sin intermediarios.' },
            ] as const).map((s, i) => (
              <div
                key={s.n}
                className={`lp-how-card lp-how-card--${s.tone}`}
                style={{ '--lp-i': i } as React.CSSProperties}
              >
                {/* Número decorativo — sin recuadro */}
                <span className="lp-how-n" aria-hidden="true">
                  {s.n}
                </span>
                <div className="lp-how-icon">
                  {s.icon}
                </div>
                {/* Título hover color */}
                <h3 className="lp-how-card-title">
                  <HoverText tone={s.tone}>{s.title}</HoverText>
                </h3>
                <p className="lp-how-card-desc">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRABAJOS REALES: muro de portafolio ── */}
      <section className="lp-work" aria-labelledby="lp-work-title">
        <div className="lp-wrap lp-work-head">
          <span className="lp-sticker lp-sticker--esmeralda lp-sticker--pill">Portafolio verificado</span>
          <h2 id="lp-work-title" className="oy-display lp-work-title">Trabajos reales en Bogotá</h2>
          <p className="lp-work-sub">
            Fotos de obras terminadas por los profesionales de OficioYa. Pasa el puntero para detener el muro o elige una para buscar expertos.
          </p>
        </div>
        <div className="lp-wrap">
          <div className="lp-work-wall">
            <DriftWall
              items={PORTFOLIO}
              ariaLabel="Fotos de trabajos realizados"
              onItemClick={handleStartAsSeeker}
            />
          </div>
        </div>
      </section>

      {/* ── FAQ DESPLEGABLE ── */}
      <section id="faq-section" ref={faqReveal.ref} className="lp-faq">
        <div className="lp-wrap lp-faq-wrap">
          <span className="lp-sticker lp-sticker--amarillo lp-sticker--pill">Preguntas frecuentes</span>
          <h2 className="oy-display lp-faq-title">
            <StrokeText text="Todo lo que" tone="cacao" trigger="scroll" fontSize={64} />{' '}
            <StrokeText text="necesitas saber." tone="cacao" trigger="scroll" fontSize={64} />
          </h2>

          <div className={`lp-faq-list ${faqReveal.visible ? 'lp-faq-list--in' : ''}`}>
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>

          <p className="lp-faq-more">
            ¿Tienes otra pregunta?{' '}
            <button type="button" className="lp-faq-link" onClick={handleStartAsSeeker}>
              Contáctanos desde la app
            </button>
          </p>
        </div>
      </section>

      {/* ── CTA WORKER ── */}
      <section ref={ctaReveal.ref} className={`lp-cta-dark ${ctaReveal.visible ? 'lp-reveal' : ''}`}>
        <div className="lp-wrap">
          <div className="lp-cta-card">
            <React.Suspense fallback={null}>
              <PlasmaWarp className="lp-cta-warp" />
            </React.Suspense>
            <div className="lp-cta-mascot-col">
              <div className="lp-cta-glow" />
              <img src={BRAND_ASSETS.manyWave} alt="Many" className="lp-cta-mascot-img" />
              <div className="lp-cta-badge-pill">
                <CheckCircle2 size={14} className="lp-cta-badge-icon" />
                <span>100% de tus ingresos son tuyos</span>
              </div>
            </div>

            <div className="lp-cta-content-col">
              {/* Eyebrow — texto suelto sin recuadro */}
              <span className="lp-cta-kicker">
                Para técnicos y profesionales
              </span>
              <h2 className="lp-cta-title">¿Eres trabajador independiente?</h2>
              <p className="lp-cta-desc">
                Publica tus servicios, activa tu disponibilidad y conecta con clientes verificados en tu zona.
              </p>

              {/* Beneficios — texto suelto, solo con punto de color */}
              <div className="lp-cta-list">
                {[
                  'Cobro 100% directo con el cliente',
                  'Control de tus horarios y zona de cobertura',
                  'Calificaciones verificadas para ganar más clientes',
                ].map((b, i) => (
                  <div key={i} className="lp-cta-list-item">
                    <span className="lp-cta-list-dot" />
                    <span className="lp-cta-list-text">
                      <HoverText tone="energy">{b}</HoverText>
                    </span>
                  </div>
                ))}
              </div>

              <div className="lp-cta-actions-row">
                <BorderGlow>
                  <button onClick={handleStartAsProvider} className="lp-cta-primary lp-cta-amber">
                    Empezar gratis <ArrowRight size={16} />
                  </button>
                </BorderGlow>
                <span className="lp-cta-note">
                  Sin tarjeta de crédito
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <AppFooter />
    </div>
  );
};
