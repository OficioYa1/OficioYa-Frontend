import React, { useState } from 'react';
import { X, Send, CheckCircle2, MessageSquare, AlertCircle, Phone, Mail, User, HelpCircle, Clock } from 'lucide-react';
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

  // Validación de campos
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
      errs.phone = 'Ingresa un número de celular de 10 dígitos (ej. 310 123 4567).';
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
        {/* Cabecera con identidad de marca y botón de cierre */}
        <div className="oy-modal__head oy-contact-modal__head">
          <div className="oy-contact-modal__brand">
            <span className="oy-contact-modal__badge-icon" aria-hidden="true">
              <MessageSquare size={20} />
            </span>
            <div>
              <div className="oy-contact-modal__eyebrow">
                <span className="oy-contact-modal__dot" aria-hidden="true" />
                <span>Atención al Usuario · Canal Oficial</span>
              </div>
              <h3 id="contact-modal-title" className="oy-modal__title oy-contact-modal__title">
                Formulario de Contacto
              </h3>
            </div>
          </div>
          <button type="button" className="oy-icon-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        <div className="oy-modal__body oy-contact-modal__body">
          {isSubmitted ? (
            <div className="oy-contact-success">
              <div className="oy-contact-success__badge" aria-hidden="true">
                <CheckCircle2 size={32} />
              </div>
              <MascotAvatar size="md" animate="bounce" forceImage="wave" />
              <h4 className="oy-contact-success__title">Mensaje Recibido con Éxito</h4>
              <p className="oy-contact-success__text">
                Muchas gracias, <strong>{form.name}</strong>. Un asesor de soporte técnico de OficioYa revisará tu solicitud y se comunicará contigo a <strong>{form.email}</strong> o vía WhatsApp al <strong>{form.phone}</strong>.
              </p>
              <div className="oy-contact-success__details">
                <div className="oy-contact-success__item">
                  <span>Motivo registrado:</span>
                  <strong>{form.subject}</strong>
                </div>
                <div className="oy-contact-success__item">
                  <span>Tiempo de respuesta:</span>
                  <strong>Menos de 2 horas hábiles</strong>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary oy-contact-success__btn"
                onClick={() => {
                  setIsSubmitted(false);
                  setForm({ name: '', email: '', phone: '', subject: 'Consulta general de servicio', message: '' });
                  setTouched({});
                  onClose();
                }}
              >
                <CheckCircle2 size={16} aria-hidden="true" /> Entendido
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="oy-contact-form">
              {/* Tarjeta informativa superior */}
              <div className="oy-contact-banner" role="status">
                <Clock size={16} className="oy-contact-banner__icon" aria-hidden="true" />
                <p>
                  ¿Tienes dudas sobre cómo contratar, ofrecer tus oficios o necesitas soporte? Escríbenos directamente y nuestro equipo te responderá en menos de 2 horas hábiles.
                </p>
              </div>

              {/* Campo: Nombre y Apellidos */}
              <div className="oy-form-group">
                <label htmlFor="contact-name" className="oy-form-label">
                  <User size={14} className="oy-form-label__icon" aria-hidden="true" />
                  <span>Nombre y Apellidos</span>
                  <span className="oy-form-req" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onBlur={() => handleBlur('name')}
                  className={`input-base oy-contact-input ${touched.name && errors.name ? 'oy-contact-input--error' : ''}`}
                  aria-required="true"
                  aria-invalid={Boolean(touched.name && errors.name)}
                />
                {touched.name && errors.name && (
                  <span className="oy-form-error" role="alert">
                    <AlertCircle size={13} aria-hidden="true" /> {errors.name}
                  </span>
                )}
              </div>

              {/* Fila: Correo y Celular */}
              <div className="oy-form-row">
                <div className="oy-form-group">
                  <label htmlFor="contact-email" className="oy-form-label">
                    <Mail size={14} className="oy-form-label__icon" aria-hidden="true" />
                    <span>Correo Electrónico</span>
                    <span className="oy-form-req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onBlur={() => handleBlur('email')}
                    className={`input-base oy-contact-input ${touched.email && errors.email ? 'oy-contact-input--error' : ''}`}
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
                    <Phone size={14} className="oy-form-label__icon" aria-hidden="true" />
                    <span>Celular / WhatsApp</span>
                    <span className="oy-form-req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    placeholder="310 123 4567"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    onBlur={() => handleBlur('phone')}
                    className={`input-base oy-contact-input ${touched.phone && errors.phone ? 'oy-contact-input--error' : ''}`}
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

              {/* Campo: Motivo de Contacto */}
              <div className="oy-form-group">
                <label htmlFor="contact-subject" className="oy-form-label">
                  <HelpCircle size={14} className="oy-form-label__icon" aria-hidden="true" />
                  <span>Motivo de contacto</span>
                </label>
                <div className="oy-contact-select-wrap">
                  <select
                    id="contact-subject"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="input-base oy-contact-select"
                  >
                    <option value="Consulta general de servicio">Consulta general de servicio</option>
                    <option value="Registro y verificación de oficio">Registro y verificación como profesional</option>
                    <option value="Soporte técnico o reporte">Soporte técnico o reporte</option>
                    <option value="Alianzas y convenios">Alianzas y convenios locales</option>
                  </select>
                </div>
              </div>

              {/* Campo: Detalle del Mensaje */}
              <div className="oy-form-group">
                <label htmlFor="contact-message" className="oy-form-label">
                  <MessageSquare size={14} className="oy-form-label__icon" aria-hidden="true" />
                  <span>Detalle del mensaje</span>
                  <span className="oy-form-req" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={3}
                  placeholder="Cuéntanos en qué te podemos ayudar con lujo de detalles..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  onBlur={() => handleBlur('message')}
                  className={`input-base oy-contact-textarea ${touched.message && errors.message ? 'oy-contact-input--error' : ''}`}
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
                  <span className={`oy-form-counter ${form.message.length >= 15 ? 'oy-form-counter--ok' : ''}`}>
                    {form.message.length} car.
                  </span>
                </div>
              </div>

              {/* Acciones del pie del modal */}
              <div className="oy-contact-modal__actions">
                <button type="button" className="oy-contact-btn--cancel" onClick={onClose}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="oy-contact-btn--submit"
                >
                  <Send size={16} aria-hidden="true" />
                  <span>Enviar Mensaje</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
