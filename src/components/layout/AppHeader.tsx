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
import type { LucideIcon } from 'lucide-react';
import { Logo, StaggeredMenu } from '../ui';
import type { StaggeredMenuItem } from '../ui';
import { AppMenu } from './AppMenu';
import './AppHeader.css';

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
  const navTabs: { id: string; label: string; icon: LucideIcon; badge?: number }[] =
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
    <header className="app-header">
      <div className="container app-header__bar">
        <div className="app-header__brand">
          <button type="button" className="app-header__logo" onClick={onOpenLanding} aria-label="OficioYa, ir al inicio">
            <Logo size={34} />
          </button>
          <button
            type="button"
            className="app-header__gps"
            onClick={onRefreshGps}
            title="Actualizar ubicación"
            aria-label="Ubicación: Bogotá D.C. Actualizar ubicación"
          >
            <MapPin size={12} aria-hidden="true" />
            <span className="app-header__gps-text">Bogotá D.C.</span>
            {hasGps
              ? <CheckCircle2 size={12} className="app-header__gps-ok" aria-hidden="true" />
              : <Navigation size={11} aria-hidden="true" />}
          </button>
        </div>

        {/* Navegación principal en píldora — escritorio */}
        <nav className="app-header__nav" aria-label="Navegación principal">
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

        <div className="app-header__actions">
          {/* Menú principal en móvil (≤ 767 px); en escritorio queda el nav en píldora */}
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

          {/* Menú de cuenta: rol, ajustes y sesión */}
          <div className="app-header__account-wrap">
            <button
              type="button"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="app-header__account"
              title="Menú de cuenta"
              aria-label={`Menú de cuenta, rol ${role === 'seeker' ? 'Contratante' : 'Profesional'}`}
              aria-haspopup="true"
              aria-expanded={showRoleDropdown}
              aria-controls="app-menu"
            >
              <User size={16} aria-hidden="true" />
              <span className="app-header__account-text">{role === 'seeker' ? 'Contratante' : 'Profesional'}</span>
              <ChevronDown size={14} className="app-header__chevron" aria-hidden="true" />
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
interface TabButtonProps {
  id: string;
  label: string;
  icon: LucideIcon;
  current: string;
  onSelect: (id: string) => void;
  badge?: number;
}

const TabButton = ({ id, label, icon: Icon, current, onSelect, badge = 0 }: TabButtonProps) => {
  const active = current === id;
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={`app-header__tab${active ? ' app-header__tab--active' : ''}`}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 2} aria-hidden={true} />
      {active && <span className="app-header__tab-label">{label}</span>}
      {badge > 0 && <span className="app-header__badge" aria-hidden="true">{badge}</span>}
    </button>
  );
};
