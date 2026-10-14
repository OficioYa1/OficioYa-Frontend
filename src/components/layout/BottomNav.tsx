import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, MessageSquare, ClipboardList, Briefcase, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  unreadCount = 0
}) => {
  const { role } = useAuth();

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 4px',
        zIndex: 900
      }}
    >
      <button
        onClick={() => onSelectTab('directorio')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: currentTab === 'directorio' ? 'var(--role-primary)' : 'var(--color-text-muted)',
          fontSize: '11px',
          fontWeight: currentTab === 'directorio' ? 700 : 500
        }}
      >
        <Search size={20} />
        <span>Explorar</span>
      </button>

      {role === 'provider' && (
        <button
          onClick={() => onSelectTab('dashboard-pro')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            color: currentTab === 'dashboard-pro' ? 'var(--role-primary)' : 'var(--color-text-muted)',
            fontSize: '11px',
            fontWeight: currentTab === 'dashboard-pro' ? 700 : 500
          }}
        >
          <Briefcase size={20} />
          <span>Mi Taller</span>
        </button>
      )}

      <button
        onClick={() => onSelectTab('servicios')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: currentTab === 'servicios' ? 'var(--role-primary)' : 'var(--color-text-muted)',
          fontSize: '11px',
          fontWeight: currentTab === 'servicios' ? 700 : 500
        }}
      >
        <ClipboardList size={20} />
        <span>Servicios</span>
      </button>

      <button
        onClick={() => onSelectTab('mensajes')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          position: 'relative',
          color: currentTab === 'mensajes' ? 'var(--role-primary)' : 'var(--color-text-muted)',
          fontSize: '11px',
          fontWeight: currentTab === 'mensajes' ? 700 : 500
        }}
      >
        <MessageSquare size={20} />
        <span>Mensajes</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '8px',
              background: 'var(--color-danger)',
              color: '#FFFFFF',
              borderRadius: '999px',
              fontSize: '10px',
              padding: '1px 5px',
              fontWeight: 800
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('perfil')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: currentTab === 'perfil' ? 'var(--role-primary)' : 'var(--color-text-muted)',
          fontSize: '11px',
          fontWeight: currentTab === 'perfil' ? 700 : 500
        }}
      >
        <User size={20} />
        <span>Perfil</span>
      </button>
    </nav>
  );
};
