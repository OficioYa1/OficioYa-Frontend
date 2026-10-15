import React, { useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useReveal } from '../../hooks/useReveal';
import { BackToTop } from '../../components/common/BackToTop';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingHow, LandingPros, LandingStats, LandingTrades, LandingTrust } from './LandingSections';
import { LandingTestimonials } from './LandingTestimonials';
import { LandingFaq } from './LandingFaq';
import { ContactForm } from './ContactForm';
import { LandingBand, LandingFooter } from './LandingFooter';
import './LandingPage.css';
import './LandingParts.css';

interface LandingPageProps {
  onEnterApp: (role?: 'seeker' | 'provider') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { t, lang } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  // Al cambiar de idioma se vuelven a observar los nodos nuevos
  useReveal(rootRef, [lang]);

  const onFind = () => onEnterApp('seeker');
  const onWorker = () => onEnterApp('provider');

  return (
    <div ref={rootRef} className="lp-root">
      <a href="#lp-main" className="lp-skip">{t('landing.skip')}</a>
      <LandingHeader onFind={onFind} onLogin={onFind} />
      <main id="lp-main">
        <LandingHero onFind={onFind} onWorker={onWorker} />
        <LandingStats />
        <LandingHow />
        <LandingTrades onFind={onFind} />
        <LandingTrust />
        <LandingPros onWorker={onWorker} />
        <LandingTestimonials />
        <LandingFaq />
        <ContactForm />
        <LandingBand onFind={onFind} onWorker={onWorker} />
      </main>
      <LandingFooter />
      <BackToTop />
    </div>
  );
};
