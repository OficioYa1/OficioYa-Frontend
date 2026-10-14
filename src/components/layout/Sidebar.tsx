import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, MessageSquare, ClipboardList, Briefcase, User, ShieldCheck } from 'lucide-react';
import { MascotAvatar } from '../mascot/MascotAvatar';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadCount = 0
}) => {
  const { user, role } = useAuth();

  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: '260px',
        flexShrink: 0,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        minHeight: 'calc(100vh - 65px)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Perfil del Usuario Activo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-hover)',
            marginBottom: '16px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: user?.avatarColor || 'var(--role-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '15px'
            }}
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OY'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {user?.name || 'Usuario'}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: role === 'seeker' ? 'var(--role-primary)' : 'var(--brand-amber)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ShieldCheck size={12} /> {role === 'seeker' ? 'Contratante' : 'Profesional Pro'}
            </span>
          </div>
        </div>

        {/* Enlaces de Navegación */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={() => onSelectTab('directorio')}
            className={`btn ${currentTab === 'directorio' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 14px' }}
          >
            <Search size={18} />
            <span>Explorar Profesionales</span>
          </button>

          {role === 'provider' && (
            <button
              onClick={() => onSelectTab('dashboard-pro')}
              className={`btn ${currentTab === 'dashboard-pro' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 14px' }}
            >
              <Briefcase size={18} />
              <span>Mi Taller & Solicitudes</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('servicios')}
            className={`btn ${currentTab === 'servicios' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 14px' }}
          >
            <ClipboardList size={18} />
            <span>Mis Servicios</span>
          </button>

          <button
            onClick={() => onSelectTab('mensajes')}
            className={`btn ${currentTab === 'mensajes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 14px', position: 'relative' }}
          >
            <MessageSquare size={18} />
            <span>Mensajes</span>
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  background: 'var(--color-danger)',
                  color: '#FFFFFF',
                  borderRadius: '999px',
                  fontSize: '11px',
                  padding: '2px 7px',
                  fontWeight: 800
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('perfil')}
            className={`btn ${currentTab === 'perfil' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 14px' }}
          >
            <User size={18} />
            <span>Mi Perfil & Ajustes</span>
          </button>
        </nav>
      </div>

      {/* Mini Banner de Mascota en Sidebar */}
      <div
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 199, 44, 0.2) 0%, transparent 80%)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px',
          textAlign: 'center'
        }}
      >
        <MascotAvatar size="sm" showHalo={true} />
        <span style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginTop: '8px', color: 'var(--color-text-main)' }}>
          OficioYa Bogotá
        </span>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
          Conectando expertos sin intermediarios abusivos.
        </span>
      </div>
    </aside>
  );
};
