import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import './AuthPage.css';

interface AuthPageProps {
  onAuthSuccess: () => void;
  initialRole?: 'seeker' | 'provider';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, initialRole = 'seeker' }) => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mascotPose, setMascotPose] = useState<'wave' | 'float' | 'work'>('float');

  const mascotImg =
    selectedRole === 'provider'
      ? '/assets/mascot/many-electricista.png'
      : '/assets/mascot/many-wave.png';

  const handleFocus = () => setMascotPose('wave');
  const handleBlur  = () => setMascotPose('float');

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
    setLoading(true);
    setMascotPose('work');
    try {
      let ok: boolean;
      if (mode === 'login') {
        ok = await login(email.trim(), password);
      } else {
        ok = await register(name.trim(), email.trim(), password, selectedRole);
      }
      if (ok) {
        onAuthSuccess();
      } else {
        setError('Credenciales incorrectas. Intenta de nuevo.');
        setMascotPose('float');
      }
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.');
      setMascotPose('float');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── Panel izquierdo: Many animado ── */}
      <div className={`auth-left auth-left--${selectedRole}`}>
        {/* Gradiente de fondo */}
        <div className="auth-left-glow" />

        {/* Marca */}
        <div className="auth-brand">
          <img src="/assets/mascot/logo1.0.png" alt="OficioYa" className="auth-brand-logo" />
          <div>
            <span className="auth-brand-name">
              Oficio<span className="auth-brand-ya">Ya</span>
            </span>
            <span className="auth-brand-slogan">
              El talento de tu zona a un click de distancia.
            </span>
          </div>
        </div>

        {/* Many mascota */}
        <div className="auth-mascot-stage">
          <div
            className="auth-mascot-glow"
            style={{ background: selectedRole === 'provider'
              ? 'radial-gradient(circle, rgba(234,88,12,0.35) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,199,44,0.3) 0%, transparent 70%)',
            }}
          />
          <img
            src={mascotImg}
            alt="Many OficioYa"
            className={`auth-mascot-img auth-mascot--${mascotPose}`}
          />
        </div>

        {/* Texto de pie izquierdo */}
        <p className="auth-left-foot">
          {mode === 'register' && selectedRole === 'provider'
            ? 'Registra tu perfil y empieza a recibir clientes en Bogotá.'
            : 'Encuentra al profesional ideal en tu localidad, verificado y con reseñas reales.'}
        </p>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {/* Cabecera del formulario */}
          <div className="auth-form-header">
            <h1 className="auth-form-title">
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
            </h1>
            <p className="auth-form-sub">
              {mode === 'login'
                ? 'Ingresa con tu cuenta de OficioYa'
                : 'Únete a miles de usuarios en Bogotá'}
            </p>
          </div>

          {/* Selector de rol (solo en registro) */}
          {mode === 'register' && (
            <div className="auth-role-toggle">
              <button
                type="button"
                onClick={() => setSelectedRole('seeker')}
                className={`auth-role-btn ${selectedRole === 'seeker' ? 'auth-role-btn--active-seeker' : ''}`}
              >
                Busco servicios
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('provider')}
                className={`auth-role-btn ${selectedRole === 'provider' ? 'auth-role-btn--active-provider' : ''}`}
              >
                Ofrezco mis servicios
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Campo nombre (solo registro) */}
            {mode === 'register' && (
              <div className="auth-field">
                <label className="auth-label">Nombre completo</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Ej: Carlos Restrepo"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Correo electrónico</label>
              <input
                type="email"
                className="auth-input"
                placeholder="tu@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoComplete="email"
              />
            </div>

            {/* Contraseña */}
            <div className="auth-field">
              <label className="auth-label">Contraseña</label>
              <div className="auth-pass-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="auth-input"
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
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="auth-error">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className={`auth-submit auth-submit--${selectedRole}`}
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner" />
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
              onClick={() => { setEmail('juan.perez@correo.com'); setPassword('demo123'); }}
            >
              <Zap size={13} /> Usar cuenta demo
            </button>
          </form>

          {/* Toggle login / registro */}
          <p className="auth-switch">
            {mode === 'login' ? (
              <>¿No tienes cuenta?{' '}
                <span className="auth-switch-link" onClick={() => { setMode('register'); setError(''); }}>
                  Regístrate gratis
                </span>
              </>
            ) : (
              <>¿Ya tienes cuenta?{' '}
                <span className="auth-switch-link" onClick={() => { setMode('login'); setError(''); }}>
                  Inicia sesión
                </span>
              </>
            )}
          </p>

          <p className="auth-footer-note">
            Proyecto DOSW · Escuela Colombiana de Ingeniería
          </p>
        </div>
      </div>
    </div>
  );
};
