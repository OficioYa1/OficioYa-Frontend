import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { ServiceRequest } from '../../types';
import {
  Settings,
  Phone,
  MapPin,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';

interface UserProfileViewProps {
  services: ServiceRequest[];
  onOpenSettings: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  services,
  onOpenSettings,
  onNavigateToTab
}) => {
  const { user, role } = useAuth();
  const { theme, fontScale } = useTheme();

  return (
    <div className="user-profile container" style={{ padding: '24px 0 60px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Tarjeta de Cabecera del Perfil */}
        <div
          className="card"
          style={{
            borderRadius: '24px',
            padding: '28px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            background: 'var(--color-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: user?.avatarColor || 'var(--role-primary)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '26px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OY'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.4rem' }}>{user?.name || 'Usuario'}</h2>
                <span className="badge badge-verified">
                  <ShieldCheck size={12} /> Verificado
                </span>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {user?.email}
              </span>

              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={13} /> {user?.phone || '+57 300 123 4567'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} /> {user?.city || 'Bogotá D.C., Colombia'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onOpenSettings}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Settings size={16} /> Configuración
            </button>
          </div>
        </div>

        {/* Sección según Rol (Contratante vs Profesional) */}
        {role === 'seeker' ? (
          <div className="card" style={{ padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Resumen de Contratante</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Historial de servicios solicitados en tu zona
                </span>
              </div>
              <button
                onClick={() => onNavigateToTab('servicios')}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Ver todos ({services.length})
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'var(--color-surface-hover)', padding: '14px', borderRadius: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Servicios Activos</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                  {services.filter(s => s.status === 'en_curso').length}
                </span>
              </div>

              <div style={{ background: 'var(--color-surface-hover)', padding: '14px', borderRadius: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Servicios Concluidos</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-success)' }}>
                  {services.filter(s => s.status === 'finalizado').length}
                </span>
              </div>

              <div style={{ background: 'var(--color-surface-hover)', padding: '14px', borderRadius: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Garantía Digital</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <ShieldCheck size={16} /> 100% Protegida
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '24px', borderRadius: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Perfil Profesional</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Oficios técnicos publicados y validados
                </span>
              </div>
              <button
                onClick={() => onNavigateToTab('dashboard-pro')}
                className="btn btn-primary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <Briefcase size={14} /> Ir a Mi Taller
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--color-surface-hover)', padding: '14px', borderRadius: '14px' }}>
              <MascotAvatar trade="electricidad" size="sm" />
              <div>
                <span style={{ fontWeight: 700, fontSize: '14px', display: 'block' }}>
                  Electricista & Mantenimiento General
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Tarifa base: $45.000 COP/h • Cobertura: Bogotá D.C. & Sabana Centro
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tarjeta de Preferencias de Accesibilidad Rápidas */}
        <div className="card" style={{ padding: '20px', borderRadius: '20px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Ajustes de Interfaz Activos</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px' }}>
            <span style={{ background: 'var(--color-surface-hover)', padding: '6px 12px', borderRadius: '999px' }}>
              Tema: <strong>{theme === 'light' ? 'Claro ☀️' : 'Oscuro 🌙'}</strong>
            </span>
            <span style={{ background: 'var(--color-surface-hover)', padding: '6px 12px', borderRadius: '999px' }}>
              Escala de Fuente: <strong>{fontScale.toUpperCase()}</strong>
            </span>
            <span style={{ background: 'var(--color-surface-hover)', padding: '6px 12px', borderRadius: '999px' }}>
              Rol Activo: <strong>{role === 'seeker' ? 'Contratante' : 'Profesional'}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
