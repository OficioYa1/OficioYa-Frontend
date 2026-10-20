import React from 'react';
import { Logo } from '../ui';
import './AppFooter.css';

const LINK_GROUPS: { title: string; links: string[] }[] = [
  { title: 'Oficio Ya', links: ['Inicio', 'Directorio', 'Servicios', 'Solicitudes'] },
  { title: 'Para clientes', links: ['Buscar profesionales', 'Publicar solicitud', 'Cómo funciona', 'Ayuda'] },
  { title: 'Para profesionales', links: ['Registrarme', 'Ofrecer mis servicios', 'Cómo funciona', 'Centro de ayuda'] },
  { title: 'Información', links: ['Sobre Oficio Ya', 'Seguridad', 'Términos y condiciones', 'Política de privacidad'] },
];

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/oficioya_/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    )
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/OficioYa0',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
      </svg>
    )
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@oficioya_',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.06a8.16 8.16 0 0 0 4.78 1.52V7.13a4.85 4.85 0 0 1-1-.44z"/>
      </svg>
    )
  }
];

export interface AppFooterProps {
  onOpenContact?: () => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({ onOpenContact }) => {
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

