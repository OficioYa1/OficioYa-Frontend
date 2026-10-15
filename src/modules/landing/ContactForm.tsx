import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowUpRight, Clock, Mail, RotateCcw, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { contactService, type ContactKind } from '../../services/mock/contactService';

type Field = 'name' | 'email' | 'phone' | 'message';
type Values = Record<Field, string> & { kind: ContactKind };
type Errors = Partial<Record<Field, string>>;
type Status = 'idle' | 'sending' | 'error' | 'sent';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s-]{7,18}$/;
const MAX_MESSAGE = 1000;
const EMPTY: Values = { name: '', email: '', phone: '', kind: 'cliente', message: '' };
const ORDER: Field[] = ['name', 'email', 'phone', 'message'];

const ERROR_KEYS: Record<Field, string> = {
  name: 'landing.contact.err.name',
  email: 'landing.contact.err.email',
  phone: 'landing.contact.err.phone',
  message: 'landing.contact.err.message',
};

/** Devuelve la clave del error de un campo, o null si es válido. */
function check(field: Field, v: Values): string | null {
  switch (field) {
    case 'name': return v.name.trim().length >= 3 ? null : ERROR_KEYS.name;
    case 'email': return EMAIL_RE.test(v.email.trim()) ? null : ERROR_KEYS.email;
    case 'phone': {
      const p = v.phone.trim();
      const digits = p.replace(/\D/g, '').length;
      return !p || (PHONE_RE.test(p) && digits >= 7 && digits <= 15) ? null : ERROR_KEYS.phone;
    }
    case 'message': return v.message.trim().length >= 10 ? null : ERROR_KEYS.message;
  }
}

