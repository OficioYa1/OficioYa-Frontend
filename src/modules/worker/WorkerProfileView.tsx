import React, { useState, useRef } from 'react';
import type { Worker, Review } from '../../types';
import { CircularCarousel, PeekRating, SpringCounter, SpringTilt } from '../../components/ui';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  MapPin,
  Calendar,
  Send,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Image as ImageIcon,
  Award,
  CreditCard,
  Wrench,
  Tag,
  Flag,
  Clock,
  Sparkles,
  Lock,
  X
} from 'lucide-react';
import type { ServiceRequest } from '../../types';
import { TRADE_LABELS, rateUnitShort } from '../../utils/workerProfile';
import { WorkerInlineHireFlow } from './WorkerInlineHireFlow';
import { TradeRatingChips } from '../../components/reviews/TradeRatingChips';
import { BeforeAfterSlider } from '../../components/common/BeforeAfterSlider';
import './Worker.css';

interface WorkerProfileViewProps {
  worker: Worker;
  onBack: () => void;
  onOpenBooking: (worker: Worker) => void;
  onOpenChat: (worker: Worker) => void;
  onOpenSendRequest: (worker: Worker) => void;
  onOpenReport: (worker: Worker) => void;
  onCreateServiceAndStartChat?: (newService: ServiceRequest, summaryMessage: string) => void;
}

function createFakeReviewTicket(worker: Worker, review: Review, reportReasonText: string) {
  return {
    id: `cmp-rev-${Date.now()}`,
    caseNumber: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
    targetWorkerId: worker.id,
    targetWorkerName: worker.name,
    type: 'Reseña Falsa' as const,
    description: `Reporte de reseña de "${review.author}": ${reportReasonText}`,
    evidenceFiles: [],
    createdAt: new Date().toISOString(),
    status: 'En revisión' as const,
    isFakeReviewReport: true,
    reviewId: review.id
  };
}

