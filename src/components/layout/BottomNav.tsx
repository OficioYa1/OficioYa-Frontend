import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, Search, MessageSquare, ClipboardList, Briefcase, Inbox, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './BottomNav.css';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount?: number;
  isChatOpen?: boolean;
  onToggleChat?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  unreadCount = 0,
  isChatOpen = false,
  onToggleChat
}) => {
  const { role } = useAuth();

  // Mismas pestañas que el header (App.tsx solo conoce estos ids).
  const items: { tab: string; label: string; Icon: LucideIcon; badge?: number }[] = role === 'provider'
    ? [
        { tab: 'inicio_pro', label: 'Inicio', Icon: Home },
        { tab: 'alertas', label: 'Mi Taller', Icon: Inbox },
        { tab: 'clientes', label: 'Clientes', Icon: Briefcase },
        { tab: 'mensajes', label: 'Mensajes', Icon: MessageSquare, badge: unreadCount },
        { tab: 'perfil', label: 'Perfil', Icon: User },
      ]
    : [
        { tab: 'inicio_seeker', label: 'Inicio', Icon: Home },
        { tab: 'buscar', label: 'Buscar', Icon: Search },
        { tab: 'solicitudes', label: 'Servicios', Icon: ClipboardList },
        { tab: 'mensajes', label: 'Mensajes', Icon: MessageSquare, badge: unreadCount },
        { tab: 'perfil', label: 'Perfil', Icon: User },
      ];

  return (
    <nav className="mobile-bottom-nav bottom-nav" aria-label="Navegación principal">
      {items.map(({ tab, label, Icon, badge }) => {
        const active = tab === 'mensajes' ? isChatOpen : currentTab === tab && !isChatOpen;
        return (
          <button
            key={tab}
            type="button"
            className={`bottom-nav__item${active ? ' bottom-nav__item--active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => (tab === 'mensajes' && onToggleChat ? onToggleChat() : onSelectTab(tab))}
          >
            <span className="bottom-nav__icon">
              <Icon size={20} aria-hidden="true" />
              {badge !== undefined && badge > 0 && (
                <span className="bottom-nav__badge" aria-hidden="true">{badge}</span>
              )}
            </span>
            <span className="bottom-nav__label">{label}</span>
            {badge !== undefined && badge > 0 && (
              <span className="bottom-nav__sr">, {badge} sin leer</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
