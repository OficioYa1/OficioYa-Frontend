import React, { useState } from 'react';
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

interface BookingModalProps {
  worker: Worker;
  onClose: () => void;
  onSuccess: (newService: ServiceRequest) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  worker,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();

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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1050,
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
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          borderRadius: '24px',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '18px', right: '18px', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        {!isSubmitted ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: worker.avatarColor,
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}
              >
                {worker.initials}
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>Reserva con {worker.name}</h3>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {worker.tradeLabel} • ${worker.hourlyRate.toLocaleString()} COP/h
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    <Calendar size={14} /> Fecha del servicio
                  </label>
                  <input
                    type="date"
                    className="input-base"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    <Clock size={14} /> Hora preferida
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    placeholder="Ej. 10:00 AM"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <MapPin size={14} /> Dirección de atención (Bogotá D.C.)
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Calle, carrera, barrio o unidad residencial"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <FileText size={14} /> Descripción del problema o requerimiento
                </label>
                <textarea
                  className="input-base"
                  rows={3}
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  placeholder="Describe qué necesitas: fuga de agua, cambio de tacos eléctricos, pintura de habitación..."
                  required
                />
              </div>

              {/* Métodos de Pago: Efectivo, Tarjeta, Transferencia (Nequi/Daviplata), Bre-B 🔑 */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Método de pago preferido (Se paga contra entrega del trabajo)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                  {[
                    { id: 'bre_b', label: 'Bre-B 🔑', icon: <KeyRound size={16} /> },
                    { id: 'transferencia', label: 'Nequi / Davi', icon: <Smartphone size={16} /> },
                    { id: 'efectivo', label: 'Efectivo', icon: <Banknote size={16} /> },
                    { id: 'tarjeta', label: 'Tarjeta', icon: <CreditCard size={16} /> }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '12px',
                        border: paymentMethod === method.id ? '2px solid var(--role-primary)' : '1px solid var(--color-border)',
                        background: paymentMethod === method.id ? 'var(--role-primary-light)' : 'var(--color-surface)',
                        color: paymentMethod === method.id ? 'var(--role-primary)' : 'var(--color-text-main)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                    >
                      {method.icon}
                      <span>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón de Confirmación */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '14px', fontSize: '15px', borderRadius: '14px', marginTop: '8px' }}
              >
                Confirmar y Reservar Cita
              </button>
            </form>
          </div>
        ) : (
          /* Pantalla de Confirmación con Resumen */
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ margin: '0 auto 16px', display: 'inline-block' }}>
              <MascotAvatar size="md" />
            </div>

            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <CheckCircle2 size={28} />
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>¡Reserva Confirmada con Éxito!</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Basty ha notificado a <strong>{worker.name}</strong>. Podrás ver el estado en tu pestaña de servicios.
            </p>

            <div
              style={{
                background: 'var(--color-surface-hover)',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Profesional:</span>
                <span style={{ fontWeight: 700 }}>{createdService?.workerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Fecha & Hora:</span>
                <span style={{ fontWeight: 700 }}>{createdService?.date} a las {createdService?.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Dirección:</span>
                <span style={{ fontWeight: 700 }}>{createdService?.address}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Método de Pago:</span>
                <span style={{ fontWeight: 800, textTransform: 'capitalize' }}>{createdService?.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Presupuesto estimado:</span>
                <span style={{ fontWeight: 800, color: 'var(--color-success)' }}>${createdService?.amount.toLocaleString()} COP</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <Sparkles size={16} /> Entendido, ir a mis servicios
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
