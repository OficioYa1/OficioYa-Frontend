import React, { useState, useEffect, useRef } from 'react';
import type { MascotExpression, TradeCategory } from '../../types';
import { MascotAvatar } from './MascotAvatar';
import { useAuth } from '../../context/AuthContext';
import { X, ChevronRight } from 'lucide-react';
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
  { expression: 'guino',        message: 'Todos los profesionales tienen antecedentes verificados. Confía en las reseñas.', animate: 'float' },
  { expression: 'entusiasta',   message: '¡Respuesta promedio en menos de 20 minutos! Eso sí es velocidad.', animate: 'bounce' },
  { expression: 'sorprendido',  message: 'Hay un profesional calificado a menos de 500 metros de ti ahora mismo.', animate: 'wave' },
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
  const [currentState, setCurrentState] = useState<ManyState>(CONTEXT_STATES.directorio_seeker);
  const [interactionIndex, setInteractionIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update state based on context
  useEffect(() => {
    if (customMessage) {
      setCurrentState({ expression: 'entusiasta', message: customMessage, animate: 'wave' });
      return;
    }
    const contextKey = activeView === 'directorio'
      ? `directorio_${role}`
      : activeView;
    setCurrentState(CONTEXT_STATES[contextKey] ?? CONTEXT_STATES.directorio_seeker);
  }, [role, activeView, customMessage]);

  // Update message when trade changes
  useEffect(() => {
    if (currentTrade && !customMessage) {
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
      setCurrentState({
        expression: 'pensativo',
        message: `Buscando expertos en ${tradeLabels[currentTrade] ?? currentTrade}. Revisa las reseñas verificadas.`,
        animate: 'idle',
      });
    }
  }, [currentTrade, customMessage]);

  // Auto-idle timer: wave every 15s to draw attention
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      if (!isInteracting) {
        setCurrentState(prev => ({ ...prev, animate: 'wave' }));
        setTimeout(() => {
          setCurrentState(prev => ({ ...prev, animate: 'float' }));
        }, 900);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isOpen, isInteracting]);

  const handleManyClick = () => {
    setIsInteracting(true);
    const next = INTERACTION_MESSAGES[interactionIndex % INTERACTION_MESSAGES.length];
    setCurrentState(next);
    setInteractionIndex(i => i + 1);

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 4000);
  };

  return (
    <aside aria-label="Asistente interactivo Many" className="many-assistant">
      {isOpen && (
        <div className="many-bubble many-assistant__bubble">
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
        </div>
      )}

      <div className="many-assistant__row">
        {!isOpen && (
          <button type="button" className="many-assistant__open" onClick={() => setIsOpen(true)}>
            Hablar con Many
          </button>
        )}

        <MascotAvatar
          trade={currentTrade}
          expression={currentState.expression}
          size="md"
          animate={currentState.animate}
          onClick={handleManyClick}
        />
      </div>
    </aside>
  );
};
