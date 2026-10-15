import React, { useState, useEffect, useRef } from 'react';
import type { MascotExpression, TradeCategory } from '../../types';
import { MascotAvatar } from './MascotAvatar';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, ChevronRight, MessageCircle } from 'lucide-react';
import './MascotAssistant.css';

interface MascotAssistantProps {
  currentTrade?: TradeCategory;
  /** Pestaña activa de la app; define el consejo de contexto. */
  activeView?: string;
}

type ManyAnimation = 'float' | 'wave' | 'bounce' | 'idle';

interface ManyState {
  expression: MascotExpression;
  /** Clave del diccionario (src/i18n/app.ts). */
  messageKey: string;
  vars?: Record<string, string>;
  animate: ManyAnimation;
}

const CONTEXT_STATES: Record<string, ManyState> = {
  directory_seeker: { expression: 'alegre', messageKey: 'app.many.ctx.directorySeeker', animate: 'float' },
  directory_provider: { expression: 'concentrado', messageKey: 'app.many.ctx.directoryProvider', animate: 'idle' },
  services: { expression: 'pensativo', messageKey: 'app.many.ctx.services', animate: 'float' },
  profile: { expression: 'guino', messageKey: 'app.many.ctx.profile', animate: 'idle' },
  dashboard: { expression: 'concentrado', messageKey: 'app.many.ctx.dashboard', animate: 'idle' }
};

/** Pestaña de la app → contexto de Many. */
const VIEW_CONTEXT: Record<string, keyof typeof CONTEXT_STATES> = {
  inicio_seeker: 'directory_seeker',
  buscar: 'directory_seeker',
  solicitudes: 'services',
  clientes: 'services',
  inicio_pro: 'directory_provider',
  oportunidades: 'directory_provider',
  alertas: 'dashboard',
  perfil: 'profile'
};

const INTERACTION_MESSAGES: ManyState[] = [
  { expression: 'alegre', messageKey: 'app.many.tip.hello', animate: 'wave' },
  { expression: 'guino', messageKey: 'app.many.tip.verified', animate: 'float' },
  { expression: 'entusiasta', messageKey: 'app.many.tip.speed', animate: 'bounce' },
  { expression: 'sorprendido', messageKey: 'app.many.tip.nearby', animate: 'wave' },
  { expression: 'pensativo', messageKey: 'app.many.tip.ranking', animate: 'idle' },
  { expression: 'concentrado', messageKey: 'app.many.tip.reviews', animate: 'float' }
];

const contextFor = (view: string, role: string): ManyState => {
  const key = VIEW_CONTEXT[view] ?? (role === 'provider' ? 'directory_provider' : 'directory_seeker');
  return CONTEXT_STATES[key];
};

/** Many flotante: consejos según la pestaña y el oficio que se está mirando. */
export const MascotAssistant: React.FC<MascotAssistantProps> = ({ currentTrade, activeView = '' }) => {
  const { role } = useAuth();
  const { t } = useLanguage();
  /* En móvil empieza plegado para no tapar el contenido */
  const [isOpen, setIsOpen] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  /* Consejo elegido al tocar a Many; se descarta al cambiar de pestaña, rol u oficio */
  const [tip, setTip] = useState<{ state: ManyState; context: string } | null>(null);
  const [interactionIndex, setInteractionIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [waving, setWaving] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const context = `${role}:${activeView}:${currentTrade ?? ''}`;
  const baseState: ManyState = currentTrade
    ? { expression: 'pensativo', messageKey: 'app.many.trade', vars: { trade: t(`app.many.tradeName.${currentTrade}`) }, animate: 'idle' }
    : contextFor(activeView, role);
  const shown = tip && tip.context === context ? tip.state : baseState;
  const animate: ManyAnimation = waving ? 'wave' : shown.animate;

  // Cada 15 s saluda para llamar la atención (si nadie está interactuando)
  useEffect(() => {
    if (!isOpen || isInteracting) return;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      setWaving(true);
      settle = setTimeout(() => setWaving(false), 900);
    }, 15000);
    return () => {
      clearInterval(interval);
      if (settle) clearTimeout(settle);
    };
  }, [isOpen, isInteracting]);

  useEffect(() => () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  }, []);

  const handleManyClick = () => {
    setIsInteracting(true);
    setIsOpen(true);
    setTip({ state: INTERACTION_MESSAGES[interactionIndex % INTERACTION_MESSAGES.length], context });
    setInteractionIndex(i => i + 1);

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setIsInteracting(false), 4000);
  };

  return (
    <aside aria-label={t('app.many.label')} className="many-assistant">
      {isOpen && (
        <div className="many-assistant__bubble glass-2">
          <div className="many-assistant__head">
            <span className="many-assistant__name">
              <span className="many-assistant__status" aria-hidden="true" />
              Many
            </span>
            <button
              type="button"
              className="many-assistant__close"
              onClick={() => setIsOpen(false)}
              aria-label={t('app.many.close')}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <p className="many-assistant__message" aria-live="polite">
            {t(shown.messageKey, shown.vars)}
          </p>

          <button type="button" className="many-assistant__hint" onClick={handleManyClick}>
            {t('app.many.more')}
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="many-assistant__row">
        {!isOpen && (
          <button type="button" className="many-assistant__open glass-2" onClick={() => setIsOpen(true)}>
            <MessageCircle size={15} aria-hidden="true" />
            {t('app.many.open')}
          </button>
        )}

        <div className="many-assistant__avatar">
          <MascotAvatar
            trade={currentTrade}
            expression={shown.expression}
            size="md"
            animate={animate}
            onClick={handleManyClick}
          />
        </div>
      </div>
    </aside>
  );
};
