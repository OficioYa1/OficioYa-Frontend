import React, { useState } from 'react';
import { X, Send, CheckCircle2, MessageSquare, AlertCircle, Phone, Mail, User } from 'lucide-react';
import { MascotAvatar } from '../mascot/MascotAvatar';
import './ContactModal.css';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    subject: 'Consulta general de servicio',
    message: ''
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  // Validación en tiempo real (Item 13: VALIDACIÓN)
  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 3) {
      errs.name = 'Ingresa tu nombre completo (mínimo 3 letras).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      errs.email = 'Ingresa un correo electrónico válido (ej. usuario@correo.com).';
    }

    const cleanPhone = form.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Ingresa un número de celular de 10 dígitos (ej. 3162209184).';
    }

    if (!form.message.trim() || form.message.trim().length < 15) {
      errs.message = 'Por favor describe tu consulta con al menos 15 caracteres.';
    }

    return errs;
  };

  const errors = validate();
  const isValid = Object.keys(errors).length === 0;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, message: true });

    if (!isValid) return;

    try {
      const existing = JSON.parse(localStorage.getItem('oy-contact-messages') || '[]');
      const newEntry = {
        id: `cnt-${Date.now()}`,
        ...form,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('oy-contact-messages', JSON.stringify([newEntry, ...existing]));
    } catch {}

    setIsSubmitted(true);
  };

  return (
    <div className="oy-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="oy-modal oy-contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
        <div className="oy-modal__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="oy-icon-badge oy-icon-badge--action" aria-hidden="true">
              <MessageSquare size={16} />
            </span>
            <div>
              <span className="oy-eyebrow">Atención al Usuario</span>
              <h3 id="contact-modal-title" className="oy-modal__title">Formulario de Contacto</h3>
            </div>
          </div>
          <button type="button" className="oy-icon-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="oy-contact-success">
            <MascotAvatar size="md" animate="bounce" forceImage="wave" />
            <h4 className="oy-contact-success__title">¡Mensaje recibido con éxito!</h4>
            <p className="oy-contact-success__text">
              Muchas gracias, <strong>{form.name}</strong>. Un asesor de soporte de OficioYa te responderá a <strong>{form.email}</strong> o por WhatsApp en menos de 2 horas hábiles.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setIsSubmitted(false);
                setForm({ name: '', email: '', phone: '', subject: 'Consulta general de servicio', message: '' });
                setTouched({});
                onClose();
              }}
            >
              <CheckCircle2 size={16} /> Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="oy-contact-form">
            <p className="oy-contact-intro">
              ¿Tienes dudas sobre cómo contratar, ofrecer tus oficios o necesitas soporte? Escríbenos directamente.
            </p>

            {/* Nombre */}
            <div className="oy-form-group">
              <label htmlFor="contact-name" className="oy-form-label">
                <User size={14} aria-hidden="true" /> Nombre y Apellidos *
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="Ej. Juan Pérez"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onBlur={() => handleBlur('name')}
                className={`oy-input ${touched.name && errors.name ? 'oy-input--error' : ''}`}
                aria-required="true"
                aria-invalid={Boolean(touched.name && errors.name)}
              />
              {touched.name && errors.name && (
                <span className="oy-form-error" role="alert">
                  <AlertCircle size={13} aria-hidden="true" /> {errors.name}
                </span>
              )}
            </div>

            {/* Fila Correo y Teléfono */}
            <div className="oy-form-row">
              <div className="oy-form-group">
                <label htmlFor="contact-email" className="oy-form-label">
                  <Mail size={14} aria-hidden="true" /> Correo Electrónico *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onBlur={() => handleBlur('email')}
                  className={`oy-input ${touched.email && errors.email ? 'oy-input--error' : ''}`}
                  aria-required="true"
                  aria-invalid={Boolean(touched.email && errors.email)}
                />
                {touched.email && errors.email && (
                  <span className="oy-form-error" role="alert">
                    <AlertCircle size={13} aria-hidden="true" /> {errors.email}
                  </span>
                )}
              </div>

              <div className="oy-form-group">
                <label htmlFor="contact-phone" className="oy-form-label">
                  <Phone size={14} aria-hidden="true" /> Celular / WhatsApp *
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="310 123 4567"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  onBlur={() => handleBlur('phone')}
                  className={`oy-input ${touched.phone && errors.phone ? 'oy-input--error' : ''}`}
                  aria-required="true"
                  aria-invalid={Boolean(touched.phone && errors.phone)}
                />
                {touched.phone && errors.phone && (
                  <span className="oy-form-error" role="alert">
                    <AlertCircle size={13} aria-hidden="true" /> {errors.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Asunto */}
            <div className="oy-form-group">
              <label htmlFor="contact-subject" className="oy-form-label">Motivo de contacto</label>
              <select
                id="contact-subject"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="oy-input"
              >
                <option value="Consulta general de servicio">Consulta general de servicio</option>
                <option value="Registro y verificación de oficio">Registro y verificación como profesional</option>
                <option value="Soporte técnico o reporte">Soporte técnico o reporte</option>
                <option value="Alianzas y convenios">Alianzas y convenios locales</option>
              </select>
            </div>

            {/* Mensaje */}
            <div className="oy-form-group">
              <label htmlFor="contact-message" className="oy-form-label">
                Detalle del mensaje *
              </label>
              <textarea
                id="contact-message"
                rows={4}
                placeholder="Cuéntanos en qué te podemos ayudar con lujo de detalles..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                onBlur={() => handleBlur('message')}
                className={`oy-input ${touched.message && errors.message ? 'oy-input--error' : ''}`}
                aria-required="true"
                aria-invalid={Boolean(touched.message && errors.message)}
              />
              <div className="oy-form-footer-line">
                {touched.message && errors.message ? (
                  <span className="oy-form-error" role="alert">
                    <AlertCircle size={13} aria-hidden="true" /> {errors.message}
                  </span>
                ) : (
                  <span className="oy-form-hint">Mínimo 15 caracteres.</span>
                )}
                <span className="oy-form-counter">{form.message.length} car.</span>
              </div>
            </div>

            <div className="oy-modal__foot" style={{ padding: '0', border: 'none', marginTop: 'var(--space-4)' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isValid && Object.keys(touched).length > 0}
              >
                <Send size={16} /> Enviar Mensaje
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
