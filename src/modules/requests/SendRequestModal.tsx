import React, { useState, useMemo, useId } from 'react';
import type { Worker, UrgencyLevel, ServiceRequest, PaymentMethod, TradeCategory } from '../../types';
import { TRADE_LABELS, rateUnitShort } from '../../utils/workerProfile';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Send,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  MapPin,
  Camera,
  Calendar,
  Sparkles,
  Plus,
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { SlideConfirm } from '../../components/ui';
import { useFlowModal } from './useFlowModal';
import './Flows.css';

interface SendRequestModalProps {
  workers: Worker[];
  initialWorker?: Worker;
  onClose: () => void;
  onSubmitRequests: (requests: ServiceRequest[]) => void;
}

const BOGOTA_NEIGHBORHOODS = [
  'Chapinero / Chicó',
  'Usaquén / Santa Bárbara',
  'Cedritos',
  'Suba / Niza',
  'Teusaquillo / Galerías',
  'La Candelaria / Centro',
  'Ciudad Salitre / Modelia',
  'Colina Campestre',
  'Fontibón'
];

const URGENCY_OPTIONS: { id: UrgencyLevel; label: string }[] = [
  { id: 'urgente', label: 'Urgente (Hoy mismo)' },
  { id: 'normal', label: 'Normal (Esta semana)' }
];

