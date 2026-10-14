import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { UserRole, FontScale } from '../../types';
import {
  Sun,
  Moon,
  Type,
  MapPin,
  CheckCircle2,
  Home,
  User,
  LogOut,
  ShieldAlert,
  Navigation,
  Search,
  FileText,
  MessageCircle,
  Bell,
  Settings,
  ChevronDown,
  Briefcase
} from 'lucide-react';

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
  isChatOpen,
  onToggleChat
}) => {
  const { user, role, switchRole, logout } = useAuth();
  const { theme, toggleTheme, fontScale, setFontScale } = useTheme();
  const [showRoleDropdown, setShowRoleDropdown] = React.useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    setShowRoleDropdown(false);
  };

  const cycleFontScale = () => {
    const scales: FontScale[] = ['normal', 'large', 'xlarge'];
    const next = scales[(scales.indexOf(fontScale) + 1) % scales.length];
    setFontScale(next);
  };

  return (
    <header
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '10px 0'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onOpenLanding}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <img src="/assets/mascot/logo1.0.png" alt="OficioYa" style={{ width: '34px', height: '34px', borderRadius: '9px' }} />
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--color-text-main)',
              lineHeight: 1,
            }}>
              Oficio<span style={{ color: 'var(--brand-amber)' }}>Ya</span>
            </span>
          </button>
          {/* Indicador de ubicación */}
          <button
            onClick={onRefreshGps}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px', borderRadius: '999px',
              background: 'var(--color-surface-hover)',
              fontSize: '11px', fontWeight: 500, color: 'var(--color-text-muted)',
              cursor: 'pointer', fontFamily: 'var(--font-ui)',
            }}
            title="Actualizar ubicación"
          >
            <MapPin size={11} color="var(--role-primary)" />
            <span>Bogotá D.C.</span>
            {hasGps ? <CheckCircle2 size={11} color="#10B981" /> : <Navigation size={10} color="var(--color-text-muted)" />}
          </button>
        </div>

        {/* Navegación Principal Minimalista (Iconos) */}
        <nav className="hide-on-mobile" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {role === 'seeker' ? (
            <>
              <TabButton id="inicio_seeker" label="Inicio" icon={Home} current={currentTab} onSelect={onSelectTab} />
              <TabButton id="buscar" label="Buscar profesionales" icon={Search} current={currentTab} onSelect={onSelectTab} />
              <TabButton id="solicitudes" label="Mis solicitudes" icon={FileText} current={currentTab} onSelect={onSelectTab} />
              <TabButton id="mensajes" label="Mensajes" icon={MessageCircle} current={isChatOpen ? 'mensajes' : ''} onSelect={() => onToggleChat && onToggleChat()} badge={unreadCount} />
            </>
          ) : (
            <>
              <TabButton id="inicio_pro" label="Inicio" icon={Home} current={currentTab} onSelect={onSelectTab} />
              <TabButton id="oportunidades" label="Oportunidades" icon={Search} current={currentTab} onSelect={onSelectTab} />
              <TabButton id="clientes" label="Mis clientes" icon={Briefcase} current={currentTab} onSelect={onSelectTab} />
              <TabButton id="alertas" label="Alertas" icon={Bell} current={currentTab} onSelect={onSelectTab} />
              <TabButton id="mensajes" label="Mensajes" icon={MessageCircle} current={isChatOpen ? 'mensajes' : ''} onSelect={() => onToggleChat && onToggleChat()} badge={unreadCount} />
            </>
          )}
        </nav>

        {/* Espaciador flexible para empujar el resto a la derecha si es necesario, 
            aunque 'space-between' ya lo hace, pero aquí podemos agrupar las acciones. */}
        <div style={{ flex: 1 }}></div>

        {/* Herramientas de Accesibilidad, Moderación y Usuario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          
          {/* Selector de Rol Compacto y Configuración */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, background: 'var(--color-surface)' }}
              title="Cambiar rol o configuración"
            >
              <User size={16} />
              <span className="hide-on-mobile">{role === 'seeker' ? 'Contratante' : 'Profesional'}</span>
              <ChevronDown size={14} style={{ opacity: 0.5 }} />
            </button>

            {showRoleDropdown && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '8px', minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 200
              }}>
                <button
                  onClick={() => handleRoleChange('seeker')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', border: 'none', background: role === 'seeker' ? 'var(--color-surface-hover)' : 'transparent', color: 'var(--color-text-main)', cursor: 'pointer', textAlign: 'left', fontWeight: role === 'seeker' ? 700 : 500, fontSize: '13px' }}
                >
                  Contratante {role === 'seeker' && <CheckCircle2 size={14} color="var(--role-primary)" />}
                </button>
                <button
                  onClick={() => handleRoleChange('provider')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', border: 'none', background: role === 'provider' ? 'var(--color-surface-hover)' : 'transparent', color: 'var(--color-text-main)', cursor: 'pointer', textAlign: 'left', fontWeight: role === 'provider' ? 700 : 500, fontSize: '13px' }}
                >
                  Profesional {role === 'provider' && <CheckCircle2 size={14} color="var(--role-primary)" />}
                </button>
                <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />
                <button
                  onClick={() => { onSelectTab('perfil'); setShowRoleDropdown(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--color-text-main)', cursor: 'pointer', textAlign: 'left', fontSize: '13px' }}
                >
                  <User size={14} /> Mi perfil
                </button>
                <button
                  onClick={() => { onOpenSettings(); setShowRoleDropdown(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--color-text-main)', cursor: 'pointer', textAlign: 'left', fontSize: '13px' }}
                >
                  <Settings size={14} /> Configuración
                </button>
                <button
                  onClick={toggleTheme}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--color-text-main)', cursor: 'pointer', textAlign: 'left', fontSize: '13px' }}
                >
                  {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />} 
                  Modo {theme === 'light' ? 'Oscuro' : 'Claro'}
                </button>
                <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />
                <button
                  onClick={logout}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--color-danger)', cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: 600 }}
                >
                  <LogOut size={14} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// --- Componente Auxiliar para Pestañas Iconográficas ---
const TabButton = ({ id, label, icon: Icon, current, onSelect, badge = 0 }: any) => {
  const active = current === id;
  return (
    <button
      onClick={() => onSelect(id)}
      title={label}
      style={{
        background: active ? 'var(--color-surface)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: active ? 'var(--role-primary)' : 'var(--color-text-muted)',
        padding: '8px 12px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget.style.background = 'var(--color-surface-hover)');
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget.style.background = 'transparent');
      }}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      {active && <span style={{ fontSize: '13.5px', fontWeight: 700, letterSpacing: '-0.3px' }}>{label}</span>}
      {badge > 0 && (
        <span style={{ position: 'absolute', top: '2px', right: '4px', background: 'var(--color-danger)', color: 'white', borderRadius: '50%', padding: '1px 5px', fontSize: '10px', fontWeight: 800 }}>
          {badge}
        </span>
      )}
    </button>
  );
};
