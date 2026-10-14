import React, { useState, useEffect, useRef } from 'react';
import type { TradeCategory } from '../../types';
import {
  Wrench, Zap, PaintBucket, KeyRound, MapPin,
  ArrowRight, UserCheck, Award, Star, Tv2, BookOpen,
  CheckCircle2, TrendingUp, Plus, Minus,
} from 'lucide-react';
import './LandingPage.css';
import { AppFooter } from '../../components/layout/AppFooter';
import { TrueFocus } from '../../components/ui/TrueFocus';

interface LandingPageProps { onEnterApp: (role?: 'seeker' | 'provider') => void; }

interface TradeOption {
  key: TradeCategory; label: string; icon: React.ReactNode;
  tagline: string; color: string;
}

const TRADES: TradeOption[] = [
  { key: 'electricidad',    label: 'Electricidad',    icon: <Zap size={15} />,        tagline: 'Instalaciones eléctricas, cableado y circuitos seguros.',            color: '#FFC72C' },
  { key: 'plomeria',        label: 'Plomería',        icon: <Wrench size={15} />,      tagline: 'Destapes, fugas y redes hidráulicas con garantía de trabajo.',        color: '#3B82F6' },
  { key: 'pintura',         label: 'Pintura',         icon: <PaintBucket size={15} />, tagline: 'Acabados finos y pintura arquitectónica para tu hogar.',                color: '#8B5CF6' },
  { key: 'cerrajeria',      label: 'Cerrajería',      icon: <KeyRound size={15} />,    tagline: 'Aperturas de emergencia 24 horas, sin daño a tus cerraduras.',         color: '#10B981' },
  { key: 'electrodomesticos', label: 'Electrodomésticos', icon: <Tv2 size={15} />,    tagline: 'Reparación de lavadoras, neveras y aires acondicionados.',             color: '#F97316' },
  { key: 'clases',          label: 'Clases',          icon: <BookOpen size={15} />,    tagline: 'Profesores particulares verificados para todas las materias.',          color: '#EC4899' },
];

const STATS = [
  { label: 'Profesionales activos',  value: '2.400+',  icon: <UserCheck size={22} />,    color: '#3B82F6' },
  { label: 'Servicios completados',  value: '18.000+', icon: <CheckCircle2 size={22} />, color: '#10B981' },
  { label: 'Calificación promedio',  value: '4.8 / 5', icon: <Star size={22} />,         color: '#FBBF24' },
  { label: 'Tiempo de respuesta',    value: '< 20 min',icon: <TrendingUp size={22} />,   color: '#F97316' },
];

