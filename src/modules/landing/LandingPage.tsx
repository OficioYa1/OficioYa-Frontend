import React, { useState, useEffect, useRef } from 'react';
import type { TradeCategory } from '../../types';
import {
  Wrench, Zap, PaintBucket, KeyRound,
  ArrowRight, Award, Tv2, BookOpen,
  Plus, Minus, Quote, ShieldCheck,
  LogIn, Search, HelpCircle, Briefcase, ChevronDown, Menu, X,
  UserCheck, Star, CheckCircle2
} from 'lucide-react';
import './LandingPage.css';
import './LandingSticker.css';
import './LandingLiquidNav.css';
import { AppFooter } from '../../components/layout/AppFooter';
import { TrueFocus } from '../../components/ui/TrueFocus';
import { BRAND_ASSETS } from '../../utils/assets';
import { PixelSwap } from '../../components/ui/PixelSwap';
import { StrokeText, BorderGlow, DriftWall, CustomCursor, RollingText, RotaryDial, CursorQuickPrompt } from '../../components/ui';
import type { DriftWallItem } from '../../components/ui';
import { EditorialManifesto } from '../../components/landing/EditorialManifesto';
import { AsymmetricShowcase } from '../../components/landing/AsymmetricShowcase';
import { SkillsTrain } from '../../components/landing/SkillsTrain';
import { StickyProcess } from '../../components/landing/StickyProcess';
import { RetroInspector } from '../../components/landing/RetroInspector';
import { PaperBroadsheet } from '../../components/landing/PaperBroadsheet';
import { INITIAL_WORKERS } from '../../services/mockData';
import { ScrollToTop } from '../../components/common/ScrollToTop';

const PlasmaWarp = React.lazy(() => import('../../components/background/PlasmaWarp'));

