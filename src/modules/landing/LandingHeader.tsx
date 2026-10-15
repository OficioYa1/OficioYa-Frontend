import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { BRAND_ASSETS } from '../../utils/assets';
import { LangSwitch } from './LangSwitch';
import { SECTIONS, prefersReducedMotion, scrollToSection } from './landingUtils';

interface LandingHeaderProps {
  onFind: () => void;
  onLogin: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onFind, onLogin }) => {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Menú móvil: bloquea el scroll, atrapa el foco y cierra con Esc
  useEffect(() => {
    if (!open) return undefined;
    const sheet = sheetRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sheet?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !sheet) return;
      const items = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  // Si la ventana crece a escritorio con el menú abierto, se cierra
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1200px)');
    const onChange = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const goTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (open) {
      close(false);
      // Espera a que el menú suelte el scroll del body antes de desplazarse
      window.setTimeout(() => scrollToSection(id), prefersReducedMotion() ? 0 : 60);
    } else {
      scrollToSection(id);
    }
  };

  const goTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (open) close(false);
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  const themeLabel = theme === 'dark' ? t('landing.theme.light') : t('landing.theme.dark');

  return (
    <>
      <header className={`lp-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="lp-header__bar glass-2">
          <a href="#inicio" className="lp-header__brand" onClick={goTop} aria-label={t('landing.nav.home')}>
            <img src={BRAND_ASSETS.logo} alt="" className="lp-header__logo" width={36} height={36} />
            <span className="lp-header__word" aria-hidden="true">Oficio<b>Ya</b></span>
          </a>

          <nav className="lp-header__nav" aria-label={t('landing.nav.label')}>
            <ul>
              {SECTIONS.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="lp-header__link" onClick={e => goTo(e, s.id)}>{t(s.key)}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lp-header__tools">
            <LangSwitch className="lp-header__lang" />
            <button type="button" className="lp-header__icon" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button type="button" className="lp-header__login" onClick={onLogin}>{t('landing.nav.login')}</button>
            <button type="button" className="lp-pill lp-pill--sm lp-header__cta" onClick={onFind}>
              {t('landing.nav.cta')}
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
            <button
              ref={toggleRef}
              type="button"
              className="lp-header__icon lp-header__menu-btn"
              aria-label={t('landing.nav.open')}
              aria-expanded={open}
              aria-controls="lp-mobile-menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="lp-menu" onClick={e => { if (e.target === e.currentTarget) close(); }}>
          <div
            ref={sheetRef}
            id="lp-mobile-menu"
            className="lp-menu__sheet glass-3"
            role="dialog"
            aria-modal="true"
            aria-label={t('landing.nav.menu')}
          >
            <div className="lp-menu__head">
              <span className="lp-menu__title">{t('landing.nav.menu')}</span>
              <button type="button" className="lp-header__icon" onClick={() => close()} aria-label={t('landing.nav.close')}>
                <X size={20} />
              </button>
            </div>
            <nav aria-label={t('landing.nav.label')}>
              <ul className="lp-menu__list">
                {SECTIONS.map((s, i) => (
                  <li key={s.id} style={{ '--i': i } as React.CSSProperties}>
                    <a href={`#${s.id}`} className="lp-menu__link" onClick={e => goTo(e, s.id)}>
                      <span className="lp-menu__num" aria-hidden="true">0{i + 1}</span>
                      {t(s.key)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="lp-menu__foot">
              <button type="button" className="lp-pill lp-menu__cta" onClick={() => { close(false); onFind(); }}>
                {t('landing.nav.cta')}
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
              <button type="button" className="lp-menu__login" onClick={() => { close(false); onLogin(); }}>
                {t('landing.nav.login')}
              </button>
              <div className="lp-menu__prefs">
                <LangSwitch />
                <button type="button" className="lp-header__icon" onClick={toggleTheme} aria-label={themeLabel}>
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