const FAQS = [
  { q: '¿Cómo verifican a los profesionales?', a: 'Validamos antecedentes judiciales, revisamos su cédula de ciudadanía y requerimos al menos 3 reseñas de clientes reales antes de activar su perfil.' },
  { q: '¿Cuánto cobra OficioYa de comisión?', a: 'Cero. El trato es 100% directo entre tú y el profesional. OficioYa no cobra comisiones ni intermediaciones.' },
  { q: '¿Puedo contratar para hoy mismo?', a: 'Sí. El filtro de disponibilidad te muestra únicamente quienes están activos en este momento y pueden atenderte hoy.' },
  { q: '¿En qué zonas de Bogotá funciona?', a: 'Actualmente operamos en todas las localidades de Bogotá D.C. y municipios del área metropolitana como Chía, Soacha y Cota.' },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// Texto con efecto hover de color
function HoverText({ children, hoverColor = '#FFC72C', style = {} }: {
  children: React.ReactNode; hoverColor?: string; style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: hovered ? hoverColor : 'inherit',
        transition: 'color 0.22s ease',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// Item desplegable FAQ
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '20px 0', background: 'none',
          border: 'none', cursor: 'pointer', textAlign: 'left', gap: '16px',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 600,
          color: open ? '#FFC72C' : '#fff', transition: 'color 0.22s ease',
        }}>
          {q}
        </span>
        <span style={{
          flexShrink: 0, color: open ? '#FFC72C' : 'rgba(255,255,255,0.4)',
          transition: 'all 0.3s ease', transform: open ? 'rotate(0deg)' : 'rotate(0deg)',
        }}>
          {open ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      <div style={{
        maxHeight: open ? '200px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '15px',
          color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
          paddingBottom: '20px', margin: 0,
        }}>
          {a}
        </p>
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

      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <div className="lp-brand">
            <img src="/assets/mascot/logo1.0.png" alt="OficioYa" className="lp-brand-logo" />
            <div>
              <span className="lp-brand-name">Oficio<span className="lp-brand-ya">Ya</span></span>
              <span className="lp-brand-tagline">Directorio Inteligente</span>
            </div>
          </div>

          {/* Nav links con hover de color — sin recuadros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <HoverText hoverColor="#FFC72C" style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
              <span onClick={handleStartAsSeeker}>Buscar</span>
            </HoverText>
            <HoverText hoverColor="#FFC72C" style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
              <span onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })}>Preguntas</span>
            </HoverText>
            <HoverText hoverColor="#FFC72C" style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
              <span onClick={handleStartAsProvider}>Para trabajadores</span>
            </HoverText>
            <button onClick={handleStartAsSeeker} className="lp-btn-cta">
              Explorar <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className={`lp-hero ${heroVisible ? 'lp-hero--in' : ''}`}
        style={{
          background: 'linear-gradient(160deg, #0A1628 0%, #0F2040 45%, #131A2E 100%)',
          color: '#fff', textAlign: 'center', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', minHeight: '92vh',
          padding: '60px 24px 40px', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Fondo decorativo */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)' }} />

        {/* Badge ciudad — texto suelto, sin recuadro opaco */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px',
          fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.3px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', animation: 'many-status-pulse 2s infinite', flexShrink: 0 }} />
          Bogotá D.C.
        </div>

        {/* Wordmark */}
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: 'clamp(4rem, 9vw, 7.5rem)',
          fontWeight: 900, letterSpacing: '-3px', lineHeight: 0.92, marginBottom: '20px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFC72C 55%, #F59E0B 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          OficioYa
        </h1>

        {/* Eslogan */}
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 'clamp(1.15rem, 2.5vw, 1.5rem)',
          fontWeight: 400, color: 'rgba(255,255,255,0.7)', marginBottom: '16px',
          maxWidth: '540px', lineHeight: 1.55, letterSpacing: '-0.2px',
        }}>
          <TrueFocus
            sentence="El talento de tu zona a un click de distancia"
            blurAmount={3}
            borderColor="#2F6BFF"
            animationDuration={0.4}
          />
        </div>

        {/* Texto descriptivo — sin recuadro, flotante */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 400,
          color: 'rgba(255,255,255,0.38)', marginBottom: '48px', maxWidth: '400px',
        }}>
          Plomeros, electricistas, pintores y más — con{' '}
          <HoverText hoverColor="#FFC72C" style={{ fontWeight: 600 }}>reputación verificada</HoverText>
          {' '}y geolocalización en tiempo real.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '72px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handleStartAsSeeker}
            className="lp-hero-btn-primary"
          >
            Buscar expertos
          </button>
          <button
            onClick={handleStartAsProvider}
            className="lp-hero-btn-ghost"
          >
            Soy trabajador independiente
          </button>
        </div>

        {/* Many mascot */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{
            position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
            width: '280px', height: '280px', borderRadius: '50%',
            background: `radial-gradient(circle, ${currentTrade.color}30 0%, transparent 70%)`,
            transition: 'background 0.5s ease', pointerEvents: 'none',
          }} />

          {selectedTrade === 'plomeria' ? (
            <img src="/assets/mascot/many-plomero.png" alt="Many Plomero"
              className={`lp-many-hero-img ${manyAnimate === 'wave' ? 'lp-many-waving' : ''}`}
              onClick={triggerWave} style={{ height: '300px', objectFit: 'contain', cursor: 'pointer', position: 'relative' }} />
          ) : selectedTrade === 'electricidad' ? (
            <img src="/assets/mascot/many-electricista.png" alt="Many Electricista"
              className={`lp-many-hero-img ${manyAnimate === 'wave' ? 'lp-many-waving' : ''}`}
              onClick={triggerWave} style={{ height: '300px', objectFit: 'contain', cursor: 'pointer', position: 'relative' }} />
          ) : (
            <img src="/assets/mascot/many-wave.png" alt="Many OficioYa"
              className={`lp-many-hero-img ${manyAnimate === 'wave' ? 'lp-many-waving' : ''}`}
              onClick={triggerWave} style={{ height: '300px', objectFit: 'contain', cursor: 'pointer', position: 'relative' }} />
          )}

          {/* Tagline del oficio — texto suelto */}
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.4)',
            fontStyle: 'italic', maxWidth: '320px', textAlign: 'center', margin: 0,
          }}>
            {currentTrade.tagline}
          </p>

          {/* Selector oficios */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {TRADES.map(t => (
              <button
                key={t.key}
                onClick={() => handleTradeSelect(t.key)}
                style={{
                  background: selectedTrade === t.key ? t.color : 'transparent',
                  color: selectedTrade === t.key
                    ? (t.key === 'electricidad' ? '#0A1628' : '#fff')
                    : 'rgba(255,255,255,0.45)',
                  border: selectedTrade === t.key ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '999px', padding: '7px 16px',
                  fontSize: '12px', fontWeight: selectedTrade === t.key ? 700 : 400,
                  cursor: 'pointer', fontFamily: 'var(--font-ui)',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  transition: 'all 0.25s ease',
                  boxShadow: selectedTrade === t.key ? `0 4px 14px ${t.color}45` : 'none',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS — texto flotante, sin cards ── */}
      <div ref={statsReveal.ref} style={{ padding: '56px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="lp-wrap">
          {/* Título suelto, sin recuadro */}
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--color-text-subtle)', textAlign: 'center', marginBottom: '40px' }}>
            OficioYa en números
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0' }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{
                textAlign: 'center', padding: '8px 16px',
                borderRight: i < 3 ? '1px solid var(--color-border)' : 'none',
                opacity: statsReveal.visible ? 1 : 0,
                transform: statsReveal.visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.5s ease ${i * 0.1}s`,
              }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 900, color: s.color, letterSpacing: '-1px', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px', fontWeight: 400 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CÓMO FUNCIONA ── */}
      <section ref={stepsReveal.ref} style={{ padding: '96px 0' }}>
        <div className="lp-wrap">
          {/* Título + subtítulo sueltos */}
          <div style={{ marginBottom: '64px' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--brand-amber)', marginBottom: '12px' }}>
              Simple y transparente
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-1px', color: 'var(--color-text-main)', marginBottom: '12px', maxWidth: '480px' }}>
              Tres pasos, cero intermediarios.
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-text-muted)', maxWidth: '400px', lineHeight: 1.65 }}>
              Sin comisiones ocultas, sin grupos de WhatsApp incómodos.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '32px' }}>
            {[
              { n: '01', icon: <MapPin size={22} />, color: '#3B82F6', title: 'Búsqueda hiperlocal', desc: 'Activa tu GPS o selecciona tu localidad. Ves en tiempo real quién está disponible a menos de 2 km.' },
              { n: '02', icon: <Award size={22} />, color: '#F59E0B', title: 'Reputación verificada', desc: 'Calificaciones reales de vecinos, fotos de trabajos terminados y antecedentes validados.' },
              { n: '03', icon: <UserCheck size={22} />, color: '#10B981', title: 'Trato directo', desc: 'Contactas, acordás la tarifa y pagás en efectivo, transferencia o Bre-B. Sin intermediarios.' },
            ].map((s, i) => (
              <div
                key={s.n}
                style={{
                  padding: '40px 32px',
                  background: 'var(--color-surface)',
                  borderRadius: '24px',
                  boxShadow: '0 2px 20px rgba(0,0,0,0.04)',
                  opacity: stepsReveal.visible ? 1 : 0,
                  transform: stepsReveal.visible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.55s ease ${i * 0.12}s`,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Número decorativo — sin recuadro */}
                <span style={{
                  position: 'absolute', top: '16px', right: '24px',
                  fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 900,
                  color: 'var(--color-border)', lineHeight: 1, pointerEvents: 'none',
                }}>
                  {s.n}
                </span>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: `${s.color}18`, color: s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  {s.icon}
                </div>
                {/* Título hover color */}
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
                  <HoverText hoverColor={s.color}>{s.title}</HoverText>
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ DESPLEGABLE ── */}
      <section
        id="faq-section"
        ref={faqReveal.ref}
        style={{
          padding: '80px 0',
          background: 'linear-gradient(160deg, #0A1628 0%, #0F2040 100%)',
        }}
      >
        <div className="lp-wrap" style={{ maxWidth: '720px' }}>
          {/* Títulos sueltos sobre fondo oscuro */}
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#FFC72C', marginBottom: '12px' }}>
            Preguntas frecuentes
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff', marginBottom: '48px' }}>
            Todo lo que necesitas saber.
          </h2>

          <div style={{
            opacity: faqReveal.visible ? 1 : 0,
            transform: faqReveal.visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.5s ease',
          }}>
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>

          {/* Texto CTA suelto, sin recuadro */}
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '14px',
            color: 'rgba(255,255,255,0.4)', marginTop: '40px', textAlign: 'center',
          }}>
            ¿Tienes otra pregunta?{' '}
            <HoverText hoverColor="#FFC72C" style={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
              <span onClick={handleStartAsSeeker}>Contáctanos desde la app</span>
            </HoverText>
          </p>
        </div>
      </section>

      {/* ── CTA WORKER ── */}
      <section ref={ctaReveal.ref} className={`lp-cta-dark ${ctaReveal.visible ? 'lp-reveal' : ''}`}>
        <div className="lp-wrap">
          <div className="lp-cta-card">
            <div className="lp-cta-mascot-col">
              <div className="lp-cta-glow" />
              <img src="/assets/mascot/many-wave.png" alt="Many" className="lp-cta-mascot-img" />
              <div className="lp-cta-badge-pill">
                <CheckCircle2 size={14} color="#22C55E" />
                <span>100% de tus ingresos son tuyos</span>
              </div>
            </div>

            <div className="lp-cta-content-col">
              {/* Eyebrow — texto suelto sin recuadro */}
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#FFC72C', display: 'block', marginBottom: '10px' }}>
                Para técnicos y profesionales
              </span>
              <h2 className="lp-cta-title">¿Eres trabajador independiente?</h2>
              <p className="lp-cta-desc">
                Publica tus servicios, activa tu disponibilidad y conecta con clientes verificados en tu zona.
              </p>

              {/* Beneficios — texto suelto, solo con punto de color */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {[
                  'Cobro 100% directo con el cliente',
                  'Control de tus horarios y zona de cobertura',
                  'Calificaciones verificadas para ganar más clientes',
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: '#E2E8F0' }}>
                      <HoverText hoverColor="#FFC72C">{b}</HoverText>
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <button onClick={handleStartAsProvider} className="lp-cta-primary lp-cta-amber">
                  Empezar gratis <ArrowRight size={16} />
                </button>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>
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