export const ContactForm: React.FC = () => {
  const { t } = useLanguage();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [summary, setSummary] = useState<Field[]>([]);
  const [summaryTick, setSummaryTick] = useState(0);
  const [sentTo, setSentTo] = useState({ name: '', email: '' });
  const summaryRef = useRef<HTMLDivElement>(null);
  const failRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const focusNameOnReset = useRef(false);

  useEffect(() => {
    if (status === 'sent') successRef.current?.focus();
    if (status === 'error') failRef.current?.focus();
    if (status === 'idle' && focusNameOnReset.current) {
      focusNameOnReset.current = false;
      nameRef.current?.focus();
    }
  }, [status]);

  // El resumen recibe el foco solo al intentar enviar, no mientras se corrige
  useEffect(() => {
    if (summaryTick) summaryRef.current?.focus();
  }, [summaryTick]);

  const setField = (field: Field | 'kind', value: string) => {
    const next = { ...values, [field]: value } as Values;
    setValues(next);
    // Una vez tocado, el campo se revalida mientras se corrige
    if (field !== 'kind' && touched[field]) {
      const key = check(field, next);
      setErrors(prev => ({ ...prev, [field]: key ?? undefined }));
      if (!key) setSummary(prev => prev.filter(f => f !== field));
    }
  };

  const onBlur = (field: Field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const key = check(field, values);
    setErrors(prev => ({ ...prev, [field]: key ?? undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const nextErrors: Errors = {};
    ORDER.forEach(f => {
      const key = check(f, values);
      if (key) nextErrors[f] = key;
    });
    setErrors(nextErrors);
    setTouched({ name: true, email: true, phone: true, message: true });
    const invalid = ORDER.filter(f => nextErrors[f]);
    if (invalid.length) {
      setSummary(invalid);
      setSummaryTick(n => n + 1);
      return;
    }
    setSummary([]);
    setStatus('sending');
    try {
      await contactService.send({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        kind: values.kind,
        message: values.message.trim(),
      });
      setSentTo({ name: values.name.trim().split(/\s+/)[0], email: values.email.trim() });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setTouched({});
    setSummary([]);
    focusNameOnReset.current = true;
    setStatus('idle');
  };

  const fieldProps = (field: Field) => ({
    id: `lp-contact-${field}`,
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setField(field, e.target.value),
    onBlur: () => onBlur(field),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': [errors[field] ? `lp-contact-${field}-err` : '', field === 'message' ? 'lp-contact-count' : '']
      .filter(Boolean).join(' ') || undefined,
    className: 'input-base lp-form__input',
  });

  const errorFor = (field: Field) => errors[field] && (
    <p id={`lp-contact-${field}-err`} className="lp-form__error">
      <AlertTriangle size={14} aria-hidden="true" /> {t(errors[field] as string)}
    </p>
  );

  const labels: Record<Field, string> = {
    name: t('landing.contact.name'),
    email: t('landing.contact.email'),
    phone: t('landing.contact.phone'),
    message: t('landing.contact.message'),
  };

  return (
    <section id="contacto" className="lp-section lp-contact" aria-labelledby="lp-contact-title">
      <div className="lp-wrap lp-contact__grid">
        <div className="lp-contact__intro">
          <p className="lp-kicker" data-reveal>{t('landing.contact.kicker')}</p>
          <h2 id="lp-contact-title" className="lp-title lp-title--xl" data-reveal style={{ '--reveal-i': 1 } as React.CSSProperties}>
            {t('landing.contact.title')}
          </h2>
          <p className="lp-lead" data-reveal style={{ '--reveal-i': 2 } as React.CSSProperties}>{t('landing.contact.sub')}</p>
          <ul className="lp-contact__info" data-reveal style={{ '--reveal-i': 3 } as React.CSSProperties}>
            <li><Mail size={18} aria-hidden="true" /> <a href={`mailto:${t('landing.contact.mail')}`}>{t('landing.contact.mail')}</a></li>
            <li><Clock size={18} aria-hidden="true" /> {t('landing.contact.hours')}</li>
          </ul>
        </div>

        <div className="lp-contact__panel glass-1" data-reveal style={{ '--reveal-i': 2 } as React.CSSProperties}>
          {status === 'sent' ? (
            <div className="lp-form__done" role="status">
              <MascotAvatar size="lg" forceImage="wave" animate="wave" />
              <h3 ref={successRef} tabIndex={-1} className="lp-form__done-title">{t('landing.contact.ok.title')}</h3>
              <p className="lp-form__done-body">{t('landing.contact.ok.body', sentTo)}</p>
              <button type="button" className="btn btn-secondary" onClick={reset}>
                <RotateCcw size={16} aria-hidden="true" /> {t('landing.contact.again')}
              </button>
            </div>
          ) : (
            <form className="lp-form" noValidate onSubmit={submit} aria-busy={status === 'sending'}>
              <p className="lp-form__note">{t('landing.contact.required')}</p>

              {summary.length > 0 && (
                <div ref={summaryRef} className="lp-form__summary" tabIndex={-1} role="alert">
                  <p>{t('landing.contact.summary', { n: summary.length })}</p>
                  <ul>
                    {summary.map(f => (
                      <li key={f}>
                        <a
                          href={`#lp-contact-${f}`}
                          onClick={e => { e.preventDefault(); document.getElementById(`lp-contact-${f}`)?.focus(); }}
                        >
                          {labels[f]}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {status === 'error' && (
                <div ref={failRef} className="lp-form__fail" tabIndex={-1} role="alert">
                  <MascotAvatar size="sm" forceImage="base" animate="none" />
                  <div>
                    <p className="lp-form__fail-title">{t('landing.contact.fail.title')}</p>
                    <p>{t('landing.contact.fail.body')}</p>
                  </div>
                </div>
              )}

              <div className="lp-form__row">
                <div className="lp-form__field">
                  <label htmlFor="lp-contact-name" className="lp-form__label">{labels.name}</label>
                  <input ref={nameRef} type="text" autoComplete="name" placeholder={t('landing.contact.name.ph')} {...fieldProps('name')} />
                  {errorFor('name')}
                </div>
                <div className="lp-form__field">
                  <label htmlFor="lp-contact-email" className="lp-form__label">{labels.email}</label>
                  <input type="email" autoComplete="email" inputMode="email" placeholder={t('landing.contact.email.ph')} {...fieldProps('email')} />
                  {errorFor('email')}
                </div>
              </div>

              <div className="lp-form__row">
                <div className="lp-form__field">
                  <label htmlFor="lp-contact-phone" className="lp-form__label">
                    {labels.phone} <span className="lp-form__opt">{t('landing.contact.optional')}</span>
                  </label>
                  <input type="tel" autoComplete="tel" inputMode="tel" placeholder={t('landing.contact.phone.ph')} {...fieldProps('phone')} />
                  {errorFor('phone')}
                </div>
                <fieldset className="lp-form__field lp-form__kind">
                  <legend className="lp-form__label">{t('landing.contact.type')}</legend>
                  <div className="lp-seg">
                    {(['cliente', 'profesional'] as const).map(kind => (
                      <label key={kind} className="lp-seg__opt">
                        <input
                          type="radio"
                          name="lp-contact-kind"
                          value={kind}
                          checked={values.kind === kind}
                          onChange={() => setField('kind', kind)}
                        />
                        <span>{t(kind === 'cliente' ? 'landing.contact.type.client' : 'landing.contact.type.pro')}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="lp-form__field">
                <label htmlFor="lp-contact-message" className="lp-form__label">{labels.message}</label>
                <textarea
                  rows={5}
                  maxLength={MAX_MESSAGE}
                  placeholder={t('landing.contact.message.ph')}
                  {...fieldProps('message')}
                  className="input-base lp-form__input lp-form__textarea"
                />
                <div className="lp-form__meta">
                  {errorFor('message')}
                  <span id="lp-contact-count" className="lp-form__count">
                    {t('landing.contact.count', { n: values.message.length, max: MAX_MESSAGE })}
                  </span>
                </div>
              </div>

              <button type="submit" className="lp-pill lp-form__submit" disabled={status === 'sending'}>
                {status === 'sending' ? (
                  <>
                    <span className="lp-spinner" aria-hidden="true" />
                    <span>{t('landing.contact.sending')}</span>
                  </>
                ) : status === 'error' ? (
                  <>
                    <span>{t('landing.contact.retry')}</span>
                    <span className="lp-pill__orb" aria-hidden="true"><RotateCcw size={18} /></span>
                  </>
                ) : (
                  <>
                    <span>{t('landing.contact.submit')}</span>
                    <span className="lp-pill__orb" aria-hidden="true">{values.message ? <Send size={18} /> : <ArrowUpRight size={18} />}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
