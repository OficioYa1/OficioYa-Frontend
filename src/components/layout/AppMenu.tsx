import React, { useEffect } from 'react';
import {
  Home,
  Search,
  FileText,
  MessageCircle,
  Briefcase,
  Inbox,
  User,
  Settings,
  Bell,
  Moon,
  LogOut
} from 'lucide-react';
import type { UserRole } from '../../types';
import { BranchedMenu, SquishSwitch, type BranchedMenuItem } from '../ui';
import './AppMenu.css';

interface AppMenuProps {
  role: UserRole;
  theme: 'light' | 'dark';
  currentTab: string;
  unreadCount: number;
  notificationCount: number;
  onClose: () => void;
  onSwitchRole: (role: UserRole) => void;
  onSelectTab: (tab: string) => void;
  onToggleChat?: () => void;
  onOpenSettings: () => void;
  onOpenNotifications?: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const ICON = 16;

const exploreFor = (role: UserRole, unread: number): BranchedMenuItem => ({
  label: 'Explorar',
  children:
    role === 'seeker'
      ? [
          { value: 'inicio_seeker', label: 'Inicio', icon: <Home size={ICON} /> },
          { value: 'buscar', label: 'Buscar profesionales', icon: <Search size={ICON} /> },
          { value: 'solicitudes', label: 'Mis solicitudes', icon: <FileText size={ICON} /> },
          { value: 'mensajes', label: 'Mensajes', icon: <MessageCircle size={ICON} />, badge: unread }
        ]
      : [
          { value: 'inicio_pro', label: 'Inicio', icon: <Home size={ICON} /> },
          { value: 'oportunidades', label: 'Oportunidades', icon: <Search size={ICON} /> },
          { value: 'clientes', label: 'Mis clientes', icon: <Briefcase size={ICON} /> },
          { value: 'alertas', label: 'Alertas', icon: <Inbox size={ICON} /> },
          { value: 'mensajes', label: 'Mensajes', icon: <MessageCircle size={ICON} />, badge: unread }
        ]
});

/** Menú principal de la cuenta: rol, navegación con ramas y ajustes. */
export const AppMenu: React.FC<AppMenuProps> = ({
  role,
  theme,
  currentTab,
  unreadCount,
  notificationCount,
  onClose,
  onSwitchRole,
  onSelectTab,
  onToggleChat,
  onOpenSettings,
  onOpenNotifications,
  onToggleTheme,
  onLogout
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const items: BranchedMenuItem[] = [
    exploreFor(role, unreadCount),
    {
      label: 'Mi cuenta',
      children: [
        { value: 'perfil', label: 'Mi perfil', icon: <User size={ICON} /> },
        ...(onOpenNotifications
          ? [{ value: 'notificaciones', label: 'Notificaciones', icon: <Bell size={ICON} />, badge: notificationCount }]
          : []),
        { value: 'configuracion', label: 'Configuración', icon: <Settings size={ICON} /> }
      ]
    }
  ];

  const handleSelect = (value: string) => {
    if (value === 'mensajes') onToggleChat?.();
    else if (value === 'configuracion') onOpenSettings();
    else if (value === 'notificaciones') onOpenNotifications?.();
    else onSelectTab(value);
    onClose();
  };

  return (
    <>
      <div className="app-menu-backdrop" onClick={onClose} />
      <div className="app-menu" id="app-menu">
        <div className="app-menu-roles" role="radiogroup" aria-label="Usar OficioYa como">
          {(['seeker', 'provider'] as const).map(r => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={role === r}
              className="app-menu-role"
              data-active={role === r ? '' : undefined}
              onClick={() => onSwitchRole(r)}
            >
              {r === 'seeker' ? 'Contratante' : 'Profesional'}
            </button>
          ))}
        </div>

        <BranchedMenu
          key={role}
          items={items}
          defaultOpen={[0, 1]}
          active={currentTab}
          onSelect={handleSelect}
          width={280}
          ariaLabel="Menú principal"
        />

        <div className="app-menu-foot">
          <div className="app-menu-switch">
            <label htmlFor="app-menu-theme" className="app-menu-switch-label">
              <Moon size={15} aria-hidden="true" />
              Modo oscuro
            </label>
            <SquishSwitch
              id="app-menu-theme"
              checked={theme === 'dark'}
              onChange={onToggleTheme}
              width={44}
              height={26}
              radius={13}
            />
          </div>
          <button type="button" className="app-menu-action app-menu-action--danger" onClick={onLogout}>
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};
