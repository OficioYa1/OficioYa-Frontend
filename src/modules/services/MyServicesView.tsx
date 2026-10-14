import React, { useState } from 'react';
import type { ServiceRequest, ServiceStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Star,
  Sparkles,
  Camera,
  RotateCcw,
  BarChart3,
  UserCheck,
  Send,
  X
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';

interface MyServicesViewProps {
  services: ServiceRequest[];
  onUpdateServiceStatus: (serviceId: string, newStatus: ServiceStatus, reason?: string) => void;
  onSubmitReview: (serviceId: string, rating: number, comment: string) => void;
  onOpenReport: (service: ServiceRequest) => void;
  onRehireWorker?: (workerId: string, workerName: string, trade: string) => void;
}

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
  const [otherReason, setOtherReason] = useState<string>('');

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

  return (
    <div className="services-module container" style={{ padding: '24px 0 60px' }}>
      {/* Cabecera con Botón de Estadísticas (RF-46) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Mis Servicios & Solicitudes (RF-44, RF-72)</h2>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Seguimiento de citas, cambios de estado y reputación en Bogotá D.C.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setShowStatsModal(true)}
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BarChart3 size={15} /> Estadísticas de Servicios (RF-46)
          </button>
        </div>
      </div>

      {/* Filtros por estado (RF-78: pendiente, en_curso, finalizado, cancelado) */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
        {[
          { id: 'todos', label: 'Todos' },
          { id: 'en_curso', label: 'En progreso / Aceptados' },
          { id: 'finalizado', label: 'Completados' },
          { id: 'cancelado', label: 'Cancelados' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id as ServiceStatus | 'todos')}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              background: filterStatus === tab.id ? 'var(--role-primary)' : 'var(--color-surface)',
              color: filterStatus === tab.id ? '#FFFFFF' : 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RF-47 & RF-48: Sección de Trabajadores Contratados Anteriormente */}
      {role === 'seeker' && previouslyHiredWorkers.length > 0 && (
        <div style={{ marginBottom: '28px', background: 'var(--color-surface)', padding: '16px 20px', borderRadius: '18px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={18} color="var(--role-primary)" /> Profesionales Contratados Anteriormente (RF-47)
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Recontrata a tu profesional de confianza con 1 clic (RF-48)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {previouslyHiredWorkers.map(w => (
              <div
                key={w.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--color-surface-hover)',
                  borderRadius: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: w.avatarColor,
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px'
                    }}
                  >
                    {w.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '13px', display: 'block' }}>{w.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{w.trade}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onRehireWorker) {
                      onRehireWorker(w.id, w.name, w.trade);
                    } else {
                      alert(`Iniciando nueva solicitud con ${w.name} (RF-48)`);
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Volver a contactar a este trabajador (RF-48)"
                >
                  <RotateCcw size={12} /> Volver a contratar (RF-48)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Servicios */}
      {filteredServices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--color-text-muted)' }}>
          <Wrench size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No hay servicios en este estado</h3>
          <p style={{ fontSize: '13px' }}>Tus solicitudes activas o pasadas aparecerán en esta sección.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
          {filteredServices.map(srv => {
            let stripeColor = '#2563EB';
            let statusLabel = 'En progreso (RF-78)';
            if (srv.status === 'finalizado') {
              stripeColor = '#10B981';
              statusLabel = 'Completado (RF-29)';
            } else if (srv.status === 'cancelado') {
              stripeColor = '#EF4444';
              statusLabel = 'Cancelado (RF-76)';
            }

            return (
              <div
                key={srv.id}
                className="card"
                style={{
                  borderLeft: `5px solid ${stripeColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <span className="badge" style={{ background: 'var(--color-surface-hover)', marginBottom: '4px' }}>
                        {statusLabel}
                      </span>
                      <h4 style={{ fontSize: '16px', fontWeight: 800 }}>
                        {role === 'seeker' ? srv.workerName : srv.clientName}
                      </h4>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {srv.workerTrade}
                      </span>
                    </div>

                    <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-success)' }}>
                      ${srv.amount.toLocaleString()} COP
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', background: 'var(--color-surface-hover)', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
                    "{srv.problemDescription}"
                  </p>

                  {/* Foto de la solicitud (RF-20) */}
                  {srv.photos && srv.photos.length > 0 && (
                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={srv.photos[0]}
                        alt="Evidencia del problema"
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Foto inicial adjunta (RF-20)
                      </span>
                    </div>
                  )}

                  {/* Evidencia fotográfica de finalización (RF-62) */}
                  {srv.completionEvidence && srv.completionEvidence.length > 0 && (
                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: '#ECFDF5', padding: '6px 10px', borderRadius: '8px' }}>
                      <img
                        src={srv.completionEvidence[0]}
                        alt="Trabajo terminado"
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '11px', color: '#065F46', fontWeight: 600 }}>
                        ✓ Evidencia fotográfica del arreglo terminado (RF-62)
                      </span>
                    </div>
                  )}

                  {/* Motivo de cancelación si aplica (RF-76) */}
                  {srv.cancelReason && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
                      <strong>Motivo de cancelación (RF-76):</strong> {srv.cancelReason}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {srv.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {srv.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} /> {srv.address}
                    </span>
                  </div>
                </div>

                {/* Acciones del Servicio (RF-29, RF-34, RF-35, RF-76, RF-78) */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {srv.status === 'en_curso' && (
                    <>
                      <button
                        onClick={() => handleConfirmFinalize(srv)}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '8px', fontSize: '12px', background: '#10B981' }}
                      >
                        <CheckCircle2 size={14} /> Marcar Completado (RF-29)
                      </button>

                      <button
                        onClick={() => setCancellingService(srv)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '8px', fontSize: '12px', color: 'var(--color-danger)' }}
                      >
                        <XCircle size={14} /> Cancelar Servicio (RF-76)
                      </button>
                    </>
                  )}

                  {srv.status === 'finalizado' && (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {role === 'seeker' ? (
                        srv.reviewDone ? (
                          <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ✓ Reseña verificada publicada (RF-36)
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setReviewingService(srv);
                              setReviewRating(5);
                              setReviewComment('');
                            }}
                            className="btn btn-primary"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            <Star size={13} /> Calificar Profesional (RF-34)
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => setRatingClientService(srv)}
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          <Star size={13} /> Calificar Contratante (RF-35)
                        </button>
                      )}

                      <button
                        onClick={() => onOpenReport(srv)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Reportar anomalía (RF-64)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Finalizar Trabajo con Evidencia Fotográfica (RF-29, RF-62) */}
      {completingService && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            padding: '16px'
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '480px', borderRadius: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Finalizar Trabajo (RF-29)</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Adjunta evidencia fotográfica del arreglo terminado (RF-62)
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Foto del resultado final / respaldo
              </label>
              <input
                type="text"
                className="input-base"
                value={completionPhotoUrl}
                onChange={e => setCompletionPhotoUrl(e.target.value)}
                placeholder="URL de la fotografía del trabajo terminado"
                style={{ fontSize: '12px', marginBottom: '8px' }}
              />
              {completionPhotoUrl && (
                <div style={{ height: '140px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <img src={completionPhotoUrl} alt="Vista previa trabajo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setCompletingService(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancelar
              </button>
              <button onClick={handleExecuteFinalize} className="btn btn-primary" style={{ flex: 1, background: '#10B981' }}>
                Confirmar y Cerrar Servicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cancelar Servicio con Justificación Obligatoria (RF-76) */}
      {cancellingService && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            padding: '16px'
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: 'var(--color-danger)' }}>
              Cancelar Servicio (RF-76)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
              Para cancelar un servicio aceptado se requiere una justificación obligatoria por transparencia.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {CANCEL_REASONS.map((r, i) => (
                <label
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: selectedReason === r ? 'var(--color-surface-hover)' : 'transparent',
                    border: '1px solid var(--color-border)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                  />
                  {r}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setCancellingService(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                Atrás
              </button>
              <button onClick={handleConfirmCancel} className="btn btn-primary" style={{ flex: 1, background: 'var(--color-danger)' }}>
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Calificar Trabajador (RF-34, RF-36) */}
      {reviewingService && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            padding: '16px'
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '24px' }}>
            {!reviewSuccess ? (
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>Calificar a {reviewingService.workerName} (RF-34)</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '14px' }}>
                  Tu reseña quedará vinculada a la transacción verificada {reviewingService.id} (RF-36)
                </span>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <Star size={28} fill={star <= reviewRating ? '#FBBF24' : 'none'} color="#FBBF24" />
                    </button>
                  ))}
                </div>

                <textarea
                  className="input-base"
                  rows={3}
                  placeholder="Describe la puntualidad, calidad técnica y cumplimiento del servicio..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  style={{ marginBottom: '16px' }}
                />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setReviewingService(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Omitir por ahora
                  </button>
                  <button onClick={handleSendReview} className="btn btn-primary" style={{ flex: 1 }}>
                    Publicar Reseña (RF-36)
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>¡Reseña Publicada!</h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  La reputación digital del trabajador se ha recalculado en tiempo real (RF-37).
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Calificar Contratante (RF-35) */}
      {ratingClientService && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            padding: '16px'
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>
              Calificar al Contratante {ratingClientService.clientName} (RF-35)
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '14px' }}>
              Valora el trato, las facilidades brindadas y la puntualidad del pago.
            </span>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setClientRatingValue(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <Star size={28} fill={star <= clientRatingValue ? '#FBBF24' : 'none'} color="#FBBF24" />
                </button>
              ))}
            </div>

            <textarea
              className="input-base"
              rows={2}
              value={clientRatingComment}
              onChange={e => setClientRatingComment(e.target.value)}
              style={{ marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setRatingClientService(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancelar
              </button>
              <button onClick={handleSendClientRating} className="btn btn-primary" style={{ flex: 1 }}>
                Guardar Valoración (RF-35)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Estadísticas de Servicios Más Solicitados (RF-46) */}
      {showStatsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            padding: '16px'
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} color="var(--role-primary)" />
                <h3 style={{ fontSize: '1.25rem' }}>Servicios Más Solicitados (RF-46)</h3>
              </div>
              <button onClick={() => setShowStatsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Distribución de solicitudes completadas por oficio en Bogotá D.C.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {Object.keys(tradeStats).length === 0 ? (
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No hay datos suficientes aún.</span>
              ) : (
                Object.entries(tradeStats).map(([trade, count]) => (
                  <div key={trade} style={{ background: 'var(--color-surface-hover)', padding: '10px 14px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                      <span>{trade}</span>
                      <span>{count} solicitudes cerradas</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, count * 35)}%`, background: 'var(--role-primary)' }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <button onClick={() => setShowStatsModal(false)} className="btn btn-primary" style={{ width: '100%' }}>
              Cerrar Estadísticas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
