import React, { useState } from 'react';
import type { ServiceRequest, ServiceStatus } from '../../types';
import { PeekRating } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { PageHero } from '../../components/layout/PageHero';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { mediaService, MediaUploadError } from '../../services/mock/mediaService';
import { motion, AnimatePresence } from 'motion/react';
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
  ClipboardList
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

const STATUS_META: Record<ServiceStatus, { label: string; tone: string }> = {
  pendiente: { label: 'Pendiente', tone: 'amarillo' },
  en_curso: { label: 'En progreso', tone: 'marino' },
  finalizado: { label: 'Completado', tone: 'esmeralda' },
  cancelado: { label: 'Cancelado', tone: 'cancelado' }
};

const FILTER_TABS: { id: ServiceStatus | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'en_curso', label: 'En progreso / Aceptados' },
  { id: 'finalizado', label: 'Completados' },
  { id: 'cancelado', label: 'Cancelados' }
];

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
  const [filterStatus, setFilterStatus] = useState<ServiceStatus | 'todos'>('todos');

  type InlineActionType = 'complete' | 'cancel' | 'review';
  const [activeInlineAction, setActiveInlineAction] = useState<{
    serviceId: string;
    type: InlineActionType;
  } | null>(null);

  // Formulario Cancelación con justificación obligatoria (RF-76)
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);

  // Formulario Finalización con Evidencia Fotográfica (RF-62, RF-29)
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState<string>('');
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  // Formulario Calificación Bilateral (RF-34, RF-35, RF-36)
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Vista de estadísticas / más solicitados (RF-46)
  const [showStatsModal, setShowStatsModal] = useState(false);

  const filteredServices = services.filter(s => {
    if (filterStatus === 'todos') return true;
    return s.status === filterStatus;
  });

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

  const handleConfirmCancel = (srv: ServiceRequest) => {
    onUpdateServiceStatus(srv.id, 'cancelado', selectedReason);
    setActiveInlineAction(null);
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
    if (next === 'finalizado') {
      setCompletionPhotoUrl('');
      setEvidenceError(null);
      setActiveInlineAction({ serviceId: service.id, type: 'complete' });
    } else {
      onUpdateServiceStatus(service.id, next);
    }
  };

  const handleExecuteFinalize = (srv: ServiceRequest) => {
    const evidence = completionPhotoUrl.trim();
    onUpdateServiceStatus(
      srv.id,
      'finalizado',
      undefined,
      evidence ? { completionEvidence: [evidence] } : undefined
    );
    // Habilitar calificación bilateral inmediata desplegada inline
    setReviewRating(5);
    setReviewComment(role === 'seeker' ? '' : 'Excelente cliente, trato muy amable y pago puntual.');
    setReviewSuccess(false);
    setActiveInlineAction({ serviceId: srv.id, type: 'review' });
  };

  const handleSendReview = (srv: ServiceRequest) => {
    if (role === 'seeker') {
      onSubmitReview(srv.id, reviewRating, reviewComment);
    } else {
      onRateClient?.(srv.id, reviewRating, reviewComment);
    }
    setReviewSuccess(true);
    setTimeout(() => {
      setActiveInlineAction(null);
      setReviewSuccess(false);
    }, 1800);
  };

  const isSeeker = role === 'seeker';
  const activeCount = services.filter(s => s.status === 'en_curso' || s.status === 'pendiente').length;
  const cancelledCount = services.filter(s => s.status === 'cancelado').length;

  return (
    <div className="services-module container">
      {/* Cabecera con Botón de Estadísticas (RF-46) */}
      <PageHero
        tone={isSeeker ? 'marino' : 'fuego'}
        eyebrow={<><ClipboardList size={14} aria-hidden="true" /> {isSeeker ? 'Mis solicitudes' : 'Mis clientes'}</>}
        title="Mis Servicios & Solicitudes"
        subtitle="Seguimiento de citas, cambios de estado y reputación en Bogotá D.C."
        actions={
          <button onClick={() => setShowStatsModal(true)} className="btn btn-secondary">
            <BarChart3 size={16} aria-hidden="true" /> Estadísticas de Servicios
          </button>
        }
        stickers={[
          { icon: <Wrench size={26} />, tone: 'amarillo', style: { top: '14%', right: '6%', rotate: '-10deg' } },
          { icon: <Star size={24} />, tone: 'esmeralda', style: { top: '46%', right: '16%', rotate: '8deg' } }
        ]}
      />

      <div className="svc-stats">
        <div className="oy-stat svc-stat svc-stat--marino">
          <span className="oy-stat__value">{activeCount}</span>
          <span className="oy-stat__label">Activos</span>
        </div>
        <div className="oy-stat svc-stat svc-stat--esmeralda">
          <span className="oy-stat__value">{completedServices.length}</span>
          <span className="oy-stat__label">Completados</span>
        </div>
        <div className="oy-stat svc-stat svc-stat--gris">
          <span className="oy-stat__value">{cancelledCount}</span>
          <span className="oy-stat__label">Cancelados</span>
        </div>
      </div>

      {/* Filtros por estado (RF-78: pendiente, en_curso, finalizado, cancelado) */}
      <div className="svc-filters" role="group" aria-label="Filtrar servicios por estado">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className="oy-chip"
            aria-pressed={filterStatus === tab.id}
            onClick={() => setFilterStatus(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RF-47 & RF-48: Sección de Trabajadores Contratados Anteriormente */}
      {isSeeker && previouslyHiredWorkers.length > 0 && (
        <section className="oy-panel oy-panel--almendra svc-rehire">
          <div className="svc-rehire__head">
            <h2 className="svc-rehire__title">
              <UserCheck size={20} aria-hidden="true" /> Profesionales Contratados Anteriormente
            </h2>
            <span className="svc-muted">Recontrata a tu profesional de confianza con 1 clic</span>
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

                <button
                  onClick={() => {
                    if (onRehireWorker) {
                      onRehireWorker(w.id, w.name, w.trade);
                    } else {
                      alert(`Iniciando nueva solicitud con ${w.name}`);
                    }
                  }}
                  className="btn btn-secondary svc-btn-sm"
                  title="Volver a contactar a este trabajador"
                >
                  <RotateCcw size={13} aria-hidden="true" /> Volver a contratar
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lista de Servicios */}
      {filteredServices.length === 0 ? (
        <div className="oy-empty svc-empty">
          <MascotAvatar expression="pensativo" size="md" animate="none" />
          <h3 className="oy-empty__title">No hay servicios en este estado</h3>
          <p className="oy-empty__text">Tus solicitudes activas o pasadas aparecerán en esta sección.</p>
        </div>
      ) : (
        <div className="svc-grid">
          {filteredServices.map(srv => {
            const baseMeta = STATUS_META[srv.status] ?? STATUS_META.en_curso;
            const meta = srv.isExpired ? { ...baseMeta, label: 'Expirada' } : baseMeta;

            return (
              <article key={srv.id} className={`svc-card svc-card--${meta.tone}`}>
                <div className="svc-card__top">
                  <span className={`svc-status svc-status--${meta.tone}`}>{meta.label}</span>
                  <span className="svc-amount">${srv.amount.toLocaleString()} COP</span>
                </div>

                <div className="svc-card__body">
                  <h3 className="svc-card__name">
                    {isSeeker ? srv.workerName : srv.clientName}
                  </h3>
                  <span className="svc-trade">{srv.workerTrade}</span>

                  <p className="svc-quote">"{srv.problemDescription}"</p>

                  {/* Foto de la solicitud (RF-20) */}
                  {srv.photos && srv.photos.length > 0 && (
                    <div className="svc-photo">
                      <img src={srv.photos[0]} alt="Evidencia del problema" />
                      <span className="svc-muted">Foto inicial adjunta</span>
                    </div>
                  )}

                  {/* Evidencia fotográfica de finalización (RF-62) */}
                  {srv.completionEvidence && srv.completionEvidence.length > 0 && (
                    <div className="svc-photo svc-photo--done">
                      <img src={srv.completionEvidence[0]} alt="Trabajo terminado" />
                      <span>
                        <CheckCircle2 size={13} aria-hidden="true" /> Evidencia fotográfica del arreglo terminado
                      </span>
                    </div>
                  )}

                  {/* Motivo de cancelación si aplica (RF-76) */}
                  {srv.cancelReason && (
                    <div className="svc-cancel-note">
                      <strong>Motivo de cancelación:</strong> {srv.cancelReason}
                    </div>
                  )}

                  <ul className="svc-meta">
                    <li><Calendar size={13} aria-hidden="true" /> {srv.date}</li>
                    <li><Clock size={13} aria-hidden="true" /> {srv.time}</li>
                    <li><MapPin size={13} aria-hidden="true" /> {srv.address}</li>
                  </ul>
                </div>

                {/* Acciones del Servicio (RF-29, RF-34, RF-35, RF-76, RF-78) */}
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
                          <option value="en_curso">En progreso</option>
                          <option value="finalizado">Finalizado</option>
                        </select>
                      </div>
                    )}

                    {srv.status === 'pendiente' && (
                      <>
                        {isSeeker && (
                          <span className="svc-muted svc-pending-note">
                            <Clock size={13} aria-hidden="true" /> Esperando respuesta del profesional
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (activeInlineAction?.serviceId === srv.id && activeInlineAction.type === 'cancel') {
                              setActiveInlineAction(null);
                            } else {
                              setSelectedReason(CANCEL_REASONS[0]);
                              setActiveInlineAction({ serviceId: srv.id, type: 'cancel' });
                            }
                          }}
                          className="btn btn-secondary svc-btn-cancel"
                          aria-expanded={activeInlineAction?.serviceId === srv.id && activeInlineAction.type === 'cancel'}
                        >
                          <XCircle size={15} aria-hidden="true" /> {isSeeker ? 'Retirar solicitud' : 'Rechazar'}
                        </button>
                      </>
                    )}

                    {srv.status === 'en_curso' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (activeInlineAction?.serviceId === srv.id && activeInlineAction.type === 'complete') {
                              setActiveInlineAction(null);
                            } else {
                              setCompletionPhotoUrl('');
                              setEvidenceError(null);
                              setActiveInlineAction({ serviceId: srv.id, type: 'complete' });
                            }
                          }}
                          className="btn btn-primary svc-btn-complete"
                          aria-expanded={activeInlineAction?.serviceId === srv.id && activeInlineAction.type === 'complete'}
                        >
                          <CheckCircle2 size={15} aria-hidden="true" /> Marcar Completado
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (activeInlineAction?.serviceId === srv.id && activeInlineAction.type === 'cancel') {
                              setActiveInlineAction(null);
                            } else {
                              setSelectedReason(CANCEL_REASONS[0]);
                              setActiveInlineAction({ serviceId: srv.id, type: 'cancel' });
                            }
                          }}
                          className="btn btn-secondary svc-btn-cancel"
                          aria-expanded={activeInlineAction?.serviceId === srv.id && activeInlineAction.type === 'cancel'}
                        >
                          <XCircle size={15} aria-hidden="true" /> Cancelar Servicio
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
                                if (activeInlineAction?.serviceId === srv.id && activeInlineAction.type === 'review') {
                                  setActiveInlineAction(null);
                                } else {
                                  setReviewRating(5);
                                  setReviewComment('');
                                  setReviewSuccess(false);
                                  setActiveInlineAction({ serviceId: srv.id, type: 'review' });
                                }
                              }}
                              className="btn btn-primary svc-btn-sm"
                              aria-expanded={activeInlineAction?.serviceId === srv.id && activeInlineAction.type === 'review'}
                            >
                              <Star size={14} aria-hidden="true" /> Calificar Profesional
                            </button>
                          )
                        ) : srv.workerRatedClient ? (
                          <span className="svc-review-done">
                            <CheckCircle2 size={14} aria-hidden="true" /> Contratante calificado ({srv.clientRatingByWorker}/5)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (activeInlineAction?.serviceId === srv.id && activeInlineAction.type === 'review') {
                                setActiveInlineAction(null);
                              } else {
                                setReviewRating(5);
                                setReviewComment('Excelente cliente, trato muy amable y pago puntual.');
                                setReviewSuccess(false);
                                setActiveInlineAction({ serviceId: srv.id, type: 'review' });
                              }
                            }}
                            className="btn btn-secondary svc-btn-sm"
                            aria-expanded={activeInlineAction?.serviceId === srv.id && activeInlineAction.type === 'review'}
                          >
                            <Star size={14} aria-hidden="true" /> Calificar Contratante
                          </button>
                        )}

                        <button onClick={() => onOpenReport(srv)} className="svc-link-btn">
                          <MessageSquareWarning size={13} aria-hidden="true" /> Reportar anomalía
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Formulario Desplegable Animado Inline (Sin Popups) */}
                <AnimatePresence>
                  {activeInlineAction?.serviceId === srv.id && (
                    <motion.div
                      key={`inline-${activeInlineAction.type}-${srv.id}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className={`svc-inline-form svc-inline-form--${activeInlineAction.type}`}
                      style={{ overflow: 'hidden' }}
                    >
                      {/* FORMULARIO DE COMPLETAR */}
                      {activeInlineAction.type === 'complete' && (
                        <>
                          <div className="svc-inline-form__header">
                            <div className="svc-inline-form__title-row">
                              <span className="svc-inline-form__icon svc-inline-form__icon--esmeralda" aria-hidden="true">
                                <Camera size={18} />
                              </span>
                              <div>
                                <h4 className="svc-inline-form__title">Finalizar Trabajo</h4>
                                <span className="svc-muted" style={{ fontSize: '11.5px' }}>
                                  Adjunta evidencia fotográfica opcional del arreglo terminado
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="oy-icon-btn svc-inline-form__close"
                              onClick={() => setActiveInlineAction(null)}
                              aria-label="Cerrar formulario"
                            >
                              <X size={15} />
                            </button>
                          </div>

                          <div className="svc-inline-form__body">
                            <div className="svc-inline-upload-box">
                              <label htmlFor={`inline-photo-${srv.id}`} className="svc-inline-upload-btn">
                                <Camera size={16} aria-hidden="true" />
                                <span>{isUploadingEvidence ? 'Subiendo foto…' : 'Tomar o subir foto de evidencia'}</span>
                              </label>
                              <input
                                id={`inline-photo-${srv.id}`}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                style={{ display: 'none' }}
                                onChange={handleEvidenceFile}
                                disabled={isUploadingEvidence}
                              />
                              {evidenceError && (
                                <span className="svc-muted" role="alert" style={{ color: 'var(--color-danger)' }}>
                                  {evidenceError}
                                </span>
                              )}

                              <div className="svc-inline-url-row">
                                <input
                                  type="text"
                                  className="input-base svc-inline-input"
                                  value={completionPhotoUrl.startsWith('data:') ? '' : completionPhotoUrl}
                                  onChange={e => setCompletionPhotoUrl(e.target.value)}
                                  placeholder="O pega una URL de la imagen..."
                                />
                              </div>

                              {completionPhotoUrl && (
                                <div className="svc-inline-preview">
                                  <img src={completionPhotoUrl} alt="Vista previa de evidencia" />
                                  <button
                                    type="button"
                                    className="svc-inline-remove-photo"
                                    onClick={() => setCompletionPhotoUrl('')}
                                    aria-label="Quitar foto"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="svc-inline-form__actions">
                              <button
                                type="button"
                                onClick={() => setActiveInlineAction(null)}
                                className="btn btn-secondary"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExecuteFinalize(srv)}
                                className="btn btn-primary svc-btn-complete"
                                disabled={isUploadingEvidence}
                              >
                                <CheckCircle2 size={14} aria-hidden="true" /> Confirmar y Finalizar
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* FORMULARIO DE CANCELAR */}
                      {activeInlineAction.type === 'cancel' && (
                        <>
                          <div className="svc-inline-form__header">
                            <div className="svc-inline-form__title-row">
                              <span className="svc-inline-form__icon svc-inline-form__icon--danger" aria-hidden="true">
                                <XCircle size={18} />
                              </span>
                              <div>
                                <h4 className="svc-inline-form__title">
                                  {srv.status === 'pendiente'
                                    ? (isSeeker ? 'Retirar Solicitud' : 'Rechazar Solicitud')
                                    : 'Cancelar Servicio en Progreso'}
                                </h4>
                                <span className="svc-muted" style={{ fontSize: '11.5px' }}>
                                  Por transparencia y reputación, selecciona el motivo obligatorio
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="oy-icon-btn svc-inline-form__close"
                              onClick={() => setActiveInlineAction(null)}
                              aria-label="Cerrar formulario"
                            >
                              <X size={15} />
                            </button>
                          </div>

                          <div className="svc-inline-form__body">
                            <fieldset className="svc-reasons svc-reasons--compact">
                              <legend className="sr-only">Motivo de cancelación</legend>
                              {CANCEL_REASONS.map((r, i) => (
                                <label
                                  key={i}
                                  className="svc-reason svc-reason--compact"
                                  data-checked={selectedReason === r ? '' : undefined}
                                >
                                  <input
                                    type="radio"
                                    name={`cancelReason-${srv.id}`}
                                    checked={selectedReason === r}
                                    onChange={() => setSelectedReason(r)}
                                  />
                                  <span>{r}</span>
                                </label>
                              ))}
                            </fieldset>

                            <div className="svc-inline-form__actions">
                              <button
                                type="button"
                                onClick={() => setActiveInlineAction(null)}
                                className="btn btn-secondary"
                              >
                                Volver
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmCancel(srv)}
                                className="btn btn-primary svc-btn-danger"
                              >
                                <XCircle size={14} aria-hidden="true" /> Confirmar Cancelación
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* FORMULARIO DE CALIFICAR */}
                      {activeInlineAction.type === 'review' && (
                        <>
                          {!reviewSuccess ? (
                            <>
                              <div className="svc-inline-form__header">
                                <div className="svc-inline-form__title-row">
                                  <span className="svc-inline-form__icon svc-inline-form__icon--amarillo" aria-hidden="true">
                                    <Star size={18} />
                                  </span>
                                  <div>
                                    <h4 className="svc-inline-form__title">
                                      {isSeeker
                                        ? `Calificar a ${srv.workerName}`
                                        : `Calificar al Contratante ${srv.clientName}`}
                                    </h4>
                                    <span className="svc-muted" style={{ fontSize: '11.5px' }}>
                                      {isSeeker
                                        ? `Vinculada a la orden verificada ${srv.id}`
                                        : 'Valora el trato, las facilidades y la puntualidad'}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="oy-icon-btn svc-inline-form__close"
                                  onClick={() => setActiveInlineAction(null)}
                                  aria-label="Cerrar formulario"
                                >
                                  <X size={15} />
                                </button>
                              </div>

                              <div className="svc-inline-form__body">
                                <div className="svc-rating svc-rating--compact">
                                  <PeekRating
                                    value={reviewRating}
                                    onChange={v => setReviewRating(v || 1)}
                                    allowClear={false}
                                    size={28}
                                    ariaLabel={isSeeker ? 'Calificación del profesional' : 'Calificación del contratante'}
                                  />
                                </div>

                                <textarea
                                  className="input-base svc-inline-textarea"
                                  rows={2}
                                  aria-label={isSeeker ? 'Comentario de la reseña' : 'Comentario sobre el contratante'}
                                  placeholder={
                                    isSeeker
                                      ? 'Puntualidad, calidad técnica y cumplimiento del servicio...'
                                      : 'Trato amable, facilidades brindadas y pago puntual...'
                                  }
                                  value={reviewComment}
                                  onChange={e => setReviewComment(e.target.value)}
                                />

                                <div className="svc-inline-form__actions">
                                  <button
                                    type="button"
                                    onClick={() => setActiveInlineAction(null)}
                                    className="btn btn-secondary"
                                  >
                                    Omitir
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSendReview(srv)}
                                    className="btn btn-primary"
                                  >
                                    <Star size={14} aria-hidden="true" /> Publicar Calificación
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="svc-inline-success" role="status">
                              <MascotAvatar expression="entusiasta" size="sm" animate="none" />
                              <div>
                                <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 800 }}>¡Calificación Registrada!</h5>
                                <p className="svc-muted" style={{ margin: 0, fontSize: '11.5px' }}>
                                  La reputación digital se actualizó en tiempo real.
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Estadísticas de Servicios Más Solicitados (RF-46) */}
      {showStatsModal && (
        <div className="oy-modal-backdrop svc-backdrop">
          <div
            className="oy-modal svc-modal svc-modal--marino svc-modal--lg"
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
                        <div className="svc-bar__fill" style={{ width: `${Math.min(100, count * 35)}%` }} />
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
