import React from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LiquidField } from './LiquidField';
import { scrollToSection } from './landingUtils';

interface LandingHeroProps {
  onFind: () => void;
  onWorker: () => void;
}

const vars = (i: number) => ({ '--i': i } as React.CSSProperties);

export const LandingHero: React.FC<LandingHeroProps> = ({ onFind, onWorker }) => {
  const { t } = useLanguage();
  const lines = [t('landing.hero.line1'), t('landing.hero.line2'), t('landing.hero.line3')];
  const ring = t('landing.hero.scrollRing');

  return (
    <section id="inicio" className="lp-hero" aria-labelledby="lp-hero-title">
      <LiquidField webgl className="lp-hero__liquid" />
      <div className="lp-hero__veil" aria-hidden="true" />

      <div className="lp-wrap lp-hero__inner">
        <p className="lp-hero__eyebrow lp-enter" style={vars(0)}>
          <span className="lp-hero__dot" aria-hidden="true" />
          {t('landing.hero.eyebrow')}
        </p>

        <h1 id="lp-hero-title" className="lp-hero__title">
          {lines.map((line, i) => (
            <span key={i} className="lp-line">
              <span className="lp-line__inner" style={vars(i)}>{line}</span>
            </span>
          ))}
        </h1>

        <div className="lp-hero__aside">
          <p className="lp-hero__sub lp-enter" style={vars(3)}>{t('landing.hero.sub')}</p>
          <div className="lp-hero__actions lp-enter" style={vars(4)}>
            <button type="button" className="lp-pill lp-pill--hero" onClick={onFind}>
              <span>{t('landing.hero.cta')}</span>
              <span className="lp-pill__orb" aria-hidden="true"><ArrowUpRight size={20} /></span>
            </button>
            <button type="button" className="lp-textlink" onClick={onWorker}>
              {t('landing.hero.secondary')}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <a
          href="#como-funciona"
          className="lp-scroll-badge lp-enter"
          style={vars(5)}
          aria-label={t('landing.hero.scroll')}
          onClick={e => { e.preventDefault(); scrollToSection('como-funciona'); }}
        >
          <svg className="lp-scroll-badge__ring" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <path id="lp-ring-path" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
            </defs>
            <text>
              <textPath href="#lp-ring-path" textLength="293" lengthAdjust="spacing">{ring}</textPath>
            </text>
          </svg>
          <span className="lp-scroll-badge__core" aria-hidden="true"><ArrowDown size={20} /></span>
        </a>
      </div>
    </section>
  );
};
