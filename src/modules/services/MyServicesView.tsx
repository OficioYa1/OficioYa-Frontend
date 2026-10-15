import React, { useEffect, useRef, useState } from 'react';
import type { ServiceRequest, ServiceStatus } from '../../types';
import { PeekRating } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { PageHero } from '../../components/layout/PageHero';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { mediaService, MediaUploadError } from '../../services/mock/mediaService';
import { useReveal } from '../../hooks/useReveal';
import './Services.css';
import {
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Star,
  Camera,
  RotateCcw,
  BarChart3,
  UserCheck,
  X,
  MessageSquareWarning,
  ClipboardList,
  Hourglass,
  AlertCircle,
  type LucideIcon
} from 'lucide-react';

interface MyServicesViewProps {
  services: ServiceRequest[];
  onUpdateServiceStatus: (
    serviceId: string,
    newStatus: ServiceStatus,
    reason?: string,
    extra?: Partial<ServiceRequest>
  ) => void;
  onSubmitReview: (serviceId: string, rating: number, comment: string) => void;
  onOpenReport: (service: ServiceRequest) => void;
  onRehireWorker?: (workerId: string, workerName: string, trade: string) => void;
  /** OFY-35: el trabajador califica al contratante. */
  onRateClient?: (serviceId: string, rating: number, comment: string) => void;
}

type MascotMood = 'pensativo' | 'alegre' | 'guino' | 'entusiasta';

const STATUS_META: Record<
  ServiceStatus,
  { label: string; column: string; tone: string; icon: LucideIcon; empty: string; emptyMood: MascotMood }
> = {
  pendiente: {
    label: 'Pendiente',
    column: 'Pendientes',
    tone: 'amarillo',
    icon: Hourglass,
    empty: 'Nada esperando respuesta.',
    emptyMood: 'guino'
  },
  en_curso: {
    label: 'En curso',
    column: 'En curso',
    tone: 'marino',
    icon: Wrench,
    empty: 'Ningún trabajo en curso ahora.',
    emptyMood: 'pensativo'
  },
  finalizado: {
    label: 'Completado',
    column: 'Completados',
    tone: 'esmeralda',
    icon: CheckCircle2,
    empty: 'Los trabajos terminados aparecerán aquí.',
    emptyMood: 'alegre'
  },
  cancelado: {
    label: 'Cancelado',
    column: 'Cancelados',
    tone: 'cancelado',
    icon: XCircle,
    empty: 'Sin cancelaciones. ¡Bien!',
    emptyMood: 'entusiasta'
  }
};

const COLUMNS: ServiceStatus[] = ['pendiente', 'en_curso', 'finalizado', 'cancelado'];

const CANCEL_REASONS = [
  'El profesional no se presentó en la hora pactada',
  'Encontré otra solución antes de la visita',
  'Tarifa no acordada o desacuerdo en precio',
  'Emergencia personal / cambio de planes',
  'Dirección incorrecta o fuera de cobertura en Bogotá',
  'Falta de comunicación del proveedor'
];