const TESTIMONIALS = [
  {
    name: 'Camila Restrepo',
    zone: 'Cedritos · Bogotá',
    trade: 'Plomería de emergencia',
    rating: 5,
    comment: 'Tenía una fuga urgente bajo el lavaplatos un domingo a las 8 p.m. Don Carlos llegó en 18 minutos y dejó todo impecable. El trato directo y transparente me dio total tranquilidad.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Andrés Felipe Morales',
    zone: 'Chapinero Alto · Bogotá',
    trade: 'Electricidad e iluminación',
    rating: 5,
    comment: 'Instalaron todo el cableado y luminarias de mi apartamento. Poder revisar las fotos de sus trabajos anteriores antes de contratar fue el factor decisivo. Recomendadísimo.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Valentina Gómez',
    zone: 'Modelia · Bogotá',
    trade: 'Aseo profundo y desinfección',
    rating: 5,
    comment: 'Doña Claudia hizo el aseo de entrega de mudanza. Dejó los tapetes y muebles a vapor como nuevos. Pagué directo por Nequi sin enredos de comisiones ni intermediarios.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  }
];

interface LandingPageProps {
  onEnterApp: (role?: 'seeker' | 'provider') => void;
  onOpenContact?: () => void;
}

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
    const el = ref.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);
  return [ref, visible] as const;
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
  const prevSrcRef = useRef(src);

  useEffect(() => {
    if (prevSrcRef.current === src) return;
    prevSrcRef.current = src;
    const next = !front;
    setFaces(prev => {
      const copy: typeof prev = [prev[0], prev[1]];
      copy[next ? 1 : 0] = { src, alt };
      return copy;
    });
    setFront(next);
  }, [src, alt, front]);

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

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenContact }) => {
  const [selectedTrade, setSelectedTrade] = useState<TradeCategory>('electricidad');
  const [manyAnimate, setManyAnimate] = useState<'float' | 'wave'>('float');
  const [heroVisible, setHeroVisible] = useState(false);
  const [showSearchMenu, setShowSearchMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [faqRef, faqVisible]     = useReveal();
  const [ctaRef, ctaVisible]     = useReveal();

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

      {/* ── NAV LIQUID 3D ── */}
      <nav className={`lp-nav lp-nav--liquid-3d ${mobileNavOpen ? 'lp-nav--mobile-open' : ''}`}>
        <div className="lp-wrap lp-nav-inner">
          <div className="lp-brand">
            <img src={BRAND_ASSETS.logo} alt="OficioYa" className="lp-brand-logo" />
            <div>
              <span className="lp-brand-name">Oficio<span className="lp-brand-ya">Ya</span></span>
              <span className="lp-brand-tagline">Directorio Inteligente</span>
            </div>
          </div>

          {/* Botón hamburguesa para móvil */}
          <button
            type="button"
            className="lp-nav-mobile-toggle"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label={mobileNavOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Nav links con micro-interacciones Liquid 3D */}
          <div className={`lp-nav-actions ${mobileNavOpen ? 'lp-nav-actions--mobile-open' : ''}`}>
            {/* Buscar con submenú desplegable Liquid 3D */}
            <div
              className="lp-nav-item-wrap"
              onMouseEnter={() => setShowSearchMenu(true)}
              onMouseLeave={() => setShowSearchMenu(false)}
            >
              <button
                type="button"
                className={`lp-nav-link lp-nav-link--liquid ${showSearchMenu ? 'lp-nav-link--active' : ''}`}
                onClick={handleStartAsSeeker}
                data-cursor-text="Directorio"
                aria-haspopup="true"
                aria-expanded={showSearchMenu}
              >
                <Search size={15} className="lp-nav-link__icon" aria-hidden="true" />
                <RollingText text="Buscar" alternateText="Directorio" />
                <ChevronDown size={13} className={`lp-nav-chevron ${showSearchMenu ? 'lp-nav-chevron--open' : ''}`} aria-hidden="true" />
              </button>

              {/* Submenú flotante Liquid 3D de oficios */}
              {showSearchMenu && (
                <div className="lp-liquid-menu" role="menu">
                  <div className="lp-liquid-menu__header">
                    <span className="lp-liquid-menu__title">Oficios Verificados en Bogotá</span>
                    <span className="lp-liquid-menu__badge">Sin intermediarios</span>
                  </div>
                  <div className="lp-liquid-menu__grid">
                    {TRADES.map(trade => (
                      <button
                        key={trade.key}
                        type="button"
                        role="menuitem"
                        className="lp-liquid-menu__item"
                        onClick={() => {
                          setSelectedTrade(trade.key);
                          setMobileNavOpen(false);
                          handleStartAsSeeker();
                        }}
                      >
                        <span className="lp-liquid-menu__icon-box">
                          {trade.icon}
                        </span>
                        <div className="lp-liquid-menu__item-text">
                          <span className="lp-liquid-menu__item-label">{trade.label}</span>
                          <span className="lp-liquid-menu__item-sub">{trade.tagline.slice(0, 32)}...</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preguntas */}
            <button
              type="button"
              className="lp-nav-link lp-nav-link--liquid"
              onClick={() => {
                setMobileNavOpen(false);
                document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              data-cursor-text="Dudas"
            >
              <HelpCircle size={15} className="lp-nav-link__icon" aria-hidden="true" />
              <RollingText text="Preguntas" alternateText="FAQ" />
            </button>

            {/* Para trabajadores */}
            <button
              type="button"
              className="lp-nav-link lp-nav-link--liquid"
              onClick={() => {
                setMobileNavOpen(false);
                handleStartAsProvider();
              }}
              data-cursor-text="Trabajar"
            >
              <Briefcase size={15} className="lp-nav-link__icon" aria-hidden="true" />
              <RollingText text="Para trabajadores" alternateText="Ofrecer oficio" />
            </button>

            {/* Iniciar sesión Liquid 3D Button */}
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                handleStartAsSeeker();
              }}
              className="lp-btn-liquid-3d"
              data-cursor-text="Entrar"
              aria-label="Iniciar sesión en OficioYa"
            >
              <span className="lp-btn-liquid-3d__glare" aria-hidden="true" />
              <span className="lp-btn-liquid-3d__content">
                <LogIn size={15} aria-hidden="true" />
                <span>Iniciar sesión</span>
                <ArrowRight size={14} className="lp-btn-liquid-3d__arrow" aria-hidden="true" />
              </span>
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
          <span className="lp-sticker lp-sticker--almendra lp-sticker--pill lp-sticker--e">Verificado</span>
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

      {/* ── MANIFIESTO EDITORIAL (Inspirado en danilodemarco.com) ── */}
      <EditorialManifesto onExplore={handleStartAsSeeker} />

      {/* ── CARAVANA / TREN DE OFICIOS (Inspirado en ollivere.webflow.io) ── */}
      <SkillsTrain onSelectTrade={(trade) => handleTradeSelect(trade as any)} />

      {/* ── METODOLOGÍA SIN VUELTAS: PROCESO STICKY (Inspirado en ollivere.webflow.io) ── */}
      <StickyProcess onStart={handleStartAsSeeker} />

      {/* ── INSPECTOR DE HERRAMIENTAS Y FICHA TÉCNICA 3D (Inspirado en thibaut.cool) ── */}
      <RetroInspector onSelectTrade={(trade) => handleTradeSelect(trade as any)} />

      {/* ── EDICIÓN EDITORIAL IMPRESA / BROADSHEET & CLASIFICADOS (Inspirado en niccolomiranda.com) ── */}
      <PaperBroadsheet onExplore={handleStartAsSeeker} />

      {/* ── SELECTOR MECÁNICO / DISCO TELEFÓNICO (Inspirado en bleibtgleich.dev) ── */}
      <RotaryDial
        onSelectTrade={(category) => {
          if (category !== 'urgencias') {
            handleTradeSelect(category as any);
          }
          handleStartAsSeeker();
        }}
      />

      {/* ── SELECCIÓN EDITORIAL ASIMÉTRICA (Inspirado en danilodemarco.com) ── */}
      <AsymmetricShowcase onSelectWorker={() => handleStartAsSeeker()} />

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

      {/* ── TESTIMONIOS VERIFICADOS (Item 18) ── */}
      <section className="lp-testimonials" aria-labelledby="lp-testimonials-title">
        <div className="lp-wrap">
          <div className="lp-testimonials-head">
            <span className="lp-sticker lp-sticker--esmeralda lp-sticker--pill">Opiniones reales</span>
            <h2 id="lp-testimonials-title" className="oy-display lp-testimonials-title">
              Historias de clientes en Bogotá
            </h2>
            <p className="lp-testimonials-sub">
              Vecinos reales que resolvieron sus problemas de hogar sin comisiones, con precio acordado y garantía.
            </p>
          </div>

          <div className="lp-testimon-grid">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="lp-testi-card">
                <div className="lp-testi-card__stars">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="var(--color-star)" color="var(--stroke-ink)" />
                  ))}
                  <span className="lp-testi-card__badge">
                    <ShieldCheck size={13} aria-hidden="true" /> Verificado
                  </span>
                </div>
                <p className="lp-testi-card__comment">
                  <Quote size={16} className="lp-testi-card__quote-icon" aria-hidden="true" />
                  "{t.comment}"
                </p>
                <div className="lp-testi-card__author">
                  <img src={t.avatar} alt={t.name} className="lp-testi-card__avatar" loading="lazy" />
                  <div className="lp-testi-card__meta">
                    <strong className="lp-testi-card__name">{t.name}</strong>
                    <span className="lp-testi-card__trade">{t.trade}</span>
                    <span className="lp-testi-card__zone">{t.zone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ DESPLEGABLE ── */}
      <section id="faq-section" ref={faqRef} className="lp-faq">
        <div className="lp-wrap lp-faq-wrap">
          <span className="lp-sticker lp-sticker--amarillo lp-sticker--pill">Preguntas frecuentes</span>
          <h2 className="oy-display lp-faq-title">
            <StrokeText text="Todo lo que" tone="cacao" trigger="scroll" fontSize={64} />{' '}
            <StrokeText text="necesitas saber." tone="cacao" trigger="scroll" fontSize={64} />
          </h2>

          <div className={`lp-faq-list ${faqVisible ? 'lp-faq-list--in' : ''}`}>
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
      <section ref={ctaRef} className={`lp-cta-dark ${ctaVisible ? 'lp-reveal' : ''}`}>
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
      <AppFooter onOpenContact={onOpenContact} />

      {/* Botón Flotante para Volver Arriba (Item 7) */}
      <ScrollToTop />

      {/* Búsqueda Rápida al Puntero con tecla '/' (Inspirado en bleibtgleich.dev) */}
      <CursorQuickPrompt onSearch={handleStartAsSeeker} />

      {/* Puntero Magnético de Alta Fidelidad (Inspirado en danilodemarco.com) */}
      <CustomCursor />
    </div>
  );
};
