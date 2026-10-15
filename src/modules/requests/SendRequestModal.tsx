import React, { useState, useMemo, useId, useEffect, useRef } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { useFlowModal } from './useFlowModal';
import { readRequestDraft, clearRequestDraft } from './requestDraft';
import { FlowError } from './FlowError';
import { fieldA11y, focusFirstError, MOCK_SUBMIT_MS, todayIso } from './flowValidation';
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
  { id: 'urgente', label: 'Urgente (hoy mismo)' },
  { id: 'normal', label: 'Normal (esta semana)' }
];

const MIN_DESCRIPTION = 10;
const MIN_BUDGET = 10000;

type FieldKey = 'date' | 'address' | 'description' | 'budget' | 'recipients';

const STEPS: { label: string; fields: FieldKey[] }[] = [
  { label: 'Zona', fields: ['date', 'address'] },
  { label: 'Necesidad', fields: ['description'] },
  { label: 'Fotos', fields: [] },
  { label: 'Presupuesto', fields: ['budget'] },
  { label: 'Destinatarios', fields: ['recipients'] }
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
  const timerRef = useRef<number | undefined>(undefined);

  const [description, setDescription] = useState(readRequestDraft);
  // OFY-22: oficio requerido ('' = cualquiera)
  const [trade, setTrade] = useState<TradeCategory | ''>(initialWorker?.trade ?? '');
  const [expectedDate, setExpectedDate] = useState(todayIso);
  const [selectedZone, setSelectedZone] = useState('Chapinero / Chicó');
  const [addressDetail, setAddressDetail] = useState('Carrera 15 # 85-20');
  const [urgency, setUrgency] = useState<UrgencyLevel>('urgente');
  const [budget, setBudget] = useState('80000');
  const [paymentMethod] = useState<PaymentMethod>('bre_b');
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop'
  ]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);

  // Destinatarios: uno (OFY-23) o varios en simultáneo (OFY-24)
  const [selectedWorkers, setSelectedWorkers] = useState<Worker[]>(() => (initialWorker ? [initialWorker] : []));
  const [attempted, setAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdList, setCreatedList] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    clearRequestDraft();
    return () => window.clearTimeout(timerRef.current);
  }, []);

  // OFY-22: trabajadores disponibles compatibles con el oficio y la zona
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

  const validation = useMemo(() => {
    const e: Partial<Record<FieldKey, string>> = {};
    if (!expectedDate) e.date = 'Elige la fecha en que necesitas el servicio.';
    else if (expectedDate < todayIso()) e.date = 'La fecha no puede ser anterior a hoy.';
    if (addressDetail.trim().length < 5) e.address = 'Escribe la dirección o un punto de referencia.';
    if (!description.trim()) e.description = 'Cuéntanos qué necesitas solucionar.';
    else if (description.trim().length < MIN_DESCRIPTION) e.description = `Agrega un poco más de detalle (mínimo ${MIN_DESCRIPTION} caracteres).`;
    const budgetValue = Number(budget);
    if (!budget || Number.isNaN(budgetValue)) e.budget = 'Indica un presupuesto aproximado en pesos.';
    else if (budgetValue < MIN_BUDGET) e.budget = `El presupuesto mínimo es $${MIN_BUDGET.toLocaleString('es-CO')} COP.`;
    if (selectedWorkers.length === 0) e.recipients = 'Elige al menos un profesional para enviarle la solicitud.';
    return e;
  }, [expectedDate, addressDetail, description, budget, selectedWorkers.length]);

  const errors = attempted ? validation : {};
  const errorCount = Object.keys(errors).length;

  const addWorker = (worker: Worker) => {
    if (!selectedWorkers.some(sw => sw.id === worker.id)) {
      setSelectedWorkers(prev => [...prev, worker]);
    }
  };

  const removeWorker = (id: string) => {
    setSelectedWorkers(prev => prev.filter(w => w.id !== id));
  };

  const handleAddPhoto = () => {
    const url = newPhotoUrl.trim();
    if (!/^https?:\/\/\S+$/i.test(url)) {
      setPhotoError('Pega un enlace que empiece por http:// o https://');
      return;
    }
    setAttachedPhotos(prev => [...prev, url]);
    setNewPhotoUrl('');
    setPhotoError('');
    setShowPhotoInput(false);
  };

  const handleRemovePhoto = (index: number) => {
    setAttachedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const ids: Record<FieldKey, string> = {
    date: `${uid}-date`,
    address: `${uid}-address`,
    description: `${uid}-desc`,
    budget: `${uid}-budget`,
    recipients: `${uid}-recipients`
  };
  const errId = (key: FieldKey) => `${ids[key]}-error`;

  // OFY-24: envío simultáneo a varios trabajadores con plazo de 30 minutos (OFY-28)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setAttempted(true);
    const invalid = (Object.keys(ids) as FieldKey[]).filter(key => validation[key]);
    if (invalid.length > 0) {
      focusFirstError(invalid.map(key => ids[key]));
      return;
    }

    const expirationDate = new Date(Date.now() + 30 * 60 * 1000).toISOString();
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
      problemDescription: description.trim(),
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

    setIsSubmitting(true);
    timerRef.current = window.setTimeout(() => {
      setCreatedList(newRequests);
      setIsSubmitting(false);
      setIsSuccess(true);
      onSubmitRequests(newRequests);
    }, MOCK_SUBMIT_MS);
  };

  const titleId = `${uid}-title`;
  const recipients = selectedWorkers.length;
  const stepState = (fields: FieldKey[], index: number) => {
    if (fields.some(f => errors[f])) return 'has-error';
    if (index === 2) return attachedPhotos.length > 0 ? 'is-done' : '';
    return fields.every(f => !validation[f]) ? 'is-done' : '';
  };

  return (
    <div className="oy-modal-backdrop oy-flow-layer--base" onMouseDown={e => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <div
        ref={dialogRef}
        className="oy-modal oy-flow oy-flow--md"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={isSubmitting || undefined}
        tabIndex={-1}
      >
        <header className={`oy-modal__head oy-flow-head ${isSuccess ? 'oy-flow-head--esmeralda' : 'oy-flow-head--marino'}`}>
          <div className="oy-flow-head__main">
            <span className={`oy-flow-tile ${isSuccess ? 'oy-flow-tile--esmeralda' : 'oy-flow-tile--marino'}`} aria-hidden="true">
              {isSuccess ? <CheckCircle2 size={24} /> : <Send size={22} />}
            </span>
            <div className="oy-flow-head__text">
              <span className="oy-eyebrow oy-flow-kicker">{isSuccess ? 'Solicitud enviada' : 'Nueva solicitud'}</span>
              <h2 id={titleId} className="oy-modal__title">
                {isSuccess ? '¡Listo! Ya les avisamos' : 'Pide tu servicio'}
              </h2>
              {!isSuccess && (
                <p className="oy-flow-head__sub">
                  Cinco pasos cortos: dónde, qué, fotos, presupuesto y a quién enviarla.
                </p>
              )}
            </div>
          </div>
          <button type="button" className="oy-icon-btn" onClick={onClose} aria-label="Cerrar" disabled={isSubmitting}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="oy-modal__body">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="oy-flow-form" noValidate>
              <ol className="oy-flow-steps" aria-label="Pasos de la solicitud">
                {STEPS.map((step, i) => {
                  const state = stepState(step.fields, i);
                  return (
                    <li key={step.label} className={state}>
                      <span className="oy-flow-num" aria-hidden="true">
                        {state === 'is-done' ? <CheckCircle2 size={13} /> : i + 1}
                      </span>
                      {step.label}
                      {state === 'is-done' && <span className="oy-flow-sr"> (completo)</span>}
                      {state === 'has-error' && <span className="oy-flow-sr"> (revisar)</span>}
                    </li>
                  );
                })}
              </ol>

              {/* OFY-21: zona donde se requiere el servicio */}
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
                    <label className="oy-flow-label" htmlFor={ids.date}>
                      <Calendar size={14} aria-hidden="true" /> Fecha esperada
                    </label>
                    <input
                      id={ids.date}
                      type="date"
                      className="input-base"
                      min={todayIso()}
                      value={expectedDate}
                      onChange={e => setExpectedDate(e.target.value)}
                      required
                      {...fieldA11y(errId('date'), errors.date)}
                    />
                    <FlowError id={errId('date')} message={errors.date} />
                  </div>
                </div>
                <div className="oy-flow-field">
                  <label className="oy-flow-label" htmlFor={ids.address}>
                    Dirección o punto de referencia
                  </label>
                  <input
                    id={ids.address}
                    type="text"
                    className="input-base"
                    autoComplete="street-address"
                    value={addressDetail}
                    onChange={e => setAddressDetail(e.target.value)}
                    placeholder="Ej. Calle 93 # 13-25, Apto 402"
                    required
                    {...fieldA11y(errId('address'), errors.address)}
                  />
                  <FlowError id={errId('address')} message={errors.address} />
                </div>
              </section>

              {/* OFY-19: descripción del trabajo */}
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
                  <label className="oy-flow-label" htmlFor={ids.description}>
                    Describe el problema
                  </label>
                  <textarea
                    id={ids.description}
                    className="input-base"
                    rows={3}
                    placeholder="Qué ocurre, desde cuándo y qué repuestos crees que se necesitan…"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    {...fieldA11y(errId('description'), errors.description, `${uid}-desc-hint`)}
                  />
                  <FlowError id={errId('description')} message={errors.description} />
                  {!errors.description && (
                    <p id={`${uid}-desc-hint`} className="oy-flow-hint">
                      Entre más detalle, mejores respuestas recibes.
                    </p>
                  )}
                </div>
              </section>

              {/* OFY-20: fotografías de evidencia */}
              <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s3`}>
                <div className="oy-flow-section__head">
                  <h3 id={`${uid}-s3`} className="oy-flow-section__title">
                    <span className="oy-flow-num">3</span>
                    <Camera size={16} aria-hidden="true" /> Fotos del problema
                  </h3>
                  <p className="oy-flow-section__hint">Opcional · {attachedPhotos.length} adjunta{attachedPhotos.length === 1 ? '' : 's'}</p>
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
                    <span>Agregar foto</span>
                  </button>
                </div>

                {showPhotoInput && (
                  <div className="oy-flow-field" id={`${uid}-photo`}>
                    <label className="oy-flow-label" htmlFor={`${uid}-photo-url`}>Enlace de la foto</label>
                    <div className="oy-flow-inline">
                      <input
                        id={`${uid}-photo-url`}
                        type="url"
                        className="input-base"
                        placeholder="https://…"
                        value={newPhotoUrl}
                        onChange={e => {
                          setNewPhotoUrl(e.target.value);
                          setPhotoError('');
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPhoto();
                          }
                        }}
                        {...fieldA11y(`${uid}-photo-error`, photoError)}
                      />
                      <button type="button" onClick={handleAddPhoto} className="btn btn-secondary oy-flow-small">
                        Agregar
                      </button>
                    </div>
                    <FlowError id={`${uid}-photo-error`} message={photoError} />
                  </div>
                )}
              </section>

              {/* Presupuesto y urgencia */}
              <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s4`}>
                <h3 id={`${uid}-s4`} className="oy-flow-section__title">
                  <span className="oy-flow-num">4</span> Presupuesto y urgencia
                </h3>
                <div className="oy-flow-field">
                  <label className="oy-flow-label" htmlFor={ids.budget}>
                    <DollarSign size={14} aria-hidden="true" /> Presupuesto estimado (COP)
                  </label>
                  <input
                    id={ids.budget}
                    type="number"
                    inputMode="numeric"
                    min={MIN_BUDGET}
                    step={5000}
                    className="input-base"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    required
                    {...fieldA11y(errId('budget'), errors.budget)}
                  />
                  <FlowError id={errId('budget')} message={errors.budget} />
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

              {/* OFY-22 y OFY-24: destinatarios */}
              <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s5`}>
                <div className="oy-flow-section__head">
                  <h3 id={`${uid}-s5`} className="oy-flow-section__title">
                    <span className="oy-flow-num">5</span>
                    <Users size={16} aria-hidden="true" /> ¿A quién se la enviamos?
                  </h3>
                  <p className="oy-flow-section__hint" aria-live="polite">
                    {recipients === 0 ? 'Ninguno elegido' : `${recipients} ${recipients === 1 ? 'profesional' : 'profesionales'}`}
                  </p>
                </div>

                <div id={ids.recipients} tabIndex={-1} className="oy-flow-field" aria-describedby={errors.recipients ? errId('recipients') : undefined}>
                  {selectedWorkers.length > 0 && (
                    <ul className="oy-flow-choices oy-flow-plain-list" aria-label="Destinatarios elegidos">
                      {selectedWorkers.map(w => (
                        <li key={w.id} className="oy-flow-token">
                          <span className="oy-flow-token__label">{w.name} · {w.tradeLabel}</span>
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

                  {compatibleWorkers.length > 0 ? (
                    <div className="oy-panel oy-flow-panel">
                      <p className="oy-flow-panel__title">
                        <Sparkles size={14} aria-hidden="true" /> Disponibles en {trade ? `${TRADE_LABELS[trade]} · ` : ''}{selectedZone}
                      </p>
                      <div className="oy-flow-choices">
                        {compatibleWorkers.slice(0, 4).map(w => {
                          const isAdded = selectedWorkers.some(sw => sw.id === w.id);
                          return (
                            <button
                              key={w.id}
                              type="button"
                              className="oy-chip oy-flow-chip--sm"
                              onClick={() => (isAdded ? removeWorker(w.id) : addWorker(w))}
                              aria-pressed={isAdded}
                            >
                              {isAdded ? <CheckCircle2 size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
                              {w.name} · ${w.hourlyRate.toLocaleString('es-CO')}/{rateUnitShort(w.rateUnit)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="oy-flow-empty-line" role="status">
                      Nadie disponible en {trade ? TRADE_LABELS[trade] : 'ese oficio'} cerca de {selectedZone}. Prueba otra zona u oficio.
                    </div>
                  )}
                  <FlowError id={errId('recipients')} message={errors.recipients} />
                </div>
              </section>

              {/* Plazo de 30 minutos (OFY-28) */}
              <div className="oy-flow-note">
                <Clock size={16} aria-hidden="true" />
                <span>
                  <strong>Plazo de respuesta:</strong> cada profesional tiene 30 minutos para aceptar antes de que la invitación expire.
                </span>
              </div>

              <div className="oy-flow-footer">
                {errorCount > 0 && (
                  <div className="oy-flow-alert" role="alert">
                    <AlertCircle size={18} aria-hidden="true" />
                    <p>
                      {errorCount === 1 ? 'Falta un dato' : `Faltan ${errorCount} datos`} para enviar la solicitud. Revisa los campos marcados.
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-primary oy-flow-cta"
                  aria-busy={isSubmitting || undefined}
                >
                  {isSubmitting ? (
                    <>
                      <span className="oy-flow-spinner" aria-hidden="true" /> Enviando solicitud…
                    </>
                  ) : (
                    <>
                      <Send size={16} aria-hidden="true" />
                      {recipients > 1 ? `Enviar a ${recipients} profesionales` : 'Enviar solicitud'}
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="oy-flow-success" role="status">
              <div className="oy-flow-success__mascot">
                <MascotAvatar trade={trade || selectedWorkers[0]?.trade} size="lg" />
                <span className="oy-flow-success__check" aria-hidden="true">
                  <CheckCircle2 size={24} />
                </span>
              </div>
              <h3 className="oy-flow-success__title">Many ya le avisó a {createdList.length === 1 ? createdList[0].workerName : `${createdList.length} profesionales`}</h3>
              <p className="oy-flow-success__text">
                Tienen 30 minutos para aceptar. Cuando uno acepte, la solicitud se cierra para los demás y te avisamos al instante.
              </p>

              <dl className="oy-flow-summary">
                <div className="oy-flow-summary__row">
                  <dt>Fecha</dt>
                  <dd>{expectedDate} · {urgency === 'urgente' ? 'Urgente' : 'Esta semana'}</dd>
                </div>
                <div className="oy-flow-summary__row">
                  <dt>Dirección</dt>
                  <dd>{addressDetail}, {selectedZone}</dd>
                </div>
                <div className="oy-flow-summary__row oy-flow-summary__row--total">
                  <dt>Presupuesto</dt>
                  <dd>${(parseInt(budget) || 0).toLocaleString('es-CO')} COP</dd>
                </div>
              </dl>

              <button type="button" onClick={onClose} className="btn btn-primary oy-flow-cta">
                Entendido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
