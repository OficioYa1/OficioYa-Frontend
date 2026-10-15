import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Worker, PaymentMethod, ServiceRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { rateUnitShort } from '../../utils/workerProfile';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CreditCard,
  Banknote,
  Smartphone,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { useFlowModal } from '../requests/useFlowModal';
import { FlowError } from '../requests/FlowError';
import { fieldA11y, focusFirstError, MOCK_SUBMIT_MS, todayIso } from '../requests/flowValidation';
import '../requests/Flows.css';

interface BookingModalProps {
  worker: Worker;
  onClose: () => void;
  onSuccess: (newService: ServiceRequest) => void;
}

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'bre_b', label: 'Bre-B', icon: <KeyRound size={18} aria-hidden="true" /> },
  { id: 'transferencia', label: 'Nequi / Davi', icon: <Smartphone size={18} aria-hidden="true" /> },
  { id: 'efectivo', label: 'Efectivo', icon: <Banknote size={18} aria-hidden="true" /> },
  { id: 'tarjeta', label: 'Tarjeta', icon: <CreditCard size={18} aria-hidden="true" /> }
];

const MIN_DESCRIPTION = 10;

type FieldKey = 'date' | 'time' | 'address' | 'description';

const STEPS: { label: string; fields: FieldKey[] }[] = [
  { label: 'Cuándo', fields: ['date', 'time'] },
  { label: 'Dónde y qué', fields: ['address', 'description'] },
  { label: 'Pago', fields: [] }
];

