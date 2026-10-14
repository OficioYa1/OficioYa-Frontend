import React, { useState, useEffect } from 'react';
import type { ComplaintTicket, Worker } from '../../types';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  UserX,
  UserCheck,
  Search,
  Flag,
  FileText
} from 'lucide-react';

interface AdminModerationModalProps {
  workers: Worker[];
  onClose: () => void;
  onToggleWorkerPause?: (workerId: string, isPaused: boolean) => void;
}

export const AdminModerationModal: React.FC<AdminModerationModalProps> = ({
  workers,
  onClose,
  onToggleWorkerPause
}) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'usuarios'>('tickets');
  const [tickets, setTickets] = useState<ComplaintTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);
  const [searchWorker, setSearchWorker] = useState('');
  const [workerStatusMap, setWorkerStatusMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    workers.forEach(w => {
      map[w.id] = !!w.isPaused;
    });
    return map;
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('oy-complaints');
      if (stored) {
        setTickets(JSON.parse(stored));
      } else {
        // Tickets semilla
        const seedTickets: ComplaintTicket[] = [
          {
            id: 'cmp-seed-1',
            caseNumber: 'OY-2026-9412',
            targetWorkerId: 'w-11',
            targetWorkerName: 'Rodrigo Barrientos',
            type: 'Inasistencia',
            description: 'El trabajador no se presentó al servicio acordado en Restrepo y no responde llamadas ni mensajes.',
            evidenceFiles: [{ name: 'chat_captura.png', type: 'image/png', size: '1.2 MB' }],
            createdAt: '2026-09-28T10:00:00Z',
            status: 'En revisión'
          },
          {
            id: 'cmp-seed-2',
            caseNumber: 'REV-4821',
            targetWorkerId: 'w-1',
            targetWorkerName: 'Mateo Gómez',
            type: 'Reseña Falsa',
            description: 'Reporte de reseña sospechosa: usuario con perfil falso intenta desprestigiar.',
            evidenceFiles: [],
            createdAt: '2026-09-29T15:30:00Z',
            status: 'Abierto',
            isFakeReviewReport: true
          }
        ];
        setTickets(seedTickets);
        localStorage.setItem('oy-complaints', JSON.stringify(seedTickets));
      }
    } catch (_e) {
      setTickets([]);
    }
  }, []);

  const updateTicketStatus = (ticketId: string, newStatus: 'Abierto' | 'En revisión' | 'Resuelto' | 'Desestimado') => {
    const updated = tickets.map(t => (t.id === ticketId ? { ...t, status: newStatus } : t));
    setTickets(updated);
    try {
      localStorage.setItem('oy-complaints', JSON.stringify(updated));
    } catch (_e) {}
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const handleTogglePause = (workerId: string) => {
    const newPaused = !workerStatusMap[workerId];
    setWorkerStatusMap(prev => ({ ...prev, [workerId]: newPaused }));
    if (onToggleWorkerPause) {
      onToggleWorkerPause(workerId, newPaused);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 1200,
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
          maxWidth: '780px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '28px',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '18px', right: '18px', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* Encabezado del Panel de Moderación */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.35rem' }}>Panel de Moderación y Auditoría (RF-54)</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Gestión de quejas, reportes de reseñas falsas y suspensión preventiva de cuentas fraudulentas
            </span>
          </div>
        </div>

        {/* Pestañas de Moderación */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--color-border)', marginBottom: '18px' }}>
          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'tickets' ? '2px solid #DC2626' : '2px solid transparent',
              color: activeTab === 'tickets' ? '#DC2626' : 'var(--color-text-muted)',
              cursor: 'pointer'
            }}
          >
            Tickets de Quejas y Reseñas ({tickets.length}) (RF-73)
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'usuarios' ? '2px solid #DC2626' : '2px solid transparent',
              color: activeTab === 'usuarios' ? '#DC2626' : 'var(--color-text-muted)',
              cursor: 'pointer'
            }}
          >
            Moderación de Cuentas (RF-39, RF-54)
          </button>
        </div>

        {/* Pestaña 1: Tickets de Quejas y Reseñas (RF-64, RF-73, RF-38) */}
        {activeTab === 'tickets' && (
          <div>
            {tickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 10px' }} />
                <p>No hay reportes abiertos en la cola de moderación.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tickets.map(ticket => (
                  <div
                    key={ticket.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: '14px',
                      padding: '14px',
                      background: 'var(--color-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '14px' }}>Caso: {ticket.caseNumber}</span>
                          <span
                            className="badge"
                            style={{
                              background: ticket.type === 'Reseña Falsa' ? '#FEF3C7' : '#FEE2E2',
                              color: ticket.type === 'Reseña Falsa' ? '#B45309' : '#DC2626',
                              fontSize: '11px'
                            }}
                          >
                            {ticket.type}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          Denunciado: <strong>{ticket.targetWorkerName}</strong> • {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <select
                        className="input-base"
                        value={ticket.status}
                        onChange={e => updateTicketStatus(ticket.id, e.target.value as any)}
                        style={{ width: 'auto', fontSize: '11px', padding: '4px 8px', height: '30px' }}
                      >
                        <option value="Abierto">Abierto</option>
                        <option value="En revisión">En revisión</option>
                        <option value="Resuelto">Resuelto</option>
                        <option value="Desestimado">Desestimado</option>
                      </select>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '4px 0', background: 'var(--color-surface-hover)', padding: '8px 12px', borderRadius: '8px' }}>
                      "{ticket.description}"
                    </p>

                    {ticket.evidenceFiles && ticket.evidenceFiles.length > 0 && (
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        📎 Adjuntos: {ticket.evidenceFiles.map(f => f.name).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pestaña 2: Moderación y Suspensión de Cuentas (RF-39, RF-54) */}
        {activeTab === 'usuarios' && (
          <div>
            <div style={{ marginBottom: '14px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="input-base"
                placeholder="Buscar profesional por nombre o oficio..."
                value={searchWorker}
                onChange={e => setSearchWorker(e.target.value)}
                style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {workers
                .filter(w => w.name.toLowerCase().includes(searchWorker.toLowerCase()) || w.tradeLabel.toLowerCase().includes(searchWorker.toLowerCase()))
                .map(w => {
                  const isPaused = workerStatusMap[w.id];
                  const isLowRating = w.rating < 3.0;

                  return (
                    <div
                      key={w.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'var(--color-surface-hover)',
                        borderRadius: '12px',
                        border: isPaused ? '1.5px solid #EF4444' : '1px solid var(--color-border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: w.avatarColor,
                            color: '#FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '14px'
                          }}
                        >
                          {w.initials}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, fontSize: '14px' }}>{w.name}</span>
                            {isLowRating && (
                              <span className="badge badge-danger" style={{ fontSize: '10px' }}>
                                ⭐ {w.rating} (RF-39: Crítico)
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            {w.tradeLabel} • {w.location.zoneName}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          className={`badge ${isPaused ? 'badge-danger' : 'badge-available'}`}
                          style={{ fontSize: '11px' }}
                        >
                          {isPaused ? 'Suspendido / Pausado (RF-39)' : 'Activo'}
                        </span>

                        <button
                          onClick={() => handleTogglePause(w.id)}
                          className="btn btn-secondary"
                          style={{
                            fontSize: '11px',
                            padding: '6px 12px',
                            color: isPaused ? '#10B981' : 'var(--color-danger)',
                            border: '1px solid currentColor'
                          }}
                        >
                          {isPaused ? 'Reactivar Cuenta' : 'Suspender Cuenta (RF-54)'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
