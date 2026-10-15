import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { Lang } from '../../i18n';
import './LanguageSwitch.css';

interface LanguageSwitchProps {
  /** id del texto visible que nombra el control. */
  labelledBy: string;
}

const OPTIONS: { id: Lang; short: string; name: string }[] = [
  { id: 'es', short: 'ES', name: 'lang.es' },
  { id: 'en', short: 'EN', name: 'lang.en' }
];

/** Selector segmentado ES | EN con píldora que se desliza al idioma activo. */
export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ labelledBy }) => {
  const { lang, setLang, t } = useLanguage();

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const next: Lang = lang === 'es' ? 'en' : 'es';
    setLang(next);
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-lang="${next}"]`)?.focus();
  };

  return (
    <div
      className="lang-switch"
      role="radiogroup"
      aria-labelledby={labelledBy}
      data-lang={lang}
      onKeyDown={onKeyDown}
    >
      <span className="lang-switch__thumb" aria-hidden="true" />
      {OPTIONS.map(opt => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={lang === opt.id}
          aria-label={t(opt.name)}
          tabIndex={lang === opt.id ? 0 : -1}
          className="lang-switch__option"
          data-lang={opt.id}
          lang={opt.id}
          onClick={() => setLang(opt.id)}
        >
          {opt.short}
        </button>
      ))}
    </div>
  );
};
