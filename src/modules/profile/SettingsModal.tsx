import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { FontScale, UserRole, ComplaintTicket } from '../../types';
import {
  X,
  Phone,
  MapPin,
  Moon,
  Sun,
  LogOut,
  Save,
  CheckCircle2,
  User,
  Camera,
  RefreshCw,
  Trash2,
  AlertTriangle,
  FileText,
  Clock
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { user, role, switchRole, logout, updateUserProfile } = useAuth();
  const { theme, toggleTheme, fontScale, setFontScale } = useTheme();

  // RF-57: Editar información básica del perfil
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+57 300 123 4567');
  const [city, setCity] = useState(user?.city || 'Bogotá D.C.');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // RF-58: Modal de confirmación de eliminación lógica de cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  // RF-73: Estado de reportes enviados por el usuario
  const [userReports, setUserReports] = useState<ComplaintTicket[]>([]);

  useEffect(() => {
    try {
      const tickets: ComplaintTicket[] = JSON.parse(localStorage.getItem('oy-complaints') || '[]');
      setUserReports(tickets);
    } catch (_e) {
      setUserReports([]);
    }
  }, []);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, phone, city, avatarUrl });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // RF-58: Borrado lógico de cuenta propia
  const handleExecuteDeleteAccount = () => {
    updateUserProfile({ isDeleted: true });
    setDeleteConfirmed(true);
    setTimeout(() => {
      logout();
      onClose();
    }, 2000);
  };

  const handleLogout = () => {
    logout();
    onClose();
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
          style={{ position: 'absolute', top: '18px', right: '18px', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.3rem', marginBottom: '18px' }}>Configuración & Perfil</h3>

        {/* Tarjeta de usuario con RF-59 (Avatar) y RF-55 (Alternar Rol) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-surface-hover)',
            padding: '16px',
            borderRadius: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: user?.avatarColor || 'var(--role-primary)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '18px',
                overflow: 'hidden',
                border: '2px solid var(--color-surface)'
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : user?.name ? (
                user.name.slice(0, 2).toUpperCase()
              ) : (
                'OY'
              )}
            </div>

            <div>
              <span style={{ fontWeight: 800, fontSize: '15px', display: 'block' }}>{user?.name}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{user?.email}</span>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '2px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: role === 'seeker' ? 'var(--role-primary)' : 'var(--brand-amber)'
                }}
              >
                Rol activo: {role === 'seeker' ? 'Contratante' : 'Profesional'}
              </span>
            </div>
          </div>

          {/* RF-55: Alternar Rol sin desloguearse */}
          <button
            type="button"
            onClick={() => switchRole(role === 'seeker' ? 'provider' : 'seeker')}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Alternar entre modo contratante y modo profesional (RF-55)"
          >
            <RefreshCw size={13} />
            <span>Cambiar a {role === 'seeker' ? 'Profesional' : 'Contratante'} (RF-55)</span>
          </button>
        </div>

        {/* Formulario de Datos Básicos y Foto de Perfil (RF-57, RF-59) */}
        <form onSubmit={handleSaveContact} style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Editar Información Básica (RF-57)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                Nombre completo
              </label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="input-base"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ paddingLeft: '34px', fontSize: '13px' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                  Teléfono / WhatsApp
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    className="input-base"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ paddingLeft: '34px', fontSize: '13px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                  Ciudad / Localidad
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    className="input-base"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    style={{ paddingLeft: '34px', fontSize: '13px' }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* RF-59: Cargar y actualizar foto de perfil */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                URL Foto de perfil / Avatar (RF-59)
              </label>
              <div style={{ position: 'relative' }}>
                <Camera size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="input-base"
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  style={{ paddingLeft: '34px', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
            {savedSuccess && (
              <span style={{ fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                <CheckCircle2 size={14} /> Guardado con éxito (RF-57)
              </span>
            )}
            <button type="submit" className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }}>
              <Save size={14} /> Guardar Cambios
            </button>
          </div>
        </form>

        {/* RF-73: Consultar el estado de un reporte enviado */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} color="var(--role-primary)" /> Estado de Mis Reportes Enviados (RF-73)
          </h4>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '10px' }}>
            Seguimiento y transparencia de quejas o reportes de reseñas enviadas a moderación.
          </span>

          {userReports.length === 0 ? (
            <div style={{ padding: '12px', background: 'var(--color-surface-hover)', borderRadius: '10px', fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              No has enviado ningún ticket de reporte o queja.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              {userReports.map(ticket => (
                <div
                  key={ticket.id}
                  style={{
                    padding: '10px 12px',
                    background: 'var(--color-surface-hover)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, display: 'block' }}>Caso {ticket.caseNumber}: {ticket.type}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Contra: {ticket.targetWorkerName}</span>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: ticket.status === 'Resuelto' ? '#ECFDF5' : '#EFF6FF',
                      color: ticket.status === 'Resuelto' ? '#065F46' : '#1E40AF',
                      border: '1px solid currentColor'
                    }}
                  >
                    ● {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preferencias de Accesibilidad */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Apariencia & Accesibilidad</h4>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>Tema Visual</span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Modo actual: {theme === 'light' ? 'Claro' : 'Oscuro'}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              <span>{theme === 'light' ? 'Activar Oscuro' : 'Activar Claro'}</span>
            </button>
          </div>

          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Tamaño de Fuente (Accesibilidad)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {[
                { id: 'normal', label: 'Normal (16px)' },
                { id: 'large', label: 'Grande (18px)' },
                { id: 'xlarge', label: 'Muy grande (20px)' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFontScale(opt.id as FontScale)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: fontScale === opt.id ? '2px solid var(--role-primary)' : '1px solid var(--color-border)',
                    background: fontScale === opt.id ? 'var(--role-primary-light)' : 'var(--color-surface)',
                    color: fontScale === opt.id ? 'var(--role-primary)' : 'var(--color-text-main)'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Zona de Peligro: RF-58 Eliminar cuenta propia & Cerrar Sesión */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', color: 'var(--color-text-main)', padding: '10px' }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-danger)',
              fontSize: '12px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Trash2 size={14} /> Eliminar mi cuenta (Borrado lógico RF-58)
          </button>
        </div>

        {/* Modal Confirmación de Borrado Lógico (RF-58) */}
        {showDeleteModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 1200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <div className="card" style={{ width: '100%', maxWidth: '420px', borderRadius: '20px', padding: '24px' }}>
              {!deleteConfirmed ? (
                <div>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <AlertTriangle size={24} />
                  </div>
                  <h4 style={{ fontSize: '1.2rem', textAlign: 'center', marginBottom: '8px' }}>
                    ¿Eliminar tu cuenta? (RF-58)
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.4, marginBottom: '16px' }}>
                    Por privacidad y cumplimiento normativo, se aplicará un <strong>borrado lógico</strong>.
                    Tu cuenta quedará inhabilitada de inmediato, pero el historial de transacciones y calificaciones que otros usuarios recibieron se conservará para no romper la reputación del sistema (RF-58).
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                      Cancelar
                    </button>
                    <button onClick={handleExecuteDeleteAccount} className="btn btn-primary" style={{ flex: 1, background: '#DC2626' }}>
                      Sí, dar de baja
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 10px' }} />
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Cuenta dada de baja</h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Cerrando sesión...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
