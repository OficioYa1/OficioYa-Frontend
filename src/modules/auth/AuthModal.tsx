import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { evaluatePasswordStrength } from '../../utils/jwt';
import type { UserRole } from '../../types';
import { X, Lock, Mail, User, Phone, CheckCircle2, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp' | 'recovery'>('login');
  
  // Datos de formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+57 310 987 6543');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('seeker');

  // RF-40: Simulación de código OTP de 4 dígitos
  const [otpCode, setOtpCode] = useState(['4', '8', '2', '1']);
  const [otpEntered, setOtpEntered] = useState('');
  const [otpError, setOtpError] = useState(false);

  // RF-75: Recuperación de contraseña
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const strength = evaluatePasswordStrength(password);

  const handleRegisterPreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    // Pasar a verificación OTP (RF-40)
    setAuthMode('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpEntered.length !== 4) {
      setOtpError(true);
      return;
    }
    // Completar registro con cuenta verificada (RF-40)
    await register(name, email, password, role);
    onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    await login(email, password);
    onClose();
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    setRecoverySent(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1100,
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
          maxWidth: '460px',
          borderRadius: '24px',
          padding: '28px',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '18px', right: '18px', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* Pantalla 1: Iniciar Sesión (RF-50) */}
        {authMode === 'login' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'inline-block', marginBottom: '8px' }}>
                <MascotAvatar size="sm" />
              </div>
              <h3 style={{ fontSize: '1.4rem' }}>Iniciar Sesión (RF-50)</h3>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Ingresa con tu correo registrado para obtener tu JWT autenticado
              </span>
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Correo electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="email"
                    className="input-base"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>Contraseña segura</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('recovery');
                      setRecoverySent(false);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--role-primary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ¿Olvidaste tu contraseña? (RF-75)
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="password"
                    className="input-base"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '12px', fontSize: '14px', fontWeight: 800, marginTop: '6px' }}
              >
                Autenticar con JWT HS256 (RF-50)
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  ¿No tienes una cuenta aún?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    style={{ background: 'none', border: 'none', color: 'var(--role-primary)', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Registrarme (RF-49)
                  </button>
                </span>
              </div>
            </form>
          </div>
        )}

        {/* Pantalla 2: Registro de Usuario (RF-49) */}
        {authMode === 'register' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'inline-block', marginBottom: '8px' }}>
                <MascotAvatar size="sm" />
              </div>
              <h3 style={{ fontSize: '1.4rem' }}>Registrar Nueva Cuenta (RF-49)</h3>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Crea tu usuario seguro con verificación telefónica o correo
              </span>
            </div>

            <form onSubmit={handleRegisterPreSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Nombre completo
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    className="input-base"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej. Mateo Restrepo"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  ¿Cómo usarás OficioYa? (RF-55)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setRole('seeker')}
                    style={{
                      padding: '8px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: role === 'seeker' ? '#1E3A8A' : 'var(--color-surface)',
                      color: role === 'seeker' ? '#FFF' : 'var(--color-text-main)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    Contratante
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('provider')}
                    style={{
                      padding: '8px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: role === 'provider' ? '#EA580C' : 'var(--color-surface)',
                      color: role === 'provider' ? '#FFF' : 'var(--color-text-main)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    Profesional
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Correo electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="email"
                    className="input-base"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="usuario@correo.com"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Celular para verificación por código (RF-40)
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="tel"
                    className="input-base"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+57 300 000 0000"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Contraseña segura (8+ caracteres, mayúsculas y símbolos)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="password"
                    className="input-base"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>

                {password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ height: '5px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(strength.score / 5) * 100}%`,
                          background: strength.color,
                          transition: 'all 0.3s'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: strength.color, fontWeight: 700, marginTop: '4px', display: 'block' }}>
                      Fortaleza: {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '12px', fontSize: '14px', fontWeight: 800, marginTop: '6px' }}
              >
                Continuar a Verificación de Código (RF-40) &rarr;
              </button>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    style={{ background: 'none', border: 'none', color: 'var(--role-primary)', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Iniciar sesión
                  </button>
                </span>
              </div>
            </form>
          </div>
        )}

        {/* Pantalla 3: Verificación por Código OTP (RF-40) */}
        {authMode === 'otp' && (
          <div>
            <button
              onClick={() => setAuthMode('register')}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer', marginBottom: '12px' }}
            >
              <ArrowLeft size={14} /> Volver
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem' }}>Verificación de Identidad (RF-40)</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                Enviamos un código de seguridad de 4 dígitos a <strong>{phone}</strong> y a <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Ingresa el código OTP (Código de prueba: <strong>4821</strong>)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  className="input-base"
                  value={otpEntered}
                  onChange={e => {
                    setOtpEntered(e.target.value);
                    setOtpError(false);
                  }}
                  placeholder="4821"
                  style={{
                    fontSize: '24px',
                    letterSpacing: '12px',
                    textAlign: 'center',
                    fontWeight: 900,
                    width: '180px',
                    margin: '0 auto',
                    height: '50px'
                  }}
                  autoFocus
                />
                {otpError && (
                  <span style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: 700, marginTop: '6px', display: 'block' }}>
                    Código incorrecto. Ingresa 4821 para continuar.
                  </span>
                )}
              </div>

              <div style={{ background: '#ECFDF5', padding: '10px 14px', borderRadius: '10px', fontSize: '11px', color: '#065F46' }}>
                ✓ Esta confirmación valida la propiedad del número/correo y habilita tu perfil verificado en Bogotá (RF-40).
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '12px', fontSize: '14px', fontWeight: 800 }}
              >
                Confirmar y Crear Perfil (RF-40)
              </button>
            </form>
          </div>
        )}

        {/* Pantalla 4: Recuperación de Cuenta (RF-75) */}
        {authMode === 'recovery' && (
          <div>
            <button
              onClick={() => setAuthMode('login')}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer', marginBottom: '12px' }}
            >
              <ArrowLeft size={14} /> Volver a iniciar sesión
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <KeyRound size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem' }}>Recuperar Cuenta (RF-75)</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                Restablece tu acceso mediante un enlace al correo o SMS verificado
              </p>
            </div>

            {!recoverySent ? (
              <form onSubmit={handleRecoverySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Correo electrónico o celular verificado
                  </label>
                  <input
                    type="email"
                    className="input-base"
                    placeholder="usuario@correo.com"
                    value={recoveryEmail}
                    onChange={e => setRecoveryEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '12px', fontSize: '14px', fontWeight: 800 }}
                >
                  Enviar Enlace de Recuperación (RF-75)
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>¡Enlace Enviado!</h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                  Hemos enviado un enlace seguro a <strong>{recoveryEmail}</strong> para que restablezcas tu contraseña.
                </p>
                <button
                  onClick={() => setAuthMode('login')}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Regresar a Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
