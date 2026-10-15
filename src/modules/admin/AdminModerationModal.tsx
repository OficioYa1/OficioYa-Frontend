import React, { useState, useEffect, useId } from 'react';
import type { ComplaintTicket, Worker } from '../../types';
import {
  X,
  ShieldAlert,
  Search,
  Paperclip,
  AlertCircle,
  Hourglass,
  CheckCircle2,
  MinusCircle,
  PauseCircle,
  Star,
  type LucideIcon
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { useFlowModal } from '../requests/useFlowModal';
import './Moderation.css';

interface AdminModerationModalProps {
  workers: Worker[];
  onClose: () => void;
  onToggleWorkerPause?: (workerId: string, isPaused: boolean) => void;
  /** OFY-41/42, OFY-68: aprobar cédulas y referidos pendientes. */
  onUpdateWorker?: (workerId: string, patch: Partial<Worker>) => void;
}

type TicketStatus = ComplaintTicket['status'];
type Tab = 'tickets' | 'usuarios' | 'verificaciones';

const STATUS_OPTIONS: TicketStatus[] = ['Abierto', 'En revisión', 'Resuelto', 'Desestimado'];

const STATUS_TONE: Record<TicketStatus, { tone: string; icon: LucideIcon }> = {
  Abierto: { tone: 'fuego', icon: AlertCircle },
  'En revisión': { tone: 'marino', icon: Hourglass },
  Resuelto: { tone: 'esmeralda', icon: CheckCircle2 },
  Desestimado: { tone: 'gris', icon: MinusCircle }
};

const TABS: Tab[] = ['tickets', 'usuarios', 'verificaciones'];

export const AdminModerationModal: React.FC<AdminModerationModalProps> = ({
  workers,
  onClose,
  onToggleWorkerPause,
  onUpdateWorker
}) => {
  const uid = useId();
  const dialogRef = useFlowModal(onClose);

  const [activeTab, setActiveTab] = useState<Tab>('tickets');
  const [tickets, setTickets] = useState<ComplaintTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);
  const [searchWorker, setSearchWorker] = useState('');

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
    } catch {
      setTickets([]);
    }
  }, []);

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    const updated = tickets.map(t => (t.id === ticketId ? { ...t, status: newStatus } : t));
    setTickets(updated);
    try {
      localStorage.setItem('oy-complaints', JSON.stringify(updated));
    } catch {
      /* sin almacenamiento: el cambio queda solo en memoria */
    }
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

  const tabLabel: Record<Tab, string> = {
    tickets: `Quejas y reseñas (${tickets.length})`,
    usuarios: 'Cuentas',
    verificaciones: `Verificaciones (${pendingVerifications})`
  };

  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = TABS[(TABS.indexOf(activeTab) + dir + TABS.length) % TABS.length];
    setActiveTab(next);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  };

  return (
    <div className="oy-modal-backdrop adm-layer" onClick={onClose}>
      <div
        ref={dialogRef}
        className="oy-modal adm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <header className="oy-modal__head adm-head">
          <div className="adm-head__main">
            <span className="adm-tile" aria-hidden="true">
              <ShieldAlert size={24} />
            </span>
            <div className="adm-head__text">
              <span className="adm-kicker">Administración · demo</span>
              <h2 id={titleId} className="oy-modal__title adm-title">Moderación y auditoría</h2>
              <p className="adm-sub">
                Quejas, reportes de reseñas falsas, verificaciones y suspensión preventiva de cuentas.
              </p>
            </div>
          </div>
          <button type="button" className="oy-icon-btn" onClick={onClose} aria-label="Cerrar moderación">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="oy-modal__body adm-body">
          <div className="adm-tabs" role="tablist" aria-label="Secciones de moderación">
            {TABS.map(tab => (
              <button
                key={tab}
                type="button"
                role="tab"
                id={`${uid}-tab-${tab}`}
                aria-controls={`${uid}-panel-${tab}`}
                aria-selected={activeTab === tab}
                tabIndex={activeTab === tab ? 0 : -1}
                className="adm-tab"
                onClick={() => setActiveTab(tab)}
                onKeyDown={onTabKey}
              >
                {tabLabel[tab]}
              </button>
            ))}
          </div>

          {/* Cédulas y referidos por revisar (OFY-41, OFY-42, OFY-68) */}
          {activeTab === 'verificaciones' && (
            <div role="tabpanel" id={`${uid}-panel-verificaciones`} aria-labelledby={`${uid}-tab-verificaciones`} tabIndex={0}>
              {pendingVerifications === 0 ? (
                <div className="oy-empty adm-empty">
                  <MascotAvatar size="sm" expression="alegre" />
                  <p className="oy-empty__title">Sin pendientes</p>
                  <p className="oy-empty__text">No hay cédulas ni referidos esperando revisión.</p>
                </div>
              ) : (
                <ul className="adm-list">
                  {pendingIdentity.map(w => (
                    <li key={`id-${w.id}`} className="adm-item">
                      <div className="adm-item__main">
                        <p className="adm-item__title">
                          {w.name}
                          <span className="adm-tag" data-tone="marino">Cédula</span>
                        </p>
                        <p className="adm-item__meta">
                          {w.identityVerification?.documentType ?? 'Documento'} {w.identityVerification?.documentNumber}
                          {' · '}{w.completedJobsCount} trabajos completados
                          {w.identityVerification?.documentFileUrl ? ' · con foto adjunta' : ' · sin foto adjunta'}
                        </p>
                      </div>
                      <div className="adm-item__actions">
                        <button type="button" className="btn btn-secondary" onClick={() => decideIdentity(w, false)}>
                          Rechazar
                        </button>
                        <button type="button" className="btn adm-btn-ok" onClick={() => decideIdentity(w, true)}>
                          <CheckCircle2 size={16} aria-hidden="true" /> Aprobar
                        </button>
                      </div>
                    </li>
                  ))}
                  {pendingReferrals.map(({ worker: w, ref, index }) => (
                    <li key={`ref-${w.id}-${index}`} className="adm-item">
                      <div className="adm-item__main">
                        <p className="adm-item__title">
                          {ref.name}
                          <span className="adm-tag" data-tone="fuego">Referido</span>
                        </p>
                        <p className="adm-item__meta">{ref.trade} · referido por {w.name}</p>
                      </div>
                      <div className="adm-item__actions">
                        <button type="button" className="btn adm-btn-ok" onClick={() => approveReferral(w, index)}>
                          <CheckCircle2 size={16} aria-hidden="true" /> Validar referido
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Tickets de quejas y reseñas (OFY-64, OFY-73, OFY-38) */}
          {activeTab === 'tickets' && (
            <div role="tabpanel" id={`${uid}-panel-tickets`} aria-labelledby={`${uid}-tab-tickets`} tabIndex={0}>
              {tickets.length === 0 ? (
                <div className="oy-empty adm-empty">
                  <MascotAvatar size="sm" expression="alegre" />
                  <p className="oy-empty__title">Cola al día</p>
                  <p className="oy-empty__text">No hay reportes abiertos en la cola de moderación.</p>
                </div>
              ) : (
                <ul className="adm-list">
                  {tickets.map(ticket => {
                    const st = STATUS_TONE[ticket.status] ?? STATUS_TONE.Desestimado;
                    const StatusIcon = st.icon;
                    const selectId = `${uid}-st-${ticket.id}`;
                    return (
                      <li key={ticket.id} className="adm-item adm-item--ticket">
                        <div className="adm-item__main">
                          <p className="adm-item__title">
                            <span className="adm-case">{ticket.caseNumber}</span>
                            <span className="adm-tag" data-tone={ticket.type === 'Reseña Falsa' ? 'marino' : 'fuego'}>
                              {ticket.type}
                            </span>
                          </p>
                          <p className="adm-item__meta">
                            Denunciado: <strong>{ticket.targetWorkerName}</strong> · {new Date(ticket.createdAt).toLocaleDateString('es-CO')}
                          </p>
                          <p className="adm-quote">{ticket.description}</p>
                          {ticket.evidenceFiles && ticket.evidenceFiles.length > 0 && (
                            <p className="adm-item__meta adm-attach">
                              <Paperclip size={13} aria-hidden="true" /> {ticket.evidenceFiles.map(f => f.name).join(', ')}
                            </p>
                          )}
                        </div>

                        <div className="adm-item__side">
                          <span className="adm-status" data-tone={st.tone}>
                            <StatusIcon size={14} aria-hidden="true" /> {ticket.status}
                          </span>
                          <label htmlFor={selectId} className="adm-label">Cambiar estado</label>
                          <select
                            id={selectId}
                            className="input-base adm-select"
                            value={ticket.status}
                            onChange={e => updateTicketStatus(ticket.id, e.target.value as TicketStatus)}
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Moderación y suspensión de cuentas (OFY-39, OFY-54) */}
          {activeTab === 'usuarios' && (
            <div role="tabpanel" id={`${uid}-panel-usuarios`} aria-labelledby={`${uid}-tab-usuarios`}>
              <label htmlFor={`${uid}-search`} className="adm-label">Buscar profesional</label>
              <div className="adm-search">
                <Search size={16} aria-hidden="true" />
                <input
                  id={`${uid}-search`}
                  type="search"
                  className="input-base"
                  placeholder="Nombre u oficio"
                  value={searchWorker}
                  onChange={e => setSearchWorker(e.target.value)}
                />
              </div>

              <ul className="adm-list">
                {filteredWorkers.map(w => {
                  const isPaused = !!w.isPaused;
                  const isLowRating = w.rating < 3.0;

                  return (
                    <li key={w.id} className="adm-item" data-paused={isPaused ? '' : undefined}>
                      <div className="adm-who">
                        <span className="adm-avatar" style={{ background: w.avatarColor }} aria-hidden="true">
                          {w.initials}
                        </span>
                        <div className="adm-item__main">
                          <p className="adm-item__title">
                            {w.name}
                            {isLowRating && (
                              <span className="adm-tag" data-tone="fuego">
                                <Star size={12} aria-hidden="true" /> {w.rating} · crítico
                              </span>
                            )}
                          </p>
                          <p className="adm-item__meta">{w.tradeLabel} · {w.location.zoneName}</p>
                        </div>
                      </div>

                      <div className="adm-item__actions">
                        <span className="adm-status" data-tone={isPaused ? 'fuego' : 'esmeralda'}>
                          {isPaused
                            ? <><PauseCircle size={14} aria-hidden="true" /> Suspendido</>
                            : <><CheckCircle2 size={14} aria-hidden="true" /> Activo</>}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTogglePause(w)}
                          className={`btn ${isPaused ? 'adm-btn-ok' : 'btn-secondary adm-btn-warn'}`}
                          aria-label={`${isPaused ? 'Reactivar' : 'Suspender'} la cuenta de ${w.name}`}
                        >
                          {isPaused ? 'Reactivar' : 'Suspender'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {filteredWorkers.length === 0 && (
                <p className="adm-none" role="status">Ningún profesional coincide con “{searchWorker}”.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
