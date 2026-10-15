import React from 'react';
import { MascotAvatar } from '../mascot/MascotAvatar';
import { Logo } from '../ui';
import './AppFooter.css';

const LINK_GROUPS: { title: string; links: string[] }[] = [
  { title: 'Oficio Ya', links: ['Inicio', 'Directorio', 'Servicios', 'Solicitudes'] },
  { title: 'Para clientes', links: ['Buscar profesionales', 'Publicar solicitud', 'Cómo funciona', 'Ayuda'] },
  { title: 'Para profesionales', links: ['Registrarme', 'Ofrecer mis servicios', 'Cómo funciona', 'Centro de ayuda'] },
  { title: 'Información', links: ['Sobre Oficio Ya', 'Seguridad', 'Términos y condiciones', 'Política de privacidad'] },
];

export const AppFooter: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__grid">
          <div className="app-footer__brand">
            <Logo size={32} />
            <p className="app-footer__claim">Encuentra a la persona indicada para tu oficio.</p>
            <p className="app-footer__text">
              Conectamos talento local verificado con hogares y negocios que necesitan soluciones rápidas, seguras y confiables.
            </p>
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
        </div>

        <div className="app-footer__bar">
          <span className="app-footer__copy">© 2026 Oficio Ya</span>
          <span className="app-footer__dot" aria-hidden="true">•</span>
          <a href="#" className="app-footer__link">Privacidad</a>
          <span className="app-footer__dot" aria-hidden="true">•</span>
          <a href="#" className="app-footer__link">Términos</a>
          <span className="app-footer__dot" aria-hidden="true">•</span>
          <a href="#" className="app-footer__link">Contacto</a>
        </div>
      </div>
    </footer>
  );
};
