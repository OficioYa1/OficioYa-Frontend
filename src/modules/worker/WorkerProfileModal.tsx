import React, { useState } from 'react';
import type { Worker, Review } from '../../types';
import {
  X,
  Star,
  ShieldCheck,
  Clock,
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '0',
          borderRadius: '24px',
          position: 'relative'
        }}
      >
        {/* Header con Portada y Botón Cerrar */}
        <div
          style={{
            height: '110px',
            background: `linear-gradient(135deg, ${worker.avatarColor} 0%, #1E3A8A 100%)`,
            position: 'relative',
            padding: '16px'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(0,0,0,0.4)',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>

        {/* Información Principal del Profesional */}
        <div style={{ padding: '0 24px 24px', marginTop: '-40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '24px',
                  background: worker.avatarColor,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '28px',
                  border: '4px solid var(--color-surface)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {worker.initials}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.4rem' }}>{worker.name}</h2>
                  {worker.verified && (
                    <span className="badge badge-verified" title="Identidad validada con documento (RF-43)">
                      <ShieldCheck size={14} /> Verificado
                    </span>
                  )}
                  {worker.referrals?.isCommunityReferrer && (
                    <span
                      className="badge"
                      style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #F59E0B' }}
                      title="Referente Comunitario Verificado: referidos activos en >= 3 oficios (RF-69)"
                    >
                      <Award size={13} /> Referente Comunitario
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {worker.tradeLabel}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span className={`badge ${worker.available && !worker.isPaused ? 'badge-available' : 'badge-danger'}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                {worker.isPaused ? 'Pausado' : worker.available ? 'Disponible Ahora' : 'Fuera de línea'}
              </span>
              <button
                onClick={() => onOpenReport(worker)}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', color: 'var(--color-danger)', fontSize: '12px' }}
                title="Reportar anomalía o queja ante administración (RF-64)"
              >
                <AlertTriangle size={14} /> Reportar
              </button>
            </div>
          </div>

          {/* Banner de Pausa Automática por Bajas Calificaciones (RF-39) */}
          {worker.isPaused && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1.5px solid #EF4444',
                borderRadius: '14px',
                padding: '12px 16px',
                marginBottom: '16px',
                color: '#991B1B',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <AlertTriangle size={20} color="#EF4444" />
              <div>
                <strong>Perfil suspendido automáticamente (RF-39):</strong> {worker.pauseReason || 'Promedio menor a 3.0 estrellas en sus últimas 5 reseñas. Se han bloqueado nuevas solicitudes.'}
              </div>
            </div>
          )}

          {/* Calificación y Métricas Clave (RF-08, RF-10) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              background: 'var(--color-surface-hover)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Calificación (RF-10)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, fontSize: '15px' }}>
                <Star size={16} fill="#FBBF24" color="#FBBF24" /> {worker.rating.toFixed(1)}
                <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--color-text-muted)' }}>({worker.reviewCount})</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Trabajos Completados (RF-08)</span>
              <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-success)' }}>
                {worker.completedJobsCount} servicios
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Tarifa Aprox. (RF-05)</span>
              <span style={{ fontWeight: 800, fontSize: '15px' }}>${worker.hourlyRate.toLocaleString()} COP /h</span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Zona (RF-04)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '13px' }}>
                <MapPin size={14} color="var(--role-primary)" /> {worker.location.zoneName}
              </div>
            </div>
          </div>

          {/* Selector de Pestañas Internas */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '16px', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('info')}
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 700,
                borderBottom: activeTab === 'info' ? '2px solid var(--role-primary)' : '2px solid transparent',
                color: activeTab === 'info' ? 'var(--role-primary)' : 'var(--color-text-muted)',
                whiteSpace: 'nowrap'
              }}
            >
              Detalles & Horarios
            </button>
            <button
              onClick={() => setActiveTab('oficios')}
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 700,
                borderBottom: activeTab === 'oficios' ? '2px solid var(--role-primary)' : '2px solid transparent',
                color: activeTab === 'oficios' ? 'var(--role-primary)' : 'var(--color-text-muted)',
                whiteSpace: 'nowrap'
              }}
            >
              Oficios & Reputación (RF-56)
            </button>
            <button
              onClick={() => setActiveTab('resenas')}
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 700,
                borderBottom: activeTab === 'resenas' ? '2px solid var(--role-primary)' : '2px solid transparent',
                color: activeTab === 'resenas' ? 'var(--role-primary)' : 'var(--color-text-muted)',
                whiteSpace: 'nowrap'
              }}
            >
              Reseñas ({worker.reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('galeria')}
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 700,
                borderBottom: activeTab === 'galeria' ? '2px solid var(--role-primary)' : '2px solid transparent',
                color: activeTab === 'galeria' ? 'var(--role-primary)' : 'var(--color-text-muted)',
                whiteSpace: 'nowrap'
              }}
            >
              Portafolio ({worker.gallery.length})
            </button>
          </div>

          {/* Contenido Pestaña 1: Detalles & Horarios (RF-04, RF-06, RF-09, RF-60) */}
          {activeTab === 'info' && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '6px' }}>Biografía y Experiencia</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  {worker.bio}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  <Phone size={13} /> {worker.phone}
                </div>
              </div>

              {/* RF-60: Métodos de Pago Aceptados */}
              <div style={{ marginBottom: '18px', background: 'var(--color-surface-hover)', padding: '12px 16px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={15} color="var(--role-primary)" /> Métodos de Pago Aceptados (RF-60)
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(worker.acceptedPaymentMethods || ['efectivo', 'nequi', 'daviplata']).map(method => (
                    <span
                      key={method}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    >
                      ✓ {method}
                    </span>
                  ))}
                </div>
              </div>

              {/* RF-09: Equipamiento, Marcas y Especies */}
              {(worker.equipment || worker.brands || worker.species) && (
                <div style={{ marginBottom: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {worker.equipment && (
                    <div style={{ background: 'var(--color-surface-hover)', padding: '12px', borderRadius: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <Wrench size={13} /> Equipo & Herramientas (RF-09)
                      </span>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {worker.equipment.map((eq, i) => (
                          <li key={i}>{eq}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {worker.brands && (
                    <div style={{ background: 'var(--color-surface-hover)', padding: '12px', borderRadius: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <Tag size={13} /> Marcas Atendidas (RF-09)
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {worker.brands.map((b, i) => (
                          <span key={i} style={{ background: 'var(--color-surface)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {worker.species && (
                    <div style={{ background: 'var(--color-surface-hover)', padding: '12px', borderRadius: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                        🐾 Especies Atendidas (RF-09)
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {worker.species.map((sp, i) => (
                          <span key={i} style={{ background: 'var(--color-surface)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Slots de Disponibilidad Semanal (RF-06) */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} /> Horarios y Disponibilidad Semanal (RF-06)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {worker.schedule.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'var(--color-surface-hover)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{item.day}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{item.slots.join(' | ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contenido Pestaña 2: Oficios & Reputación Diferenciada (RF-02, RF-03, RF-56, RF-66, RF-71, RF-74) */}
          {activeTab === 'oficios' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>Reputación Diferenciada por Oficio (RF-56, RF-71)</h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Las calificaciones y trabajos no se promedian entre oficios distintos para proteger la reputación especializada.
                </p>
              </div>

              {/* Desglose por oficio */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {/* Oficio Principal (RF-02) */}
                <div style={{ border: '1.5px solid var(--role-primary)', borderRadius: '14px', padding: '14px', background: 'var(--color-surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span className="badge badge-verified" style={{ marginBottom: '4px' }}>OFICIO PRINCIPAL (RF-02)</span>
                      <h4 style={{ fontSize: '15px', fontWeight: 800 }}>{worker.tradeLabel}</h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706' }}>
                        <Star size={18} fill="#FBBF24" color="#FBBF24" />
                        {worker.ratingByTrade?.[worker.trade]?.rating || worker.rating}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {worker.ratingByTrade?.[worker.trade]?.reviewCount || worker.reviewCount} reseñas
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                    <span><strong>{worker.ratingByTrade?.[worker.trade]?.completedJobs || worker.completedJobsCount}</strong> trabajos completados (RF-74)</span>
                    <span>Tarifa: <strong>${worker.hourlyRate.toLocaleString()} COP/h</strong></span>
                  </div>

                  {/* Especializaciones (RF-66) */}
                  {worker.specializations && worker.specializations.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                        Especializaciones registradas (RF-66):
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {worker.specializations.map((spec, i) => (
                          <span key={i} style={{ background: 'var(--role-primary-light)', color: 'var(--role-primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            * {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Oficios Secundarios (RF-03) */}
                {worker.secondaryTrades && worker.secondaryTrades.length > 0 && worker.secondaryTrades.map(secTrade => {
                  const secRep = worker.ratingByTrade?.[secTrade] || { rating: 4.8, reviewCount: 6, completedJobs: 6 };
                  return (
                    <div key={secTrade} style={{ border: '1px solid var(--color-border)', borderRadius: '14px', padding: '14px', background: 'var(--color-surface)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span className="badge" style={{ background: 'var(--color-surface-hover)', marginBottom: '4px' }}>OFICIO SECUNDARIO (RF-03)</span>
                          <h4 style={{ fontSize: '15px', fontWeight: 800, textTransform: 'capitalize' }}>{secTrade}</h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706' }}>
                            <Star size={18} fill="#FBBF24" color="#FBBF24" /> {secRep.rating}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{secRep.reviewCount} reseñas</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                        <span><strong>{secRep.completedJobs}</strong> trabajos completados (RF-74)</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Referente Comunitario Verificado (RF-68, RF-69) */}
              {worker.referrals && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Award size={18} color="#D97706" />
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#B45309' }}>
                      Crecimiento Comunitario & Referidos (RF-68, RF-69)
                    </h4>
                  </div>
                  <p style={{ fontSize: '12px', color: '#78350F', margin: '0 0 8px' }}>
                    Código de referente: <strong>{worker.referrals.code}</strong>. Ha referido a {worker.referrals.count} colegas técnicos en {worker.referrals.distinctTradesCount} oficios distintos.
                  </p>
                  {worker.referrals.isCommunityReferrer && (
                    <span className="badge" style={{ background: '#F59E0B', color: '#FFF' }}>
                      Insignia Permanente: Referente Comunitario Verificado (RF-69)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Contenido Pestaña 3: Reseñas & Reporte de Falsas (RF-36, RF-38) */}
          {activeTab === 'resenas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {worker.reviews.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px' }}>
                  Aún no tiene reseñas registradas. ¡Sé el primero en calificarlo!
                </p>
              ) : (
                worker.reviews.map(rev => {
                  const isReported = reportedReviews[rev.id] || rev.isReported;
                  return (
                    <div
                      key={rev.id}
                      style={{
                        padding: '14px',
                        background: 'var(--color-surface-hover)',
                        borderRadius: '12px',
                        fontSize: '13px',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700 }}>{rev.author}</span>
                          {rev.verifiedWork && (
                            <span style={{ fontSize: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                              <CheckCircle2 size={11} /> Trabajo Verificado (RF-36)
                            </span>
                          )}
                          {rev.tradeCategory && (
                            <span style={{ fontSize: '10px', background: 'var(--color-surface)', padding: '1px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
                              {rev.tradeCategory}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{rev.date}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={12}
                              fill={star <= rev.rating ? '#FBBF24' : 'none'}
                              color="#FBBF24"
                            />
                          ))}
                        </div>

                        {/* Botón Reportar Reseña Falsa (RF-38) */}
                        {isReported ? (
                          <span style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: 600 }}>
                            Reseña reportada para moderación
                          </span>
                        ) : (
                          <button
                            onClick={() => setReportingReviewId(reportingReviewId === rev.id ? null : rev.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-text-muted)',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Reportar reseña potencialmente falsa ante el administrador (RF-38)"
                          >
                            <Flag size={11} /> Reportar sospechosa
                          </button>
                        )}
                      </div>

                      <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.4, margin: 0 }}>
                        "{rev.comment}"
                      </p>

                      {/* Formulario desplegable para reportar reseña falsa */}
                      {reportingReviewId === rev.id && (
                        <div style={{ marginTop: '10px', padding: '10px', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                            Motivo del reporte (RF-38: sin eliminación automática, enviado a auditoría):
                          </span>
                          <input
                            type="text"
                            className="input-base"
                            placeholder="Ej. Reseña fraudulenta, conflicto de interés o suplantación"
                            value={reportReasonText}
                            onChange={e => setReportReasonText(e.target.value)}
                            style={{ fontSize: '12px', height: '34px', marginBottom: '6px' }}
                          />
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setReportingReviewId(null)}
                              className="btn btn-secondary"
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleReportFakeReview(rev)}
                              className="btn btn-primary"
                              style={{ fontSize: '11px', padding: '4px 10px', background: 'var(--color-danger)' }}
                            >
                              Enviar Reporte
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Contenido Pestaña 4: Portafolio de Trabajos (RF-07, RF-65) */}
          {activeTab === 'galeria' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {worker.gallery.map((imgUrl, i) => (
                <div
                  key={i}
                  style={{
                    height: '140px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'var(--color-surface-hover)',
                    position: 'relative'
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={`Evidencia de trabajo ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', color: '#FFF', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
                    <ImageIcon size={10} style={{ display: 'inline', marginRight: '3px' }} /> Evidencia (RF-65)
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Barra de Acciones: Chat, Enviar Petición, Contratar / No disponible */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '16px',
              flexWrap: 'wrap'
            }}
          >
            <button
              onClick={() => onOpenChat(worker)}
              className="btn btn-secondary"
              style={{ flex: 1, minWidth: '110px' }}
            >
              <MessageCircle size={16} /> Chatear (RF-51)
            </button>

            <button
              onClick={() => onOpenSendRequest(worker)}
              className="btn btn-secondary"
              disabled={worker.isPaused}
              style={{ flex: 1, minWidth: '130px', opacity: worker.isPaused ? 0.5 : 1 }}
            >
              <Send size={16} /> Enviar petición
            </button>

            <button
              onClick={() => {
                if (worker.available && !worker.isPaused) onOpenBooking(worker);
              }}
              disabled={!worker.available || worker.isPaused}
              className="btn btn-primary"
              style={{
                flex: 1.5,
                minWidth: '150px',
                opacity: worker.available && !worker.isPaused ? 1 : 0.6,
                cursor: worker.available && !worker.isPaused ? 'pointer' : 'not-allowed'
              }}
            >
              <Calendar size={16} /> {worker.isPaused ? 'Pausado (RF-39)' : worker.available ? 'Contratar Servicio' : 'No disponible'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
