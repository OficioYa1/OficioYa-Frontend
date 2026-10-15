import React, { useState } from 'react';
import type { Worker, ServiceRequest, PaymentMethod, UrgencyLevel } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { rateUnitShort } from '../../utils/workerProfile';
import {
  Send,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Banknote,
  Smartphone,
  KeyRound,
  X,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock
} from 'lucide-react';
import './WorkerInlineHireFlow.css';

export interface WorkerInlineHireFlowProps {
  worker: Worker;
  mode: 'peticion' | 'contratar';
  onModeChange: (mode: 'peticion' | 'contratar') => void;
  onClose: () => void;
  onSubmit: (newService: ServiceRequest, summaryMessage: string) => void;
}

const BOGOTA_ZONES = [
  'Chapinero / Chicó',
  'Usaquén / Santa Bárbara',
  'Cedritos',
  'Suba / Niza',
  'Teusaquillo / Galerías',
  'La Candelaria / Centro',
  'Ciudad Salitre / Modelia',
  'Colina Campestre',
  'Fontibón',
  'Engativá',
  'Kennedy / Castilla'
];

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'bre_b', label: 'Bre-B 🔑', icon: <KeyRound size={16} aria-hidden="true" /> },
  { id: 'transferencia', label: 'Nequi / Davi', icon: <Smartphone size={16} aria-hidden="true" /> },
  { id: 'efectivo', label: 'Efectivo', icon: <Banknote size={16} aria-hidden="true" /> },
  { id: 'tarjeta', label: 'Tarjeta', icon: <CreditCard size={16} aria-hidden="true" /> }
];

const TODAY_STR = new Date().toISOString().split('T')[0];

