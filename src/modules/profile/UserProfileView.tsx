import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { ServiceRequest } from '../../types';
import {
  Settings,
  Phone,
  MapPin,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import './Profile.css';

interface UserProfileViewProps {
  services: ServiceRequest[];
  onOpenSettings: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  services,
  onOpenSettings,
  onNavigateToTab
}) => {
  const { user, role } = useAuth();
  const { theme, fontScale } = useTheme();

  const activeCount = services.filter(s => s.status === 'en_curso').length;
  const doneCount = services.filter(s => s.status === 'finalizado').length;

  return (
    <div className="user-profile container pf-page">
      <div className="pf-wrap">
        {/* Banda de cabecera del perfil */}
        <section
          className={`pf-hero ${role === 'seeker' ? 'pf-hero--marino' : 'pf-hero--almendra'}`}
          aria-labelledby="pf-name"
        >
          <span className="oy-sticker oy-sticker--amarillo oy-sticker--pill pf-hero__sticker" aria-hidden="true">
            {role === 'seeker' ? 'Contratante' : 'Profesional'}
          </span>

          <div className="pf-hero__id">
            <div
              className="pf-avatar"
              style={{ '--pf-avatar-bg': user?.avatarColor || 'var(--role-primary)' } as React.CSSProperties}
              aria-hidden="true"
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OY'}
            </div>

            <div className="pf-hero__text">
              <span className="oy-eyebrow">Mi perfil</span>
              <h2 id="pf-name" className="oy-display pf-hero__name">{user?.name || 'Usuario'}</h2>
              <div className="pf-badges">
                <span className="badge badge-verified pf-badge-sticker">
                  <ShieldCheck size={12} /> Verificado
                </span>
              </div>
              <span className="pf-hero__email">{user?.email}</span>

              <div className="pf-meta">
                <span className="pf-meta__item">
                  <Phone size={13} aria-hidden="true" /> {user?.phone || '+57 300 123 4567'}
                </span>
                <span className="pf-meta__item">
                  <MapPin size={13} aria-hidden="true" /> {user?.city || 'Bogotá D.C., Colombia'}
                </span>
              </div>
            </div>
          </div>

          <div className="pf-hero__actions">
            <button onClick={onOpenSettings} className="btn btn-secondary">
              <Settings size={16} aria-hidden="true" /> Configuración
            </button>
          </div>
        </section>

        {/* Sección según Rol (Contratante vs Profesional) */}
        {role === 'seeker' ? (
          <section className="oy-panel pf-section" aria-labelledby="pf-seeker-title">
            <div className="pf-section__head">
              <div>
                <h3 id="pf-seeker-title" className="oy-section-title">Resumen de Contratante</h3>
                <p className="oy-section-sub">Historial de servicios solicitados en tu zona</p>
              </div>
              <button onClick={() => onNavigateToTab('solicitudes')} className="btn btn-secondary">
                Ver todos ({services.length})
              </button>
            </div>

            <div className="pf-stats">
              <div className="oy-stat pf-stat--marino">
                <span className="oy-stat__label">Servicios Activos</span>
                <span className="oy-stat__value">{activeCount}</span>
              </div>

              <div className="oy-stat pf-stat--esmeralda">
                <span className="oy-stat__label">Servicios Concluidos</span>
                <span className="oy-stat__value">{doneCount}</span>
              </div>

              <div className="oy-stat pf-stat--amarillo">
                <span className="oy-stat__label">Pagos</span>
                <span className="pf-stat__guarantee">
                  <ShieldCheck size={18} aria-hidden="true" /> Directo, 0 % comisión
                </span>
              </div>
            </div>
          </section>
        ) : (
          <section className="oy-panel pf-section" aria-labelledby="pf-pro-title">
            <div className="pf-section__head">
              <div>
                <h3 id="pf-pro-title" className="oy-section-title">Perfil Profesional</h3>
                <p className="oy-section-sub">Oficios técnicos publicados y validados</p>
              </div>
              <button onClick={() => onNavigateToTab('alertas')} className="btn btn-primary">
                <Briefcase size={14} aria-hidden="true" /> Ir a Mi Taller
              </button>
            </div>

            <div className="pf-trade">
              <MascotAvatar trade="electricidad" size="sm" />
              <div>
                <span className="pf-trade__title">Electricista & Mantenimiento General</span>
                <span className="pf-trade__sub">
                  Tarifa base: $45.000 COP/h • Cobertura: Bogotá D.C. & Sabana Centro
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Preferencias de accesibilidad rápidas */}
        <section className="oy-panel oy-panel--gris pf-section" aria-labelledby="pf-ui-title">
          <h4 id="pf-ui-title" className="oy-label pf-ui__title">Ajustes de Interfaz Activos</h4>
          <div className="pf-pills">
            <span className="pf-pill">
              Tema: <strong>{theme === 'light' ? 'Claro ☀️' : 'Oscuro 🌙'}</strong>
            </span>
            <span className="pf-pill">
              Escala de Fuente: <strong>{fontScale.toUpperCase()}</strong>
            </span>
            <span className="pf-pill">
              Rol Activo: <strong>{role === 'seeker' ? 'Contratante' : 'Profesional'}</strong>
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};
