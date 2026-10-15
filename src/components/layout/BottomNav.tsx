import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, MessageSquare, ClipboardList, Briefcase, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './BottomNav.css';

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

  const items: { tab: string; label: string; Icon: LucideIcon; badge?: number }[] = [
    { tab: 'directorio', label: 'Explorar', Icon: Search },
    ...(role === 'provider' ? [{ tab: 'dashboard-pro', label: 'Mi Taller', Icon: Briefcase }] : []),
    { tab: 'servicios', label: 'Servicios', Icon: ClipboardList },
    { tab: 'mensajes', label: 'Mensajes', Icon: MessageSquare, badge: unreadCount },
    { tab: 'perfil', label: 'Perfil', Icon: User },
  ];

  return (
    <nav className="mobile-bottom-nav bottom-nav" aria-label="Navegación principal">
      {items.map(({ tab, label, Icon, badge }) => {
        const active = currentTab === tab;
        return (
          <button
            key={tab}
            type="button"
            className={`bottom-nav__item${active ? ' bottom-nav__item--active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onSelectTab(tab)}
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
