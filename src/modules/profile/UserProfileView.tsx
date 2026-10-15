import React, { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { ServiceRequest } from '../../types';
import {
  Settings,
  Phone,
  MapPin,
  ShieldCheck,
  Briefcase,
  ClipboardList,
  Sun,
  Moon,
  Type,
  Repeat,
  ChevronRight,
  Wrench,
  User as UserIcon
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { useReveal } from '../../hooks/useReveal';
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
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef, [role]);

  const isSeeker = role === 'seeker';
  const activeCount = services.filter(s => s.status === 'en_curso').length;
  const doneCount = services.filter(s => s.status === 'finalizado').length;
  const pendingCount = services.filter(s => s.status === 'pendiente').length;
  const fontLabel: Record<string, string> = { normal: 'Normal', large: 'Grande', xlarge: 'Muy grande' };

  const stats = [
    { label: 'Pendientes', value: pendingCount },
    { label: 'En curso', value: activeCount },
    { label: 'Completados', value: doneCount }
  ];

  return (
    <div ref={rootRef} className="user-profile container pf-page">
      <div className="pf-wrap">
        <section className="pf-head" aria-labelledby="pf-name" data-reveal>
          <div className="pf-head__id">
            <div
              className="pf-avatar"
              style={{ '--pf-avatar-bg': user?.avatarColor || 'var(--role-primary)' } as React.CSSProperties}
              aria-hidden="true"
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OY'}
            </div>

            <div className="pf-head__text">
              <div className="pf-badges">
                <span className="pf-role">
                  {isSeeker ? <UserIcon size={13} aria-hidden="true" /> : <Wrench size={13} aria-hidden="true" />}
                  {isSeeker ? 'Contratante' : 'Profesional'}
                </span>
                <span className="pf-verified">
                  <ShieldCheck size={13} aria-hidden="true" /> Verificado
                </span>
              </div>
              <h1 id="pf-name" className="pf-head__name">{user?.name || 'Usuario'}</h1>
              {user?.email && <span className="pf-head__email">{user.email}</span>}
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

          <dl className="pf-stats">
            {stats.map(st => (
              <div key={st.label} className="pf-stat">
                <dt className="pf-stat__label">{st.label}</dt>
                <dd className="pf-stat__value">{st.value}</dd>
              </div>
            ))}
          </dl>

          <div className="pf-head__actions">
            <button
              type="button"
              onClick={() => onNavigateToTab(isSeeker ? 'solicitudes' : 'clientes')}
              className="btn btn-primary"
            >
              <ClipboardList size={16} aria-hidden="true" /> Ver mis servicios ({services.length})
            </button>
            <button type="button" onClick={onOpenSettings} className="btn btn-secondary">
              <Settings size={16} aria-hidden="true" /> Configuración
            </button>
          </div>
        </section>

        {isSeeker ? (
          <section className="oy-panel pf-section" aria-labelledby="pf-seeker-title" data-reveal>
            <span className="pf-section__icon pf-section__icon--esmeralda" aria-hidden="true"><ShieldCheck size={20} /></span>
            <div className="pf-section__text">
              <h2 id="pf-seeker-title" className="pf-section__title">Garantía digital activa</h2>
              <p className="pf-section__sub">
                Cada servicio queda registrado con fecha, valor y reseña verificada. Si algo sale mal, puedes reportarlo desde Mis servicios.
              </p>
            </div>
          </section>
        ) : (
          <section className="oy-panel pf-section" aria-labelledby="pf-pro-title" data-reveal>
            <MascotAvatar trade="electricidad" size="sm" />
            <div className="pf-section__text">
              <h2 id="pf-pro-title" className="pf-section__title">Electricista y mantenimiento general</h2>
              <p className="pf-section__sub">Tarifa base: $45.000 COP/h · Cobertura: Bogotá D.C. y Sabana Centro</p>
            </div>
            <button type="button" onClick={() => onNavigateToTab('alertas')} className="btn btn-secondary">
              <Briefcase size={16} aria-hidden="true" /> Ir a mi panel
            </button>
          </section>
        )}

        <section className="pf-prefs" aria-labelledby="pf-ui-title" data-reveal>
          <h2 id="pf-ui-title" className="pf-prefs__title">Ajustes rápidos</h2>
          <ul className="pf-prefs__list">
            <li>
              <button type="button" className="pf-pref" onClick={onOpenSettings}>
                <span className="pf-pref__icon" aria-hidden="true">
                  {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
                </span>
                <span className="pf-pref__text">
                  <span className="pf-pref__label">Tema</span>
                  <span className="pf-pref__value">{theme === 'light' ? 'Claro' : 'Oscuro'}</span>
                </span>
                <ChevronRight size={18} aria-hidden="true" className="pf-pref__chev" />
              </button>
            </li>
            <li>
              <button type="button" className="pf-pref" onClick={onOpenSettings}>
                <span className="pf-pref__icon" aria-hidden="true"><Type size={18} /></span>
                <span className="pf-pref__text">
                  <span className="pf-pref__label">Tamaño de letra</span>
                  <span className="pf-pref__value">{fontLabel[fontScale] ?? fontScale}</span>
                </span>
                <ChevronRight size={18} aria-hidden="true" className="pf-pref__chev" />
              </button>
            </li>
            <li>
              <button type="button" className="pf-pref" onClick={onOpenSettings}>
                <span className="pf-pref__icon" aria-hidden="true"><Repeat size={18} /></span>
                <span className="pf-pref__text">
                  <span className="pf-pref__label">Modo activo</span>
                  <span className="pf-pref__value">{isSeeker ? 'Contratante' : 'Profesional'}</span>
                </span>
                <ChevronRight size={18} aria-hidden="true" className="pf-pref__chev" />
              </button>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