export const MyServicesView: React.FC<MyServicesViewProps> = ({
  services,
  onUpdateServiceStatus,
  onSubmitReview,
  onOpenReport,
  onRehireWorker,
  onRateClient
}) => {
  const { role } = useAuth();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeColumn, setActiveColumn] = useState<ServiceStatus>(
    () => COLUMNS.find(c => services.some(s => s.status === c)) ?? 'pendiente'
  );

  // Modal Cancelación con justificación obligatoria (RF-76)
  const [cancellingService, setCancellingService] = useState<ServiceRequest | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const otherReason = '';

  // Modal Finalización con Evidencia Fotográfica (RF-62, RF-29)
  const [completingService, setCompletingService] = useState<ServiceRequest | null>(null);
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState<string>('');
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  // Modal Calificación Bilateral (RF-34, RF-35, RF-36)
  const [reviewingService, setReviewingService] = useState<ServiceRequest | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Trabajador calificando al contratante (RF-35)
  const [ratingClientService, setRatingClientService] = useState<ServiceRequest | null>(null);
  const [clientRatingValue, setClientRatingValue] = useState<number>(5);
  const [clientRatingComment, setClientRatingComment] = useState<string>('Excelente cliente, trato muy amable y pago puntual.');

  // Vista de estadísticas / más solicitados (RF-46)
  const [showStatsModal, setShowStatsModal] = useState(false);

  const countOf = (status: ServiceStatus) => services.filter(s => s.status === status).length;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  useReveal(rootRef, [isLoading, activeColumn, services.length]);

  const anyModalOpen = !!(cancellingService || completingService || reviewingService || ratingClientService || showStatsModal);
  useEffect(() => {
    if (!anyModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setCancellingService(null);
      setCompletingService(null);
      setReviewingService(null);
      setRatingClientService(null);
      setShowStatsModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [anyModalOpen]);

  // RF-46: Estadísticas de servicios más solicitados
  const completedServices = services.filter(s => s.status === 'finalizado');
  const tradeStats = completedServices.reduce((acc, curr) => {
    const trade = curr.workerTrade || 'General';
    acc[trade] = (acc[trade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // RF-47: Trabajadores contratados anteriormente (únicos)
  const previouslyHiredWorkers = Array.from(
    new Map(
      completedServices.map(s => [
        s.workerId,
        {
          id: s.workerId,
          name: s.workerName,
          trade: s.workerTrade,
          avatarColor: s.workerAvatarColor,
          lastServiceDate: s.date
        }
      ])
    ).values()
  );

  const handleConfirmCancel = () => {
    if (!cancellingService) return;
    const finalReason = selectedReason === 'Otro motivo' ? otherReason : selectedReason;
    onUpdateServiceStatus(cancellingService.id, 'cancelado', finalReason);
    setCancellingService(null);
  };

  const handleConfirmFinalize = (service: ServiceRequest) => {
    setCompletionPhotoUrl('');
    setEvidenceError(null);
    setCompletingService(service);
  };

  // RF-62: foto del trabajo terminado tomada con la cámara o elegida de la galería
  const handleEvidenceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setEvidenceError(null);
    setIsUploadingEvidence(true);
    try {
      const media = await mediaService.uploadImage(file, { folder: 'evidence', maxSide: 900 });
      setCompletionPhotoUrl(media.url);
    } catch (err) {
      setEvidenceError(err instanceof MediaUploadError ? err.message : 'No pudimos leer la foto. Intenta con otra.');
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  // RF-78: el profesional cambia el estado (Pendiente / En progreso / Finalizado)
  const handleProviderStatus = (service: ServiceRequest, next: ServiceStatus) => {
    if (next === 'finalizado') handleConfirmFinalize(service);
    else onUpdateServiceStatus(service.id, next);
  };

  const handleExecuteFinalize = () => {
    if (!completingService) return;
    const evidence = completionPhotoUrl.trim();
    onUpdateServiceStatus(
      completingService.id,
      'finalizado',
      undefined,
      evidence ? { completionEvidence: [evidence] } : undefined
    );
    const finalized = completingService;
    setCompletingService(null);

    // Habilitar calificación bilateral (RF-29, RF-34, RF-35)
    if (role === 'seeker') {
      setReviewingService(finalized);
      setReviewRating(5);
      setReviewComment('');
      setReviewSuccess(false);
    } else {
      setRatingClientService(finalized);
    }
  };

  const handleSendReview = () => {
    if (!reviewingService) return;
    onSubmitReview(reviewingService.id, reviewRating, reviewComment);
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewingService(null);
      setReviewSuccess(false);
    }, 1800);
  };

  const handleSendClientRating = () => {
    if (ratingClientService) {
      onRateClient?.(ratingClientService.id, clientRatingValue, clientRatingComment);
    }
    setRatingClientService(null);
  };

  const isSeeker = role === 'seeker';

  const renderCard = (srv: ServiceRequest, index: number) => {
    const baseMeta = STATUS_META[srv.status] ?? STATUS_META.en_curso;
    const meta = srv.isExpired ? { ...baseMeta, label: 'Expirada', icon: AlertCircle } : baseMeta;
    const StatusIcon = meta.icon;

    return (
      <article
        key={srv.id}
        className="svc-card"
        data-tone={meta.tone}
        data-reveal
        style={{ '--reveal-i': Math.min(index, 6) } as React.CSSProperties}
      >
        <div className="svc-card__top">
          <span className="svc-status" data-tone={meta.tone}>
            <StatusIcon size={14} aria-hidden="true" /> {meta.label}
          </span>
          <span className="svc-amount">${srv.amount.toLocaleString('es-CO')}</span>
        </div>

        <div className="svc-card__body">
          <h3 className="svc-card__name">{isSeeker ? srv.workerName : srv.clientName}</h3>
          <span className="svc-trade">{srv.workerTrade}</span>

          <p className="svc-quote">{srv.problemDescription}</p>

          {srv.photos && srv.photos.length > 0 && (
            <div className="svc-photo">
              <img src={srv.photos[0]} alt="Evidencia del problema" />
              <span className="svc-muted">Foto inicial adjunta</span>
            </div>
          )}

          {srv.completionEvidence && srv.completionEvidence.length > 0 && (
            <div className="svc-photo svc-photo--done">
              <img src={srv.completionEvidence[0]} alt="Trabajo terminado" />
              <span>
                <CheckCircle2 size={13} aria-hidden="true" /> Evidencia del arreglo terminado
              </span>
            </div>
          )}

          {srv.cancelReason && (
            <p className="svc-cancel-note">
              <strong>Motivo:</strong> {srv.cancelReason}
            </p>
          )}

          <ul className="svc-meta">
            <li><Calendar size={13} aria-hidden="true" /> {srv.date}</li>
            <li><Clock size={13} aria-hidden="true" /> {srv.time}</li>
            <li><MapPin size={13} aria-hidden="true" /> {srv.address}</li>
          </ul>
        </div>

        {/* Acciones del servicio (RF-29, RF-34, RF-35, RF-76, RF-78) */}
        {(srv.status === 'pendiente' || srv.status === 'en_curso' || srv.status === 'finalizado') && (
          <div className="svc-card__actions">
            {!isSeeker && (srv.status === 'pendiente' || srv.status === 'en_curso') && (
              <div className="svc-status-field">
                <label htmlFor={`svc-status-${srv.id}`} className="svc-label">Estado del servicio</label>
                <select
                  id={`svc-status-${srv.id}`}
                  className="input-base"
                  value={srv.status}
                  onChange={e => handleProviderStatus(srv, e.target.value as ServiceStatus)}
                >
                  <option value="pendiente" disabled={srv.status !== 'pendiente'}>Pendiente</option>
                  <option value="en_curso">En curso</option>
                  <option value="finalizado">Completado</option>
                </select>
              </div>
            )}

            {srv.status === 'pendiente' && (
              <>
                {isSeeker && (
                  <span className="svc-muted svc-pending-note">
                    <Hourglass size={13} aria-hidden="true" /> Esperando respuesta del profesional
                  </span>
                )}
                <button type="button" onClick={() => setCancellingService(srv)} className="btn btn-secondary svc-btn-cancel">
                  <XCircle size={15} aria-hidden="true" /> {isSeeker ? 'Retirar solicitud' : 'Rechazar'}
                </button>
              </>
            )}

            {srv.status === 'en_curso' && (
              <>
                <button type="button" onClick={() => handleConfirmFinalize(srv)} className="btn btn-primary svc-btn-complete">
                  <CheckCircle2 size={15} aria-hidden="true" /> Marcar completado
                </button>
                <button type="button" onClick={() => setCancellingService(srv)} className="btn btn-secondary svc-btn-cancel">
                  <XCircle size={15} aria-hidden="true" /> Cancelar
                </button>
              </>
            )}

            {srv.status === 'finalizado' && (
              <>
                {isSeeker ? (
                  srv.reviewDone ? (
                    <span className="svc-review-done">
                      <CheckCircle2 size={14} aria-hidden="true" /> Reseña verificada publicada
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setReviewingService(srv);
                        setReviewRating(5);
                        setReviewComment('');
                      }}
                      className="btn btn-primary"
                    >
                      <Star size={14} aria-hidden="true" /> Calificar profesional
                    </button>
                  )
                ) : srv.workerRatedClient ? (
                  <span className="svc-review-done">
                    <CheckCircle2 size={14} aria-hidden="true" /> Contratante calificado ({srv.clientRatingByWorker}/5)
                  </span>
                ) : (
                  <button type="button" onClick={() => setRatingClientService(srv)} className="btn btn-secondary">
                    <Star size={14} aria-hidden="true" /> Calificar contratante
                  </button>
                )}

                <button type="button" onClick={() => onOpenReport(srv)} className="svc-link-btn">
                  <MessageSquareWarning size={13} aria-hidden="true" /> Reportar anomalía
                </button>
              </>
            )}
          </div>
        )}
      </article>
    );
  };

  return (
    <div ref={rootRef} className="services-module container">
      <PageHero
        tone={isSeeker ? 'marino' : 'fuego'}
        eyebrow={<><ClipboardList size={14} aria-hidden="true" /> {isSeeker ? 'Mis solicitudes' : 'Mis clientes'}</>}
        title="Mis servicios"
        subtitle={
          isSeeker
            ? 'Sigue cada solicitud desde que la envías hasta que calificas el trabajo.'
            : 'Mueve cada trabajo de pendiente a completado y califica a tus clientes.'
        }
        actions={
          <button type="button" onClick={() => setShowStatsModal(true)} className="btn btn-secondary">
            <BarChart3 size={16} aria-hidden="true" /> Estadísticas
          </button>
        }
      />

      {/* RF-47 & RF-48: profesionales contratados anteriormente */}
      {isSeeker && previouslyHiredWorkers.length > 0 && (
        <section className="oy-panel svc-rehire" aria-labelledby="svc-rehire-title" data-reveal>
          <div className="svc-rehire__head">
            <h2 id="svc-rehire-title" className="svc-rehire__title">
              <UserCheck size={20} aria-hidden="true" /> Vuelve a contratar
            </h2>
            <span className="svc-muted">Tus profesionales de confianza, a un clic</span>
          </div>

          <div className="svc-rehire__grid">
            {previouslyHiredWorkers.map(w => (
              <div key={w.id} className="svc-rehire__item">
                <div className="svc-person">
                  <span className="svc-avatar" style={{ background: w.avatarColor }} aria-hidden="true">
                    {w.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="svc-person__text">
                    <span className="svc-person__name">{w.name}</span>
                    <span className="svc-muted">{w.trade}</span>
                  </div>
                </div>

                {onRehireWorker && (
                  <button
                    type="button"
                    onClick={() => onRehireWorker(w.id, w.name, w.trade)}
                    className="btn btn-secondary svc-btn-sm"
                    aria-label={`Volver a contratar a ${w.name}`}
                  >
                    <RotateCcw size={14} aria-hidden="true" /> Recontratar
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {!isLoading && services.length === 0 ? (
        <div className="oy-empty svc-empty" data-reveal>
          <MascotAvatar expression="pensativo" size="md" animate="none" />
          <h2 className="oy-empty__title">Aún no tienes servicios</h2>
          <p className="oy-empty__text">
            {isSeeker
              ? 'Cuando solicites un profesional, aquí podrás seguir cada paso del trabajo.'
              : 'Cuando aceptes una solicitud, aquí podrás llevar el trabajo hasta completarlo.'}
          </p>
        </div>
      ) : (
        <>
          {/* Selector por estado en móvil (RF-78: pendiente, en curso, completado, cancelado) */}
          <div className="svc-segmented" role="group" aria-label="Mostrar servicios por estado">
            {COLUMNS.map(col => {
              const Icon = STATUS_META[col].icon;
              return (
                <button
                  key={col}
                  type="button"
                  className="svc-segmented__btn"
                  data-tone={STATUS_META[col].tone}
                  aria-pressed={activeColumn === col}
                  aria-controls={`svc-col-${col}`}
                  onClick={() => setActiveColumn(col)}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span className="svc-segmented__label">{STATUS_META[col].column}</span>
                  <span className="svc-segmented__count">{isLoading ? '·' : countOf(col)}</span>
                </button>
              );
            })}
          </div>

          <div className="svc-board" aria-busy={isLoading}>
            {COLUMNS.map(col => {
              const meta = STATUS_META[col];
              const Icon = meta.icon;
              const items = services.filter(s => s.status === col);
              return (
                <section
                  key={col}
                  id={`svc-col-${col}`}
                  className="svc-col"
                  data-tone={meta.tone}
                  data-active={activeColumn === col ? '' : undefined}
                  aria-labelledby={`svc-col-${col}-title`}
                >
                  <header className="svc-col__head">
                    <span className="svc-col__icon" aria-hidden="true"><Icon size={16} /></span>
                    <h2 id={`svc-col-${col}-title`} className="svc-col__title">{meta.column}</h2>
                    <span className="svc-col__count">{isLoading ? '' : items.length}</span>
                  </header>

                  <div className="svc-col__list">
                    {isLoading ? (
                      [0, 1].map(i => (
                        <div key={i} className="svc-card svc-card--skeleton" aria-hidden="true">
                          <span className="oy-skeleton svc-sk svc-sk--pill" />
                          <span className="oy-skeleton svc-sk svc-sk--title" />
                          <span className="oy-skeleton svc-sk svc-sk--line" />
                          <span className="oy-skeleton svc-sk svc-sk--line svc-sk--short" />
                        </div>
                      ))
                    ) : items.length === 0 ? (
                      <div className="svc-col__empty">
                        <MascotAvatar expression={meta.emptyMood} size="xs" animate="none" />
                        <p>{meta.empty}</p>
                      </div>
                    ) : (
                      items.map(renderCard)
                    )}
                  </div>
                </section>
              );
            })}
          </div>
          {isLoading && <span className="svc-sr" role="status">Cargando tus servicios…</span>}
        </>
      )}

      {/* Modal Finalizar Trabajo con Evidencia Fotográfica (RF-29, RF-62) */}
      {completingService && (
        <div className="oy-modal-backdrop svc-backdrop">
          <div
            className="oy-modal svc-modal svc-modal--md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="svc-finalize-title"
          >
            <div className="oy-modal__head">
              <div className="svc-modal__headline">
                <span className="svc-modal__icon" aria-hidden="true"><Camera size={22} /></span>
                <div>
                  <h3 id="svc-finalize-title" className="oy-modal__title">Finalizar Trabajo</h3>
                  <span className="svc-muted">Adjunta evidencia fotográfica del arreglo terminado</span>
                </div>
              </div>
              <button className="oy-icon-btn" onClick={() => setCompletingService(null)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="oy-modal__body">
              <label htmlFor="svc-photo-file" className="svc-label">Toma o elige la foto del trabajo terminado</label>
              <input
                id="svc-photo-file"
                type="file"
                accept="image/*"
                capture="environment"
                className="input-base"
                onChange={handleEvidenceFile}
                disabled={isUploadingEvidence}
              />
              {isUploadingEvidence && <span className="svc-muted" role="status">Subiendo foto…</span>}
              {evidenceError && <span className="svc-muted" role="alert">{evidenceError}</span>}

              <label htmlFor="svc-photo-url" className="svc-label">O pega la URL de la foto</label>
              <input
                id="svc-photo-url"
                type="text"
                className="input-base"
                value={completionPhotoUrl.startsWith('data:') ? '' : completionPhotoUrl}
                onChange={e => setCompletionPhotoUrl(e.target.value)}
                placeholder="URL de la fotografía del trabajo terminado"
              />
              {completionPhotoUrl && (
                <div className="svc-preview">
                  <img src={completionPhotoUrl} alt="Vista previa trabajo" />
                </div>
              )}

              <div className="svc-modal__actions">
                <button onClick={() => setCompletingService(null)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button onClick={handleExecuteFinalize} className="btn btn-primary svc-btn-complete" disabled={isUploadingEvidence}>
                  Confirmar y Cerrar Servicio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cancelar Servicio con Justificación Obligatoria (RF-76) */}
      {cancellingService && (
        <div className="oy-modal-backdrop svc-backdrop">
          <div
            className="oy-modal svc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="svc-cancel-title"
          >
            <div className="oy-modal__head">
              <div>
                <h3 id="svc-cancel-title" className="oy-modal__title">Cancelar Servicio</h3>
                <span className="svc-muted">
                  Para cancelar un servicio aceptado se requiere una justificación obligatoria por transparencia.
                </span>
              </div>
              <button className="oy-icon-btn" onClick={() => setCancellingService(null)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="oy-modal__body">
              <fieldset className="svc-reasons">
                <legend className="svc-label">Motivo de la cancelación</legend>
                {CANCEL_REASONS.map((r, i) => (
                  <label key={i} className="svc-reason" data-checked={selectedReason === r ? '' : undefined}>
                    <input
                      type="radio"
                      name="cancelReason"
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                    />
                    {r}
                  </label>
                ))}
              </fieldset>

              <div className="svc-modal__actions">
                <button onClick={() => setCancellingService(null)} className="btn btn-secondary">
                  Atrás
                </button>
                <button onClick={handleConfirmCancel} className="btn btn-primary svc-btn-danger">
                  Confirmar Cancelación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Calificar Trabajador (RF-34, RF-36) */}
      {reviewingService && (
        <div className="oy-modal-backdrop svc-backdrop">
          <div
            className="oy-modal svc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="svc-review-title"
          >
            {!reviewSuccess ? (
              <>
                <div className="oy-modal__head">
                  <div>
                    <h3 id="svc-review-title" className="oy-modal__title">Calificar a {reviewingService.workerName}</h3>
                    <span className="svc-muted">
                      Tu reseña quedará vinculada a la transacción verificada {reviewingService.id}
                    </span>
                  </div>
                  <button className="oy-icon-btn" onClick={() => setReviewingService(null)} aria-label="Cerrar">
                    <X size={18} />
                  </button>
                </div>

                <div className="oy-modal__body">
                  <div className="svc-rating">
                    <PeekRating value={reviewRating} onChange={v => setReviewRating(v || 1)} allowClear={false} size={34} ariaLabel="Calificación del profesional" />
                  </div>

                  <label htmlFor="svc-review-comment" className="svc-label">Comentario de la reseña</label>
                  <textarea
                    id="svc-review-comment"
                    className="input-base"
                    rows={3}
                    placeholder="Describe la puntualidad, calidad técnica y cumplimiento del servicio..."
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                  />

                  <div className="svc-modal__actions">
                    <button onClick={() => setReviewingService(null)} className="btn btn-secondary">
                      Omitir por ahora
                    </button>
                    <button onClick={handleSendReview} className="btn btn-primary">
                      Publicar Reseña
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="svc-success" role="status">
                <MascotAvatar expression="entusiasta" size="md" animate="none" />
                <h4 id="svc-review-title" className="oy-modal__title">¡Reseña Publicada!</h4>
                <p className="svc-muted">
                  La reputación digital del trabajador se ha recalculado en tiempo real.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Calificar Contratante (RF-35) */}
      {ratingClientService && (
        <div className="oy-modal-backdrop svc-backdrop">
          <div
            className="oy-modal svc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="svc-client-title"
          >
            <div className="oy-modal__head">
              <div>
                <h3 id="svc-client-title" className="oy-modal__title">
                  Calificar al Contratante {ratingClientService.clientName}
                </h3>
                <span className="svc-muted">
                  Valora el trato, las facilidades brindadas y la puntualidad del pago.
                </span>
              </div>
              <button className="oy-icon-btn" onClick={() => setRatingClientService(null)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="oy-modal__body">
              <div className="svc-rating">
                <PeekRating value={clientRatingValue} onChange={v => setClientRatingValue(v || 1)} allowClear={false} size={34} ariaLabel="Calificación del contratante" />
              </div>

              <label htmlFor="svc-client-comment" className="svc-label">Comentario sobre el contratante</label>
              <textarea
                id="svc-client-comment"
                className="input-base"
                rows={2}
                value={clientRatingComment}
                onChange={e => setClientRatingComment(e.target.value)}
              />

              <div className="svc-modal__actions">
                <button onClick={() => setRatingClientService(null)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button onClick={handleSendClientRating} className="btn btn-primary">
                  Guardar Valoración
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Estadísticas de Servicios Más Solicitados (RF-46) */}
      {showStatsModal && (
        <div className="oy-modal-backdrop svc-backdrop">
          <div
            className="oy-modal svc-modal svc-modal--lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="svc-stats-title"
          >
            <div className="oy-modal__head">
              <div className="svc-modal__headline">
                <span className="svc-modal__icon" aria-hidden="true"><BarChart3 size={22} /></span>
                <div>
                  <h3 id="svc-stats-title" className="oy-modal__title">Servicios Más Solicitados</h3>
                  <span className="svc-muted">Distribución de solicitudes completadas por oficio en Bogotá D.C.</span>
                </div>
              </div>
              <button className="oy-icon-btn" onClick={() => setShowStatsModal(false)} aria-label="Cerrar estadísticas">
                <X size={18} />
              </button>
            </div>

            <div className="oy-modal__body">
              <div className="svc-bars">
                {Object.keys(tradeStats).length === 0 ? (
                  <span className="svc-muted">No hay datos suficientes aún.</span>
                ) : (
                  Object.entries(tradeStats).map(([trade, count]) => (
                    <div key={trade} className="svc-bar">
                      <div className="svc-bar__row">
                        <span>{trade}</span>
                        <span>{count} solicitudes cerradas</span>
                      </div>
                      <div className="svc-bar__track">
                        <div className="svc-bar__fill" style={{ transform: `scaleX(${Math.min(1, count * 0.35)})` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button onClick={() => setShowStatsModal(false)} className="btn btn-primary svc-btn-block">
                Cerrar Estadísticas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
