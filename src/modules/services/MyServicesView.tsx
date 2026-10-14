import React, { useState } from 'react';
import type { ServiceRequest, ServiceStatus } from '../../types';
import { PeekRating } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { PageHero } from '../../components/layout/PageHero';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
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
  onUpdateServiceStatus: (serviceId: string, newStatus: ServiceStatus, reason?: string) => void;
  onSubmitReview: (serviceId: string, rating: number, comment: string) => void;
  onOpenReport: (service: ServiceRequest) => void;
  onRehireWorker?: (workerId: string, workerName: string, trade: string) => void;
}

const STATUS_META: Record<ServiceStatus, { label: string; tone: string }> = {
  pendiente: { label: 'Pendiente', tone: 'amarillo' },
  en_curso: { label: 'En progreso', tone: 'marino' },
  finalizado: { label: 'Completado', tone: 'esmeralda' },
  cancelado: { label: 'Cancelado', tone: 'cancelado' }
};

const FILTER_TABS: { id: ServiceStatus | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
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
  onRehireWorker
}) => {
  const { role } = useAuth();
  const [filterStatus, setFilterStatus] = useState<ServiceStatus | 'todos'>('todos');

  // Modal Cancelación con justificación obligatoria (RF-76)
  const [cancellingService, setCancellingService] = useState<ServiceRequest | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const otherReason = '';

  // Modal Finalización con Evidencia Fotográfica (RF-62, RF-29)
  const [completingService, setCompletingService] = useState<ServiceRequest | null>(null);
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop');

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

  const handleConfirmCancel = () => {
    if (!cancellingService) return;
    const finalReason = selectedReason === 'Otro motivo' ? otherReason : selectedReason;
    onUpdateServiceStatus(cancellingService.id, 'cancelado', finalReason);
    setCancellingService(null);
  };

  const handleConfirmFinalize = (service: ServiceRequest) => {
    setCompletingService(service);
  };

  const handleExecuteFinalize = () => {
    if (!completingService) return;
    onUpdateServiceStatus(completingService.id, 'finalizado');
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
    setRatingClientService(null);
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
            const meta = STATUS_META[srv.status] ?? STATUS_META.en_curso;

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
                {(srv.status === 'en_curso' || srv.status === 'finalizado') && (
                  <div className="svc-card__actions">
                    {srv.status === 'en_curso' && (
                      <>
                        <button onClick={() => handleConfirmFinalize(srv)} className="btn btn-primary svc-btn-complete">
                          <CheckCircle2 size={15} aria-hidden="true" /> Marcar Completado
                        </button>

                        <button onClick={() => setCancellingService(srv)} className="btn btn-secondary svc-btn-cancel">
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
                              onClick={() => {
                                setReviewingService(srv);
                                setReviewRating(5);
                                setReviewComment('');
                              }}
                              className="btn btn-primary svc-btn-sm"
                            >
                              <Star size={14} aria-hidden="true" /> Calificar Profesional
                            </button>
                          )
                        ) : (
                          <button onClick={() => setRatingClientService(srv)} className="btn btn-secondary svc-btn-sm">
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
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Finalizar Trabajo con Evidencia Fotográfica (RF-29, RF-62) */}
      {completingService && (
        <div className="oy-modal-backdrop svc-backdrop">
          <div
            className="oy-modal svc-modal svc-modal--esmeralda"
            role="dialog"
            aria-modal="true"
            aria-labelledby="svc-finalize-title"
            style={{ '--oy-modal-w': '480px' } as React.CSSProperties}
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
              <label htmlFor="svc-photo-url" className="svc-label">Foto del resultado final / respaldo</label>
              <input
                id="svc-photo-url"
                type="text"
                className="input-base"
                value={completionPhotoUrl}
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
                <button onClick={handleExecuteFinalize} className="btn btn-primary svc-btn-complete">
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
            className="oy-modal svc-modal svc-modal--danger"
            role="dialog"
            aria-modal="true"
            aria-labelledby="svc-cancel-title"
            style={{ '--oy-modal-w': '460px' } as React.CSSProperties}
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
            style={{ '--oy-modal-w': '460px' } as React.CSSProperties}
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

                  <textarea
                    className="input-base"
                    rows={3}
                    aria-label="Comentario de la reseña"
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
            style={{ '--oy-modal-w': '460px' } as React.CSSProperties}
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

              <textarea
                className="input-base"
                rows={2}
                aria-label="Comentario sobre el contratante"
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
            className="oy-modal svc-modal svc-modal--marino"
            role="dialog"
            aria-modal="true"
            aria-labelledby="svc-stats-title"
            style={{ '--oy-modal-w': '500px' } as React.CSSProperties}
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
