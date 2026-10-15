import React from 'react';
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
  LogOut,
  ShieldAlert,
  Languages
} from 'lucide-react';
import type { UserRole } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { BranchedMenu, SquishSwitch, type BranchedMenuItem } from '../ui';
import { LanguageSwitch } from './LanguageSwitch';
import { usePopover } from './usePopover';
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

/** Menú de la cuenta: rol, navegación con ramas, idioma, tema y sesión. */
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
  onOpenAdminModeration,
  onOpenNotifications,
  onToggleTheme,
  onLogout
}) => {
  const { t } = useLanguage();
  const panelRef = usePopover<HTMLDivElement>(onClose);

  const explore: BranchedMenuItem = {
    label: t('app.menu.explore'),
    children:
      role === 'seeker'
        ? [
            { value: 'inicio_seeker', label: t('app.nav.home'), icon: <Home size={ICON} /> },
            { value: 'buscar', label: t('app.nav.search'), icon: <Search size={ICON} /> },
            { value: 'solicitudes', label: t('app.nav.requests'), icon: <FileText size={ICON} /> },
            { value: 'mensajes', label: t('app.nav.messages'), icon: <MessageCircle size={ICON} />, badge: unreadCount }
          ]
        : [
            { value: 'inicio_pro', label: t('app.nav.home'), icon: <Home size={ICON} /> },
            { value: 'oportunidades', label: t('app.nav.opportunities'), icon: <Search size={ICON} /> },
            { value: 'clientes', label: t('app.nav.clients'), icon: <Briefcase size={ICON} /> },
            { value: 'alertas', label: t('app.nav.alerts'), icon: <Inbox size={ICON} /> },
            { value: 'mensajes', label: t('app.nav.messages'), icon: <MessageCircle size={ICON} />, badge: unreadCount }
          ]
  };

  const items: BranchedMenuItem[] = [
    explore,
    {
      label: t('app.menu.account'),
      children: [
        { value: 'perfil', label: t('app.nav.profile'), icon: <User size={ICON} /> },
        ...(onOpenNotifications
          ? [{ value: 'notificaciones', label: t('app.nav.notifications'), icon: <Bell size={ICON} />, badge: notificationCount }]
          : []),
        { value: 'configuracion', label: t('app.menu.settings'), icon: <Settings size={ICON} /> },
        ...(onOpenAdminModeration
          ? [{ value: 'moderacion', label: t('app.menu.moderation'), icon: <ShieldAlert size={ICON} /> }]
          : [])
      ]
    }
  ];

  const handleSelect = (value: string) => {
    if (value === 'mensajes') onToggleChat?.();
    else if (value === 'configuracion') onOpenSettings();
    else if (value === 'notificaciones') onOpenNotifications?.();
    else if (value === 'moderacion') onOpenAdminModeration?.();
    else onSelectTab(value);
    onClose();
  };

  return (
    <>
      <div className="app-menu-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="app-menu" id="app-menu" ref={panelRef} role="group" aria-label={t('app.menu.label')} tabIndex={-1}>
        <div className="app-menu-roles" role="radiogroup" aria-label={t('app.menu.useAs')}>
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
              {r === 'seeker' ? t('app.role.seeker') : t('app.role.provider')}
            </button>
          ))}
        </div>

        <BranchedMenu
          key={role}
          items={items}
          defaultOpen={[0, 1]}
          active={currentTab}
          onSelect={handleSelect}
          width={268}
          ariaLabel={t('app.menu.main')}
        />

        <div className="app-menu-foot">
          <div className="app-menu-switch">
            <span className="app-menu-switch-label" id="app-menu-lang">
              <Languages size={15} aria-hidden="true" />
              {t('lang.label')}
            </span>
            <LanguageSwitch labelledBy="app-menu-lang" />
          </div>
          <div className="app-menu-switch">
            <label htmlFor="app-menu-theme" className="app-menu-switch-label">
              <Moon size={15} aria-hidden="true" />
              {t('app.settings.darkMode')}
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
            <LogOut size={15} aria-hidden="true" />
            {t('app.menu.logout')}
          </button>
        </div>
      </div>
    </>
  );
};