export const WorkerInlineHireFlow: React.FC<WorkerInlineHireFlowProps> = ({
  worker,
  mode,
  onModeChange: _onModeChange,
  onClose,
  onSubmit
}) => {
  const { user } = useAuth();

  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => TODAY_STR);
  const [timeSlot, setTimeSlot] = useState('08:00 AM - 12:00 PM (Mañana)');
  const [urgency, setUrgency] = useState<UrgencyLevel>('urgente');
  const [selectedZone, setSelectedZone] = useState(() => {
    return BOGOTA_ZONES.find(z => z.toLowerCase().includes(worker.location.zoneName.toLowerCase())) || worker.location.zoneName;
  });
  const [addressDetail, setAddressDetail] = useState('Carrera 15 # 85-20');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bre_b');

  // Tarifa calculada si es contratación directa (2h estimadas) o presupuesto libre si es petición
  const unit = rateUnitShort(worker.rateUnit);
  const baseRate = worker.hourlyRate;
  const directEstimate = (worker.rateUnit ?? 'hora') === 'hora' ? baseRate * 2 : baseRate;
  const [customBudget, setCustomBudget] = useState(() => String(directEstimate || 80000));
  const [hasError, setHasError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setHasError(true);
      return;
    }

    const id = `srv-${Date.now()}-${worker.id}`;
    const broadcastId = `bc-${Date.now()}`;
    const finalAmount = mode === 'contratar' ? directEstimate : (parseInt(customBudget, 10) || directEstimate);
    const timeLabel = mode === 'contratar' ? timeSlot : urgency === 'urgente' ? 'Urgente (Hoy mismo / < 30 min)' : 'Normal (Esta semana)';
    const fullAddress = `${addressDetail}, ${selectedZone}, Bogotá D.C.`;

    const newService: ServiceRequest = {
      id,
      broadcastId,
      tradeCategory: worker.trade,
      workerId: worker.id,
      workerName: worker.name,
      workerTrade: worker.tradeLabel,
      workerAvatarColor: worker.avatarColor,
      clientId: user?.id || 'usr-default',
      clientName: user?.name || 'Cliente',
      clientEmail: user?.email || 'cliente@correo.com',
      date,
      time: timeLabel,
      address: fullAddress,
      coverageZone: selectedZone,
      problemDescription: description,
      paymentMethod,
      status: 'pendiente',
      urgency,
      budget: finalAmount,
      amount: finalAmount,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };

    const paymentLabel = PAYMENT_OPTIONS.find(p => p.id === paymentMethod)?.label || paymentMethod;

    // Resumen estructurado para el chat
    const summaryMessage = [
      `📋 *Petición de Servicio enviada a ${worker.name}*`,
      `• *Oficio:* ${worker.tradeLabel}`,
      `• *Modalidad:* ${mode === 'contratar' ? 'Contratación Directa' : 'Petición de Servicio'}`,
      `• *Detalle:* ${description.trim()}`,
      `• *Fecha y Horario:* ${date} (${timeLabel})`,
      `• *Ubicación:* ${fullAddress}`,
      `• *Valor estimado:* $${finalAmount.toLocaleString()} COP`,
      `• *Método de pago propuesto:* ${paymentLabel}`
    ].join('\n');

    onSubmit(newService, summaryMessage);
  };

  return (
    <section className="wk-inline-flow" id="worker-inline-flow" aria-labelledby="wk-inline-flow-title">
      {/* Cabecera */}
      <header className="wk-inline-flow__head">
        <div className="wk-inline-flow__head-left">
          <div className={`wk-inline-flow__icon-tile ${mode === 'contratar' ? 'wk-inline-flow__icon-tile--booking' : ''}`}>
            {mode === 'contratar' ? <Calendar size={26} aria-hidden="true" /> : <Send size={24} aria-hidden="true" />}
          </div>
          <div className="wk-inline-flow__head-titles">
            <span className="oy-eyebrow">
              {mode === 'contratar' ? 'Contratación Directa' : 'Nueva Petición de Servicio'}
            </span>
            <h3 id="wk-inline-flow-title" className="wk-inline-flow__title">
              {mode === 'contratar' ? `Contratar a ${worker.name}` : `Enviar Petición a ${worker.name}`}
            </h3>
            <p className="wk-inline-flow__sub">
              {mode === 'contratar'
                ? `Agenda tu servicio con ${worker.name}. Al confirmar, enviaremos este resumen al chat para coordinar la llegada.`
                : `Describe tu necesidad y propuesta. Se enviará de inmediato al chat con ${worker.name} para empezar a coordinar.`}
            </p>
          </div>
        </div>

        <div className="wk-inline-flow__head-actions">
          {/* Indicador de Flujo */}
          <div className="wk-inline-flow__mode-toggle" role="group" aria-label="Modo de solicitud">
            <button
              type="button"
              className="wk-inline-flow__mode-btn is-active"
              disabled
            >
              <Send size={14} aria-hidden="true" /> Petición de Servicio
            </button>
            <span
              className="wk-inline-flow__mode-btn"
              style={{ cursor: 'not-allowed', opacity: 0.65, gap: '5px' }}
              title="El profesional debe aceptar la petición para hacer la reserva"
            >
              <Lock size={13} aria-hidden="true" style={{ color: 'var(--brand-amber, #E58F49)' }} /> Reserva Bloqueada
            </span>
          </div>

          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="wk-inline-flow__close-btn"
            aria-label="Cerrar formulario inline"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="wk-inline-flow__body">
        {/* Descripción del problema */}
        <div className="wk-inline-flow__field">
          <label htmlFor="flow-problem-desc" className="wk-inline-flow__label">
            <Sparkles size={16} aria-hidden="true" />
            ¿Qué necesitas solucionar o realizar? <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            id="flow-problem-desc"
            className="wk-inline-flow__textarea"
            placeholder={`Explica con detalle el trabajo requerido (ej. cambio de breakers, instalación de toma trifásico, revisión de caja eléctrica en ${worker.location.zoneName})...`}
            value={description}
            onChange={e => {
              setDescription(e.target.value);
              if (hasError && e.target.value.trim()) setHasError(false);
            }}
            required
            rows={3}
          />
          {hasError && (
            <span style={{ color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <AlertCircle size={14} /> Por favor describe el trabajo que necesitas antes de continuar.
            </span>
          )}
        </div>

        {/* Fecha y Franja / Urgencia */}
        <div className="wk-inline-flow__grid-2">
          <div className="wk-inline-flow__field">
            <label htmlFor="flow-date" className="wk-inline-flow__label">
              <Calendar size={16} aria-hidden="true" /> Fecha sugerida
            </label>
            <input
              type="date"
              id="flow-date"
              className="wk-inline-flow__input"
              value={date}
              min={TODAY_STR}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {mode === 'contratar' ? (
            <div className="wk-inline-flow__field">
              <label htmlFor="flow-timeslot" className="wk-inline-flow__label">
                <Clock size={16} aria-hidden="true" /> Franja Horaria
              </label>
              <select
                id="flow-timeslot"
                className="wk-inline-flow__select"
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
              >
                <option value="08:00 AM - 12:00 PM (Mañana)">Mañana: 08:00 AM a 12:00 PM</option>
                <option value="02:00 PM - 06:00 PM (Tarde)">Tarde: 02:00 PM a 06:00 PM</option>
                <option value="06:00 PM - 09:00 PM (Noche)">Noche: 06:00 PM a 09:00 PM</option>
                <option value="Inmediato (< 30 min)">Inmediato (&lt; 30 min)</option>
              </select>
            </div>
          ) : (
            <div className="wk-inline-flow__field">
              <label htmlFor="flow-urgency" className="wk-inline-flow__label">
                <Clock size={16} aria-hidden="true" /> Nivel de Urgencia
              </label>
              <select
                id="flow-urgency"
                className="wk-inline-flow__select"
                value={urgency}
                onChange={e => setUrgency(e.target.value as UrgencyLevel)}
              >
                <option value="urgente">Urgente (Hoy mismo / &lt; 30 min)</option>
                <option value="normal">Normal (Esta semana)</option>
              </select>
            </div>
          )}
        </div>

        {/* Zona y Dirección */}
        <div className="wk-inline-flow__grid-2">
          <div className="wk-inline-flow__field">
            <label htmlFor="flow-zone" className="wk-inline-flow__label">
              <MapPin size={16} aria-hidden="true" /> Zona o Localidad en Bogotá
            </label>
            <select
              id="flow-zone"
              className="wk-inline-flow__select"
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
            >
              {BOGOTA_ZONES.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <div className="wk-inline-flow__field">
            <label htmlFor="flow-address" className="wk-inline-flow__label">
              <MapPin size={16} aria-hidden="true" /> Dirección exacta / Punto de referencia
            </label>
            <input
              type="text"
              id="flow-address"
              className="wk-inline-flow__input"
              placeholder="Ej. Carrera 15 # 85-20, Apto 302"
              value={addressDetail}
              onChange={e => setAddressDetail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Tarifa / Presupuesto */}
        {mode === 'contratar' ? (
          <div className="wk-inline-flow__rate-card">
            <div className="wk-inline-flow__rate-title">
              <strong>Tarifa de referencia de {worker.name}</strong>
              <span>
                ${baseRate.toLocaleString()} COP / {unit} · Estimado de 2 horas base para diagnóstico y mano de obra
              </span>
            </div>
            <div className="wk-inline-flow__rate-val">
              ${directEstimate.toLocaleString()} COP
            </div>
          </div>
        ) : (
          <div className="wk-inline-flow__field">
            <label htmlFor="flow-budget" className="wk-inline-flow__label">
              <CreditCard size={16} aria-hidden="true" /> Presupuesto estimado ofrecido (COP)
            </label>
            <input
              type="number"
              id="flow-budget"
              className="wk-inline-flow__input"
              step="5000"
              min="20000"
              value={customBudget}
              onChange={e => setCustomBudget(e.target.value)}
            />
          </div>
        )}

        {/* Método de pago */}
        <div className="wk-inline-flow__field">
          <span className="wk-inline-flow__label">
            <CreditCard size={16} aria-hidden="true" /> Método de pago acordado
          </span>
          <div className="wk-inline-flow__payment-chips" role="radiogroup" aria-label="Método de pago">
            {PAYMENT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={paymentMethod === opt.id}
                className={`wk-inline-flow__pay-chip ${paymentMethod === opt.id ? 'is-selected' : ''}`}
                onClick={() => setPaymentMethod(opt.id)}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mensaje explicativo del flujo de chat automático */}
        <div className="wk-inline-flow__chat-hint" role="status">
          <MessageSquare size={20} aria-hidden="true" />
          <span>
            <strong>Flujo transparente:</strong> Al enviar, se registrará tu solicitud y se trasladará este resumen directamente al chat con <strong>{worker.name}</strong> para que inicien la conversación de inmediato.
          </span>
        </div>

        {/* Botones de acción del footer */}
        <div className="wk-inline-flow__footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary wk-inline-flow__btn-cancel"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="btn btn-primary wk-inline-flow__btn-submit"
          >
            {mode === 'contratar' ? (
              <>
                <CheckCircle2 size={18} aria-hidden="true" />
                Confirmar Contratación y Abrir Chat
              </>
            ) : (
              <>
                <Send size={18} aria-hidden="true" />
                Enviar Petición y Abrir Chat
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
