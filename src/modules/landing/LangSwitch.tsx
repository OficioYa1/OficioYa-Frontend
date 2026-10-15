import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { Lang } from '../../i18n';

const OPTIONS: { value: Lang; short: string; nameKey: string }[] = [
  { value: 'es', short: 'ES', nameKey: 'lang.es' },
  { value: 'en', short: 'EN', nameKey: 'lang.en' },
];

/** Selector ES/EN en píldora de vidrio. */
export const LangSwitch: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang, t } = useLanguage();
  return (
    <div className={`lp-lang ${className}`} role="group" aria-label={t('lang.label')}>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          lang={opt.value}
          title={t(opt.nameKey)}
          className="lp-lang__btn"
          aria-pressed={lang === opt.value}
          onClick={() => setLang(opt.value)}
        >
          {opt.short}
        </button>
      ))}
    </div>
  );
};
