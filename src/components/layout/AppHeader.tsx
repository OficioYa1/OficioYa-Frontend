import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { UserRole } from '../../types';
import {
  MapPin,
  CheckCircle2,
  Home,
  User,
  Navigation,
  Search,
  FileText,
  MessageCircle,
  Bell,
  ChevronDown,
  Briefcase,
  Inbox
} from 'lucide-react';
import { Logo, StaggeredMenu } from '../ui';
import type { StaggeredMenuItem } from '../ui';
import { AppMenu } from './AppMenu';

interface AppHeaderProps {
  onOpenLanding: () => void;
  onOpenSettings: () => void;
  onOpenAdminModeration?: () => void;
  onRefreshGps?: () => void;
  hasGps: boolean;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount: number;
  isChatOpen?: boolean;
  onToggleChat?: () => void;
  notificationCount?: number;
  onOpenNotifications?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenLanding,
  onOpenSettings,
  onRefreshGps,
  hasGps,
  currentTab,
  onSelectTab,
  unreadCount,
  isChatOpen,
  onToggleChat,
  notificationCount = 0,
  onOpenNotifications
}) => {
  const { role, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showRoleDropdown, setShowRoleDropdown] = React.useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
  };

  // Pestañas del rol actual: las comparten el nav de iconos (escritorio) y el StaggeredMenu (móvil).
  const navTabs: { id: string; label: string; icon: StaggeredMenuItem['icon']; badge?: number }[] =
    role === 'seeker'
      ? [
          { id: 'inicio_seeker', label: 'Inicio', icon: Home },
          { id: 'buscar', label: 'Buscar profesionales', icon: Search },
          { id: 'solicitudes', label: 'Mis solicitudes', icon: FileText },
          { id: 'mensajes', label: 'Mensajes', icon: MessageCircle, badge: unreadCount }
        ]
      : [
          { id: 'inicio_pro', label: 'Inicio', icon: Home },
          { id: 'oportunidades', label: 'Oportunidades', icon: Search },
          { id: 'clientes', label: 'Mis clientes', icon: Briefcase },
          { id: 'alertas', label: 'Alertas', icon: Inbox },
          { id: 'mensajes', label: 'Mensajes', icon: MessageCircle, badge: unreadCount }
        ];

  const handleNavSelect = (id: string) => {
    if (id === 'mensajes') onToggleChat?.();
    else onSelectTab(id);
  };

  const menuItems: StaggeredMenuItem[] = navTabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    badge: tab.badge,
    active: tab.id === 'mensajes' ? !!isChatOpen : currentTab === tab.id
  }));

  return (
    <header
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '10px 0'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onOpenLanding}
            aria-label="OficioYa, ir al inicio"
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Logo size={34} />
          </button>
          {/* Indicador de ubicación */}
          <button
            onClick={onRefreshGps}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px', borderRadius: '999px',
              background: 'var(--color-surface-hover)',
              fontSize: '11px', fontWeight: 500, color: 'var(--color-text-muted)',
              cursor: 'pointer', fontFamily: 'var(--font-ui)',
            }}
            title="Actualizar ubicación"
            aria-label="Ubicación: Bogotá D.C. Actualizar ubicación"
          >
            <MapPin size={11} color="var(--role-primary)" />
            <span className="hide-on-mobile" style={{ whiteSpace: 'nowrap' }}>Bogotá D.C.</span>
            {hasGps ? <CheckCircle2 size={11} color="#10B981" /> : <Navigation size={10} color="var(--color-text-muted)" />}
          </button>
        </div>

        {/* Navegación Principal Minimalista (Iconos) — escritorio */}
        <nav className="hide-on-mobile" aria-label="Navegación principal" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {navTabs.map(tab => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              current={tab.id === 'mensajes' ? (isChatOpen ? 'mensajes' : '') : currentTab}
              onSelect={handleNavSelect}
              badge={tab.badge}
            />
          ))}
        </nav>

        {/* Espaciador flexible para empujar el resto a la derecha si es necesario, 
            aunque 'space-between' ya lo hace, pero aquí podemos agrupar las acciones. */}
        <div style={{ flex: 1 }}></div>

        {/* Herramientas de Accesibilidad, Moderación y Usuario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Menú principal en móvil (≤ 767 px); en escritorio queda el nav de iconos */}
          <StaggeredMenu
            items={menuItems}
            onSelect={handleNavSelect}
            mobileOnly
            title={role === 'seeker' ? 'Navegación · Contratante' : 'Navegación · Profesional'}
          />
          {onOpenNotifications && (
            <TabButton
              id="notificaciones"
              label={notificationCount > 0 ? `Notificaciones (${notificationCount} sin leer)` : 'Notificaciones'}
              icon={Bell}
              current=""
              onSelect={onOpenNotifications}
              badge={notificationCount}
            />
          )}
          
          {/* Selector de Rol Compacto y Configuración */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, background: 'var(--color-surface)' }}
              title="Menú"
              aria-haspopup="true"
              aria-expanded={showRoleDropdown}
              aria-controls="app-menu"
            >
              <User size={16} />
              <span className="hide-on-mobile">{role === 'seeker' ? 'Contratante' : 'Profesional'}</span>
              <ChevronDown size={14} style={{ opacity: 0.5 }} />
            </button>

            {showRoleDropdown && (
              <AppMenu
                role={role}
                theme={theme}
                currentTab={currentTab}
                unreadCount={unreadCount}
                notificationCount={notificationCount}
                onClose={() => setShowRoleDropdown(false)}
                onSwitchRole={handleRoleChange}
                onSelectTab={onSelectTab}
                onToggleChat={onToggleChat}
                onOpenSettings={onOpenSettings}
                onOpenNotifications={onOpenNotifications}
                onToggleTheme={toggleTheme}
                onLogout={logout}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// --- Componente Auxiliar para Pestañas Iconográficas ---
const TabButton = ({ id, label, icon: Icon, current, onSelect, badge = 0 }: any) => {
  const active = current === id;
  return (
    <button
      onClick={() => onSelect(id)}
      title={label}
      style={{
        background: active ? 'var(--color-surface)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: active ? 'var(--role-primary)' : 'var(--color-text-muted)',
        padding: '8px 12px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget.style.background = 'var(--color-surface-hover)');
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget.style.background = 'transparent');
      }}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      {active && <span style={{ fontSize: '13.5px', fontWeight: 700, letterSpacing: '-0.3px' }}>{label}</span>}
      {badge > 0 && (
        <span style={{ position: 'absolute', top: '2px', right: '4px', background: 'var(--color-danger)', color: 'white', borderRadius: '50%', padding: '1px 5px', fontSize: '10px', fontWeight: 800 }}>
          {badge}
        </span>
      )}
    </button>
  );
};
