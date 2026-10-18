import React from 'react';
import { MascotAvatar } from '../mascot/MascotAvatar';
import { Logo } from '../ui';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './AppFooter.css';

const LINK_GROUPS: { title: string; links: string[] }[] = [
  { title: 'Oficio Ya', links: ['Inicio', 'Directorio', 'Servicios', 'Solicitudes'] },
  { title: 'Para clientes', links: ['Buscar profesionales', 'Publicar solicitud', 'Cómo funciona', 'Ayuda'] },
  { title: 'Para profesionales', links: ['Registrarme', 'Ofrecer mis servicios', 'Cómo funciona', 'Centro de ayuda'] },
  { title: 'Información', links: ['Sobre Oficio Ya', 'Seguridad', 'Términos y condiciones', 'Política de privacidad'] },
];

const SOCIAL_LINKS = [
  {
    label: 'WhatsApp',
    href: 'https://wa.me/573162209184',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        <path d="M8 12h.01M12 12h.01M16 12h.01" />
      </svg>
    )
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/oficioya',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    )
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/oficioya',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    )
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/oficioya',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
      </svg>
    )
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/oficioya',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    )
  },
  {
    label: 'GitHub',
    href: 'https://github.com/OficioYa1/OficioYa-Frontend',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    )
  }
];

export interface AppFooterProps {
  onOpenContact?: () => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({ onOpenContact }) => {
  const { lang, setLang } = useLanguage();
  const [bogotaTime, setBogotaTime] = React.useState<string>('00:00:00');

  React.useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = new Intl.DateTimeFormat('es-CO', {
          timeZone: 'America/Bogota',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now);
        setBogotaTime(timeStr);
      } catch {
        const now = new Date();
        setBogotaTime(now.toTimeString().split(' ')[0]);
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__grid">
          <div className="app-footer__brand">
            <Logo size={32} />
            <p className="app-footer__claim">Encuentra a la persona indicada para tu oficio.</p>
            <p className="app-footer__text">
              Conectamos talento local verificado con hogares y negocios que necesitan soluciones rápidas, seguras y confiables en Bogotá D.C.
            </p>

            {/* Item 17: Botones RRSS de Redes Sociales */}
            <div className="app-footer__social-row" aria-label="Redes sociales oficiales">
              {SOCIAL_LINKS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-footer__social-btn"
                  aria-label={s.label}
                  title={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {LINK_GROUPS.map(group => (
            <nav key={group.title} className="app-footer__group" aria-label={group.title}>
              <h4 className="app-footer__heading">{group.title}</h4>
              <ul className="app-footer__list">
                {group.links.map(link => (
                  <li key={link}>
                    <a href="#" className="app-footer__link">{link}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="app-footer__sign">
          <div className="app-footer__sign-avatar">
            <MascotAvatar size="sm" animate="idle" forceImage="wave" />
          </div>
          <div className="app-footer__sign-text">
            <span className="app-footer__sign-title oy-display">¿Necesitas una mano?</span>
            <span className="app-footer__sign-sub">Encuentra un profesional cerca de ti.</span>
          </div>

          {/* Item 16: Selector de Idioma */}
          <div className="app-footer__lang-picker">
            <Globe size={15} aria-hidden="true" />
            <button
              type="button"
              className={`app-footer__lang-btn ${lang === 'es' ? 'app-footer__lang-btn--active' : ''}`}
              onClick={() => setLang('es')}
            >
              ES
            </button>
            <span className="app-footer__lang-sep">/</span>
            <button
              type="button"
              className={`app-footer__lang-btn ${lang === 'en' ? 'app-footer__lang-btn--active' : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>
        </div>

        {/* Reloj de guardia y pulso de ciudad en vivo (Inspirado en bleibtgleich.dev) */}
        <div className="app-footer__clockwork" aria-label="Hora local en Bogotá">
          <span className="app-footer__clockwork-pulse" aria-hidden="true" />
          <span className="app-footer__clockwork-city">BOGOTÁ D.C.</span>
          <span className="app-footer__clockwork-time">({bogotaTime})</span>
          <span className="app-footer__clockwork-status">· HORA LOCAL</span>
        </div>

        <div className="app-footer__bar">
          <span className="app-footer__copy">© 2026 Oficio Ya · DOSW Escuela Colombiana de Ingeniería</span>
          <span className="app-footer__dot" aria-hidden="true">•</span>
          <a href="#" className="app-footer__link">Privacidad</a>
          <span className="app-footer__dot" aria-hidden="true">•</span>
          <a href="#" className="app-footer__link">Términos</a>
          <span className="app-footer__dot" aria-hidden="true">•</span>
          <button type="button" onClick={onOpenContact} className="app-footer__link app-footer__btn-link">
            Contacto
          </button>
        </div>
      </div>
    </footer>
  );
};

