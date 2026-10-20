import React, { useState, useId } from 'react';
import type { ComplaintTicket, Worker } from '../../types';
import {
  X,
  ShieldAlert,
  Search,
  Paperclip,
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { useFlowModal } from '../requests/useFlowModal';
import '../requests/Flows.css';

interface AdminModerationModalProps {
  workers: Worker[];
  onClose: () => void;
  onToggleWorkerPause?: (workerId: string, isPaused: boolean) => void;
  /** OFY-41/42, OFY-68: aprobar cédulas y referidos pendientes. */
  onUpdateWorker?: (workerId: string, patch: Partial<Worker>) => void;
}

type TicketStatus = ComplaintTicket['status'];

const STATUS_OPTIONS: TicketStatus[] = ['Abierto', 'En revisión', 'Resuelto', 'Desestimado'];

const statusClass = (status: TicketStatus) => {
  if (status === 'Resuelto') return 'oy-flow-status--resuelto';
  if (status === 'En revisión') return 'oy-flow-status--revision';
  if (status === 'Abierto') return 'oy-flow-status--abierto';
  return '';
};

export const AdminModerationModal: React.FC<AdminModerationModalProps> = ({
  workers,
  onClose,
  onToggleWorkerPause,
  onUpdateWorker
}) => {
  const uid = useId();
  const dialogRef = useFlowModal(onClose);

  const [activeTab, setActiveTab] = useState<'tickets' | 'usuarios' | 'verificaciones'>('tickets');
  const [tickets, setTickets] = useState<ComplaintTicket[]>(() => {
    try {
      const stored = localStorage.getItem('oy-complaints');
      if (stored) {
        return JSON.parse(stored);
      }
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
      localStorage.setItem('oy-complaints', JSON.stringify(seedTickets));
      return seedTickets;
    } catch {
      return [];
    }
  });
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);
  const [searchWorker, setSearchWorker] = useState('');

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    const updated = tickets.map(t => (t.id === ticketId ? { ...t, status: newStatus } : t));
    setTickets(updated);
    try {
      localStorage.setItem('oy-complaints', JSON.stringify(updated));
    } catch {}
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const handleTogglePause = (worker: Worker) => {
    onToggleWorkerPause?.(worker.id, !worker.isPaused);
  };

  // OFY-41/42: la cédula enviada queda "pending" hasta que moderación decide
  const pendingIdentity = workers.filter(w => w.identityVerification?.status === 'pending');
  const decideIdentity = (worker: Worker, approve: boolean) => {
    if (!worker.identityVerification) return;
    onUpdateWorker?.(worker.id, {
      verified: approve,
      identityVerification: {
        ...worker.identityVerification,
        status: approve ? 'verified' : worker.completedJobsCount >= 10 ? 'eligible' : 'none'
      }
    });
  };

  // OFY-68, OFY-69: referidos que esperan validación
  const pendingReferrals = workers.flatMap(w =>
    (w.referrals?.referredList ?? [])
      .map((ref, index) => ({ worker: w, ref, index }))
      .filter(item => item.ref.status === 'pendiente')
  );
  const approveReferral = (worker: Worker, index: number) => {
    if (!worker.referrals) return;
    const referredList = worker.referrals.referredList.map((r, i) =>
      i === index ? { ...r, status: 'verificado' as const } : r
    );
    const verified = referredList.filter(r => r.status === 'verificado');
    const distinct = new Set(verified.map(r => r.trade.toLowerCase())).size;
    onUpdateWorker?.(worker.id, {
      referrals: {
        ...worker.referrals,
        referredList,
        count: verified.length,
        distinctTradesCount: distinct,
        isCommunityReferrer: distinct >= 3
      }
    });
  };
  const pendingVerifications = pendingIdentity.length + pendingReferrals.length;

  const titleId = `${uid}-title`;
  const query = searchWorker.toLowerCase();
  const filteredWorkers = workers.filter(
    w => w.name.toLowerCase().includes(query) || w.tradeLabel.toLowerCase().includes(query)
  );

  return (
    <div className="oy-modal-backdrop oy-flow-layer--top">
      <div
        ref={dialogRef}
        className="oy-modal oy-flow oy-flow--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        {/* Encabezado del Panel de Moderación */}
        <header className="oy-modal__head oy-flow-head oy-flow-head--gris">
          <div className="oy-flow-head__main">
            <span className="oy-flow-tile oy-flow-tile--marino" aria-hidden="true">
              <ShieldAlert size={26} />
            </span>
            <div className="oy-flow-head__text">
              <span className="oy-eyebrow oy-flow-kicker">Administración · demo</span>
              <h2 id={titleId} className="oy-modal__title oy-display">Panel de Moderación y Auditoría</h2>
              <p className="oy-flow-head__sub">
                Gestión de quejas, reportes de reseñas falsas y suspensión preventiva de cuentas fraudulentas
              </p>
            </div>
          </div>
          <button type="button" className="oy-icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="oy-modal__body oy-flow-body">
          {/* Pestañas de Moderación */}
          <div className="oy-flow-tabs" role="tablist" aria-label="Secciones de moderación">
            <button
              type="button"
              role="tab"
              id={`${uid}-tab-tickets`}
              aria-controls={`${uid}-panel-tickets`}
              aria-selected={activeTab === 'tickets'}
              data-active={activeTab === 'tickets' ? '' : undefined}
              className="oy-chip"
              onClick={() => setActiveTab('tickets')}
            >
              Tickets de Quejas y Reseñas ({tickets.length})
            </button>
            <button
              type="button"
              role="tab"
              id={`${uid}-tab-usuarios`}
              aria-controls={`${uid}-panel-usuarios`}
              aria-selected={activeTab === 'usuarios'}
              data-active={activeTab === 'usuarios' ? '' : undefined}
              className="oy-chip"
              onClick={() => setActiveTab('usuarios')}
            >
              Moderación de Cuentas
            </button>
            <button
              type="button"
              role="tab"
              id={`${uid}-tab-verif`}
              aria-controls={`${uid}-panel-verif`}
              aria-selected={activeTab === 'verificaciones'}
              data-active={activeTab === 'verificaciones' ? '' : undefined}
              className="oy-chip"
              onClick={() => setActiveTab('verificaciones')}
            >
              Verificaciones ({pendingVerifications})
            </button>
          </div>

          {/* Pestaña 3: Cédulas y referidos por revisar (OFY-41, OFY-42, OFY-68) */}
          {activeTab === 'verificaciones' && (
            <div role="tabpanel" id={`${uid}-panel-verif`} aria-labelledby={`${uid}-tab-verif`}>
              {pendingVerifications === 0 ? (
                <div className="oy-empty">
                  <MascotAvatar forceImage="escudo" size="md" />
                  <p className="oy-empty__title">Sin pendientes</p>
                  <p className="oy-empty__text">No hay cédulas ni referidos esperando revisión.</p>
                </div>
              ) : (
                <ul className="oy-flow-list">
                  {pendingIdentity.map(w => (
                    <li key={`id-${w.id}`} className="oy-flow-item">
                      <div className="oy-flow-item__row">
                        <div className="oy-flow-min0">
                          <p className="oy-flow-item__title">
                            {w.name}
                            <span className="oy-flow-tag">Cédula</span>
                          </p>
                          <p className="oy-flow-item__meta">
                            {w.identityVerification?.documentType ?? 'Documento'} {w.identityVerification?.documentNumber}
                            {' • '}{w.completedJobsCount} trabajos completados
                            {w.identityVerification?.documentFileUrl ? ' • con foto adjunta' : ' • sin foto adjunta'}
                          </p>
                        </div>
                        <div className="oy-flow-item__actions">
                          <button type="button" className="btn btn-secondary oy-flow-small" onClick={() => decideIdentity(w, false)}>
                            Rechazar
                          </button>
                          <button type="button" className="btn oy-flow-small oy-btn-ok" onClick={() => decideIdentity(w, true)}>
                            Aprobar
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                  {pendingReferrals.map(({ worker: w, ref, index }) => (
                    <li key={`ref-${w.id}-${index}`} className="oy-flow-item">
                      <div className="oy-flow-item__row">
                        <div className="oy-flow-min0">
                          <p className="oy-flow-item__title">
                            {ref.name}
                            <span className="oy-flow-tag oy-flow-tag--fuego">Referido</span>
                          </p>
                          <p className="oy-flow-item__meta">
                            {ref.trade} • referido por {w.name}
                          </p>
                        </div>
                        <div className="oy-flow-item__actions">
                          <button type="button" className="btn oy-flow-small oy-btn-ok" onClick={() => approveReferral(w, index)}>
                            Validar referido
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Pestaña 1: Tickets de Quejas y Reseñas (OFY-64, OFY-73, OFY-38) */}
          {activeTab === 'tickets' && (
            <div role="tabpanel" id={`${uid}-panel-tickets`} aria-labelledby={`${uid}-tab-tickets`}>
              {tickets.length === 0 ? (
                <div className="oy-empty">
                  <MascotAvatar size="sm" />
                  <p className="oy-empty__title">Cola al día</p>
                  <p className="oy-empty__text">No hay reportes abiertos en la cola de moderación.</p>
                </div>
              ) : (
                <ul className="oy-flow-list">
                  {tickets.map(ticket => (
                    <li key={ticket.id} className="oy-flow-item">
                      <div className="oy-flow-item__row">
                        <div className="oy-flow-min0">
                          <p className="oy-flow-item__title">
                            Caso: {ticket.caseNumber}
                            <span className={`oy-flow-tag ${ticket.type === 'Reseña Falsa' ? '' : 'oy-flow-tag--fuego'}`}>
                              {ticket.type}
                            </span>
                          </p>
                          <p className="oy-flow-item__meta">
                            Denunciado: <strong>{ticket.targetWorkerName}</strong> • {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="oy-flow-item__actions">
                          <span className={`oy-flow-status ${statusClass(ticket.status)}`}>{ticket.status}</span>
                          <select
                            className="input-base oy-flow-select"
                            value={ticket.status}
                            onChange={e => updateTicketStatus(ticket.id, e.target.value as TicketStatus)}
                            aria-label={`Cambiar estado del caso ${ticket.caseNumber}`}
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <p className="oy-flow-item__quote">"{ticket.description}"</p>

                      {ticket.evidenceFiles && ticket.evidenceFiles.length > 0 && (
                        <p className="oy-flow-item__meta oy-flow-attach">
                          <Paperclip size={12} aria-hidden="true" /> Adjuntos: {ticket.evidenceFiles.map(f => f.name).join(', ')}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Pestaña 2: Moderación y Suspensión de Cuentas (OFY-39, OFY-54) */}
          {activeTab === 'usuarios' && (
            <div
              role="tabpanel"
              id={`${uid}-panel-usuarios`}
              aria-labelledby={`${uid}-tab-usuarios`}
              className="oy-flow-body"
            >
              <div className="oy-flow-field">
                <div className="oy-flow-input-icon">
                  <Search size={16} aria-hidden="true" />
                  <input
                    type="search"
                    className="input-base"
                    placeholder="Buscar profesional por nombre o oficio..."
                    aria-label="Buscar profesional por nombre o oficio"
                    value={searchWorker}
                    onChange={e => setSearchWorker(e.target.value)}
                  />
                </div>
              </div>

              <ul className="oy-flow-list">
                {filteredWorkers.map(w => {
                  const isPaused = !!w.isPaused;
                  const isLowRating = w.rating < 3.0;

                  return (
                    <li key={w.id} className={`oy-flow-item ${isPaused ? 'oy-flow-item--paused' : ''}`}>
                      <div className="oy-flow-item__row">
                        <div className="oy-flow-item__who">
                          <div
                            className="oy-flow-avatar oy-flow-avatar--round oy-flow-avatar--sm"
                            style={{ background: w.avatarColor }}
                            aria-hidden="true"
                          >
                            {w.initials}
                          </div>
                          <div className="oy-flow-min0">
                            <p className="oy-flow-item__title">
                              {w.name}
                              {isLowRating && (
                                <span className="oy-flow-tag oy-flow-tag--danger">
                                  ⭐ {w.rating} (crítico)
                                </span>
                              )}
                            </p>
                            <p className="oy-flow-item__meta">
                              {w.tradeLabel} • {w.location.zoneName}
                            </p>
                          </div>
                        </div>

                        <div className="oy-flow-item__actions">
                          <span className={`oy-flow-status ${isPaused ? 'oy-flow-status--danger' : 'oy-flow-status--resuelto'}`}>
                            {isPaused ? 'Suspendido / Pausado' : 'Activo'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTogglePause(w)}
                            className={`btn oy-flow-small ${isPaused ? 'oy-btn-ok' : 'btn-danger'}`}
                          >
                            {isPaused ? 'Reactivar Cuenta' : 'Suspender Cuenta'}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {filteredWorkers.length === 0 && (
                <div className="oy-flow-empty-line">Ningún profesional coincide con “{searchWorker}”.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