// OFY-52 (RF-52): Consultar perfil de trabajador con oficios, reputación y disponibilidad
export const WorkerProfileView: React.FC<WorkerProfileViewProps> = ({
  worker,
  onBack,
  onOpenBooking: _onOpenBooking,
  onOpenChat,
  onOpenSendRequest: _onOpenSendRequest,
  onOpenReport,
  onCreateServiceAndStartChat
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'oficios' | 'resenas' | 'galeria'>('info');
  const [reportedReviews, setReportedReviews] = useState<Record<string, boolean>>({});
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReasonText, setReportReasonText] = useState('');
  const [inlineFlow, setInlineFlow] = useState<'peticion' | 'contratar' | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showLockedNotice, setShowLockedNotice] = useState(false);
  const noticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggleFlow = (mode: 'peticion' | 'contratar') => {
    if (inlineFlow === mode) {
      setInlineFlow(null);
    } else {
      setInlineFlow(mode);
      setShowLockedNotice(false);
      setTimeout(() => {
        const el = document.getElementById('worker-inline-flow');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const handleLockedContractClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    setShowLockedNotice(true);
    if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
    noticeTimeoutRef.current = setTimeout(() => {
      setShowLockedNotice(false);
    }, 7000);

    setTimeout(() => {
      const el = document.getElementById('wk-locked-notice');
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const handleFlowSubmit = (newService: ServiceRequest, summaryMessage: string) => {
    setInlineFlow(null);
    if (onCreateServiceAndStartChat) {
      onCreateServiceAndStartChat(newService, summaryMessage);
    } else {
      onOpenChat(worker);
    }
  };

  // RF-38: Reportar reseña potencialmente falsa
  const handleReportFakeReview = (review: Review) => {
    if (!reportReasonText.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem('oy-complaints') || '[]');
      const fakeReviewTicket = createFakeReviewTicket(worker, review, reportReasonText);
      localStorage.setItem('oy-complaints', JSON.stringify([fakeReviewTicket, ...existing]));
    } catch {}

    setReportedReviews(prev => ({ ...prev, [review.id]: true }));
    setReportingReviewId(null);
    setReportReasonText('');
  };

  const canBook = worker.available && !worker.isPaused;
  const primaryRep = worker.ratingByTrade?.[worker.trade];
  const unit = rateUnitShort(worker.rateUnit);
  const formatRating = (rating: number, count: number) => (count > 0 ? rating.toFixed(1) : '—');

  const tabs: { id: typeof activeTab; label: string; count?: number }[] = [
    { id: 'info', label: 'Detalles & Horarios' },
    { id: 'oficios', label: 'Oficios & Reputación' },
    { id: 'resenas', label: 'Reseñas Verificadas', count: worker.reviews.length },
    { id: 'galeria', label: 'Portafolio de Trabajos', count: worker.gallery.length }
  ];

  return (
    <div className="wk-fullpage">
      {/* ── BARRA SUPERIOR DE NAVEGACIÓN Y BREADCRUMB ── */}
      <nav className="wk-fullpage__nav" aria-label="Navegación de retorno">
        <button
          type="button"
          onClick={onBack}
          className="wk-fullpage__back-btn"
          aria-label="Volver a la lista de profesionales"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Volver al directorio</span>
        </button>

        <div className="wk-fullpage__breadcrumbs">
          <span>Directorio</span>
          <ChevronRight size={13} aria-hidden="true" className="wk-fullpage__bc-sep" />
          <span>{worker.tradeLabel}</span>
          <ChevronRight size={13} aria-hidden="true" className="wk-fullpage__bc-sep" />
          <span className="wk-fullpage__bc-active">{worker.name}</span>
        </div>

        <button
          type="button"
          onClick={() => onOpenReport(worker)}
          className="wk-fullpage__report-top"
          title="Reportar anomalía o queja ante administración"
        >
          <Flag size={14} aria-hidden="true" />
          <span>Reportar perfil</span>
        </button>
      </nav>

      {/* ── HERO BANNER DEL PERFIL COMPLETO ── */}
      <header className="wk-fullpage__hero">
        <div className="wk-fullpage__hero-main">
          <div
            className="wk-avatar wk-fullpage__avatar"
            style={{ '--wk-avatar-bg': worker.avatarColor } as React.CSSProperties}
            aria-hidden="true"
          >
            {worker.photoUrl ? (
              <img
                src={worker.photoUrl.startsWith('http') ? worker.photoUrl : `${import.meta.env.BASE_URL}${worker.photoUrl.replace(/^\//, '')}`}
                alt={worker.name}
              />
            ) : (
              worker.initials
            )}
          </div>

          <div className="wk-fullpage__hero-info">
            <span className="wk-trade-label">{worker.tradeLabel}</span>
            <h1 className="wk-fullpage__name">{worker.name}</h1>

            <div className="wk-badges">
              {worker.verified && (
                <span className="badge badge-verified wk-sticker wk-sticker--tilt-l" title="Identidad validada con documento oficial">
                  <ShieldCheck size={14} aria-hidden="true" /> Verificado Oficial
                </span>
              )}
              {worker.referrals?.isCommunityReferrer && (
                <span
                  className="badge wk-sticker wk-sticker--almendra wk-sticker--tilt-r"
                  title="Referente Comunitario Verificado: referidos activos en >= 3 oficios"
                >
                  <Award size={13} aria-hidden="true" /> Referente Comunitario
                </span>
              )}
              <span className={`badge wk-sticker ${canBook ? 'badge-available' : 'wk-sticker--off'}`}>
                {worker.isPaused ? 'Pausado por moderación' : worker.available ? '● Disponible Ahora' : 'Fuera de línea'}
              </span>
            </div>

            <p className="wk-fullpage__geo-sub">
              <MapPin size={15} aria-hidden="true" />
              <span>{worker.location.zoneName} · Bogotá D.C.</span>
              {worker.maxDistanceKm && (
                <span className="wk-fullpage__geo-tag">Hasta {worker.maxDistanceKm} km de cobertura</span>
              )}
            </p>
          </div>
        </div>

        {/* Acciones principales integradas en el Hero Banner (Sin botón de chatear) */}
        <div className="wk-fullpage__hero-actions">
          <button
            type="button"
            onClick={() => handleToggleFlow('peticion')}
            className={`btn wk-fullpage__action-btn ${inlineFlow === 'peticion' ? 'btn-primary' : 'btn-secondary'}`}
            disabled={worker.isPaused}
            aria-expanded={inlineFlow === 'peticion'}
          >
            <Send size={17} aria-hidden="true" />
            {inlineFlow === 'peticion' ? 'Cerrar petición' : 'Enviar petición'}
          </button>

          <motion.button
            type="button"
            onClick={handleLockedContractClick}
            animate={isShaking ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="btn wk-fullpage__action-btn wk-fullpage__action-btn--locked"
            aria-label="Contratar Servicio (Bloqueado: el profesional debe aceptar la petición para hacer la reserva)"
            title="El profesional debe aceptar la petición para hacer la reserva"
          >
            <Lock size={15} aria-hidden="true" className="wk-locked-icon" />
            <span>Contratar Servicio</span>
            <span className="wk-locked-tag">Bloqueado</span>
          </motion.button>
        </div>
      </header>

      {/* ── AVISO ANIMADO DE BLOQUEO DE RESERVA ── */}
      <AnimatePresence>
        {showLockedNotice && (
          <motion.div
            id="wk-locked-notice"
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="wk-locked-notice"
            role="alert"
          >
            <div className="wk-locked-notice__icon-wrap">
              <Lock size={20} aria-hidden="true" />
            </div>
            <div className="wk-locked-notice__content">
              <strong className="wk-locked-notice__title">
                El profesional debe aceptar la petición para hacer la reserva
              </strong>
              <p className="wk-locked-notice__desc">
                Para coordinar disponibilidad y tarifas, primero debes enviar una petición de servicio. Una vez <strong>{worker.name}</strong> la revise y la acepte en el chat, se formalizará la reserva.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowLockedNotice(false);
                  handleToggleFlow('peticion');
                }}
                className="btn btn-primary wk-locked-notice__btn"
              >
                <Send size={14} aria-hidden="true" />
                Enviar petición ahora
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowLockedNotice(false)}
              className="wk-locked-notice__close"
              aria-label="Cerrar aviso"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FORMULARIO INLINE LIMPIO (SIN POP-UPS) ── */}
      <AnimatePresence>
        {inlineFlow && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <WorkerInlineHireFlow
              worker={worker}
              mode={inlineFlow}
              onModeChange={setInlineFlow}
              onClose={() => setInlineFlow(null)}
              onSubmit={handleFlowSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerta si el perfil se encuentra suspendido */}
      {worker.isPaused && (
        <div className="wk-alert" role="status" style={{ margin: 'var(--space-4) 0' }}>
          <AlertTriangle size={22} aria-hidden="true" />
          <div>
            <strong>Perfil suspendido automáticamente:</strong> {worker.pauseReason || 'Promedio menor a 3.0 estrellas en sus últimas 5 reseñas. Se han bloqueado nuevas solicitudes.'}
          </div>
        </div>
      )}

      {/* ── GRID DE MÉTRICAS CLAVE (BENTO KPIS) ── */}
      <section className="wk-stats wk-fullpage__stats" aria-label="Métricas del profesional">
        <SpringTilt maxTilt={4} scale={1.015}>
          <div className="oy-stat wk-stat--amarillo">
            <span className="oy-stat__label">Calificación Global</span>
            <span className="oy-stat__value wk-stat__row">
              <Star size={24} fill="var(--color-star)" color="var(--stroke-ink)" aria-hidden="true" />
              {worker.reviewCount > 0 ? (
                <SpringCounter value={worker.rating} decimals={1} />
              ) : (
                '—'
              )}
              <span className="wk-stat__aside">({worker.reviewCount} reseñas)</span>
            </span>
          </div>
        </SpringTilt>

        <SpringTilt maxTilt={4} scale={1.015}>
          <div className="oy-stat wk-stat--esmeralda">
            <span className="oy-stat__label">Trabajos Completados</span>
            <span className="oy-stat__value">
              <SpringCounter value={worker.completedJobsCount} />
            </span>
            <span className="wk-stat__aside">servicios exitosos</span>
          </div>
        </SpringTilt>

        <SpringTilt maxTilt={4} scale={1.015}>
          <div className="oy-stat wk-stat--marino">
            <span className="oy-stat__label">Tarifa de Referencia</span>
            <span className="oy-stat__value wk-stat__value--sm">
              <SpringCounter value={worker.hourlyRate} prefix="$" />
            </span>
            <span className="wk-stat__aside">COP /{unit}</span>
          </div>
        </SpringTilt>

        <SpringTilt maxTilt={4} scale={1.015}>
          <div className="oy-stat">
            <span className="oy-stat__label">Zona Principal</span>
            <span className="wk-stat__zone">
              <MapPin size={16} aria-hidden="true" /> {worker.location.zoneName}
            </span>
            <span className="wk-stat__aside">Tiempo de respuesta: &lt; 20 min</span>
          </div>
        </SpringTilt>
      </section>

      {/* ── PESTAÑAS DE CONTENIDO COMPLETO ── */}
      <div className="wk-tabs wk-fullpage__tabs" role="tablist" aria-label="Secciones del perfil">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`oy-chip wk-fullpage__tab-chip ${activeTab === tab.id ? 'wk-fullpage__tab-chip--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}
          </button>
        ))}
      </div>

      {/* ── CUERPO PRINCIPAL DE PESTAÑAS ── */}
      <main className="wk-fullpage__content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* PESTAÑA 1: DETALLES & HORARIOS */}
            {activeTab === 'info' && (
          <div className="wk-pane wk-fullpage__pane">
            <div className="wk-fullpage__two-col">
              <div className="wk-fullpage__col-main">
                <section className="wk-card wk-fullpage__section-card">
                  <h3 className="wk-block__title">Biografía y Experiencia Profesional</h3>
                  <p className="wk-text" style={{ fontSize: '15px', lineHeight: '1.65' }}>{worker.bio}</p>
                  <div className="wk-fullpage__contact-pills">
                    <span className="wk-chip-line">
                      <Phone size={14} aria-hidden="true" /> Contacto: {worker.phone}
                    </span>
                    <span className="wk-chip-line">
                      <Clock size={14} aria-hidden="true" /> Disponibilidad: Inmediata en Bogotá
                    </span>
                  </div>
                </section>

                {/* Métodos de Pago */}
                <section className="wk-card wk-card--almendra wk-fullpage__section-card">
                  <h3 className="wk-block__title wk-block__title--icon">
                    <CreditCard size={18} aria-hidden="true" /> Métodos de Pago Aceptados
                  </h3>
                  <p className="wk-text" style={{ marginBottom: 'var(--space-2)' }}>
                    Paga de forma directa y segura al finalizar el trabajo a satisfacción:
                  </p>
                  <div className="wk-tags">
                    {(worker.acceptedPaymentMethods || ['efectivo', 'nequi', 'daviplata']).map(method => (
                      <span key={method} className="wk-tag wk-tag--upper wk-tag--lg">
                        ✓ {method}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Equipamiento y Marcas */}
                {(worker.equipment?.length || worker.brands?.length || worker.species?.length) ? (
                  <div className="wk-grid wk-fullpage__equipment-grid">
                    {worker.equipment && (
                      <section className="wk-card wk-fullpage__section-card">
                        <h3 className="wk-block__title wk-block__title--icon">
                          <Wrench size={16} aria-hidden="true" /> Herramientas y Equipamiento
                        </h3>
                        <ul className="wk-list">
                          {worker.equipment.map((eq, i) => (
                            <li key={i}>{eq}</li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {worker.brands && (
                      <section className="wk-card wk-fullpage__section-card">
                        <h3 className="wk-block__title wk-block__title--icon">
                          <Tag size={16} aria-hidden="true" /> Marcas que Atiende
                        </h3>
                        <div className="wk-tags">
                          {worker.brands.map((b, i) => (
                            <span key={i} className="wk-tag">{b}</span>
                          ))}
                        </div>
                      </section>
                    )}

                    {worker.species && (
                      <section className="wk-card wk-fullpage__section-card">
                        <h3 className="wk-block__title">🐾 Especies Atendidas</h3>
                        <div className="wk-tags">
                          {worker.species.map((sp, i) => (
                            <span key={i} className="wk-tag">{sp}</span>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Columna lateral: Horarios & Compromiso OficioYa */}
              <aside className="wk-fullpage__col-side">
                <section className="wk-card wk-fullpage__section-card">
                  <h3 className="wk-block__title wk-block__title--icon">
                    <Calendar size={18} aria-hidden="true" /> Horarios de Atención Semanal
                  </h3>
                  <ul className="wk-schedule">
                    {worker.schedule.map((item, idx) => (
                      <li key={idx} className="wk-schedule__row">
                        <span className="wk-schedule__day">{item.day}</span>
                        <span className="wk-schedule__slots">{item.slots.join(' | ')}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <div className="wk-card wk-card--amarillo wk-fullpage__guarantee-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Sparkles size={20} color="var(--stroke-ink)" />
                    <h4 style={{ margin: 0, fontWeight: 800 }}>Confianza OficioYa</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: 'var(--color-text-main)' }}>
                    Las reseñas solo las dejan clientes con un servicio completado. Si algo sale mal, repórtalo y moderación lo revisa. Acuerda la garantía por chat para que quede por escrito.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: OFICIOS & REPUTACIÓN */}
        {activeTab === 'oficios' && (
          <div className="wk-pane wk-fullpage__pane">
            <div className="wk-block">
              <h3 className="wk-block__title">Reputación Diferenciada por Oficio</h3>
              <p className="wk-text" style={{ fontSize: '15px' }}>
                En OficioYa las calificaciones y trabajos no se mezclan entre oficios distintos para proteger la reputación especializada y garantizar máxima transparencia.
              </p>
              {worker.ratingByTrade && (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <TradeRatingChips ratingByTrade={worker.ratingByTrade} primaryTrade={worker.trade} />
                </div>
              )}
            </div>

            {/* Oficio Principal */}
            <section className="wk-trade wk-trade--primary wk-fullpage__trade-card">
              <div className="wk-trade__head">
                <span className="oy-sticker oy-sticker--pill oy-sticker--amarillo wk-trade__pill">Oficio Principal</span>
                <h3 className="oy-display wk-trade__name">{worker.tradeLabel}</h3>
              </div>

              <div className="wk-trade__stats">
                <div className="oy-stat wk-stat--amarillo">
                  <span className="oy-stat__label">Calificación</span>
                  <span className="oy-stat__value wk-stat__row">
                    <Star size={20} fill="var(--color-star)" color="var(--stroke-ink)" aria-hidden="true" />
                    {primaryRep ? formatRating(primaryRep.rating, primaryRep.reviewCount) : formatRating(worker.rating, worker.reviewCount)}
                  </span>
                  <span className="wk-stat__aside">{primaryRep?.reviewCount ?? worker.reviewCount} reseñas</span>
                </div>
                <div className="oy-stat wk-stat--esmeralda">
                  <span className="oy-stat__label">Trabajos Completados</span>
                  <span className="oy-stat__value">{primaryRep?.completedJobs ?? worker.completedJobsCount}</span>
                </div>
                <div className="oy-stat wk-stat--marino">
                  <span className="oy-stat__label">Tarifa Estándar</span>
                  <span className="oy-stat__value wk-stat__value--sm">${worker.hourlyRate.toLocaleString()}</span>
                  <span className="wk-stat__aside">COP/{unit}</span>
                </div>
              </div>

              {worker.specializations && worker.specializations.length > 0 && (
                <div className="wk-specs" style={{ marginTop: 'var(--space-4)' }}>
                  <span className="oy-label wk-specs__label">Especializaciones técnicas registradas:</span>
                  <div className="wk-tags">
                    {worker.specializations.map((spec, i) => (
                      <span key={i} className="wk-tag wk-tag--role wk-tag--lg">{spec}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Oficios Secundarios */}
            {worker.secondaryTrades && worker.secondaryTrades.length > 0 && worker.secondaryTrades.map(secTrade => {
              const secRep = worker.ratingByTrade?.[secTrade] ?? { rating: 0, reviewCount: 0, completedJobs: 0 };
              const secService = worker.services.find(sv => sv.trade === secTrade);
              return (
                <section key={secTrade} className="wk-trade wk-fullpage__trade-card">
                  <div className="wk-trade__head">
                    <span className="oy-sticker oy-sticker--pill oy-sticker--blanco wk-trade__pill">Oficio Secundario</span>
                    <h3 className="oy-display wk-trade__name wk-trade__name--cap">
                      {secService?.tradeLabel ?? TRADE_LABELS[secTrade] ?? secTrade}
                    </h3>
                  </div>
                  <div className="wk-trade__stats">
                    <div className="oy-stat wk-stat--amarillo">
                      <span className="oy-stat__label">Calificación</span>
                      <span className="oy-stat__value wk-stat__row">
                        <Star size={20} fill="var(--color-star)" color="var(--stroke-ink)" aria-hidden="true" />
                        {formatRating(secRep.rating, secRep.reviewCount)}
                      </span>
                      <span className="wk-stat__aside">{secRep.reviewCount} reseñas</span>
                    </div>
                    <div className="oy-stat wk-stat--esmeralda">
                      <span className="oy-stat__label">Trabajos Completados</span>
                      <span className="oy-stat__value">{secRep.completedJobs}</span>
                    </div>
                    {secService && (
                      <div className="oy-stat wk-stat--marino">
                        <span className="oy-stat__label">Tarifa</span>
                        <span className="oy-stat__value wk-stat__value--sm">${secService.hourlyRate.toLocaleString()}</span>
                        <span className="wk-stat__aside">COP/{rateUnitShort(secService.rateUnit)}</span>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}

            {/* Referente Comunitario Verificado */}
            {worker.referrals && (
              <section className="wk-card wk-card--amarillo wk-fullpage__section-card">
                <h3 className="wk-block__title wk-block__title--icon">
                  <Award size={20} aria-hidden="true" /> Crecimiento Comunitario & Referidos
                </h3>
                <p className="wk-text wk-text--main" style={{ fontSize: '15px' }}>
                  Código de referente oficial: <strong>{worker.referrals.code}</strong>. Ha referido y avalado a {worker.referrals.count} colegas técnicos en {worker.referrals.distinctTradesCount} oficios distintos.
                </p>
                {worker.referrals.isCommunityReferrer && (
                  <span className="oy-sticker oy-sticker--pill oy-sticker--amarillo wk-badge-perm" style={{ marginTop: 'var(--space-2)' }}>
                    <Award size={15} aria-hidden="true" /> Insignia Permanente: Referente Comunitario Verificado
                  </span>
                )}
              </section>
            )}
          </div>
        )}

        {/* PESTAÑA 3: RESEÑAS VERIFICADAS */}
        {activeTab === 'resenas' && (
          <div className="wk-pane wk-fullpage__pane">
            {worker.reviews.length === 0 ? (
              <div className="oy-empty wk-empty" style={{ padding: 'var(--space-12) 0' }}>
                <p className="oy-empty__title">Sin reseñas todavía</p>
                <p className="oy-empty__text">Aún no tiene reseñas registradas. ¡Sé el primero en solicitar y calificar su trabajo!</p>
              </div>
            ) : (
              <div className="wk-fullpage__reviews-list">
                {worker.reviews.map(rev => {
                  const isReported = reportedReviews[rev.id] || rev.isReported;
                  return (
                    <article key={rev.id} className="wk-review wk-fullpage__review-item">
                      <div className="wk-review__head">
                        <div className="wk-review__who">
                          <span className="wk-review__author" style={{ fontSize: '16px' }}>{rev.author}</span>
                          {rev.verifiedWork && (
                            <span className="wk-review__verified">
                              <CheckCircle2 size={13} aria-hidden="true" /> Trabajo Verificado
                            </span>
                          )}
                          {rev.tradeCategory && (
                            <span className="wk-tag wk-tag--sm wk-tag--cap">{rev.tradeCategory}</span>
                          )}
                        </div>
                        <span className="wk-review__date">{rev.date}</span>
                      </div>

                      <div className="wk-review__rating" style={{ margin: 'var(--space-2) 0' }}>
                        <PeekRating value={rev.rating} readOnly size={15} />

                        {isReported ? (
                          <span className="wk-review__reported">Reseña reportada para moderación</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setReportingReviewId(reportingReviewId === rev.id ? null : rev.id)}
                            className="wk-link-btn"
                            title="Reportar reseña potencialmente falsa ante el administrador"
                            aria-expanded={reportingReviewId === rev.id}
                          >
                            <Flag size={12} aria-hidden="true" /> Reportar sospechosa
                          </button>
                        )}
                      </div>

                      <p className="wk-review__comment" style={{ fontSize: '15px' }}>"{rev.comment}"</p>

                      {/* Formulario desplegable para reportar reseña falsa */}
                      {reportingReviewId === rev.id && (
                        <div className="wk-report-form">
                          <label className="wk-report-form__label" htmlFor={`wk-report-${rev.id}`}>
                            Motivo del reporte (lo evalúa el equipo de moderación; no se borra automáticamente):
                          </label>
                          <input
                            id={`wk-report-${rev.id}`}
                            type="text"
                            className="input-base wk-report-form__input"
                            placeholder="Ej. Reseña fraudulenta, conflicto de interés o suplantación"
                            value={reportReasonText}
                            onChange={e => setReportReasonText(e.target.value)}
                          />
                          <div className="wk-report-form__actions">
                            <button
                              type="button"
                              onClick={() => setReportingReviewId(null)}
                              className="btn btn-secondary wk-btn-sm"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReportFakeReview(rev)}
                              className="btn btn-danger wk-btn-sm wk-btn-danger"
                            >
                              Enviar Reporte
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

            {/* PESTAÑA 4: PORTAFOLIO DE TRABAJOS */}
            {activeTab === 'galeria' && (
              <div className="wk-pane wk-fullpage__pane">
                <section className="wk-card wk-fullpage__section-card" style={{ marginBottom: 'var(--space-6)' }}>
                  <div className="wk-block" style={{ marginBottom: 'var(--space-4)' }}>
                    <span className="oy-sticker oy-sticker--pill oy-sticker--amarillo">Caso Destacado</span>
                    <h3 className="wk-block__title" style={{ marginTop: 'var(--space-2)' }}>
                      Comparativa Antes y Después de la Intervención
                    </h3>
                    <p className="wk-text">
                      Desliza el control interactivo o usa el teclado para constatar la calidad técnica de la reparación y acabados entregados.
                    </p>
                  </div>
                  <BeforeAfterSlider
                    beforeImage={`${import.meta.env.BASE_URL}assets/media/paso-1-fuga.webp`}
                    afterImage={`${import.meta.env.BASE_URL}assets/media/paso-3-resuelto.webp`}
                    beforeAlt="Fuga hidráulica y daño estructural antes de la intervención"
                    afterAlt="Tubería renovada, soldadura hidrostática y área completamente seca y limpia"
                    caption="Caso real verificado: sustitución de tramo colapsado e impermeabilización en Bogotá D.C."
                    tradeLabel={worker.tradeLabel}
                  />
                </section>
                <WorkerGallery images={worker.gallery} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── BARRA FLOTANTE MÓVIL DE ACCIONES RÁPIDAS (Sin botón de chatear) ── */}
      <div className="wk-fullpage__floating-bar" aria-label="Acciones rápidas móviles">
        <button
          type="button"
          onClick={() => handleToggleFlow('peticion')}
          className={`btn wk-fullpage__floating-btn ${inlineFlow === 'peticion' ? 'btn-primary' : 'btn-secondary'}`}
          disabled={worker.isPaused}
        >
          <Send size={18} aria-hidden="true" />
          {inlineFlow === 'peticion' ? 'Cerrar petición' : 'Enviar petición'}
        </button>

        <motion.button
          type="button"
          onClick={handleLockedContractClick}
          animate={isShaking ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="btn wk-fullpage__floating-btn wk-fullpage__action-btn--locked"
          aria-label="Contratar Servicio (Bloqueado)"
        >
          <Lock size={16} aria-hidden="true" className="wk-locked-icon" />
          <span>Contratar Servicio</span>
          <span className="wk-locked-tag">Bloqueado</span>
        </motion.button>
      </div>
    </div>
  );
};

const MIN_RING_ITEMS = 6;

const WorkerGallery: React.FC<{ images: string[] }> = ({ images }) => {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div className="oy-empty wk-empty" style={{ padding: 'var(--space-12) 0' }}>
        <ImageIcon size={32} aria-hidden="true" />
        <p className="oy-empty__title">Sin evidencias fotográficas aún</p>
        <p className="oy-empty__text">Este trabajador aún no ha subido fotografías de sus proyectos.</p>
      </div>
    );
  }

  const repeats = Math.max(1, Math.ceil(MIN_RING_ITEMS / images.length));
  const items = Array.from({ length: images.length * repeats }, (_, i) => ({
    src: images[i % images.length],
    alt: `Evidencia de trabajo ${(i % images.length) + 1}`,
  }));

  return (
    <div className="wk-gallery wk-fullpage__gallery">
      <div className="wk-gallery__stage">
        <CircularCarousel
          items={items}
          preset="cylinder"
          intro="rise"
          cardWidth={260}
          aspectRatio={4 / 3}
          captions={false}
          ariaLabel="Portafolio de trabajos"
          onChange={(i) => setCurrent(i % images.length)}
        />
      </div>
      <p aria-live="polite" className="wk-gallery__counter" style={{ marginTop: 'var(--space-4)' }}>
        Trabajo {current + 1} de {images.length} · arrastra o desliza para navegar por el carrusel 3D
      </p>

      {/* Grid de miniaturas para exploración directa */}
      <div className="wk-fullpage__gallery-grid">
        {images.map((img, i) => (
          <div key={i} className="wk-fullpage__gallery-thumb">
            <img src={img} alt={`Trabajo realizado ${i + 1}`} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
};
