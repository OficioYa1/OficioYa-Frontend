import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Home, Search, MessageSquare, ClipboardList, Briefcase, Inbox, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSlidingIndicator } from './useSlidingIndicator';
import './BottomNav.css';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount?: number;
  isChatOpen?: boolean;
  onToggleChat?: () => void;
}

/** Barra inferior flotante en móvil (máx. 5 destinos) con indicador deslizante. */
export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  unreadCount = 0,
  isChatOpen = false,
  onToggleChat
}) => {
  const { role } = useAuth();
  const { t, lang } = useLanguage();

  const items: { tab: string; label: string; Icon: LucideIcon; badge?: number }[] = role === 'provider'
    ? [
        { tab: 'inicio_pro', label: t('app.nav.home'), Icon: Home },
        { tab: 'alertas', label: t('app.nav.workshop'), Icon: Inbox },
        { tab: 'clientes', label: t('app.nav.clientsShort'), Icon: Briefcase },
        { tab: 'mensajes', label: t('app.nav.messages'), Icon: MessageSquare, badge: unreadCount },
        { tab: 'perfil', label: t('app.nav.profileShort'), Icon: User },
      ]
    : [
        { tab: 'inicio_seeker', label: t('app.nav.home'), Icon: Home },
        { tab: 'buscar', label: t('app.nav.searchShort'), Icon: Search },
        { tab: 'solicitudes', label: t('app.nav.services'), Icon: ClipboardList },
        { tab: 'mensajes', label: t('app.nav.messages'), Icon: MessageSquare, badge: unreadCount },
        { tab: 'perfil', label: t('app.nav.profileShort'), Icon: User },
      ];

  const activeTab = isChatOpen ? 'mensajes' : currentTab;
  const { containerRef, indicatorRef } = useSlidingIndicator<HTMLDivElement, HTMLSpanElement>(
    `${role}:${activeTab}:${lang}`
  );

  return (
    <nav className="mobile-bottom-nav bottom-nav glass-2" aria-label={t('app.nav.label')}>
      <div className="bottom-nav__track" ref={containerRef}>
        <span className="bottom-nav__indicator" ref={indicatorRef} aria-hidden="true" />
        {items.map(({ tab, label, Icon, badge = 0 }) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              className="bottom-nav__item"
              aria-current={active ? 'page' : undefined}
              onClick={() => (tab === 'mensajes' && onToggleChat ? onToggleChat() : onSelectTab(tab))}
            >
              <span className="bottom-nav__icon">
                <Icon size={20} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                {badge > 0 && <span className="bottom-nav__badge" aria-hidden="true">{badge}</span>}
              </span>
              <span className="bottom-nav__label">{label}</span>
              {badge > 0 && <span className="bottom-nav__sr">, {t('app.nav.unread', { n: badge })}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
