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
  Inbox,
  Sparkles
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
  onLogout?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenLanding,
  onOpenSettings,
  onOpenAdminModeration,
  onRefreshGps,
  hasGps,
  currentTab,
  onSelectTab,
  unreadCount,
  isChatOpen: _isChatOpen,
  onToggleChat,
  notificationCount = 0,
  onOpenNotifications,
  onLogout
}) => {
  const { user, role, switchRole, logout, loginAsDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showRoleDropdown, setShowRoleDropdown] = React.useState(false);
  const [showDemoMenu, setShowDemoMenu] = React.useState(false);

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
    onSelectTab(id);
  };

  const menuItems: StaggeredMenuItem[] = navTabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    badge: tab.badge,
    active: currentTab === tab.id
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
              current={currentTab}
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

          {/* OFY-DEMO: Selector rápido para la feria de evaluación DOSW */}
          <div className="app-header__demo-wrap">
            <button
              type="button"
              className="app-header__demo-btn"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              title="Selector de demostración para jurados DOSW"
              aria-label="Abrir selector de modo demo"
              aria-expanded={showDemoMenu}
            >
              <Sparkles size={14} aria-hidden="true" />
              <span>Modo Demo</span>
            </button>
            {showDemoMenu && (
              <div className="app-header__demo-dropdown" role="menu">
                <div className="app-header__demo-header">
                  <strong>Demostración Rápida DOSW</strong>
                  <span>Alterna roles en 1 clic</span>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  className="app-header__demo-item app-header__demo-item--carlos"
                  onClick={async () => {
                    setShowDemoMenu(false);
                    await loginAsDemo('carlos');
                    onSelectTab('inicio_pro');
                  }}
                >
                  <span className="app-header__demo-badge app-header__demo-badge--orange">Don Carlos</span>
                  <div className="app-header__demo-item-text">
                    <strong>Don Carlos Mendoza</strong>
                    <small>Plomero · Verificado · Disponible ya</small>
                  </div>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="app-header__demo-item"
                  onClick={async () => {
                    setShowDemoMenu(false);
                    await loginAsDemo('seeker');
                    onSelectTab('inicio_seeker');
                  }}
                >
                  <span className="app-header__demo-badge app-header__demo-badge--blue">Cliente</span>
                  <div className="app-header__demo-item-text">
                    <strong>Juan Pérez</strong>
                    <small>Contratante con solicitudes activas</small>
                  </div>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="app-header__demo-item"
                  onClick={async () => {
                    setShowDemoMenu(false);
                    await loginAsDemo('guest');
                    onSelectTab('buscar');
                  }}
                >
                  <span className="app-header__demo-badge">Invitado</span>
                  <div className="app-header__demo-item-text">
                    <strong>Modo Explorador</strong>
                    <small>Navega el directorio sin cuenta</small>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Menú de cuenta: rol, ajustes y sesión (o acceso a login si es invitado) */}
          <div className="app-header__account-wrap">
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  onSelectTab('login');
                } else {
                  setShowRoleDropdown(!showRoleDropdown);
                }
              }}
              className="app-header__account"
              title={user ? "Menú de cuenta" : "Iniciar sesión"}
              aria-label={user ? `Menú de cuenta, rol ${role === 'seeker' ? 'Contratante' : 'Profesional'}` : "Iniciar sesión o registrarse"}
              aria-haspopup={user ? "true" : undefined}
              aria-expanded={user ? showRoleDropdown : undefined}
              aria-controls={user ? "app-menu" : undefined}
            >
              <User size={16} aria-hidden="true" />
              <span className="app-header__account-text">
                {user ? (role === 'seeker' ? 'Contratante' : 'Profesional') : 'Ingresar'}
              </span>
              {user && <ChevronDown size={14} className="app-header__chevron" aria-hidden="true" />}
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
                onOpenAdminModeration={onOpenAdminModeration}
                onOpenNotifications={onOpenNotifications}
                onToggleTheme={toggleTheme}
                onLogout={() => {
                  logout();
                  if (onLogout) onLogout();
                  else if (onOpenLanding) onOpenLanding();
                }}
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
      <span className="app-header__tab-icon-wrap">
        <Icon size={20} strokeWidth={active ? 2.5 : 2} aria-hidden={true} />
        {badge > 0 && <span className="app-header__badge" aria-hidden="true">{badge}</span>}
      </span>
      {active && <span className="app-header__tab-label">{label}</span>}
    </button>
  );
};
