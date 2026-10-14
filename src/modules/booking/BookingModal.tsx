import React, { useId, useState } from 'react';
import type { Worker, PaymentMethod, ServiceRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
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
  Sparkles
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { useFlowModal } from '../requests/useFlowModal';
import '../requests/Flows.css';

interface BookingModalProps {
  worker: Worker;
  onClose: () => void;
  onSuccess: (newService: ServiceRequest) => void;
}

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'bre_b', label: 'Bre-B 🔑', icon: <KeyRound size={18} aria-hidden="true" /> },
  { id: 'transferencia', label: 'Nequi / Davi', icon: <Smartphone size={18} aria-hidden="true" /> },
  { id: 'efectivo', label: 'Efectivo', icon: <Banknote size={18} aria-hidden="true" /> },
  { id: 'tarjeta', label: 'Tarjeta', icon: <CreditCard size={18} aria-hidden="true" /> }
];

export const BookingModal: React.FC<BookingModalProps> = ({
  worker,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const uid = useId();
  const dialogRef = useFlowModal(onClose);

  const [date, setDate] = useState('2026-10-05');
  const [time, setTime] = useState('10:00 AM');
  const [address, setAddress] = useState('Carrera 15 # 85-20, Bogotá D.C.');
  const [problemDescription, setProblemDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bre_b');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [createdService, setCreatedService] = useState<ServiceRequest | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;

    const newService: ServiceRequest = {
      id: `srv-${Date.now()}`,
      workerId: worker.id,
      workerName: worker.name,
      workerTrade: worker.tradeLabel,
      workerAvatarColor: worker.avatarColor,
      clientId: user?.id || 'usr-default',
      clientName: user?.name || 'Cliente',
      clientEmail: user?.email || 'cliente@correo.com',
      date,
      time,
      address,
      problemDescription,
      paymentMethod,
      status: 'en_curso',
      urgency: 'normal',
      budget: worker.hourlyRate * 2, // 2 horas base estimadas
      amount: worker.hourlyRate * 2,
      createdAt: new Date().toISOString()
    };

    setCreatedService(newService);
    setIsSubmitted(true);
    onSuccess(newService);
  };

  const titleId = `${uid}-title`;

  return (
    <div className="oy-modal-backdrop oy-flow-layer--base">
      <div
        ref={dialogRef}
        className="oy-modal oy-flow"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className={`oy-modal__head oy-flow-head ${isSubmitted ? 'oy-flow-head--esmeralda' : 'oy-flow-head--marino'}`}>
          <div className="oy-flow-head__main">
            <div className="oy-flow-avatar" style={{ background: worker.avatarColor }} aria-hidden="true">
              {worker.initials}
            </div>
            <div className="oy-flow-head__text">
              <span className="oy-eyebrow oy-flow-kicker">{isSubmitted ? 'Reserva lista' : 'Reservar cita'}</span>
              <h2 id={titleId} className="oy-modal__title oy-display">
                {isSubmitted ? '¡Reserva confirmada!' : `Reserva con ${worker.name}`}
              </h2>
              <p className="oy-flow-head__sub">
                {worker.tradeLabel} • ${worker.hourlyRate.toLocaleString()} COP/h
              </p>
            </div>
          </div>
          <button type="button" className="oy-icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="oy-modal__body">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="oy-flow-form">
              <ol className="oy-flow-steps" aria-label="Pasos de la reserva">
                <li><span className="oy-flow-num">1</span>Cuándo</li>
                <li><span className="oy-flow-num">2</span>Dónde y qué</li>
                <li><span className="oy-flow-num">3</span>Pago</li>
              </ol>

              <section className="oy-flow-section" aria-labelledby={`${uid}-s1`}>
                <h3 id={`${uid}-s1`} className="oy-flow-section__title">
                  <span className="oy-flow-num">1</span> Fecha y hora
                </h3>
                <div className="oy-flow-grid2">
                  <div className="oy-flow-field">
                    <label className="oy-flow-label" htmlFor={`${uid}-date`}>
                      <Calendar size={14} aria-hidden="true" /> Fecha del servicio
                    </label>
                    <input
                      id={`${uid}-date`}
                      type="date"
                      className="input-base"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="oy-flow-field">
                    <label className="oy-flow-label" htmlFor={`${uid}-time`}>
                      <Clock size={14} aria-hidden="true" /> Hora preferida
                    </label>
                    <input
                      id={`${uid}-time`}
                      type="text"
                      className="input-base"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      placeholder="Ej. 10:00 AM"
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s2`}>
                <h3 id={`${uid}-s2`} className="oy-flow-section__title">
                  <span className="oy-flow-num">2</span> Lugar y necesidad
                </h3>
                <div className="oy-flow-field">
                  <label className="oy-flow-label" htmlFor={`${uid}-address`}>
                    <MapPin size={14} aria-hidden="true" /> Dirección de atención (Bogotá D.C.)
                  </label>
                  <input
                    id={`${uid}-address`}
                    type="text"
                    className="input-base"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Calle, carrera, barrio o unidad residencial"
                    required
                  />
                </div>
                <div className="oy-flow-field">
                  <label className="oy-flow-label" htmlFor={`${uid}-desc`}>
                    <FileText size={14} aria-hidden="true" /> Descripción del problema o requerimiento
                  </label>
                  <textarea
                    id={`${uid}-desc`}
                    className="input-base"
                    rows={3}
                    value={problemDescription}
                    onChange={e => setProblemDescription(e.target.value)}
                    placeholder="Describe qué necesitas: fuga de agua, cambio de tacos eléctricos, pintura de habitación..."
                    required
                  />
                </div>
              </section>

              {/* Métodos de Pago: Efectivo, Tarjeta, Transferencia (Nequi/Daviplata), Bre-B */}
              <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s3`}>
                <div className="oy-flow-section__head">
                  <h3 id={`${uid}-s3`} className="oy-flow-section__title">
                    <span className="oy-flow-num">3</span> Método de pago preferido
                  </h3>
                  <p className="oy-flow-section__hint">Se paga contra entrega del trabajo</p>
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

              <button type="submit" className="btn btn-primary oy-flow-cta">
                Confirmar y Reservar Cita
              </button>
            </form>
          ) : (
            /* Pantalla de Confirmación con Resumen */
            <div className="oy-flow-success" role="status">
              <div className="oy-flow-success__mascot">
                <MascotAvatar size="md" />
                <span className="oy-flow-success__check" aria-hidden="true">
                  <CheckCircle2 size={24} />
                </span>
              </div>

              <h3 className="oy-flow-success__title oy-display">¡Reserva Confirmada con Éxito!</h3>
              <p className="oy-flow-success__text">
                Many le avisó a <strong>{worker.name}</strong>. Podrás ver el estado en tu pestaña de servicios.
              </p>

              <dl className="oy-flow-summary">
                <div className="oy-flow-summary__row">
                  <dt>Profesional:</dt>
                  <dd>{createdService?.workerName}</dd>
                </div>
                <div className="oy-flow-summary__row">
                  <dt>Fecha & Hora:</dt>
                  <dd>{createdService?.date} a las {createdService?.time}</dd>
                </div>
                <div className="oy-flow-summary__row">
                  <dt>Dirección:</dt>
                  <dd>{createdService?.address}</dd>
                </div>
                <div className="oy-flow-summary__row">
                  <dt>Método de Pago:</dt>
                  <dd style={{ textTransform: 'capitalize' }}>{createdService?.paymentMethod}</dd>
                </div>
                <div className="oy-flow-summary__row oy-flow-summary__row--total">
                  <dt>Presupuesto estimado:</dt>
                  <dd>${createdService?.amount.toLocaleString()} COP</dd>
                </div>
              </dl>

              <button type="button" onClick={onClose} className="btn btn-primary oy-flow-cta">
                <Sparkles size={16} aria-hidden="true" /> Entendido, ir a mis servicios
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
