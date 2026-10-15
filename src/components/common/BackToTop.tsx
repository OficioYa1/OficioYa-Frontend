import React from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useScrolledPast } from '../layout/useScrolledPast';
import './BackToTop.css';

interface BackToTopProps {
  /** Píxeles de scroll a partir de los cuales aparece. */
  threshold?: number;
  className?: string;
}

/**
 * Píldora de vidrio "Volver arriba". Aparece tras `threshold` px de scroll.
 * Su distancia al borde inferior sale de --back-to-top-offset, que cada
 * layout ajusta (la app la sube por encima de la barra inferior en móvil).
 */
export const BackToTop: React.FC<BackToTopProps> = ({ threshold = 600, className = '' }) => {
  const { t } = useLanguage();
  const visible = useScrolledPast(threshold);

  const goTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      className={`back-to-top glass-2${visible ? ' back-to-top--visible' : ''}${className ? ` ${className}` : ''}`}
      onClick={goTop}
      aria-label={t('common.backToTop')}
      inert={!visible}
    >
      <ArrowUp size={16} strokeWidth={2.4} aria-hidden="true" />
      <span className="back-to-top__text" aria-hidden="true">{t('common.backToTop')}</span>
    </button>
  );
};

export default BackToTop;
