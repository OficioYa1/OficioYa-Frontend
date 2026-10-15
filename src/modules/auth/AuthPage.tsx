import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { User, UserRole } from '../../types';
import {
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Mail, Smartphone, Zap,
} from 'lucide-react';
import { BRAND_ASSETS } from '../../utils/assets';
import { LiquidField } from '../landing/LiquidField';
import { LangSwitch } from '../landing/LangSwitch';
import './AuthPage.css';

interface AuthPageProps {
  onAuthSuccess: () => void;
  initialRole?: 'seeker' | 'provider';
}

type AuthMode = 'login' | 'register' | 'verify' | 'recover' | 'recover-sent' | 'reset';
type VerifyChannel = 'email' | 'sms';
type FieldId = 'name' | 'email' | 'password' | 'phone' | 'code' | 'recover' | 'newPassword' | 'confirmPassword';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s-]{7,15}$/;

/** Campos que valida cada pantalla, en el orden en que aparecen. */
const FIELDS_BY_MODE: Record<AuthMode, FieldId[]> = {
  login: ['email', 'password'],
  register: ['name', 'email', 'password', 'phone'],
  verify: ['code'],
  recover: ['recover'],
  'recover-sent': [],
  reset: ['newPassword', 'confirmPassword'],
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const makeCode = () => String(Math.floor(100000 + Math.random() * 900000));

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, initialRole = 'seeker' }) => {
  const { login, register, findAccount, resetPassword } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<AuthMode>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [mascotPose, setMascotPose] = useState<'wave' | 'float' | 'work'>('float');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldId, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldId, boolean>>>({});
  const formRef = useRef<HTMLDivElement>(null);

  // OFY-40 · verificación por código (correo o SMS)
  const [channel, setChannel] = useState<VerifyChannel>('email');
  const [sentCode, setSentCode] = useState('');
  const [code, setCode] = useState('');

  // OFY-75 · recuperación de cuenta
  const [recoverTarget, setRecoverTarget] = useState('');
  const [recoverAccount, setRecoverAccount] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const values: Record<FieldId, string> = {
    name, email, password, phone, code, recover: recoverTarget, newPassword, confirmPassword,
  };

  /** Clave de i18n del error de un campo en la pantalla actual, o null si es válido. */
  const validate = (field: FieldId, v: Record<FieldId, string> = values): string | null => {
    switch (field) {
      case 'name': return v.name.trim() ? null : 'auth.err.name';
      case 'email':
        if (!v.email.trim()) return 'auth.err.emailRequired';
        return EMAIL_RE.test(v.email.trim()) ? null : 'auth.err.email';
      case 'password':
        if (!v.password) return 'auth.err.passwordRequired';
        return mode === 'register' && v.password.length < 6 ? 'auth.err.password' : null;
      case 'phone': return channel !== 'sms' || PHONE_RE.test(v.phone.trim()) ? null : 'auth.err.phone';
      case 'code': return v.code.trim().length === 6 ? null : 'auth.err.code';
      case 'recover': return EMAIL_RE.test(v.recover.trim()) || PHONE_RE.test(v.recover.trim()) ? null : 'auth.err.recover';
      case 'newPassword': return v.newPassword.length >= 6 ? null : 'auth.err.password';
      case 'confirmPassword': return v.confirmPassword && v.confirmPassword === v.newPassword ? null : 'auth.err.confirm';
    }
  };

  const setValue = (field: FieldId, value: string) => {
    const setters: Record<FieldId, (s: string) => void> = {
      name: setName, email: setEmail, password: setPassword, phone: setPhone, code: setCode,
      recover: setRecoverTarget, newPassword: setNewPassword, confirmPassword: setConfirmPassword,
    };
    setters[field](value);
    if (touched[field]) {
      const key = validate(field, { ...values, [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: key ?? undefined }));
    }
  };

  const onBlurField = (field: FieldId) => {
    setMascotPose('float');
    setTouched(prev => ({ ...prev, [field]: true }));
    const key = validate(field);
    setFieldErrors(prev => ({ ...prev, [field]: key ?? undefined }));
  };

  /** Valida la pantalla; si hay errores los muestra y enfoca el primer campo inválido. */
  const validateAll = (): boolean => {
    const fields = FIELDS_BY_MODE[mode].filter(f => f !== 'phone' || channel === 'sms');
    const next: Partial<Record<FieldId, string>> = {};
    fields.forEach(f => {
      const key = validate(f);
      if (key) next[f] = key;
    });
    setFieldErrors(next);
    setTouched(Object.fromEntries(fields.map(f => [f, true])));
    const first = fields.find(f => next[f]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#auth-${first}`)?.focus();
      return false;
    }
    return true;
  };

  const goTo = (next: AuthMode) => {
    setMode(next);
    setFormError('');
    setNotice('');
    setFieldErrors({});
    setTouched({});
    setMascotPose('float');
  };

  const sendCode = async () => {
    setLoading(true);
    setMascotPose('work');
    await wait(700);
    setSentCode(makeCode());
    setCode('');
    setLoading(false);
    setMascotPose('float');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setNotice('');
    if (!validateAll()) return;

    if (mode === 'register') {
      if (findAccount(email)) {
        setFormError(t('auth.err.exists'));
        return;
      }
      await sendCode();
      goTo('verify');
      return;
    }

    setLoading(true);
    setMascotPose('work');
    try {
      const ok = await login(email.trim(), password);
      if (ok) {
        onAuthSuccess();
      } else {
        setFormError(t(findAccount(email) ? 'auth.err.wrongPassword' : 'auth.err.noAccount'));
        setMascotPose('float');
      }
    } catch {
      setFormError(t('auth.err.generic'));
      setMascotPose('float');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setNotice('');
    if (!validateAll()) return;
    if (code.trim() !== sentCode) {
      setFieldErrors({ code: 'auth.err.codeMismatch' });
      formRef.current?.querySelector<HTMLElement>('#auth-code')?.focus();
      return;
    }
    setLoading(true);
    setMascotPose('work');
    try {
      const verified: Partial<User> =
        channel === 'sms' ? { phone: phone.trim(), phoneVerified: true } : { emailVerified: true };
      const ok = await register(name.trim(), email.trim(), password, selectedRole, verified);
      if (ok) {
        onAuthSuccess();
      } else {
        setFormError(t('auth.err.exists'));
        setMascotPose('float');
      }
    } catch {
      setFormError(t('auth.err.generic'));
      setMascotPose('float');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setFormError('');
    setFieldErrors({});
    await sendCode();
    setNotice(t('auth.code.resent'));
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validateAll()) return;
    setLoading(true);
    setMascotPose('work');
    await wait(800);
    setRecoverAccount(findAccount(recoverTarget.trim()));
    setLoading(false);
    goTo('recover-sent');
  };

  const openResetLink = () => {
    setNewPassword('');
    setConfirmPassword('');
    setShowPass(false);
    goTo('reset');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!recoverAccount) {
      setFormError(t('auth.err.linkInvalid'));
      return;
    }
    if (!validateAll()) return;
    setLoading(true);
    setMascotPose('work');
    await wait(600);
    const ok = await resetPassword(recoverAccount.email, newPassword);
    setLoading(false);
    if (!ok) {
      setMascotPose('float');
      setFormError(t('auth.err.resetFailed'));
      return;
    }
    goTo('login');
    setEmail(recoverAccount.email);
    setPassword('');
    setShowPass(false);
    setNotice(t('auth.reset.done'));
  };

  const fillDemo = () => {
    setEmail('juan.perez@correo.com');
    setPassword('demo123');
    setFormError('');
    setFieldErrors({});
    setTouched({});
    setNotice(t('auth.demo.filled'));
    setMascotPose('wave');
  };

  const verifyDestination = channel === 'sms' ? phone.trim() : email.trim();
  const roleClass = selectedRole === 'provider' ? 'provider' : 'seeker';

  const headings: Record<AuthMode, { eyebrow: string; title: string; sub: string }> = {
    login: { eyebrow: t('auth.eyebrow.login'), title: t('auth.title.login'), sub: t('auth.sub.login') },
    register: { eyebrow: t('auth.eyebrow.register'), title: t('auth.title.register'), sub: t('auth.sub.register') },
    verify: { eyebrow: t('auth.eyebrow.verify'), title: t('auth.title.verify'), sub: t('auth.sub.verify', { dest: verifyDestination }) },
    recover: { eyebrow: t('auth.eyebrow.recover'), title: t('auth.title.recover'), sub: t('auth.sub.recover') },
    'recover-sent': { eyebrow: t('auth.eyebrow.recover'), title: t('auth.title.recoverSent'), sub: t('auth.sub.recoverSent') },
    reset: {
      eyebrow: t('auth.eyebrow.recover'),
      title: t('auth.title.reset'),
      sub: recoverAccount ? t('auth.sub.reset', { email: recoverAccount.email }) : t('auth.sub.resetGeneric'),
    },
  };

  const posterFoot = mode === 'register' && selectedRole === 'provider' ? t('auth.poster.provider') : t('auth.poster.seeker');
  const mascotImg = selectedRole === 'provider' ? BRAND_ASSETS.manyElectricista : BRAND_ASSETS.manyWave;

  /** Atributos comunes de un input validado: id, aria-invalid/aria-describedby y eventos. */
  const inputProps = (field: FieldId) => ({
    id: `auth-${field}`,
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(field, e.target.value),
    onFocus: () => setMascotPose('wave'),
    onBlur: () => onBlurField(field),
    'aria-invalid': fieldErrors[field] ? true : undefined,
    'aria-describedby': fieldErrors[field] ? `auth-${field}-err` : undefined,
  });

  const fieldError = (field: FieldId) => fieldErrors[field] && (
    <p id={`auth-${field}-err`} className="auth-field-error">
      <AlertTriangle size={14} aria-hidden="true" /> {t(fieldErrors[field] as string)}
    </p>
  );

  const passToggle = (
    <button
      type="button"
      className="auth-pass-toggle"
      onClick={() => setShowPass(s => !s)}
      aria-label={showPass ? t('auth.password.hide') : t('auth.password.show')}
      aria-pressed={showPass}
    >
      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  const spinner = <span className="auth-spinner" role="status" aria-label={t('auth.loading')} />;
  const messages = (
    <>
      {formError && <p className="auth-alert" role="alert"><AlertTriangle size={16} aria-hidden="true" /> {formError}</p>}
      {notice && <p className="auth-notice" role="status"><CheckCircle2 size={16} aria-hidden="true" /> {notice}</p>}
    </>
  );

  return (
    <div className={`auth-root auth-root--${roleClass}`}>
      <LiquidField className="auth-liquid" />

      <div className="auth-shell">
        <aside className="auth-aside">
          <div className="auth-brand">
            <img src={BRAND_ASSETS.logo} alt="" className="auth-brand__logo" width={40} height={40} />
            <span className="auth-brand__word">Oficio<b>Ya</b></span>
          </div>
          <p className="auth-aside__title" aria-hidden="true">
            <span>{t('auth.poster.line1')}</span>
            <span>{t('auth.poster.line2')}</span>
            <span>{t('auth.poster.line3')}</span>
          </p>
          <p className="auth-aside__foot">{posterFoot}</p>
          <img
            src={mascotImg}
            alt={t('auth.manyAlt')}
            className={`auth-many auth-many--${mascotPose}`}
            width={720}
            height={806}
          />
        </aside>

        <section className="auth-panel glass-3" aria-labelledby="auth-title">
          <div className="auth-panel__top">
            <span className="auth-eyebrow">{headings[mode].eyebrow}</span>
            <LangSwitch />
          </div>
          <h1 id="auth-title" className="auth-title">{headings[mode].title}</h1>
          <p className="auth-sub">{headings[mode].sub}</p>

          <div ref={formRef} className="auth-body">
            {(mode === 'login' || mode === 'register') && (
              <>
                {mode === 'register' && (
                  <fieldset className="auth-role">
                    <legend className="auth-label">{t('auth.role.label')}</legend>
                    <div className="auth-seg">
                      {(['seeker', 'provider'] as const).map(r => (
                        <label key={r} className={`auth-seg__opt auth-seg__opt--${r}`}>
                          <input
                            type="radio"
                            name="auth-role"
                            value={r}
                            checked={selectedRole === r}
                            onChange={() => setSelectedRole(r)}
                          />
                          <span>{t(r === 'seeker' ? 'auth.role.seeker' : 'auth.role.provider')}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                  {mode === 'register' && (
                    <div className="auth-field">
                      <label className="auth-label" htmlFor="auth-name">{t('auth.name')}</label>
                      <input type="text" className="input-base auth-input" placeholder={t('auth.name.ph')} autoComplete="name" {...inputProps('name')} />
                      {fieldError('name')}
                    </div>
                  )}

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="auth-email">{t('auth.email')}</label>
                    <input type="email" inputMode="email" className="input-base auth-input" placeholder={t('auth.email.ph')} autoComplete="email" {...inputProps('email')} />
                    {fieldError('email')}
                  </div>

                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="auth-password">{t('auth.password')}</label>
                      {mode === 'login' && (
                        <button type="button" className="auth-link auth-link--small" onClick={() => { setRecoverTarget(email); goTo('recover'); }}>
                          {t('auth.forgot')}
                        </button>
                      )}
                    </div>
                    <div className="auth-pass-wrap">
                      <input
                        type={showPass ? 'text' : 'password'}
                        className="input-base auth-input"
                        placeholder={t('auth.password.ph')}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        {...inputProps('password')}
                      />
                      {passToggle}
                    </div>
                    {fieldError('password')}
                  </div>

                  {mode === 'register' && (
                    <fieldset className="auth-field auth-fieldset">
                      <legend className="auth-label">{t('auth.channel')}</legend>
                      <div className="auth-channel">
                        <button type="button" className="oy-chip auth-chip" aria-pressed={channel === 'email'} onClick={() => setChannel('email')}>
                          <Mail size={15} aria-hidden="true" /> {t('auth.channel.email')}
                        </button>
                        <button type="button" className="oy-chip auth-chip" aria-pressed={channel === 'sms'} onClick={() => setChannel('sms')}>
                          <Smartphone size={15} aria-hidden="true" /> {t('auth.channel.sms')}
                        </button>
                      </div>
                      {channel === 'sms' && (
                        <div className="auth-field">
                          <label className="auth-label auth-label--sub" htmlFor="auth-phone">{t('auth.phone')}</label>
                          <input type="tel" inputMode="tel" className="input-base auth-input" placeholder={t('auth.phone.ph')} autoComplete="tel" {...inputProps('phone')} />
                          {fieldError('phone')}
                        </div>
                      )}
                    </fieldset>
                  )}

                  {messages}

                  <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? spinner : (
                      <>
                        <span>{mode === 'login' ? t('auth.submit.login') : t('auth.submit.register')}</span>
                        <span className="auth-submit__orb" aria-hidden="true"><ArrowRight size={18} /></span>
                      </>
                    )}
                  </button>

                  {mode === 'login' && (
                    <button type="button" className="auth-demo" onClick={fillDemo}>
                      <Zap size={16} aria-hidden="true" /> {t('auth.demo')}
                    </button>
                  )}
                </form>

                <p className="auth-switch">
                  {mode === 'login' ? t('auth.switch.toRegister') : t('auth.switch.toLogin')}{' '}
                  <button type="button" className="auth-link" onClick={() => goTo(mode === 'login' ? 'register' : 'login')}>
                    {mode === 'login' ? t('auth.switch.register') : t('auth.switch.login')}
                  </button>
                </p>
              </>
            )}

            {mode === 'verify' && (
              <form onSubmit={handleVerify} className="auth-form" noValidate>
                <div className="auth-code-note">
                  {channel === 'sms' ? <Smartphone size={18} aria-hidden="true" /> : <Mail size={18} aria-hidden="true" />}
                  <span>{t('auth.code.demo')} <strong>{sentCode}</strong></span>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-code">{t('auth.code')}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="input-base auth-input auth-code-input"
                    placeholder="000000"
                    autoComplete="one-time-code"
                    autoFocus
                    {...inputProps('code')}
                    onChange={e => setValue('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                  {fieldError('code')}
                </div>

                {messages}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? spinner : (
                    <>
                      <span>{t('auth.code.submit')}</span>
                      <span className="auth-submit__orb" aria-hidden="true"><ArrowRight size={18} /></span>
                    </>
                  )}
                </button>

                <div className="auth-row">
                  <button type="button" className="auth-link" onClick={() => goTo('register')}>
                    <ArrowLeft size={14} aria-hidden="true" /> {t('auth.code.change')}
                  </button>
                  <button type="button" className="auth-link" onClick={handleResend} disabled={loading}>
                    {t('auth.code.resend')}
                  </button>
                </div>
              </form>
            )}

            {mode === 'recover' && (
              <form onSubmit={handleRecover} className="auth-form" noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-recover">{t('auth.recover.target')}</label>
                  <input type="text" className="input-base auth-input" placeholder={t('auth.recover.ph')} autoComplete="email" {...inputProps('recover')} />
                  {fieldError('recover')}
                </div>

                {messages}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? spinner : (
                    <>
                      <span>{t('auth.recover.submit')}</span>
                      <span className="auth-submit__orb" aria-hidden="true"><KeyRound size={18} /></span>
                    </>
                  )}
                </button>

                <button type="button" className="auth-link auth-back" onClick={() => goTo('login')}>
                  <ArrowLeft size={14} aria-hidden="true" /> {t('auth.back')}
                </button>
              </form>
            )}

            {mode === 'recover-sent' && (
              <div className="auth-form">
                <div className="auth-success" role="status">
                  <CheckCircle2 size={22} aria-hidden="true" />
                  <p>
                    {t('auth.recover.sent', {
                      target: recoverTarget.trim(),
                      via: t(EMAIL_RE.test(recoverTarget.trim()) ? 'auth.recover.viaEmail' : 'auth.recover.viaSms'),
                    })}
                  </p>
                </div>
                {recoverAccount ? (
                  <div className="auth-code-note">
                    <Mail size={18} aria-hidden="true" />
                    <span>
                      {t('auth.recover.demoLink')}{' '}
                      <button type="button" className="auth-link" onClick={openResetLink}>
                        {t('auth.recover.open')} <ArrowRight size={14} aria-hidden="true" />
                      </button>
                    </span>
                  </div>
                ) : (
                  <p className="auth-code-note">{t('auth.recover.none')}</p>
                )}
                <button type="button" className="auth-submit" onClick={() => goTo('login')}>
                  <span>{t('auth.back')}</span>
                  <span className="auth-submit__orb" aria-hidden="true"><ArrowRight size={18} /></span>
                </button>
                <button type="button" className="auth-link auth-back" onClick={() => goTo('recover')}>
                  {t('auth.recover.retry')}
                </button>
              </div>
            )}

            {mode === 'reset' && (
              <form onSubmit={handleReset} className="auth-form" noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-newPassword">{t('auth.reset.new')}</label>
                  <div className="auth-pass-wrap">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="input-base auth-input"
                      placeholder={t('auth.password.ph')}
                      autoComplete="new-password"
                      autoFocus
                      {...inputProps('newPassword')}
                    />
                    {passToggle}
                  </div>
                  {fieldError('newPassword')}
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-confirmPassword">{t('auth.reset.confirm')}</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-base auth-input"
                    placeholder={t('auth.reset.confirm.ph')}
                    autoComplete="new-password"
                    {...inputProps('confirmPassword')}
                  />
                  {fieldError('confirmPassword')}
                </div>

                {messages}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? spinner : (
                    <>
                      <span>{t('auth.reset.submit')}</span>
                      <span className="auth-submit__orb" aria-hidden="true"><KeyRound size={18} /></span>
                    </>
                  )}
                </button>

                <button type="button" className="auth-link auth-back" onClick={() => goTo('login')}>
                  <ArrowLeft size={14} aria-hidden="true" /> {t('auth.back')}
                </button>
              </form>
            )}
          </div>

          <p className="auth-footer-note">{t('auth.footer')}</p>
        </section>
      </div>
    </div>
  );
};
