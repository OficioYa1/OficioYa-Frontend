import React, { useId, useState } from 'react';
import type { Worker, Review } from '../../types';
import { PeekRating } from '../../components/ui';
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
  Flag,
  PawPrint
} from 'lucide-react';
import { TRADE_LABELS, rateUnitShort } from '../../utils/workerProfile';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { useFlowModal } from '../requests/useFlowModal';
import './Worker.css';

interface WorkerProfileModalProps {
  worker: Worker;
  onClose: () => void;
  onOpenBooking: (worker: Worker) => void;
  onOpenChat: (worker: Worker) => void;
  onOpenSendRequest: (worker: Worker) => void;
  onOpenReport: (worker: Worker) => void;
}

type TabId = 'info' | 'oficios' | 'resenas' | 'galeria';

const formatCop = (value: number) => `$${value.toLocaleString('es-CO')}`;

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({
  worker,
  onClose,
  onOpenBooking,
  onOpenChat,
  onOpenSendRequest,
  onOpenReport
}) => {
  const uid = useId();
  const dialogRef = useFlowModal(onClose);
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [reportedReviews, setReportedReviews] = useState<Record<string, boolean>>({});
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReasonText, setReportReasonText] = useState('');
  const [reportError, setReportError] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  // RF-38: Reportar reseña potencialmente falsa
  const handleReportFakeReview = (review: Review) => {
    if (!reportReasonText.trim()) {
      setReportError(true);
      return;
    }

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
    } catch {
      /* sin almacenamiento: el reporte queda solo en esta sesión */
    }

    setReportedReviews(prev => ({ ...prev, [review.id]: true }));
    setReportingReviewId(null);
    setReportReasonText('');
    setReportError(false);
  };

  const canBook = worker.available && !worker.isPaused;
  const primaryRep = worker.ratingByTrade?.[worker.trade];
  const unit = rateUnitShort(worker.rateUnit);
  const formatRating = (rating: number, count: number) => (count > 0 ? rating.toFixed(1) : '—');
  const statusLabel = worker.isPaused ? 'Pausado' : worker.available ? 'Disponible ahora' : 'Fuera de línea';

  const tabs: { id: TabId; label: string }[] = [
    { id: 'info', label: 'Detalles' },
    { id: 'resenas', label: `Reseñas (${worker.reviews.length})` },
    { id: 'galeria', label: `Portafolio (${worker.gallery.length})` },
    { id: 'oficios', label: 'Oficios' }
  ];
  const tabId = (id: TabId) => `${uid}-tab-${id}`;
  const panelId = `${uid}-panel`;

  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const last = tabs.length - 1;
    const next =
      e.key === 'Home' ? 0 : e.key === 'End' ? last : e.key === 'ArrowRight' ? (index === last ? 0 : index + 1) : (index === 0 ? last : index - 1);
    setActiveTab(tabs[next].id);
    document.getElementById(tabId(tabs[next].id))?.focus();
  };

  // Distribución de estrellas de las reseñas verificadas
  const distribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: worker.reviews.filter(r => Math.round(r.rating) === stars).length
  }));
  const maxCount = Math.max(1, ...distribution.map(d => d.count));

  return (
    <div className="oy-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className="oy-modal wk-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-name`}
        tabIndex={-1}
      >
        <header className="wk-head">
          <div className="wk-head__tools">
            <button
              type="button"
              onClick={() => onOpenReport(worker)}
              className="wk-report-btn"
            >
              <AlertTriangle size={14} aria-hidden="true" /> Reportar
            </button>
            <button type="button" onClick={onClose} className="oy-icon-btn" aria-label="Cerrar perfil">
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="wk-hero">
            <div
              className="wk-photo"
              style={{ '--wk-avatar-bg': worker.avatarColor } as React.CSSProperties}
            >
              {worker.photoUrl && !photoFailed ? (
                <img src={worker.photoUrl} alt={`Foto de ${worker.name}`} onError={() => setPhotoFailed(true)} />
              ) : (
                <span aria-hidden="true">{worker.initials}</span>
              )}
            </div>

            <div className="wk-hero__text">
              <span className="wk-trade-label">{worker.tradeLabel}</span>
              <h2 id={`${uid}-name`} className="wk-name">{worker.name}</h2>
              <p className="wk-zone">
                <MapPin size={14} aria-hidden="true" /> {worker.location.zoneName}
                {worker.maxDistanceKm ? ` · atiende hasta ${worker.maxDistanceKm} km` : ''}
              </p>
              <div className="wk-badges">
                {worker.verified && (
                  <span className="wk-pill wk-pill--verified" title="Identidad validada con documento">
                    <ShieldCheck size={14} aria-hidden="true" /> Verificado
                  </span>
                )}
                <span className={`wk-pill ${canBook ? 'wk-pill--available' : 'wk-pill--off'}`}>
                  <span className="wk-pill__dot" aria-hidden="true" /> {statusLabel}
                </span>
                {worker.referrals?.isCommunityReferrer && (
                  <span className="wk-pill wk-pill--warm" title="Referidos activos en 3 o más oficios">
                    <Award size={14} aria-hidden="true" /> Referente comunitario
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Reputación y métricas clave (RF-08, RF-10) */}
          <dl className="wk-rep">
            <div className="wk-rep__item">
              <dt>Calificación</dt>
              <dd>
                <Star size={20} fill="var(--color-star)" color="var(--color-star)" aria-hidden="true" />
                {formatRating(worker.rating, worker.reviewCount)}
                <span className="wk-rep__aside">{worker.reviewCount} reseñas</span>
              </dd>
            </div>
            <div className="wk-rep__item">
              <dt>Trabajos</dt>
              <dd>
                {worker.completedJobsCount}
                <span className="wk-rep__aside">completados</span>
              </dd>
            </div>
            <div className="wk-rep__item">
              <dt>Tarifa aprox.</dt>
              <dd>
                {formatCop(worker.hourlyRate)}
                <span className="wk-rep__aside">COP/{unit}</span>
              </dd>
            </div>
          </dl>
        </header>

        <div className="wk-body">
          {/* Banner de pausa automática por bajas calificaciones (RF-39) */}
          {worker.isPaused && (
            <div className="wk-alert" role="status">
              <AlertTriangle size={20} aria-hidden="true" />
              <p>
                <strong>Perfil suspendido automáticamente.</strong>{' '}
                {worker.pauseReason || 'Promedio menor a 3.0 estrellas en sus últimas 5 reseñas. Se bloquearon nuevas solicitudes.'}
              </p>
            </div>
          )}

          <div className="wk-tabs" role="tablist" aria-label="Secciones del perfil">
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                id={tabId(tab.id)}
                type="button"
                role="tab"
                className="wk-tab"
                aria-selected={activeTab === tab.id}
                aria-controls={panelId}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={e => onTabKey(e, i)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div id={panelId} role="tabpanel" aria-labelledby={tabId(activeTab)} className="wk-pane" key={activeTab}>
            {/* Detalles y horarios (RF-04, RF-06, RF-09, RF-60) */}
            {activeTab === 'info' && (
              <>
                <section className="wk-block">
                  <h3 className="wk-block__title">Sobre {worker.name.split(' ')[0]}</h3>
                  <p className="wk-text">{worker.bio}</p>
                  <span className="wk-chip-line">
                    <Phone size={13} aria-hidden="true" /> {worker.phone}
                  </span>
                </section>

                <section className="wk-card">
                  <h3 className="wk-block__title wk-block__title--icon">
                    <CreditCard size={16} aria-hidden="true" /> Medios de pago
                  </h3>
                  <div className="wk-tags">
                    {(worker.acceptedPaymentMethods || ['efectivo', 'nequi', 'daviplata']).map(method => (
                      <span key={method} className="wk-tag wk-tag--cap">
                        <CheckCircle2 size={12} aria-hidden="true" /> {method.replace('_', '-')}
                      </span>
                    ))}
                  </div>
                </section>

                {(worker.equipment?.length || worker.brands?.length || worker.species?.length) ? (
                  <div className="wk-grid">
                    {worker.equipment && (
                      <section className="wk-card">
                        <h3 className="wk-block__title wk-block__title--icon">
                          <Wrench size={15} aria-hidden="true" /> Equipo y herramientas
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
                          <Tag size={15} aria-hidden="true" /> Marcas que atiende
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
                        <h3 className="wk-block__title wk-block__title--icon">
                          <PawPrint size={15} aria-hidden="true" /> Especies que atiende
                        </h3>
                        <div className="wk-tags">
                          {worker.species.map((sp, i) => (
                            <span key={i} className="wk-tag">{sp}</span>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                ) : null}

                {/* Disponibilidad semanal (RF-06) */}
                <section className="wk-block">
                  <h3 className="wk-block__title wk-block__title--icon">
                    <Calendar size={16} aria-hidden="true" /> Horarios
                  </h3>
                  <ul className="wk-schedule">
                    {worker.schedule.map((item, idx) => (
                      <li key={idx} className="wk-schedule__row">
                        <span className="wk-schedule__day">{item.day}</span>
                        <span className="wk-schedule__slots">{item.slots.join(' · ')}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            {/* Reseñas verificadas y reporte de falsas (RF-36, RF-38) */}
            {activeTab === 'resenas' && (
              worker.reviews.length === 0 ? (
                <div className="oy-empty wk-empty">
                  <MascotAvatar size="md" />
                  <p className="oy-empty__title">Sin reseñas todavía</p>
                  <p className="oy-empty__text">Cuando complete su primer servicio contigo podrás calificarlo.</p>
                </div>
              ) : (
                <>
                  <section className="wk-summary" aria-label="Resumen de reseñas">
                    <div className="wk-summary__score">
                      <span className="wk-summary__value">{formatRating(worker.rating, worker.reviewCount)}</span>
                      <PeekRating value={Math.round(worker.rating)} readOnly size={16} ariaLabel={`${worker.rating.toFixed(1)} de 5 estrellas`} />
                      <span className="wk-summary__count">{worker.reviewCount} reseñas verificadas</span>
                    </div>
                    <ul className="wk-summary__bars">
                      {distribution.map(d => (
                        <li key={d.stars}>
                          <span className="wk-summary__stars">{d.stars} <Star size={11} aria-hidden="true" /></span>
                          <span className="wk-summary__track" aria-hidden="true">
                            <span style={{ transform: `scaleX(${d.count / maxCount})` }} />
                          </span>
                          <span className="wk-summary__num">
                            {d.count}<span className="wk-sr"> reseñas de {d.stars} estrellas</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {worker.reviews.map(rev => {
                    const isReported = reportedReviews[rev.id] || rev.isReported;
                    const reasonId = `${uid}-report-${rev.id}`;
                    return (
                      <article key={rev.id} className="wk-review">
                        <div className="wk-review__head">
                          <span className="wk-review__avatar" aria-hidden="true">{rev.author.charAt(0)}</span>
                          <div className="wk-review__who">
                            <span className="wk-review__author">{rev.author}</span>
                            <span className="wk-review__date">{rev.date}</span>
                          </div>
                          <PeekRating value={rev.rating} readOnly size={13} ariaLabel={`${rev.rating} de 5 estrellas`} />
                        </div>
                        <div className="wk-review__tags">
                          {rev.verifiedWork && (
                            <span className="wk-pill wk-pill--available wk-pill--sm">
                              <CheckCircle2 size={12} aria-hidden="true" /> Trabajo verificado
                            </span>
                          )}
                          {rev.tradeCategory && (
                            <span className="wk-tag wk-tag--cap">{TRADE_LABELS[rev.tradeCategory] ?? rev.tradeCategory}</span>
                          )}
                        </div>

                        <p className="wk-review__comment">{rev.comment}</p>

                        <div className="wk-review__foot">
                          {isReported ? (
                            <span className="wk-review__reported">Reportada para moderación</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setReportingReviewId(reportingReviewId === rev.id ? null : rev.id);
                                setReportError(false);
                              }}
                              className="wk-link-btn"
                              aria-expanded={reportingReviewId === rev.id}
                            >
                              <Flag size={12} aria-hidden="true" /> Reportar reseña sospechosa
                            </button>
                          )}
                        </div>

                        {reportingReviewId === rev.id && (
                          <div className="wk-report-form">
                            <label className="wk-report-form__label" htmlFor={reasonId}>
                              Motivo del reporte
                            </label>
                            <input
                              id={reasonId}
                              type="text"
                              className="input-base"
                              placeholder="Ej. reseña falsa, conflicto de interés o suplantación"
                              value={reportReasonText}
                              aria-invalid={reportError || undefined}
                              aria-describedby={`${reasonId}-hint`}
                              onChange={e => {
                                setReportReasonText(e.target.value);
                                if (e.target.value.trim()) setReportError(false);
                              }}
                            />
                            <p id={`${reasonId}-hint`} className={`wk-field-hint${reportError ? ' is-error' : ''}`}>
                              {reportError
                                ? 'Cuéntanos el motivo para poder revisarla.'
                                : 'Lo revisa nuestro equipo; la reseña no se borra automáticamente.'}
                            </p>
                            <div className="wk-report-form__actions">
                              <button type="button" onClick={() => setReportingReviewId(null)} className="btn btn-secondary wk-btn-sm">
                                Cancelar
                              </button>
                              <button type="button" onClick={() => handleReportFakeReview(rev)} className="btn wk-btn-sm wk-btn-danger">
                                Enviar reporte
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </>
              )
            )}

            {/* Portafolio de trabajos (RF-07, RF-65) */}
            {activeTab === 'galeria' && <WorkerGallery images={worker.gallery} name={worker.name} />}

            {/* Oficios y reputación diferenciada (RF-02, RF-03, RF-56, RF-66, RF-68, RF-69) */}
            {activeTab === 'oficios' && (
              <>
                <p className="wk-text">
                  Las calificaciones no se promedian entre oficios distintos para proteger la reputación especializada.
                </p>

                <section className="wk-trade wk-trade--primary">
                  <div className="wk-trade__head">
                    <span className="wk-pill wk-pill--sm">Oficio principal</span>
                    <h3 className="wk-trade__name">{worker.tradeLabel}</h3>
                  </div>
                  <dl className="wk-trade__stats">
                    <div>
                      <dt>Calificación</dt>
                      <dd>
                        <Star size={16} fill="var(--color-star)" color="var(--color-star)" aria-hidden="true" />
                        {primaryRep
                          ? formatRating(primaryRep.rating, primaryRep.reviewCount)
                          : formatRating(worker.rating, worker.reviewCount)}
                        <span className="wk-rep__aside">{primaryRep?.reviewCount ?? worker.reviewCount} reseñas</span>
                      </dd>
                    </div>
                    <div>
                      <dt>Trabajos</dt>
                      <dd>{primaryRep?.completedJobs ?? worker.completedJobsCount}</dd>
                    </div>
                    <div>
                      <dt>Tarifa</dt>
                      <dd>{formatCop(worker.hourlyRate)}<span className="wk-rep__aside">/{unit}</span></dd>
                    </div>
                  </dl>
                  {worker.specializations && worker.specializations.length > 0 && (
                    <div className="wk-specs">
                      <span className="wk-specs__label">Especializaciones</span>
                      <div className="wk-tags">
                        {worker.specializations.map((spec, i) => (
                          <span key={i} className="wk-tag wk-tag--role">{spec}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {worker.secondaryTrades?.map(secTrade => {
                  const secRep = worker.ratingByTrade?.[secTrade] ?? { rating: 0, reviewCount: 0, completedJobs: 0 };
                  const secService = worker.services.find(sv => sv.trade === secTrade);
                  return (
                    <section key={secTrade} className="wk-trade">
                      <div className="wk-trade__head">
                        <span className="wk-pill wk-pill--sm">Oficio secundario</span>
                        <h3 className="wk-trade__name wk-trade__name--cap">{secService?.tradeLabel ?? TRADE_LABELS[secTrade] ?? secTrade}</h3>
                      </div>
                      <dl className="wk-trade__stats">
                        <div>
                          <dt>Calificación</dt>
                          <dd>
                            <Star size={16} fill="var(--color-star)" color="var(--color-star)" aria-hidden="true" />
                            {formatRating(secRep.rating, secRep.reviewCount)}
                            <span className="wk-rep__aside">{secRep.reviewCount} reseñas</span>
                          </dd>
                        </div>
                        <div>
                          <dt>Trabajos</dt>
                          <dd>{secRep.completedJobs}</dd>
                        </div>
                        {secService && (
                          <div>
                            <dt>Tarifa</dt>
                            <dd>{formatCop(secService.hourlyRate)}<span className="wk-rep__aside">/{rateUnitShort(secService.rateUnit)}</span></dd>
                          </div>
                        )}
                      </dl>
                    </section>
                  );
                })}

                {worker.referrals && (
                  <section className="wk-card">
                    <h3 className="wk-block__title wk-block__title--icon">
                      <Award size={16} aria-hidden="true" /> Crecimiento comunitario
                    </h3>
                    <p className="wk-text">
                      Código de referente <strong>{worker.referrals.code}</strong>. Ha referido a {worker.referrals.count} colegas en {worker.referrals.distinctTradesCount} oficios distintos.
                    </p>
                    {worker.referrals.isCommunityReferrer && (
                      <span className="wk-pill wk-pill--warm wk-pill--start">
                        <Award size={14} aria-hidden="true" /> Insignia permanente: Referente comunitario verificado
                      </span>
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        </div>

        {/* CTA fija al pie: solicitar, reservar y chatear */}
        <div className="wk-actions">
          <button type="button" onClick={() => onOpenChat(worker)} className="btn btn-secondary wk-actions__btn">
            <MessageCircle size={18} aria-hidden="true" /> Chatear
          </button>
          <button
            type="button"
            onClick={() => canBook && onOpenBooking(worker)}
            className="btn btn-secondary wk-actions__btn"
            disabled={!canBook}
          >
            <Calendar size={18} aria-hidden="true" /> {canBook ? 'Reservar cita' : 'Sin agenda hoy'}
          </button>
          <button
            type="button"
            onClick={() => onOpenSendRequest(worker)}
            className="btn btn-primary wk-actions__btn wk-actions__btn--main"
            disabled={worker.isPaused}
          >
            <Send size={18} aria-hidden="true" /> {worker.isPaused ? 'Perfil pausado' : 'Solicitar servicio'}
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkerGallery: React.FC<{ images: string[]; name: string }> = ({ images, name }) => {
  if (images.length === 0) {
    return (
      <div className="oy-empty wk-empty">
        <ImageIcon size={28} aria-hidden="true" />
        <p className="oy-empty__text">{name.split(' ')[0]} aún no ha subido fotos de sus trabajos.</p>
      </div>
    );
  }

  return (
    <ul className="wk-gallery" aria-label="Portafolio de trabajos">
      {images.map((src, i) => (
        <li key={`${src}-${i}`} className="wk-gallery__item">
          <img src={src} alt={`Trabajo ${i + 1} de ${name}`} loading="lazy" />
        </li>
      ))}
    </ul>
  );
};
