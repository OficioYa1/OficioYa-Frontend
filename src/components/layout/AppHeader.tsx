import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
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
import { Logo } from '../ui';
import { AppMenu } from './AppMenu';
import { useScrolledPast } from './useScrolledPast';
import { useSlidingIndicator } from './useSlidingIndicator';
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
  isInboxOpen?: boolean;
  onOpenNotifications?: () => void;
}

const SCROLL_THRESHOLD = 24;

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenLanding,
  onOpenSettings,
  onOpenAdminModeration,
  onRefreshGps,
  hasGps,
  currentTab,
  onSelectTab,
  unreadCount,
  isChatOpen,
  onToggleChat,
  notificationCount = 0,
  isInboxOpen = false,
  onOpenNotifications
}) => {
  const { role, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, lang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolledPast(SCROLL_THRESHOLD);

  const navTabs: { id: string; label: string; icon: LucideIcon; badge?: number }[] =
    role === 'seeker'
      ? [
          { id: 'inicio_seeker', label: t('app.nav.home'), icon: Home },
          { id: 'buscar', label: t('app.nav.search'), icon: Search },
          { id: 'solicitudes', label: t('app.nav.requests'), icon: FileText },
          { id: 'mensajes', label: t('app.nav.messages'), icon: MessageCircle, badge: unreadCount }
        ]
      : [
          { id: 'inicio_pro', label: t('app.nav.home'), icon: Home },
          { id: 'oportunidades', label: t('app.nav.opportunities'), icon: Search },
          { id: 'clientes', label: t('app.nav.clients'), icon: Briefcase },
          { id: 'alertas', label: t('app.nav.alerts'), icon: Inbox },
          { id: 'mensajes', label: t('app.nav.messages'), icon: MessageCircle, badge: unreadCount }
        ];

  const activeId = isChatOpen ? 'mensajes' : currentTab;
  const { containerRef, indicatorRef } = useSlidingIndicator<HTMLDivElement, HTMLSpanElement>(
    `${role}:${activeId}:${lang}`
  );

  const handleNavSelect = (id: string) => {
    if (id === 'mensajes') onToggleChat?.();
    else onSelectTab(id);
  };

  const roleLabel = role === 'seeker' ? t('app.role.seeker') : t('app.role.provider');
  const gpsLabel = hasGps ? t('app.gps.active') : t('app.gps.refresh');

  return (
    <header className={`app-header${scrolled ? ' app-header--scrolled' : ''}`}>
      <div className="app-header__inner">
        <div className="app-header__bar glass-2">
          <div className="app-header__brand">
            <button type="button" className="app-header__logo" onClick={onOpenLanding} aria-label={t('app.header.home')}>
              <Logo size={32} />
            </button>
            <button
              type="button"
              className="app-header__gps"
              onClick={onRefreshGps}
              title={gpsLabel}
              aria-label={`${t('app.gps.location')}: Bogotá D.C. ${gpsLabel}`}
            >
              <MapPin size={14} aria-hidden="true" />
              <span className="app-header__gps-text">Bogotá D.C.</span>
              {hasGps
                ? <CheckCircle2 size={13} className="app-header__gps-ok" aria-hidden="true" />
                : <Navigation size={12} className="app-header__gps-off" aria-hidden="true" />}
            </button>
          </div>

          <nav className="app-header__nav" aria-label={t('app.nav.label')}>
            <div className="app-header__tabs" ref={containerRef}>
              <span className="app-header__indicator" ref={indicatorRef} aria-hidden="true" />
              {navTabs.map(({ id, label, icon: Icon, badge = 0 }) => {
                const active = activeId === id;
                const fullLabel = badge > 0 ? `${label}, ${t('app.nav.unread', { n: badge })}` : label;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleNavSelect(id)}
                    title={label}
                    aria-label={fullLabel}
                    aria-current={active ? 'page' : undefined}
                    className="app-header__tab"
                  >
                    <Icon size={18} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                    <span className="app-header__tab-label">{label}</span>
                    {badge > 0 && <span className="app-header__badge" aria-hidden="true">{badge}</span>}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="app-header__actions">
            {onOpenNotifications && (
              <button
                type="button"
                className="app-header__icon-btn"
                onClick={onOpenNotifications}
                aria-label={notificationCount > 0
                  ? `${t('app.nav.notifications')}, ${t('app.nav.unread', { n: notificationCount })}`
                  : t('app.nav.notifications')}
                aria-haspopup="dialog"
                aria-expanded={isInboxOpen}
                data-active={isInboxOpen ? '' : undefined}
              >
                <Bell size={19} aria-hidden="true" />
                {notificationCount > 0 && (
                  <span className="app-header__badge app-header__badge--icon" aria-hidden="true">{notificationCount}</span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(open => !open)}
              className="app-header__account"
              aria-label={t('app.header.account', { role: roleLabel })}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? 'app-menu' : undefined}
            >
              <span className="app-header__avatar" aria-hidden="true">
                <User size={16} />
              </span>
              <span className="app-header__account-text">{roleLabel}</span>
              <ChevronDown size={14} className="app-header__chevron" aria-hidden="true" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <AppMenu
            role={role}
            theme={theme}
            currentTab={currentTab}
            unreadCount={unreadCount}
            notificationCount={notificationCount}
            onClose={() => setMenuOpen(false)}
            onSwitchRole={switchRole}
            onSelectTab={onSelectTab}
            onToggleChat={onToggleChat}
            onOpenSettings={onOpenSettings}
            onOpenAdminModeration={onOpenAdminModeration}
            onOpenNotifications={onOpenNotifications}
            onToggleTheme={toggleTheme}
            onLogout={logout}
          />
        )}
      </div>
    </header>
  );
};