export const SendRequestModal: React.FC<SendRequestModalProps> = ({
  workers,
  initialWorker,
  onClose,
  onSubmitRequests
}) => {
  const { user } = useAuth();
  const uid = useId();
  const dialogRef = useFlowModal(onClose);

  const [description, setDescription] = useState('');
  // OFY-22: oficio requerido ('' = cualquiera)
  const [trade, setTrade] = useState<TradeCategory | ''>(initialWorker?.trade ?? '');
  const [expectedDate, setExpectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedZone, setSelectedZone] = useState('Chapinero / Chicó');
  const [addressDetail, setAddressDetail] = useState('Carrera 15 # 85-20');
  const [urgency, setUrgency] = useState<UrgencyLevel>('urgente');
  const [budget, setBudget] = useState('80000');
  const [paymentMethod] = useState<PaymentMethod>('bre_b');
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);

  // Lista de trabajadores seleccionados (OFY-23 si es 1, OFY-24 si son múltiples)
  const [selectedWorkers, setSelectedWorkers] = useState<Worker[]>(() => {
    return initialWorker ? [initialWorker] : [];
  });
  const [, setSearchWorkerQuery] = useState('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [createdList, setCreatedList] = useState<ServiceRequest[]>([]);

  // OFY-22: Identificar trabajadores cercanos compatibles con el oficio y la zona seleccionados
  const compatibleWorkers = useMemo(() => {
    const zoneKeyword = selectedZone.split('/')[0].trim().toLowerCase();
    return workers.filter(
      w =>
        w.available &&
        !w.isPaused &&
        (!trade ||
          w.trade === trade ||
          w.secondaryTrades?.includes(trade) ||
          w.services.some(s => s.trade === trade)) &&
        (w.location.zoneName.toLowerCase().includes(zoneKeyword) ||
          w.services.some(s => s.coverageZones.some(cz => cz.toLowerCase().includes(zoneKeyword))))
    );
  }, [workers, selectedZone, trade]);

  const addWorker = (worker: Worker) => {
    if (!selectedWorkers.some(sw => sw.id === worker.id)) {
      setSelectedWorkers(prev => [...prev, worker]);
    }
    setSearchWorkerQuery('');
  };

  const removeWorker = (id: string) => {
    setSelectedWorkers(prev => prev.filter(w => w.id !== id));
  };

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim()) {
      setAttachedPhotos(prev => [...prev, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
      setShowPhotoInput(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setAttachedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // OFY-24: Enviar simultáneamente solicitud a varios trabajadores con plazo de 30 minutos (OFY-28)
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!description.trim() || selectedWorkers.length === 0) return;

    const expirationDate = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos (OFY-28)
    const broadcastId = `bc-${Date.now()}`;

    const newRequests: ServiceRequest[] = selectedWorkers.map(w => ({
      id: `srv-${Date.now()}-${w.id}`,
      broadcastId,
      tradeCategory: trade || w.trade,
      workerId: w.id,
      workerName: w.name,
      workerTrade: w.tradeLabel,
      workerAvatarColor: w.avatarColor,
      clientId: user?.id || 'usr-default',
      clientName: user?.name || 'Cliente',
      clientEmail: user?.email || 'cliente@correo.com',
      date: expectedDate,
      time: urgency === 'urgente' ? 'Inmediato (< 30 min)' : 'En el transcurso del día',
      address: `${addressDetail}, ${selectedZone}, Bogotá D.C.`,
      coverageZone: selectedZone,
      problemDescription: description,
      paymentMethod,
      status: 'pendiente',
      urgency,
      budget: parseInt(budget) || 50000,
      amount: parseInt(budget) || 50000,
      photos: attachedPhotos,
      broadcastCandidates: selectedWorkers.map(sw => sw.id),
      expiresAt: expirationDate,
      createdAt: new Date().toISOString()
    }));

    setCreatedList(newRequests);
    setIsSuccess(true);
    onSubmitRequests(newRequests);
  };

  const titleId = `${uid}-title`;
  const recipients = selectedWorkers.length;

  return (
    <div className="oy-modal-backdrop oy-flow-layer--base">
      <div
        ref={dialogRef}
        className="oy-modal oy-flow oy-flow--md"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className={`oy-modal__head oy-flow-head ${isSuccess ? 'oy-flow-head--esmeralda' : 'oy-flow-head--almendra'}`}>
          <div className="oy-flow-head__main">
            <span className="oy-flow-tile oy-flow-tile--fuego" aria-hidden="true">
              <Send size={24} />
            </span>
            <div className="oy-flow-head__text">
              <span className="oy-eyebrow oy-flow-kicker">Nueva solicitud</span>
              <h2 id={titleId} className="oy-modal__title oy-display">
                {isSuccess ? '¡Solicitud enviada!' : 'Crear Petición de Servicio'}
              </h2>
              {!isSuccess && (
                <p className="oy-flow-head__sub">
                  Describe tu necesidad, adjunta evidencia fotográfica y notifica a expertos compatibles
                </p>
              )}
            </div>
          </div>
          <button type="button" className="oy-icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="oy-modal__body">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="oy-flow-form">
              <ol className="oy-flow-steps" aria-label="Pasos de la solicitud">
                <li><span className="oy-flow-num">1</span>Zona</li>
                <li><span className="oy-flow-num">2</span>Necesidad</li>
                <li><span className="oy-flow-num">3</span>Fotos</li>
                <li><span className="oy-flow-num">4</span>Presupuesto</li>
                <li><span className="oy-flow-num">5</span>Destinatarios</li>
              </ol>

              {/* OFY-21: Registrar zona donde se requiere el servicio */}
              <section className="oy-flow-section" aria-labelledby={`${uid}-s1`}>
                <h3 id={`${uid}-s1`} className="oy-flow-section__title">
                  <span className="oy-flow-num">1</span> Zona y fecha
                </h3>
                <div className="oy-flow-grid2">
                  <div className="oy-flow-field">
                    <label className="oy-flow-label" htmlFor={`${uid}-zone`}>
                      <MapPin size={14} aria-hidden="true" /> Zona de Bogotá
                    </label>
                    <select
                      id={`${uid}-zone`}
                      className="input-base"
                      value={selectedZone}
                      onChange={e => setSelectedZone(e.target.value)}
                    >
                      {BOGOTA_NEIGHBORHOODS.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                  <div className="oy-flow-field">
                    <label className="oy-flow-label" htmlFor={`${uid}-date`}>
                      <Calendar size={14} aria-hidden="true" /> Fecha esperada
                    </label>
                    <input
                      id={`${uid}-date`}
                      type="date"
                      className="input-base"
                      value={expectedDate}
                      onChange={e => setExpectedDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="oy-flow-field">
                  <label className="oy-flow-label" htmlFor={`${uid}-address`}>
                    Dirección exacta o punto de referencia
                  </label>
                  <input
                    id={`${uid}-address`}
                    type="text"
                    className="input-base"
                    value={addressDetail}
                    onChange={e => setAddressDetail(e.target.value)}
                    placeholder="Ej. Calle 93 # 13-25, Apto 402"
                    required
                  />
                </div>
              </section>

              {/* OFY-19: Descripción del trabajo */}
              <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s2`}>
                <h3 id={`${uid}-s2`} className="oy-flow-section__title">
                  <span className="oy-flow-num">2</span> ¿Qué necesitas?
                </h3>
                <div className="oy-flow-field">
                  <label className="oy-flow-label" htmlFor={`${uid}-trade`}>
                    Oficio requerido
                  </label>
                  <select
                    id={`${uid}-trade`}
                    className="input-base"
                    value={trade}
                    onChange={e => setTrade(e.target.value as TradeCategory | '')}
                  >
                    <option value="">Cualquier oficio</option>
                    {(Object.keys(TRADE_LABELS) as TradeCategory[]).map(t => (
                      <option key={t} value={t}>{TRADE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div className="oy-flow-field">
                  <label className="oy-flow-label" htmlFor={`${uid}-desc`}>
                    Descripción detallada de la necesidad
                  </label>
                  <textarea
                    id={`${uid}-desc`}
                    className="input-base"
                    rows={3}
                    placeholder="Describe qué ocurre, qué herramientas o repuestos crees que se requieren..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                  />
                </div>
              </section>

              {/* OFY-20: Adjuntar fotografía a la solicitud */}
              <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s3`}>
                <div className="oy-flow-section__head">
                  <h3 id={`${uid}-s3`} className="oy-flow-section__title">
                    <span className="oy-flow-num">3</span>
                    <Camera size={16} aria-hidden="true" /> Evidencia fotográfica del problema
                  </h3>
                  <p className="oy-flow-section__hint">{attachedPhotos.length} adjunta{attachedPhotos.length === 1 ? '' : 's'}</p>
                </div>

                <div className="oy-flow-photos">
                  {attachedPhotos.map((url, idx) => (
                    <div key={idx} className="oy-flow-photo">
                      <img src={url} alt={`Evidencia ${idx + 1}`} />
                      <button
                        type="button"
                        className="oy-flow-photo__remove"
                        onClick={() => handleRemovePhoto(idx)}
                        aria-label={`Quitar evidencia ${idx + 1}`}
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="oy-flow-photo oy-flow-photo--add"
                    onClick={() => setShowPhotoInput(!showPhotoInput)}
                    aria-expanded={showPhotoInput}
                    aria-controls={`${uid}-photo`}
                  >
                    <Plus size={18} aria-hidden="true" />
                    <span>Adjuntar otra foto</span>
                  </button>
                </div>

                {showPhotoInput && (
                  <div className="oy-flow-inline" id={`${uid}-photo`}>
                    <input
                      type="text"
                      className="input-base"
                      placeholder="URL de foto o imagen de evidencia"
                      aria-label="URL de foto o imagen de evidencia"
                      value={newPhotoUrl}
                      onChange={e => setNewPhotoUrl(e.target.value)}
                    />
                    <button type="button" onClick={handleAddPhoto} className="btn btn-secondary oy-flow-small">
                      Agregar
                    </button>
                  </div>
                )}
              </section>

              {/* Presupuesto y Urgencia */}
              <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s4`}>
                <h3 id={`${uid}-s4`} className="oy-flow-section__title">
                  <span className="oy-flow-num">4</span> Presupuesto y urgencia
                </h3>
                <div className="oy-flow-field">
                  <label className="oy-flow-label" htmlFor={`${uid}-budget`}>
                    <DollarSign size={14} aria-hidden="true" /> Presupuesto estimado (COP)
                  </label>
                  <input
                    id={`${uid}-budget`}
                    type="number"
                    inputMode="numeric"
                    className="input-base"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    required
                  />
                </div>
                <div className="oy-flow-field">
                  <span className="oy-flow-label" id={`${uid}-urgency`}>Nivel de urgencia</span>
                  <div className="oy-flow-choices oy-flow-choices--grid" role="group" aria-labelledby={`${uid}-urgency`}>
                    {URGENCY_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        className="oy-chip"
                        aria-pressed={urgency === opt.id}
                        onClick={() => setUrgency(opt.id)}
                      >
                        {opt.id === 'urgente' && <Clock size={14} aria-hidden="true" />}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* OFY-22 & OFY-24: Destinatarios y compatibilidad */}
              <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s5`}>
                <div className="oy-flow-section__head">
                  <h3 id={`${uid}-s5`} className="oy-flow-section__title">
                    <span className="oy-flow-num">5</span>
                    <Users size={16} aria-hidden="true" /> Profesionales Destinatarios
                  </h3>
                  <p className="oy-flow-section__hint" aria-live="polite">
                    {recipients} {recipients === 1 ? 'destinatario directo' : 'candidatos simultáneos'}
                  </p>
                </div>

                {selectedWorkers.length > 0 && (
                  <ul className="oy-flow-choices oy-flow-plain-list" aria-label="Destinatarios seleccionados">
                    {selectedWorkers.map(w => (
                      <li key={w.id} className="oy-flow-token">
                        <span className="oy-flow-token__label">{w.name} ({w.tradeLabel})</span>
                        <button
                          type="button"
                          className="oy-flow-token__remove"
                          onClick={() => removeWorker(w.id)}
                          aria-label={`Quitar a ${w.name}`}
                        >
                          <X size={14} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* OFY-22: Sugerencias compatibles en la zona */}
                {compatibleWorkers.length > 0 && (
                  <div className="oy-panel oy-panel--marino oy-flow-panel">
                    <p className="oy-flow-panel__title">
                      <Sparkles size={14} aria-hidden="true" /> Expertos cercanos compatibles con {trade ? `${TRADE_LABELS[trade]} en ` : ''}{selectedZone}:
                    </p>
                    <div className="oy-flow-choices">
                      {compatibleWorkers.slice(0, 4).map(w => {
                        const isAdded = selectedWorkers.some(sw => sw.id === w.id);
                        return (
                          <button
                            key={w.id}
                            type="button"
                            className="oy-chip oy-flow-chip--sm"
                            onClick={() => addWorker(w)}
                            disabled={isAdded}
                            aria-pressed={isAdded}
                          >
                            {isAdded ? '✓' : '+'} {w.name} (${w.hourlyRate.toLocaleString()}/{rateUnitShort(w.rateUnit)})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {compatibleWorkers.length === 0 && (
                  <div className="oy-flow-empty-line" role="status">
                    Ningún profesional disponible coincide con {trade ? TRADE_LABELS[trade] : 'ese oficio'} en {selectedZone}. Prueba otra zona u oficio.
                  </div>
                )}
              </section>

              {/* Aviso de expiración a los 30 min (OFY-28) */}
              <div className="oy-flow-note">
                <Clock size={16} aria-hidden="true" />
                <span>
                  <strong>Plazo de respuesta:</strong> Los trabajadores recibirán una alerta push con un plazo de 30 minutos para responder antes de que la invitación expire.
                </span>
              </div>

              <div className="oy-flow-confirm-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem', width: '100%' }}>
                <SlideConfirm
                  width={380}
                  label={recipients === 0 ? "Selecciona un destinatario" : `Desliza para enviar a ${recipients} experto${recipients === 1 ? '' : 's'}`}
                  confirmedLabel="¡Solicitud Confirmada!"
                  disabled={recipients === 0}
                  autoReset={false}
                  onConfirm={() => handleSubmit()}
                />
                <button
                  type="submit"
                  className="oy-flow-plain-submit"
                  disabled={recipients === 0}
                >
                  Enviar sin deslizar
                </button>
              </div>
            </form>
          ) : (
            <div className="oy-flow-success" role="status">
              <div className="oy-flow-success__mascot">
                <MascotAvatar forceImage="exito" size="lg" animate="bounce" />
                <span className="oy-flow-success__check" aria-hidden="true">
                  <CheckCircle2 size={24} />
                </span>
              </div>
              <h3 className="oy-flow-success__title oy-display">¡Solicitud enviada con éxito!</h3>
              <p className="oy-flow-success__text">
                Despachamos la notificación a los <strong>{createdList.length}</strong> profesionales seleccionados en Bogotá.
                Cuentan con 30 minutos para aceptar antes de expirar. Cuando uno acepte, la solicitud se cierra para los demás.
              </p>

              <button type="button" onClick={onClose} className="btn btn-primary oy-flow-cta">
                Entendido, ir a Mis Servicios
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
