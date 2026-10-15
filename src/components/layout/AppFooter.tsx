import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Logo } from '../ui';
import './AppFooter.css';

interface AppFooterProps {
  /** Lleva a una pestaña de la app (los enlaces de "Explorar"). */
  onSelectTab?: (tab: string) => void;
}

const SOCIAL: { name: string; href: string; icon: React.ReactNode }[] = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/oficioya',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </>
    )
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/oficioya',
    icon: <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5h2.8l.7-3.5h-3.5V7.2c0-.6.4-.9 1-.9H15z" />
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com/@oficioya',
    icon: <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.6 2.2 4.4 5 4.6" />
  },
  {
    name: 'WhatsApp',
    href: 'https://whatsapp.com/oficioya',
    icon: (
      <>
        <path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.3 18.5z" />
        <path d="M9.2 8.6c.2-.4.5-.4.8-.4l.6.1 1 2.1-.6.8c.5 1 1.3 1.8 2.3 2.3l.8-.6 2.1 1v.6c0 .4-.2.8-.5 1-.9.6-2.2.5-3.9-.6a9 9 0 0 1-2.9-3c-.7-1.4-.7-2.5.3-3.3z" />
      </>
    )
  }
];

/** Footer editorial de vidrio: marca, accesos, redes y crédito académico. */
export const AppFooter: React.FC<AppFooterProps> = ({ onSelectTab }) => {
  const { role } = useAuth();
  const { t } = useLanguage();

  const explore = role === 'provider'
    ? [
        { tab: 'inicio_pro', label: t('app.nav.home') },
        { tab: 'alertas', label: t('app.nav.workshop') },
        { tab: 'clientes', label: t('app.nav.clients') },
        { tab: 'perfil', label: t('app.nav.profile') }
      ]
    : [
        { tab: 'inicio_seeker', label: t('app.nav.home') },
        { tab: 'buscar', label: t('app.nav.search') },
        { tab: 'solicitudes', label: t('app.nav.requests') },
        { tab: 'perfil', label: t('app.nav.profile') }
      ];

  return (
    <footer className="app-footer">
      <div className="app-footer__panel glass-1">
        <div className="app-footer__grid">
          <div className="app-footer__brand">
            <Logo size={32} />
            <p className="app-footer__claim oy-display">{t('app.footer.claim')}</p>
            <p className="app-footer__text">{t('app.footer.text')}</p>
          </div>

          {onSelectTab && (
            <nav className="app-footer__group" aria-labelledby="app-footer-explore">
              <h2 id="app-footer-explore" className="app-footer__heading">{t('app.menu.explore')}</h2>
              <ul className="app-footer__list">
                {explore.map(item => (
                  <li key={item.tab}>
                    <button type="button" className="app-footer__link" onClick={() => onSelectTab(item.tab)}>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="app-footer__group">
            <h2 id="app-footer-social" className="app-footer__heading">{t('app.footer.follow')}</h2>
            <ul className="app-footer__social" aria-labelledby="app-footer-social">
              {SOCIAL.map(s => (
                <li key={s.name}>
                  <a
                    className="app-footer__social-link"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('app.footer.socialLink', { name: s.name })}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {s.icon}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="app-footer__bar">
          <span className="app-footer__copy">© 2026 OficioYa</span>
          <span className="app-footer__credit">{t('app.footer.credit')}</span>
        </div>
      </div>
    </footer>
  );
};
