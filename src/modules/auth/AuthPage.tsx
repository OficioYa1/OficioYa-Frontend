import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { User, UserRole } from '../../types';
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, Zap, Wrench, Star, ShieldCheck,
  Mail, Smartphone, KeyRound, CheckCircle2,
} from 'lucide-react';
import './AuthPage.css';
import { BRAND_ASSETS } from '../../utils/assets';

interface AuthPageProps {
  onAuthSuccess: () => void;
  initialRole?: 'seeker' | 'provider';
}

type AuthMode = 'login' | 'register' | 'verify' | 'recover' | 'recover-sent' | 'reset';
type VerifyChannel = 'email' | 'sms';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s-]{7,15}$/;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const makeCode = () => String(Math.floor(100000 + Math.random() * 900000));

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, initialRole = 'seeker' }) => {
  const { login, register, findAccount, resetPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mascotPose, setMascotPose] = useState<'wave' | 'float' | 'work'>('float');

  // OFY-40 · verificación por código (correo o SMS)
  const [channel, setChannel] = useState<VerifyChannel>('email');
  const [sentCode, setSentCode] = useState('');
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState('');

  // OFY-75 · recuperación de cuenta
  const [recoverTarget, setRecoverTarget] = useState('');
  const [recoverAccount, setRecoverAccount] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mascotImg =
    selectedRole === 'provider'
      ? BRAND_ASSETS.manyElectricista
      : BRAND_ASSETS.manyWave;

  const handleFocus = () => setMascotPose('wave');
  const handleBlur  = () => setMascotPose('float');

  const goTo = (next: AuthMode) => {
    setMode(next);
    setError('');
    setNotice('');
    setMascotPose('float');
  };

  const sendCode = async () => {
    setLoading(true);
    setMascotPose('work');
    await wait(700);
    const fresh = makeCode();
    setSentCode(fresh);
    setCode('');
    setLoading(false);
    setMascotPose('float');
    return fresh;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Completa todos los campos.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Ingresa tu nombre completo.');
      return;
    }

    // OFY-49 (RF-49): Registrar cuenta de usuario
    if (mode === 'register') {
      if (!EMAIL_RE.test(email.trim())) {
        setError('Ingresa un correo válido.');
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener mínimo 6 caracteres.');
        return;
      }
      if (channel === 'sms' && !PHONE_RE.test(phone.trim())) {
        setError('Ingresa un número de celular válido para recibir el código.');
        return;
      }
      if (findAccount(email)) {
        setError('Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.');
        return;
      }
      await sendCode();
      setMode('verify');
      return;
    }

    setLoading(true);
    setMascotPose('work');
    try {
      const ok = await login(email.trim(), password);
      if (ok) {
        onAuthSuccess();
      } else {
        setError(
          findAccount(email)
            ? 'La contraseña no coincide con esta cuenta. Revísala o usa “¿Olvidaste tu contraseña?”.'
            : 'No encontramos una cuenta con ese correo. Revisa que esté bien escrito o regístrate gratis.'
        );
        setMascotPose('float');
      }
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.');
      setMascotPose('float');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (code.trim().length !== 6) {
      setError('El código tiene 6 dígitos.');
      return;
    }
    if (code.trim() !== sentCode) {
      setError('El código no coincide. Revisa e intenta de nuevo.');
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
        setError('Ya existe una cuenta con ese correo. Vuelve e inicia sesión o recupera tu contraseña.');
        setMascotPose('float');
      }
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.');
      setMascotPose('float');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    await sendCode();
    setNotice('Te enviamos un código nuevo.');
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const target = recoverTarget.trim();
    if (!EMAIL_RE.test(target) && !PHONE_RE.test(target)) {
      setError('Escribe el correo o celular verificado de tu cuenta.');
      return;
    }
    setLoading(true);
    setMascotPose('work');
    await wait(800);
    setRecoverAccount(findAccount(target));
    setLoading(false);
    setMascotPose('float');
    setMode('recover-sent');
  };

  const openResetLink = () => {
    setNewPassword('');
    setConfirmPassword('');
    setShowPass(false);
    goTo('reset');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!recoverAccount) {
      setError('El enlace ya no es válido. Solicita uno nuevo.');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña nueva debe tener mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Escríbela igual en ambos campos.');
      return;
    }
    setLoading(true);
    setMascotPose('work');
    await wait(600);
    const ok = await resetPassword(recoverAccount.email, newPassword);
    setLoading(false);
    if (!ok) {
      setMascotPose('float');
      setError('No pudimos actualizar tu contraseña. Solicita un enlace nuevo.');
      return;
    }
    goTo('login');
    setEmail(recoverAccount.email);
    setPassword('');
    setShowPass(false);
    setNotice('Listo, tu contraseña quedó actualizada. Inicia sesión con la nueva.');
  };

  const verifyDestination = channel === 'sms' ? phone.trim() : email.trim();
  const roleClass = selectedRole === 'provider' ? 'provider' : 'seeker';

  const headings: Record<AuthMode, { title: string; sub: string }> = {
    login: { title: 'Bienvenido de nuevo', sub: 'Ingresa con tu cuenta de OficioYa' },
    register: { title: 'Crear cuenta', sub: 'Únete a miles de usuarios en Bogotá' },
    verify: { title: 'Verifica tu cuenta', sub: `Escribe el código de 6 dígitos que enviamos a ${verifyDestination}` },
    recover: { title: 'Recuperar cuenta', sub: 'Te enviaremos un enlace para restablecer tu contraseña' },
    'recover-sent': { title: 'Revisa tu bandeja', sub: 'El enlace de recuperación ya va en camino' },
    reset: { title: 'Nueva contraseña', sub: recoverAccount ? `Crea una contraseña nueva para ${recoverAccount.email}` : 'Crea una contraseña nueva para tu cuenta' },
  };

  const posterFoot =
    mode === 'register' && selectedRole === 'provider'
      ? 'Registra tu perfil y empieza a recibir clientes en Bogotá.'
      : 'Encuentra al profesional ideal en tu localidad, verificado y con reseñas reales.';

  return (
    <div className="auth-root">
      <div className={`auth-card auth-card--${roleClass}`}>
        {/* ── Póster: marca, Many y stickers ── */}
        <aside className="auth-poster" aria-label="OficioYa">
          <div className="auth-brand">
            <img src={BRAND_ASSETS.logo} alt="" className="auth-brand-logo" />
            <span className="auth-brand-slogan">
              El talento de tu zona a un click de distancia.
            </span>
          </div>

          <p className="oy-display auth-wordmark" aria-label="OficioYa">
            <span className="auth-wordmark-oficio">Oficio</span>
            <span className="auth-wordmark-ya">Ya</span>
          </p>

          <div className="auth-mascot-stage">
            <span className="oy-sticker oy-sticker--amarillo auth-sticker auth-sticker--a" aria-hidden="true">
              <Wrench size={24} />
            </span>
            <span className="oy-sticker oy-sticker--esmeralda auth-sticker auth-sticker--b" aria-hidden="true">
              <ShieldCheck size={24} />
            </span>
            <span className="oy-sticker oy-sticker--blanco oy-sticker--pill auth-sticker auth-sticker--c" aria-hidden="true">
              <Star size={14} /> 4,9
            </span>
            <img
              src={mascotImg}
              alt="Many, la mascota de OficioYa"
              className={`auth-mascot-img auth-mascot--${mascotPose}`}
            />
          </div>

          <p className="auth-poster-foot">{posterFoot}</p>
        </aside>

        {/* ── Formulario ── */}
        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-form-wrap">
            <header className="auth-form-header">
              <span className="oy-eyebrow auth-eyebrow">
                {mode === 'login' && 'Acceso'}
                {mode === 'register' && 'Registro'}
                {mode === 'verify' && 'Paso 2 de 2'}
                {(mode === 'recover' || mode === 'recover-sent' || mode === 'reset') && 'Recuperar acceso'}
              </span>
              <h1 id="auth-title" className="oy-display auth-form-title">{headings[mode].title}</h1>
              <p className="auth-form-sub">{headings[mode].sub}</p>
            </header>

            {(mode === 'login' || mode === 'register') && (
              <>
                {/* Selector de rol inicial (OFY-55) */}
                {mode === 'register' && (
                  <div className="auth-role" role="radiogroup" aria-label="¿Cómo quieres usar OficioYa?">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selectedRole === 'seeker'}
                      onClick={() => setSelectedRole('seeker')}
                      className="auth-role-btn auth-role-btn--seeker"
                    >
                      Busco servicios
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selectedRole === 'provider'}
                      onClick={() => setSelectedRole('provider')}
                      className="auth-role-btn auth-role-btn--provider"
                    >
                      Ofrezco mis servicios
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                  {mode === 'register' && (
                    <div className="auth-field">
                      <label className="auth-label" htmlFor="auth-name">Nombre completo</label>
                      <input
                        id="auth-name"
                        type="text"
                        className="input-base auth-input"
                        placeholder="Ej: Carlos Restrepo"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        autoComplete="name"
                      />
                    </div>
                  )}

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="auth-email">Correo electrónico</label>
                    <input
                      id="auth-email"
                      type="email"
                      className="input-base auth-input"
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      autoComplete="email"
                    />
                  </div>

                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label" htmlFor="auth-pass">Contraseña</label>
                      {mode === 'login' && (
                        <button type="button" className="auth-link auth-link--small" onClick={() => { setRecoverTarget(email); goTo('recover'); }}>
                          ¿Olvidaste tu contraseña?
                        </button>
                      )}
                    </div>
                    <div className="auth-pass-wrap">
                      <input
                        id="auth-pass"
                        type={showPass ? 'text' : 'password'}
                        className="input-base auth-input"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        className="auth-pass-toggle"
                        onClick={() => setShowPass(s => !s)}
                        aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        aria-pressed={showPass}
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Canal de verificación (OFY-40) */}
                  {mode === 'register' && (
                    <fieldset className="auth-field auth-fieldset">
                      <legend className="auth-label">Verificar con</legend>
                      <div className="auth-channel">
                        <button
                          type="button"
                          className="oy-chip"
                          aria-pressed={channel === 'email'}
                          onClick={() => setChannel('email')}
                        >
                          <Mail size={15} /> Correo
                        </button>
                        <button
                          type="button"
                          className="oy-chip"
                          aria-pressed={channel === 'sms'}
                          onClick={() => setChannel('sms')}
                        >
                          <Smartphone size={15} /> SMS
                        </button>
                      </div>
                      {channel === 'sms' && (
                        <>
                          <label className="auth-label auth-label--sub" htmlFor="auth-phone">Celular</label>
                          <input
                            id="auth-phone"
                            type="tel"
                            inputMode="tel"
                            className="input-base auth-input"
                            placeholder="+57 300 000 0000"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            autoComplete="tel"
                          />
                        </>
                      )}
                    </fieldset>
                  )}

                  {error && <p className="auth-error" role="alert">{error}</p>}
                  {notice && <p className="auth-notice" role="status">{notice}</p>}

                  <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                    {loading ? (
                      <span className="auth-spinner" aria-label="Cargando" />
                    ) : (
                      <>
                        {mode === 'login' ? 'Iniciar sesión' : 'Crear mi cuenta'}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  {/* Demo rápido */}
                  <button
                    type="button"
                    className="auth-demo-btn"
                    onClick={() => { setEmail('juan.perez@correo.com'); setPassword('demo123'); setError(''); }}
                  >
                    <Zap size={14} /> Usar cuenta demo
                  </button>
                </form>

                <p className="auth-switch">
                  {mode === 'login' ? (
                    <>¿No tienes cuenta?{' '}
                      <button type="button" className="auth-link" onClick={() => goTo('register')}>
                        Regístrate gratis
                      </button>
                    </>
                  ) : (
                    <>¿Ya tienes cuenta?{' '}
                      <button type="button" className="auth-link" onClick={() => goTo('login')}>
                        Inicia sesión
                      </button>
                    </>
                  )}
                </p>
              </>
            )}

            {/* ── Verificación por código (OFY-40) ── */}
            {mode === 'verify' && (
              <form onSubmit={handleVerify} className="auth-form" noValidate>
                <div className="auth-code-note">
                  {channel === 'sms' ? <Smartphone size={18} /> : <Mail size={18} />}
                  <span>
                    Modo demostración: tu código es <strong>{sentCode}</strong>
                  </span>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-code">Código de verificación</label>
                  <input
                    id="auth-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="input-base auth-input auth-code-input"
                    placeholder="000000"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </div>

                {error && <p className="auth-error" role="alert">{error}</p>}
                {notice && <p className="auth-notice" role="status">{notice}</p>}

                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? <span className="auth-spinner" aria-label="Cargando" /> : <>Verificar y crear cuenta <ArrowRight size={16} /></>}
                </button>

                <div className="auth-row">
                  <button type="button" className="auth-link" onClick={() => goTo('register')}>
                    <ArrowLeft size={14} /> Cambiar datos
                  </button>
                  <button type="button" className="auth-link" onClick={handleResend} disabled={loading}>
                    Reenviar código
                  </button>
                </div>
              </form>
            )}

            {/* ── Recuperar cuenta (OFY-75) ── */}
            {mode === 'recover' && (
              <form onSubmit={handleRecover} className="auth-form" noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-recover">Correo o celular verificado</label>
                  <input
                    id="auth-recover"
                    type="text"
                    className="input-base auth-input"
                    placeholder="tu@correo.com o +57 300 000 0000"
                    value={recoverTarget}
                    onChange={e => setRecoverTarget(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoComplete="email"
                  />
                </div>

                {error && <p className="auth-error" role="alert">{error}</p>}

                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? <span className="auth-spinner" aria-label="Cargando" /> : <>Enviar enlace <KeyRound size={16} /></>}
                </button>

                <button type="button" className="auth-link auth-back" onClick={() => goTo('login')}>
                  <ArrowLeft size={14} /> Volver a iniciar sesión
                </button>
              </form>
            )}

            {mode === 'recover-sent' && (
              <div className="auth-form">
                <div className="auth-success" role="status">
                  <CheckCircle2 size={22} />
                  <p>
                    Si <strong>{recoverTarget.trim()}</strong> está registrado, recibirás un enlace
                    {EMAIL_RE.test(recoverTarget.trim()) ? ' en tu correo' : ' por SMS'} para crear una contraseña nueva.
                    Expira en 30 minutos.
                  </p>
                </div>
                {recoverAccount ? (
                  <div className="auth-code-note auth-demo-link">
                    <Mail size={18} aria-hidden="true" />
                    <span>
                      Modo demostración: no enviamos mensajes reales.{' '}
                      <button type="button" className="auth-link" onClick={openResetLink}>
                        Abrir el enlace de recuperación <ArrowRight size={14} aria-hidden="true" />
                      </button>
                    </span>
                  </div>
                ) : (
                  <p className="auth-code-note">
                    Modo demostración: no hay ninguna cuenta con ese correo o celular. Revisa el dato o regístrate gratis.
                  </p>
                )}
                <button type="button" className="btn btn-primary auth-submit" onClick={() => goTo('login')}>
                  Volver a iniciar sesión <ArrowRight size={16} />
                </button>
                <button type="button" className="auth-link auth-back" onClick={() => goTo('recover')}>
                  No me llegó, intentar de nuevo
                </button>
              </div>
            )}

            {/* ── Nueva contraseña desde el enlace (OFY-75) ── */}
            {mode === 'reset' && (
              <form onSubmit={handleReset} className="auth-form" noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-new-pass">Contraseña nueva</label>
                  <div className="auth-pass-wrap">
                    <input
                      id="auth-new-pass"
                      type={showPass ? 'text' : 'password'}
                      className="input-base auth-input"
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="auth-pass-toggle"
                      onClick={() => setShowPass(s => !s)}
                      aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      aria-pressed={showPass}
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-confirm-pass">Confirma la contraseña</label>
                  <input
                    id="auth-confirm-pass"
                    type={showPass ? 'text' : 'password'}
                    className="input-base auth-input"
                    placeholder="Escríbela de nuevo"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoComplete="new-password"
                  />
                </div>

                {error && <p className="auth-error" role="alert">{error}</p>}

                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? <span className="auth-spinner" aria-label="Cargando" /> : <>Guardar contraseña <KeyRound size={16} /></>}
                </button>

                <button type="button" className="auth-link auth-back" onClick={() => goTo('login')}>
                  <ArrowLeft size={14} /> Volver a iniciar sesión
                </button>
              </form>
            )}

            <p className="auth-footer-note">
              Proyecto DOSW · Escuela Colombiana de Ingeniería
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
