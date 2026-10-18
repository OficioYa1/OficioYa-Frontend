import React, { useEffect } from 'react';
import {
  User,
  Settings,
  Bell,
  Moon,
  LogOut,
  ShieldAlert
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
  /** OFY-54: Panel de moderación (demo, visible para cualquier sesión). */
  onOpenAdminModeration?: () => void;
  onOpenNotifications?: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const ICON = 16;

/** Menú principal de la cuenta: rol, gestión de cuenta y ajustes (sin sección explorar). */
export const AppMenu: React.FC<AppMenuProps> = ({
  role,
  theme,
  currentTab,
  notificationCount,
  onClose,
  onSwitchRole,
  onSelectTab,
  onOpenSettings,
  onOpenAdminModeration,
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
    {
      label: 'Mi cuenta',
      children: [
        { value: 'perfil', label: 'Mi perfil', icon: <User size={ICON} /> },
        ...(onOpenNotifications
          ? [{ value: 'notificaciones', label: 'Notificaciones', icon: <Bell size={ICON} />, badge: notificationCount }]
          : []),
        { value: 'configuracion', label: 'Configuración', icon: <Settings size={ICON} /> },
        ...(onOpenAdminModeration
          ? [{ value: 'moderacion', label: 'Moderación (demo)', icon: <ShieldAlert size={ICON} /> }]
          : [])
      ]
    }
  ];

  const handleSelect = (value: string) => {
    if (value === 'configuracion') onOpenSettings();
    else if (value === 'notificaciones') onOpenNotifications?.();
    else if (value === 'moderacion') onOpenAdminModeration?.();
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
          defaultOpen={[0]}
          active={currentTab}
          onSelect={handleSelect}
          width={280}
          ariaLabel="Menú de cuenta"
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
