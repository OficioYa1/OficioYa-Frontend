import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BRAND_ASSETS } from '../../utils/assets';
import { SECTIONS, scrollToSection } from './landingUtils';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from './SocialIcons';

interface Actions {
  onFind: () => void;
  onWorker: () => void;
}

/* ── Banda líquida final con el CTA repetido ──────────────── */
export const LandingBand: React.FC<Actions> = ({ onFind, onWorker }) => {
  const { t } = useLanguage();
  return (
    <section className="lp-band-wrap" aria-labelledby="lp-band-title">
      <div className="lp-wrap">
        <div className="oy-hero lp-band" data-reveal>
          <img src={BRAND_ASSETS.manyWave} alt="" className="lp-band__many" loading="lazy" width={720} height={806} />
          <div className="lp-band__text">
            <h2 id="lp-band-title" className="lp-band__title">{t('landing.band.title')}</h2>
            <p className="lp-band__sub">{t('landing.band.sub')}</p>
            <div className="lp-band__actions">
              <button type="button" className="lp-pill lp-pill--light" onClick={onFind}>
                <span>{t('landing.band.cta')}</span>
                <span className="lp-pill__orb" aria-hidden="true"><ArrowUpRight size={18} /></span>
              </button>
              <button type="button" className="lp-textlink lp-textlink--light" onClick={onWorker}>
                {t('landing.band.secondary')}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SOCIAL = [
  { href: 'https://instagram.com/oficioya', key: 'landing.footer.instagram', Icon: InstagramIcon },
  { href: 'https://facebook.com/oficioya', key: 'landing.footer.facebook', Icon: FacebookIcon },
  { href: 'https://tiktok.com/@oficioya', key: 'landing.footer.tiktok', Icon: TikTokIcon },
  { href: 'https://wa.me/573000000000', key: 'landing.footer.whatsapp', Icon: WhatsAppIcon },
];

/* ── Pie de la landing ────────────────────────────────────── */
export const LandingFooter: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="lp-footer">
      <div className="lp-wrap">
        <div className="lp-footer__top">
          <div className="lp-footer__brand">
            <img src={BRAND_ASSETS.logo} alt="" width={44} height={44} className="lp-footer__logo" />
            <p className="lp-footer__word">Oficio<b>Ya</b></p>
            <p className="lp-footer__claim">{t('landing.footer.claim')}</p>
          </div>

          <nav className="lp-footer__col" aria-labelledby="lp-footer-explore">
            <h2 id="lp-footer-explore" className="lp-footer__h">{t('landing.footer.explore')}</h2>
            <ul>
              {SECTIONS.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="lp-footer__link" onClick={e => { e.preventDefault(); scrollToSection(s.id); }}>
                    {t(s.key)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lp-footer__col">
            <h2 className="lp-footer__h">{t('landing.footer.social')}</h2>
            <ul className="lp-social">
              {SOCIAL.map(({ href, key, Icon }) => (
                <li key={href}>
                  <a href={href} className="lp-social__link" target="_blank" rel="noopener noreferrer" aria-label={t(key)} title={t(key)}>
                    <Icon size={20} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="lp-footer__mega" aria-hidden="true">OficioYa</p>

        <div className="lp-footer__bar">
          <span>{t('landing.footer.rights')}</span>
          <span>{t('landing.footer.credit')}</span>
        </div>
      </div>
    </footer>
  );
};
