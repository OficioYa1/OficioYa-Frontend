import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { prefersReducedMotion } from './landingUtils';

const IDS = ['t1', 't2', 't3', 't4', 't5'] as const;

/**
 * Carrusel de testimonios sin autoplay: pista con scroll-snap (deslizar con el
 * dedo), botones anterior/siguiente, flechas del teclado y puntos de posición.
 */
export const LandingTestimonials: React.FC = () => {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const total = IDS.length;

  // La posición activa sale del scroll real (sirve igual para swipe y botones)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const slides = Array.from(track.children) as HTMLElement[];
        const left = track.scrollLeft;
        const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        let best = 0;
        let bestDist = Infinity;
        slides.forEach((s, i) => {
          const d = Math.abs(s.offsetLeft - pad - left);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        // Al final de la pista, el último visible cuenta como activo
        if (left + track.clientWidth >= track.scrollWidth - 4) best = total - 1;
        setIndex(best);
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [total]);

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(total - 1, i));
    const slide = track.children[clamped] as HTMLElement | undefined;
    if (!slide) return;
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    track.scrollTo({
      left: slide.offsetLeft - pad,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
    setIndex(clamped);
  }, [total]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
    if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    if (e.key === 'End') { e.preventDefault(); goTo(total - 1); }
  };

  return (
    <section className="lp-section lp-quotes" aria-labelledby="lp-quotes-title">
      <div className="lp-wrap">
        <div className="lp-quotes__head">
          <div>
            <p className="lp-kicker" data-reveal>{t('landing.testimonials.kicker')}</p>
            <h2 id="lp-quotes-title" className="lp-title" data-reveal style={{ '--reveal-i': 1 } as React.CSSProperties}>
              {t('landing.testimonials.title')}
            </h2>
          </div>
          <div className="lp-quotes__nav" data-reveal style={{ '--reveal-i': 2 } as React.CSSProperties}>
            <button type="button" className="lp-round" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label={t('landing.testimonials.prev')}>
              <ChevronLeft size={20} />
            </button>
            <button type="button" className="lp-round" onClick={() => goTo(index + 1)} disabled={index === total - 1} aria-label={t('landing.testimonials.next')}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div
        className="lp-quotes__viewport"
        role="region"
        aria-roledescription="carrusel"
        aria-label={t('landing.testimonials.label')}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <ul ref={trackRef} className="lp-quotes__track">
          {IDS.map((id, i) => (
            <li
              key={id}
              className={`lp-quote glass-1 ${i === index ? 'is-current' : ''}`}
              role="group"
              aria-roledescription="testimonio"
              aria-label={t('landing.testimonials.slide', { n: i + 1, total })}
            >
              <Quote size={28} className="lp-quote__mark" aria-hidden="true" />
              <blockquote className="lp-quote__text">{t(`landing.testimonials.${id}.quote`)}</blockquote>
              <footer className="lp-quote__who">
                <span className="lp-quote__initial" aria-hidden="true">{t(`landing.testimonials.${id}.name`).charAt(0)}</span>
                <span>
                  <span className="lp-quote__name">{t(`landing.testimonials.${id}.name`)}</span>
                  <span className="lp-quote__role">{t(`landing.testimonials.${id}.role`)}</span>
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </div>

      <div className="lp-wrap lp-quotes__foot">
        <div className="lp-dots">
          {IDS.map((id, i) => (
            <button
              key={id}
              type="button"
              className="lp-dots__dot"
              aria-label={t('landing.testimonials.goto', { n: i + 1 })}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <p className="lp-quotes__hint">{t('landing.testimonials.hint')}</p>
      </div>
    </section>
  );
};