export const BookingModal: React.FC<BookingModalProps> = ({
  worker,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const uid = useId();
  const dialogRef = useFlowModal(onClose);
  const timerRef = useRef<number | undefined>(undefined);

  const [date, setDate] = useState(todayIso);
  const [time, setTime] = useState('10:00');
  const [address, setAddress] = useState('Carrera 15 # 85-20, Bogotá D.C.');
  const [problemDescription, setProblemDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bre_b');
  const [attempted, setAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdService, setCreatedService] = useState<ServiceRequest | null>(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const validation = useMemo(() => {
    const e: Partial<Record<FieldKey, string>> = {};
    if (!date) e.date = 'Elige la fecha del servicio.';
    else if (date < todayIso()) e.date = 'La fecha no puede ser anterior a hoy.';
    if (!time) e.time = 'Elige una hora aproximada.';
    if (address.trim().length < 5) e.address = 'Escribe la dirección donde te atienden.';
    if (!problemDescription.trim()) e.description = 'Cuéntale al profesional qué necesitas.';
    else if (problemDescription.trim().length < MIN_DESCRIPTION) e.description = `Agrega un poco más de detalle (mínimo ${MIN_DESCRIPTION} caracteres).`;
    return e;
  }, [date, time, address, problemDescription]);

  const errors = attempted ? validation : {};
  const errorCount = Object.keys(errors).length;

  const ids: Record<FieldKey, string> = {
    date: `${uid}-date`,
    time: `${uid}-time`,
    address: `${uid}-address`,
    description: `${uid}-desc`
  };
  const errId = (key: FieldKey) => `${ids[key]}-error`;

  // 2 horas base si cobra por hora; una visita o un servicio en otras modalidades
  const estimate = (worker.rateUnit ?? 'hora') === 'hora' ? worker.hourlyRate * 2 : worker.hourlyRate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setAttempted(true);
    const invalid = (Object.keys(ids) as FieldKey[]).filter(key => validation[key]);
    if (invalid.length > 0) {
      focusFirstError(invalid.map(key => ids[key]));
      return;
    }

    const id = `srv-${Date.now()}`;
    const newService: ServiceRequest = {
      id,
      broadcastId: id,
      tradeCategory: worker.trade,
      workerId: worker.id,
      workerName: worker.name,
      workerTrade: worker.tradeLabel,
      workerAvatarColor: worker.avatarColor,
      clientId: user?.id || 'usr-default',
      clientName: user?.name || 'Cliente',
      clientEmail: user?.email || 'cliente@correo.com',
      date,
      time,
      address: address.trim(),
      problemDescription: problemDescription.trim(),
      paymentMethod,
      status: 'pendiente',
      urgency: 'normal',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      budget: estimate,
      amount: estimate,
      createdAt: new Date().toISOString()
    };

    setIsSubmitting(true);
    timerRef.current = window.setTimeout(() => {
      setIsSubmitting(false);
      setCreatedService(newService);
      onSuccess(newService);
    }, MOCK_SUBMIT_MS);
  };

  const titleId = `${uid}-title`;
  const isSubmitted = createdService !== null;
  const paymentLabel = PAYMENT_OPTIONS.find(p => p.id === createdService?.paymentMethod)?.label;
  const stepState = (fields: FieldKey[]) => {
    if (fields.some(f => errors[f])) return 'has-error';
    return fields.every(f => !validation[f]) ? 'is-done' : '';
  };

  return (
    <div className="oy-modal-backdrop oy-flow-layer--base" onMouseDown={e => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <div
        ref={dialogRef}
        className="oy-modal oy-flow"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={isSubmitting || undefined}
        tabIndex={-1}
      >
        <header className={`oy-modal__head oy-flow-head ${isSubmitted ? 'oy-flow-head--esmeralda' : 'oy-flow-head--marino'}`}>
          <div className="oy-flow-head__main">
            <div className="oy-flow-avatar" style={{ background: worker.avatarColor }} aria-hidden="true">
              {worker.photoUrl ? <img src={worker.photoUrl} alt="" /> : worker.initials}
            </div>
            <div className="oy-flow-head__text">
              <span className="oy-eyebrow oy-flow-kicker">{isSubmitted ? 'Reserva enviada' : 'Reservar cita'}</span>
              <h2 id={titleId} className="oy-modal__title">
                {isSubmitted ? '¡Reserva enviada!' : `Cita con ${worker.name}`}
              </h2>
              <p className="oy-flow-head__sub">
                {worker.tradeLabel} · ${worker.hourlyRate.toLocaleString('es-CO')} COP/{rateUnitShort(worker.rateUnit)}
              </p>
            </div>
          </div>
          <button type="button" className="oy-icon-btn" onClick={onClose} aria-label="Cerrar" disabled={isSubmitting}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="oy-modal__body">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="oy-flow-form" noValidate>
              <ol className="oy-flow-steps" aria-label="Pasos de la reserva">
                {STEPS.map((step, i) => {
                  const state = stepState(step.fields);
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

              <section className="oy-flow-section" aria-labelledby={`${uid}-s1`}>
                <h3 id={`${uid}-s1`} className="oy-flow-section__title">
                  <span className="oy-flow-num">1</span> Fecha y hora
                </h3>
                <div className="oy-flow-grid2">
                  <div className="oy-flow-field">
                    <label className="oy-flow-label" htmlFor={ids.date}>
                      <Calendar size={14} aria-hidden="true" /> Fecha del servicio
                    </label>
                    <input
                      id={ids.date}
                      type="date"
                      className="input-base"
                      min={todayIso()}
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      required
                      {...fieldA11y(errId('date'), errors.date)}
                    />
                    <FlowError id={errId('date')} message={errors.date} />
                  </div>
                  <div className="oy-flow-field">
                    <label className="oy-flow-label" htmlFor={ids.time}>
                      <Clock size={14} aria-hidden="true" /> Hora preferida
                    </label>
                    <input
                      id={ids.time}
                      type="time"
                      className="input-base"
                      step={900}
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      required
                      {...fieldA11y(errId('time'), errors.time)}
                    />
                    <FlowError id={errId('time')} message={errors.time} />
                  </div>
                </div>
              </section>

              <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s2`}>
                <h3 id={`${uid}-s2`} className="oy-flow-section__title">
                  <span className="oy-flow-num">2</span> Lugar y necesidad
                </h3>
                <div className="oy-flow-field">
                  <label className="oy-flow-label" htmlFor={ids.address}>
                    <MapPin size={14} aria-hidden="true" /> Dirección (Bogotá D.C.)
                  </label>
                  <input
                    id={ids.address}
                    type="text"
                    className="input-base"
                    autoComplete="street-address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Calle, carrera, barrio o conjunto"
                    required
                    {...fieldA11y(errId('address'), errors.address)}
                  />
                  <FlowError id={errId('address')} message={errors.address} />
                </div>
                <div className="oy-flow-field">
                  <label className="oy-flow-label" htmlFor={ids.description}>
                    <FileText size={14} aria-hidden="true" /> ¿Qué necesitas?
                  </label>
                  <textarea
                    id={ids.description}
                    className="input-base"
                    rows={3}
                    value={problemDescription}
                    onChange={e => setProblemDescription(e.target.value)}
                    placeholder="Ej. fuga bajo el lavaplatos, cambio de tacos, pintar una habitación…"
                    required
                    {...fieldA11y(errId('description'), errors.description)}
                  />
                  <FlowError id={errId('description')} message={errors.description} />
                </div>
              </section>

              {/* Medios de pago: efectivo, tarjeta, transferencia (Nequi/Daviplata) y Bre-B */}
              <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s3`}>
                <div className="oy-flow-section__head">
                  <h3 id={`${uid}-s3`} className="oy-flow-section__title">
                    <span className="oy-flow-num">3</span> Medio de pago
                  </h3>
                  <p className="oy-flow-section__hint">Pagas al recibir el trabajo</p>
                </div>
                <div className="oy-flow-choices oy-flow-choices--grid" role="group" aria-labelledby={`${uid}-s3`}>
                  {PAYMENT_OPTIONS.map(method => (
                    <button
                      key={method.id}
                      type="button"
                      className="oy-chip oy-flow-chip--stack"
                      aria-pressed={paymentMethod === method.id}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      {method.icon}
                      <span>{method.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="oy-flow-footer">
                {errorCount > 0 && (
                  <div className="oy-flow-alert" role="alert">
                    <AlertCircle size={18} aria-hidden="true" />
                    <p>
                      {errorCount === 1 ? 'Falta un dato' : `Faltan ${errorCount} datos`} para reservar. Revisa los campos marcados.
                    </p>
                  </div>
                )}
                <button type="submit" className="btn btn-primary oy-flow-cta" aria-busy={isSubmitting || undefined}>
                  {isSubmitting ? (
                    <>
                      <span className="oy-flow-spinner" aria-hidden="true" /> Reservando…
                    </>
                  ) : (
                    <>Confirmar reserva · ${estimate.toLocaleString('es-CO')} aprox.</>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="oy-flow-success" role="status">
              <div className="oy-flow-success__mascot">
                <MascotAvatar trade={worker.trade} size="lg" />
                <span className="oy-flow-success__check" aria-hidden="true">
                  <CheckCircle2 size={24} />
                </span>
              </div>

              <h3 className="oy-flow-success__title">Many le avisó a {worker.name.split(' ')[0]}</h3>
              <p className="oy-flow-success__text">
                Tiene 30 minutos para aceptar tu cita; verás el estado en Mis servicios.
              </p>

              <dl className="oy-flow-summary">
                <div className="oy-flow-summary__row">
                  <dt>Profesional</dt>
                  <dd>{createdService.workerName}</dd>
                </div>
                <div className="oy-flow-summary__row">
                  <dt>Fecha y hora</dt>
                  <dd>{createdService.date} · {createdService.time}</dd>
                </div>
                <div className="oy-flow-summary__row">
                  <dt>Dirección</dt>
                  <dd>{createdService.address}</dd>
                </div>
                <div className="oy-flow-summary__row">
                  <dt>Pago</dt>
                  <dd>{paymentLabel}</dd>
                </div>
                <div className="oy-flow-summary__row oy-flow-summary__row--total">
                  <dt>Presupuesto estimado</dt>
                  <dd>${createdService.amount.toLocaleString('es-CO')} COP</dd>
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
