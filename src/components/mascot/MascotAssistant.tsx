import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { MascotExpression, TradeCategory } from '../../types';
import { MascotAvatar } from './MascotAvatar';
import { useAuth } from '../../context/AuthContext';
import { X, ChevronRight } from 'lucide-react';
import { useSpring, useTransition, animated, config } from '@react-spring/web';
import './MascotAssistant.css';

interface MascotAssistantProps {
  currentTrade?: TradeCategory;
  activeView?: string;
  customMessage?: string;
}

type ManyState = {
  expression: MascotExpression;
  message: string;
  animate: 'float' | 'wave' | 'bounce' | 'idle';
};

const CONTEXT_STATES: Record<string, ManyState> = {
  directorio_seeker: {
    expression: 'alegre',
    message: 'Encuentra el profesional ideal en tu barrio. Filtra por oficio y distancia.',
    animate: 'float',
  },
  directorio_provider: {
    expression: 'concentrado',
    message: 'Modo Profesional activo. Mantén tus tarifas y disponibilidad actualizadas.',
    animate: 'idle',
  },
  servicios: {
    expression: 'pensativo',
    message: 'Aquí puedes ver el estado de todos tus servicios y dejar reseñas verificadas.',
    animate: 'float',
  },
  mensajes: {
    expression: 'entusiasta',
    message: 'Chatea directamente con el profesional. Acuerda la tarifa antes del servicio.',
    animate: 'bounce',
  },
  perfil: {
    expression: 'guino',
    message: 'Tu reputación digital es tu mayor activo. Mantén tu perfil completo.',
    animate: 'idle',
  },
  'dashboard-pro': {
    expression: 'concentrado',
    message: 'Gestiona tus solicitudes entrantes y activa tu disponibilidad en tiempo real.',
    animate: 'idle',
  },
};

const INTERACTION_MESSAGES: ManyState[] = [
  { expression: 'alegre',       message: '¡Hola! Soy Many, el castor de OficioYa. Estoy aquí para ayudarte.', animate: 'wave' },
  { expression: 'guino',        message: 'Busca el sello de identidad: lo ganan los profesionales que muestran su cédula después de 10 trabajos.', animate: 'float' },
  { expression: 'entusiasta',   message: 'Activa "Disponible ahora" en los filtros para ver solo a quienes pueden atenderte hoy.', animate: 'bounce' },
  { expression: 'sorprendido',  message: 'Te muestro primero a quienes están más cerca de tu zona, con su distancia real.', animate: 'wave' },
  { expression: 'pensativo',    message: 'Analizo distancia, reputación y disponibilidad para darte la mejor opción.', animate: 'idle' },
  { expression: 'concentrado',  message: 'Las reseñas son verificadas: solo clientes con servicio completado pueden opinar.', animate: 'float' },
];

export const MascotAssistant: React.FC<MascotAssistantProps> = ({
  currentTrade,
  activeView = 'directorio',
  customMessage,
}) => {
  const { role } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [interactiveState, setInteractiveState] = useState<ManyState | null>(null);
  const [isWaving, setIsWaving] = useState(false);
  const [interactionIndex, setInteractionIndex] = useState(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Física de resorte para avatar y burbuja
  const [avatarSpring, avatarApi] = useSpring(() => ({
    scale: 1,
    config: config.wobbly
  }));

  const bubbleTransitions = useTransition(isOpen, {
    from: { opacity: 0, transform: 'scale(0.85) translateY(14px)' },
    enter: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    leave: { opacity: 0, transform: 'scale(0.9) translateY(10px)' },
    config: { tension: 340, friction: 24 }
  });

  const defaultState: ManyState = useMemo(() => {
    if (customMessage) {
      return { expression: 'entusiasta', message: customMessage, animate: 'wave' };
    }
    if (currentTrade) {
      const tradeLabels: Partial<Record<TradeCategory, string>> = {
        electricidad: 'electricidad',
        plomeria: 'plomería',
        pintura: 'pintura',
        cerrajeria: 'cerrajería',
        electrodomesticos: 'electrodomésticos',
        computacion: 'computación',
        hogar: 'hogar',
        mascotas: 'cuidado de mascotas',
        aseo: 'aseo',
        jardineria: 'jardinería',
        albanileria: 'albañilería',
        clases: 'clases particulares',
      };
      return {
        expression: 'pensativo',
        message: `Buscando expertos en ${tradeLabels[currentTrade] ?? currentTrade}. Revisa las reseñas verificadas.`,
        animate: 'idle',
      };
    }
    const contextKey = activeView === 'directorio' ? `directorio_${role}` : activeView;
    return CONTEXT_STATES[contextKey] ?? CONTEXT_STATES.directorio_seeker;
  }, [role, activeView, customMessage, currentTrade]);

  const baseState = interactiveState ?? defaultState;
  const currentState: ManyState = isWaving ? { ...baseState, animate: 'wave' } : baseState;

  // Auto-idle timer: wave every 15s to draw attention
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      if (!interactiveState) {
        setIsWaving(true);
        setTimeout(() => {
          setIsWaving(false);
        }, 900);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isOpen, interactiveState]);

  const handleManyClick = () => {
    // Reacción elástica de Many
    avatarApi.start({
      to: [{ scale: 1.2 }, { scale: 1 }],
      from: { scale: 0.88 }
    });

    const next = INTERACTION_MESSAGES[interactionIndex % INTERACTION_MESSAGES.length];
    setInteractiveState(next);
    setInteractionIndex(i => i + 1);

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setInteractiveState(null);
    }, 4000);
  };

  return (
    <aside aria-label="Asistente interactivo Many" className="many-assistant">
      {bubbleTransitions((style, item) =>
        item ? (
          <animated.div style={style} className="many-bubble many-assistant__bubble">
            <div className="many-assistant__head">
              <span className="many-assistant__name">
                <span className="many-assistant__status" aria-hidden="true" />
                Many
              </span>
              <button
                type="button"
                className="many-assistant__close"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar asistente"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>

            <p className="many-assistant__message" aria-live="polite">
              {currentState.message}
            </p>

            <button type="button" className="many-assistant__hint" onClick={handleManyClick}>
              <ChevronRight size={12} aria-hidden="true" />
              Haz clic en Many para más consejos
            </button>
          </animated.div>
        ) : null
      )}

      <div className="many-assistant__row">
        {!isOpen && (
          <button type="button" className="many-assistant__open" onClick={() => setIsOpen(true)}>
            Hablar con Many
          </button>
        )}

        <animated.div
          style={{
            transform: avatarSpring.scale.to(s => `scale(${s})`),
            display: 'inline-flex',
            willChange: 'transform'
          }}
        >
          <MascotAvatar
            trade={currentTrade}
            expression={currentState.expression}
            size="md"
            animate={currentState.animate}
            onClick={handleManyClick}
          />
        </animated.div>
      </div>
    </aside>
  );
};
