import React, { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ITEMS = [1, 2, 3, 4, 5, 6] as const;

const FaqItem: React.FC<{ q: string; a: string; index: number }> = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const btnId = `${uid}-q`;
  const panelId = `${uid}-a`;
  return (
    <li className="lp-faq__item" data-open={open || undefined} data-reveal style={{ '--reveal-i': index } as React.CSSProperties}>
      <h3 className="lp-faq__h">
        <button
          id={btnId}
          type="button"
          className="lp-faq__q"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(o => !o)}
        >
          <span>{q}</span>
          <span className="lp-faq__icon" aria-hidden="true"><Plus size={20} /></span>
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={btnId} className="lp-faq__a" hidden={!open}>
        <p>{a}</p>
      </div>
    </li>
  );
};

export const LandingFaq: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section id="preguntas" className="lp-section lp-faq" aria-labelledby="lp-faq-title">
      <div className="lp-wrap lp-faq__grid">
        <div className="lp-faq__intro">
          <p className="lp-kicker" data-reveal>{t('landing.faq.kicker')}</p>
          <h2 id="lp-faq-title" className="lp-title" data-reveal style={{ '--reveal-i': 1 } as React.CSSProperties}>
            {t('landing.faq.title')}
          </h2>
        </div>
        <ul className="lp-faq__list">
          {ITEMS.map((n, i) => (
            <FaqItem key={n} index={i} q={t(`landing.faq.q${n}`)} a={t(`landing.faq.a${n}`)} />
          ))}
        </ul>
      </div>
    </section>
  );
};
