import React, { useState } from 'react';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, Camera, CheckCircle2, Handshake, KeyRound,
  MapPin, PaintBucket, ShieldCheck, Star, Tv2, Wrench, Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BRAND_ASSETS, assetUrl } from '../../utils/assets';

const vars = (i: number) => ({ '--reveal-i': i } as React.CSSProperties);

/* ── Cifras ───────────────────────────────────────────────── */
export const LandingStats: React.FC = () => {
  const { t, lang } = useLanguage();
  const nf = new Intl.NumberFormat(lang === 'es' ? 'es-CO' : 'en-US', { maximumFractionDigits: 1 });
  const stats = [
    { value: `${nf.format(2400)}+`, label: t('landing.stats.pros') },
    { value: `${nf.format(18000)}+`, label: t('landing.stats.jobs') },
    { value: nf.format(4.8), label: t('landing.stats.rating'), unit: '/5' },
    { value: '<20', label: t('landing.stats.response') },
  ];
  return (
    <section className="lp-stats" aria-label={t('landing.stats.label')}>
      <div className="lp-wrap">
        <ul className="lp-stats__grid">
          {stats.map((s, i) => (
            <li key={s.label} className="lp-stats__item" data-reveal style={vars(i)}>
              <span className="lp-stats__value">
                {s.value}{s.unit && <span className="lp-stats__unit">{s.unit}</span>}
              </span>
              <span className="lp-stats__label">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

/* ── Cómo funciona ────────────────────────────────────────── */
export const LandingHow: React.FC = () => {
  const { t } = useLanguage();
  const steps = [
    { icon: <MapPin size={22} />, title: t('landing.how.s1.title'), desc: t('landing.how.s1.desc') },
    { icon: <Star size={22} />, title: t('landing.how.s2.title'), desc: t('landing.how.s2.desc') },
    { icon: <Handshake size={22} />, title: t('landing.how.s3.title'), desc: t('landing.how.s3.desc') },
  ];
  return (
    <section id="como-funciona" className="lp-section lp-split" aria-labelledby="lp-how-title">
      <div className="lp-wrap lp-split__grid">
        <div className="lp-split__text lp-sticky">
          <p className="lp-kicker" data-reveal>{t('landing.how.kicker')}</p>
          <h2 id="lp-how-title" className="lp-title" data-reveal style={vars(1)}>{t('landing.how.title')}</h2>
          <p className="lp-lead" data-reveal style={vars(2)}>{t('landing.how.sub')}</p>
        </div>
        <ol className="lp-steps">
          {steps.map((s, i) => (
            <li key={s.title} className="lp-step glass-1" data-reveal style={vars(i)}>
              <span className="lp-step__num" aria-hidden="true">0{i + 1}</span>
              <div className="lp-step__body">
                <span className="lp-step__icon" aria-hidden="true">{s.icon}</span>
                <h3 className="lp-step__title">{s.title}</h3>
                <p className="lp-step__desc">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

/* ── Oficios (con Many) ───────────────────────────────────── */
type TradeKey = 'electricidad' | 'plomeria' | 'pintura' | 'cerrajeria' | 'electrodomesticos' | 'clases';
type Pose = 'electricista' | 'plomero' | 'wave';

const TRADES: { key: TradeKey; icon: React.ReactNode; pose: Pose }[] = [
  { key: 'electricidad', icon: <Zap size={16} />, pose: 'electricista' },
  { key: 'plomeria', icon: <Wrench size={16} />, pose: 'plomero' },
  { key: 'pintura', icon: <PaintBucket size={16} />, pose: 'wave' },
  { key: 'cerrajeria', icon: <KeyRound size={16} />, pose: 'wave' },
  { key: 'electrodomesticos', icon: <Tv2 size={16} />, pose: 'wave' },
  { key: 'clases', icon: <BookOpen size={16} />, pose: 'wave' },
];

const POSES: { pose: Pose; src: string }[] = [
  { pose: 'electricista', src: BRAND_ASSETS.manyElectricista },
  { pose: 'plomero', src: BRAND_ASSETS.manyPlomero },
  { pose: 'wave', src: BRAND_ASSETS.manyWave },
];

export const LandingTrades: React.FC<{ onFind: () => void }> = ({ onFind }) => {
  const { t } = useLanguage();
  const [active, setActive] = useState<TradeKey>('electricidad');
  const current = TRADES.find(tr => tr.key === active) ?? TRADES[0];
  const tradeName = t(`landing.trades.${current.key}`);

  return (
    <section id="oficios" className="lp-section lp-split lp-split--flip" aria-labelledby="lp-trades-title">
      <div className="lp-wrap lp-split__grid">
        <div className="lp-trades__visual" data-reveal>
          <div className="lp-trades__stage">
            <span className="lp-trades__halo" aria-hidden="true" />
            {POSES.map(p => (
              <img
                key={p.pose}
                src={p.src}
                alt={p.pose === current.pose ? t('landing.trades.manyAlt', { trade: tradeName.toLowerCase() }) : ''}
                aria-hidden={p.pose === current.pose ? undefined : true}
                className={`lp-trades__many ${p.pose === current.pose ? 'is-active' : ''}`}
                loading="lazy"
                decoding="async"
                width={720}
                height={806}
              />
            ))}
          </div>
          <figure className="lp-trades__tile glass-1">
            <img
              src={assetUrl('assets/mascot/logos-oficios.webp')}
              alt={t('landing.trades.iconsAlt')}
              loading="lazy"
              decoding="async"
              width={720}
              height={720}
            />
            <figcaption>{t('landing.trades.more')}</figcaption>
          </figure>
        </div>

        <div className="lp-split__text">
          <p className="lp-kicker" data-reveal>{t('landing.trades.kicker')}</p>
          <h2 id="lp-trades-title" className="lp-title" data-reveal style={vars(1)}>{t('landing.trades.title')}</h2>
          <p className="lp-lead" data-reveal style={vars(2)}>{t('landing.trades.sub')}</p>

          <div className="lp-trades__chips" role="group" aria-label={t('landing.trades.groupLabel')} data-reveal style={vars(3)}>
            {TRADES.map(tr => (
              <button
                key={tr.key}
                type="button"
                className="oy-chip lp-trades__chip"
                aria-pressed={tr.key === active}
                onClick={() => setActive(tr.key)}
              >
                <span aria-hidden="true">{tr.icon}</span>
                {t(`landing.trades.${tr.key}`)}
              </button>
            ))}
          </div>

          <p className="lp-trades__desc" aria-live="polite" data-reveal style={vars(4)}>
            <strong>{tradeName}.</strong> {t(`landing.trades.${current.key}.desc`)}
          </p>
          <button type="button" className="lp-textlink lp-textlink--ink" onClick={onFind} data-reveal style={vars(5)}>
            {t('landing.trades.cta', { trade: tradeName.toLowerCase() })}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};

/* ── Reputación verificada ────────────────────────────────── */
export const LandingTrust: React.FC = () => {
  const { t, lang } = useLanguage();
  const points = [
    { icon: <ShieldCheck size={20} />, text: t('landing.trust.p1') },
    { icon: <CheckCircle2 size={20} />, text: t('landing.trust.p2') },
    { icon: <Camera size={20} />, text: t('landing.trust.p3') },
    { icon: <BadgeCheck size={20} />, text: t('landing.trust.p4') },
  ];
  return (
    <section id="reputacion" className="lp-section lp-split" aria-labelledby="lp-trust-title">
      <div className="lp-wrap lp-split__grid">
        <div className="lp-split__text">
          <p className="lp-kicker" data-reveal>{t('landing.trust.kicker')}</p>
          <h2 id="lp-trust-title" className="lp-title" data-reveal style={vars(1)}>{t('landing.trust.title')}</h2>
          <p className="lp-lead" data-reveal style={vars(2)}>{t('landing.trust.sub')}</p>
          <ul className="lp-checks">
            {points.map((p, i) => (
              <li key={p.text} data-reveal style={vars(i + 3)}>
                <span className="lp-checks__icon" aria-hidden="true">{p.icon}</span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="lp-trust__visual" data-reveal style={vars(2)}>
          <div className="lp-trust__back glass-1" aria-hidden="true">
            <span className="lp-trust__big">{lang === 'es' ? '4,9' : '4.9'}</span>
            <span className="lp-trust__stars">
              {[0, 1, 2, 3, 4].map(i => <Star key={i} size={16} fill="currentColor" />)}
            </span>
            <span className="lp-trust__meta">{t('landing.trust.card.jobs')}</span>
          </div>
          <article className="lp-trust__card glass-1">
            <header className="lp-trust__head">
              <img src={BRAND_ASSETS.manyElectricista} alt="" className="lp-trust__avatar" loading="lazy" width={56} height={56} />
              <div>
                <p className="lp-trust__name">{t('landing.trust.card.name')}</p>
                <p className="lp-trust__trade">{t('landing.trust.card.trade')}</p>
              </div>
              <span className="lp-trust__badge"><BadgeCheck size={14} aria-hidden="true" /> {t('landing.trust.card.verified')}</span>
            </header>
            <p className="lp-trust__stars lp-trust__stars--row" aria-label={t('landing.trust.card.rating')}>
              {[0, 1, 2, 3, 4].map(i => <Star key={i} size={18} fill="currentColor" aria-hidden="true" />)}
            </p>
            <blockquote className="lp-trust__quote">{t('landing.trust.card.quote')}</blockquote>
            <p className="lp-trust__by">{t('landing.trust.card.by')}</p>
          </article>
        </div>
      </div>
    </section>
  );
};

/* ── Para profesionales ───────────────────────────────────── */
export const LandingPros: React.FC<{ onWorker: () => void }> = ({ onWorker }) => {
  const { t } = useLanguage();
  const benefits = [t('landing.pros.b1'), t('landing.pros.b2'), t('landing.pros.b3')];
  return (
    <section id="profesionales" className="lp-section lp-split lp-split--flip" aria-labelledby="lp-pros-title">
      <div className="lp-wrap lp-split__grid">
        <div className="lp-pros__panel" data-reveal>
          <img src={BRAND_ASSETS.manyElectricista} alt={t('landing.pros.manyAlt')} className="lp-pros__many" loading="lazy" decoding="async" width={720} height={806} />
          <span className="lp-pros__badge glass-2">
            <CheckCircle2 size={16} aria-hidden="true" />
            {t('landing.pros.badge')}
          </span>
        </div>

        <div className="lp-split__text">
          <p className="lp-kicker" data-reveal>{t('landing.pros.kicker')}</p>
          <h2 id="lp-pros-title" className="lp-title" data-reveal style={vars(1)}>{t('landing.pros.title')}</h2>
          <p className="lp-lead" data-reveal style={vars(2)}>{t('landing.pros.sub')}</p>
          <ul className="lp-benefits">
            {benefits.map((b, i) => (
              <li key={b} data-reveal style={vars(i + 3)}>
                <span className="lp-benefits__n" aria-hidden="true">0{i + 1}</span>
                {b}
              </li>
            ))}
          </ul>
          <div className="lp-pros__actions" data-reveal style={vars(6)}>
            <button type="button" className="lp-pill lp-pill--pro" onClick={onWorker}>
              <span>{t('landing.pros.cta')}</span>
              <span className="lp-pill__orb" aria-hidden="true"><ArrowUpRight size={18} /></span>
            </button>
            <span className="lp-pros__note">{t('landing.pros.note')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
