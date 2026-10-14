import React, { useState } from 'react';
import type { Worker, Review } from '../../types';
import { CircularCarousel, PeekRating } from '../../components/ui';
import {
  X,
  Star,
  ShieldCheck,
  MapPin,
  Calendar,
  MessageCircle,
  Send,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Image as ImageIcon,
  Award,
  CreditCard,
  Wrench,
  Tag,
  Flag
} from 'lucide-react';
import './Worker.css';

interface WorkerProfileModalProps {
  worker: Worker;
  onClose: () => void;
  onOpenBooking: (worker: Worker) => void;
  onOpenChat: (worker: Worker) => void;
  onOpenSendRequest: (worker: Worker) => void;
  onOpenReport: (worker: Worker) => void;
}

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({
  worker,
  onClose,
  onOpenBooking,
  onOpenChat,
  onOpenSendRequest,
  onOpenReport
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'oficios' | 'resenas' | 'galeria'>('info');
  const [reportedReviews, setReportedReviews] = useState<Record<string, boolean>>({});
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReasonText, setReportReasonText] = useState('');

  // RF-38: Reportar reseña potencialmente falsa
  const handleReportFakeReview = (review: Review) => {
    if (!reportReasonText.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem('oy-complaints') || '[]');
      const fakeReviewTicket = {
        id: `cmp-rev-${Date.now()}`,
        caseNumber: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
        targetWorkerId: worker.id,
        targetWorkerName: worker.name,
        type: 'Reseña Falsa',
        description: `Reporte de reseña de "${review.author}": ${reportReasonText}`,
        evidenceFiles: [],
        createdAt: new Date().toISOString(),
        status: 'En revisión',
        isFakeReviewReport: true,
        reviewId: review.id
      };
      localStorage.setItem('oy-complaints', JSON.stringify([fakeReviewTicket, ...existing]));
    } catch (_e) {}

    setReportedReviews(prev => ({ ...prev, [review.id]: true }));
    setReportingReviewId(null);
    setReportReasonText('');
  };

  const canBook = worker.available && !worker.isPaused;
  const primaryRep = worker.ratingByTrade?.[worker.trade];

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'info', label: 'Detalles & Horarios' },
    { id: 'oficios', label: 'Oficios & Reputación' },
    { id: 'resenas', label: `Reseñas (${worker.reviews.length})` },
    { id: 'galeria', label: `Portafolio (${worker.gallery.length})` }
  ];

  return (
    <div className="oy-modal-backdrop">
      <div
        className="oy-modal wk-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wk-name"
      >
        {/* Banda de cabecera con lavado y foto en círculo */}
        <div className="oy-modal__head wk-head">
          <div className="wk-head__id">
            <div
              className="wk-avatar"
              style={{ '--wk-avatar-bg': worker.avatarColor } as React.CSSProperties}
              aria-hidden="true"
            >
              {worker.initials}
            </div>

            <div className="wk-head__text">
              <span className="wk-trade-label">{worker.tradeLabel}</span>
              <h2 id="wk-name" className="oy-display wk-name">{worker.name}</h2>
              <div className="wk-badges">
                {worker.verified && (
                  <span className="badge badge-verified wk-sticker wk-sticker--tilt-l" title="Identidad validada con documento">
                    <ShieldCheck size={14} aria-hidden="true" /> Verificado
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
                  {worker.isPaused ? 'Pausado' : worker.available ? 'Disponible Ahora' : 'Fuera de línea'}
                </span>
              </div>
            </div>
          </div>

          <div className="wk-head__tools">
            <button
              onClick={onClose}
              className="oy-icon-btn"
              title="Cerrar ventana"
              aria-label="Cerrar ventana"
            >
              <X size={18} />
            </button>
            <button
              onClick={() => onOpenReport(worker)}
              className="btn btn-secondary wk-report-btn"
              title="Reportar anomalía o queja ante administración"
            >
              <AlertTriangle size={14} aria-hidden="true" /> Reportar
            </button>
          </div>
        </div>

        <div className="oy-modal__body wk-body">
          {/* Banner de Pausa Automática por Bajas Calificaciones (RF-39) */}
          {worker.isPaused && (
            <div className="wk-alert" role="status">
              <AlertTriangle size={20} aria-hidden="true" />
              <div>
                <strong>Perfil suspendido automáticamente:</strong> {worker.pauseReason || 'Promedio menor a 3.0 estrellas en sus últimas 5 reseñas. Se han bloqueado nuevas solicitudes.'}
              </div>
            </div>
          )}

          {/* Calificación y Métricas Clave (RF-08, RF-10) */}
          <div className="wk-stats">
            <div className="oy-stat wk-stat--amarillo">
              <span className="oy-stat__label">Calificación</span>
              <span className="oy-stat__value wk-stat__row">
                <Star size={22} fill="var(--color-star)" color="var(--stroke-ink)" aria-hidden="true" /> {worker.rating.toFixed(1)}
                <span className="wk-stat__aside">({worker.reviewCount})</span>
              </span>
            </div>

            <div className="oy-stat wk-stat--esmeralda">
              <span className="oy-stat__label">Trabajos Completados</span>
              <span className="oy-stat__value">{worker.completedJobsCount}</span>
              <span className="wk-stat__aside">servicios</span>
            </div>

            <div className="oy-stat wk-stat--marino">
              <span className="oy-stat__label">Tarifa Aprox.</span>
              <span className="oy-stat__value wk-stat__value--sm">${worker.hourlyRate.toLocaleString()}</span>
              <span className="wk-stat__aside">COP /h</span>
            </div>

            <div className="oy-stat">
              <span className="oy-stat__label">Zona</span>
              <span className="wk-stat__zone">
                <MapPin size={15} aria-hidden="true" /> {worker.location.zoneName}
              </span>
            </div>
          </div>

          {/* Selector de Pestañas Internas */}
          <div className="wk-tabs" role="group" aria-label="Secciones del perfil">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className="oy-chip"
                aria-pressed={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido Pestaña 1: Detalles & Horarios (RF-04, RF-06, RF-09, RF-60) */}
          {activeTab === 'info' && (
            <div className="wk-pane">
              <section className="wk-block">
                <h3 className="wk-block__title">Biografía y Experiencia</h3>
                <p className="wk-text">{worker.bio}</p>
                <span className="wk-chip-line">
                  <Phone size={13} aria-hidden="true" /> {worker.phone}
                </span>
              </section>

              {/* RF-60: Métodos de Pago Aceptados */}
              <section className="wk-card wk-card--almendra">
                <h3 className="wk-block__title wk-block__title--icon">
                  <CreditCard size={16} aria-hidden="true" /> Métodos de Pago Aceptados
                </h3>
                <div className="wk-tags">
                  {(worker.acceptedPaymentMethods || ['efectivo', 'nequi', 'daviplata']).map(method => (
                    <span key={method} className="wk-tag wk-tag--upper">
                      ✓ {method}
                    </span>
                  ))}
                </div>
              </section>

              {/* RF-09: Equipamiento, Marcas y Especies */}
              {(worker.equipment || worker.brands || worker.species) && (
                <div className="wk-grid">
                  {worker.equipment && (
                    <section className="wk-card">
                      <h3 className="wk-block__title wk-block__title--icon">
                        <Wrench size={14} aria-hidden="true" /> Equipo & Herramientas
                      </h3>
                      <ul className="wk-list">
                        {worker.equipment.map((eq, i) => (
                          <li key={i}>{eq}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {worker.brands && (
                    <section className="wk-card">
                      <h3 className="wk-block__title wk-block__title--icon">
                        <Tag size={14} aria-hidden="true" /> Marcas Atendidas
                      </h3>
                      <div className="wk-tags">
                        {worker.brands.map((b, i) => (
                          <span key={i} className="wk-tag">{b}</span>
                        ))}
                      </div>
                    </section>
                  )}

                  {worker.species && (
                    <section className="wk-card">
                      <h3 className="wk-block__title">🐾 Especies Atendidas</h3>
                      <div className="wk-tags">
                        {worker.species.map((sp, i) => (
                          <span key={i} className="wk-tag">{sp}</span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* Slots de Disponibilidad Semanal (RF-06) */}
              <section className="wk-block">
                <h3 className="wk-block__title wk-block__title--icon">
                  <Calendar size={16} aria-hidden="true" /> Horarios y Disponibilidad Semanal
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
            </div>
          )}

          {/* Contenido Pestaña 2: Oficios & Reputación Diferenciada (RF-02, RF-03, RF-56, RF-66, RF-71, RF-74) */}
          {activeTab === 'oficios' && (
            <div className="wk-pane">
              <div className="wk-block">
                <h3 className="wk-block__title">Reputación Diferenciada por Oficio</h3>
                <p className="wk-text">
                  Las calificaciones y trabajos no se promedian entre oficios distintos para proteger la reputación especializada.
                </p>
              </div>

              {/* Oficio Principal (RF-02) */}
              <section className="wk-trade wk-trade--primary">
                <div className="wk-trade__head">
                  <span className="oy-sticker oy-sticker--pill oy-sticker--amarillo wk-trade__pill">Oficio principal</span>
                  <h4 className="oy-display wk-trade__name">{worker.tradeLabel}</h4>
                </div>

                <div className="wk-trade__stats">
                  <div className="oy-stat wk-stat--amarillo">
                    <span className="oy-stat__label">Calificación</span>
                    <span className="oy-stat__value wk-stat__row">
                      <Star size={20} fill="var(--color-star)" color="var(--stroke-ink)" aria-hidden="true" />
                      {primaryRep?.rating || worker.rating}
                    </span>
                    <span className="wk-stat__aside">{primaryRep?.reviewCount || worker.reviewCount} reseñas</span>
                  </div>
                  <div className="oy-stat wk-stat--esmeralda">
                    <span className="oy-stat__label">Trabajos completados</span>
                    <span className="oy-stat__value">{primaryRep?.completedJobs || worker.completedJobsCount}</span>
                  </div>
                  <div className="oy-stat wk-stat--marino">
                    <span className="oy-stat__label">Tarifa</span>
                    <span className="oy-stat__value wk-stat__value--sm">${worker.hourlyRate.toLocaleString()}</span>
                    <span className="wk-stat__aside">COP/h</span>
                  </div>
                </div>

                {/* Especializaciones (RF-66) */}
                {worker.specializations && worker.specializations.length > 0 && (
                  <div className="wk-specs">
                    <span className="oy-label wk-specs__label">Especializaciones registradas</span>
                    <div className="wk-tags">
                      {worker.specializations.map((spec, i) => (
                        <span key={i} className="wk-tag wk-tag--role">{spec}</span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Oficios Secundarios (RF-03) */}
              {worker.secondaryTrades && worker.secondaryTrades.length > 0 && worker.secondaryTrades.map(secTrade => {
                const secRep = worker.ratingByTrade?.[secTrade] || { rating: 4.8, reviewCount: 6, completedJobs: 6 };
                return (
                  <section key={secTrade} className="wk-trade">
                    <div className="wk-trade__head">
                      <span className="oy-sticker oy-sticker--pill oy-sticker--blanco wk-trade__pill">Oficio secundario</span>
                      <h4 className="oy-display wk-trade__name wk-trade__name--cap">{secTrade}</h4>
                    </div>
                    <div className="wk-trade__stats">
                      <div className="oy-stat wk-stat--amarillo">
                        <span className="oy-stat__label">Calificación</span>
                        <span className="oy-stat__value wk-stat__row">
                          <Star size={20} fill="var(--color-star)" color="var(--stroke-ink)" aria-hidden="true" /> {secRep.rating}
                        </span>
                        <span className="wk-stat__aside">{secRep.reviewCount} reseñas</span>
                      </div>
                      <div className="oy-stat wk-stat--esmeralda">
                        <span className="oy-stat__label">Trabajos completados</span>
                        <span className="oy-stat__value">{secRep.completedJobs}</span>
                      </div>
                    </div>
                  </section>
                );
              })}

              {/* Referente Comunitario Verificado (RF-68, RF-69) */}
              {worker.referrals && (
                <section className="wk-card wk-card--amarillo">
                  <h3 className="wk-block__title wk-block__title--icon">
                    <Award size={18} aria-hidden="true" /> Crecimiento Comunitario & Referidos
                  </h3>
                  <p className="wk-text wk-text--main">
                    Código de referente: <strong>{worker.referrals.code}</strong>. Ha referido a {worker.referrals.count} colegas técnicos en {worker.referrals.distinctTradesCount} oficios distintos.
                  </p>
                  {worker.referrals.isCommunityReferrer && (
                    <span className="oy-sticker oy-sticker--pill oy-sticker--amarillo wk-badge-perm">
                      <Award size={14} aria-hidden="true" /> Insignia Permanente: Referente Comunitario Verificado
                    </span>
                  )}
                </section>
              )}
            </div>
          )}

          {/* Contenido Pestaña 3: Reseñas & Reporte de Falsas (RF-36, RF-38) */}
          {activeTab === 'resenas' && (
            <div className="wk-pane">
              {worker.reviews.length === 0 ? (
                <div className="oy-empty wk-empty">
                  <p className="oy-empty__title">Sin reseñas todavía</p>
                  <p className="oy-empty__text">Aún no tiene reseñas registradas. ¡Sé el primero en calificarlo!</p>
                </div>
              ) : (
                worker.reviews.map(rev => {
                  const isReported = reportedReviews[rev.id] || rev.isReported;
                  return (
                    <article key={rev.id} className="wk-review">
                      <div className="wk-review__head">
                        <div className="wk-review__who">
                          <span className="wk-review__author">{rev.author}</span>
                          {rev.verifiedWork && (
                            <span className="wk-review__verified">
                              <CheckCircle2 size={12} aria-hidden="true" /> Trabajo Verificado
                            </span>
                          )}
                          {rev.tradeCategory && (
                            <span className="wk-tag wk-tag--sm wk-tag--cap">{rev.tradeCategory}</span>
                          )}
                        </div>
                        <span className="wk-review__date">{rev.date}</span>
                      </div>

                      <div className="wk-review__rating">
                        <PeekRating value={rev.rating} readOnly size={13} />

                        {/* Botón Reportar Reseña Falsa (RF-38) */}
                        {isReported ? (
                          <span className="wk-review__reported">Reseña reportada para moderación</span>
                        ) : (
                          <button
                            onClick={() => setReportingReviewId(reportingReviewId === rev.id ? null : rev.id)}
                            className="wk-link-btn"
                            title="Reportar reseña potencialmente falsa ante el administrador"
                            aria-expanded={reportingReviewId === rev.id}
                          >
                            <Flag size={12} aria-hidden="true" /> Reportar sospechosa
                          </button>
                        )}
                      </div>

                      <p className="wk-review__comment">"{rev.comment}"</p>

                      {/* Formulario desplegable para reportar reseña falsa */}
                      {reportingReviewId === rev.id && (
                        <div className="wk-report-form">
                          <label className="wk-report-form__label" htmlFor={`wk-report-${rev.id}`}>
                            Motivo del reporte (lo revisa nuestro equipo; no se borra automáticamente):
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
                            <button onClick={() => setReportingReviewId(null)} className="btn btn-secondary wk-btn-sm">
                              Cancelar
                            </button>
                            <button onClick={() => handleReportFakeReview(rev)} className="btn btn-danger wk-btn-sm wk-btn-danger">
                              Enviar Reporte
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          )}

          {/* Contenido Pestaña 4: Portafolio de Trabajos (RF-07, RF-65) */}
          {activeTab === 'galeria' && <WorkerGallery images={worker.gallery} />}
        </div>

        {/* Barra de Acciones: Chat, Enviar Petición, Contratar / No disponible */}
        <div className="wk-actions">
          <button onClick={() => onOpenChat(worker)} className="btn btn-secondary wk-actions__btn">
            <MessageCircle size={16} aria-hidden="true" /> Chatear
          </button>

          <button
            onClick={() => onOpenSendRequest(worker)}
            className="btn btn-secondary wk-actions__btn"
            disabled={worker.isPaused}
          >
            <Send size={16} aria-hidden="true" /> Enviar petición
          </button>

          <button
            onClick={() => {
              if (worker.available && !worker.isPaused) onOpenBooking(worker);
            }}
            disabled={!canBook}
            className="btn btn-primary wk-actions__btn wk-actions__btn--main"
          >
            <Calendar size={16} aria-hidden="true" /> {worker.isPaused ? 'Pausado' : worker.available ? 'Contratar Servicio' : 'No disponible'}
          </button>
        </div>
      </div>
    </div>
  );
};

/** Portafolio en carrusel 3D; repite las fotos para que el anillo se vea lleno. */
const MIN_RING_ITEMS = 6;

const WorkerGallery: React.FC<{ images: string[] }> = ({ images }) => {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div className="oy-empty wk-empty">
        <ImageIcon size={28} aria-hidden="true" />
        <p className="oy-empty__text">Este trabajador aún no ha subido evidencias de trabajo.</p>
      </div>
    );
  }

  const repeats = Math.max(1, Math.ceil(MIN_RING_ITEMS / images.length));
  const items = Array.from({ length: images.length * repeats }, (_, i) => ({
    src: images[i % images.length],
    alt: `Evidencia de trabajo ${(i % images.length) + 1}`,
  }));

  return (
    <div className="wk-gallery">
      <div className="wk-gallery__stage">
        <CircularCarousel
          items={items}
          preset="cylinder"
          intro="rise"
          cardWidth={220}
          aspectRatio={4 / 3}
          captions={false}
          ariaLabel="Portafolio de trabajos"
          onChange={(i) => setCurrent(i % images.length)}
        />
      </div>
      <p aria-live="polite" className="wk-gallery__counter">
        Trabajo {current + 1} de {images.length} · arrastra o usa las flechas
      </p>
    </div>
  );
};
