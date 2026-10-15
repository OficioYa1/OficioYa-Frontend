import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { House, Search, MessageSquare, ClipboardList, Briefcase, Inbox, User } from 'lucide-react';
import { GlassDock, type GlassDockItem } from '../ui';
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

  const items: GlassDockItem[] = role === 'provider'
    ? [
        { key: 'inicio_pro', label: 'Inicio', Icon: House },
        { key: 'alertas', label: 'Mi Taller', Icon: Inbox },
        { key: 'clientes', label: 'Clientes', Icon: Briefcase },
        { key: 'mensajes', label: 'Mensajes', Icon: MessageSquare, badge: unreadCount },
        { key: 'perfil', label: 'Perfil', Icon: User },
      ]
    : [
        { key: 'inicio_seeker', label: 'Inicio', Icon: House },
        { key: 'buscar', label: 'Buscar', Icon: Search },
        { key: 'solicitudes', label: 'Servicios', Icon: ClipboardList },
        { key: 'mensajes', label: 'Mensajes', Icon: MessageSquare, badge: unreadCount },
        { key: 'perfil', label: 'Perfil', Icon: User },
      ];

  const activeKey = isChatOpen ? 'mensajes' : currentTab;

  const handleSelect = (key: string) => {
    if (key === 'mensajes' && onToggleChat) {
      onToggleChat();
    } else {
      onSelectTab(key);
    }
  };

  return (
    <aside className="mobile-bottom-nav bottom-nav-wrap" aria-label="Navegación principal">
      <GlassDock
        items={items}
        active={activeKey}
        onSelect={handleSelect}
        magnify={1.35}
        spread={2}
        lift={10}
        labels={true}
      />
    </aside>
  );
};

