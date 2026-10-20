import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CornerDownLeft, Sparkles } from 'lucide-react';
import { playTactileClick, playChime } from '../../utils/audioChimes';
import { triggerHaptic } from '../../utils/haptics';
import './CursorQuickPrompt.css';

export interface CursorQuickPromptProps {
  onSearch?: (query: string) => void;
}

const QUICK_SUGGESTIONS = [
  'Plomero urgente',
  'Electricista RETIE',
  'Cambio de chapa',
  'Pintor de interiores',
  'Aseo de mudanza'
];

/**
 * CursorQuickPrompt — Chat/búsqueda flotante anclado al cursor
 * Inspirado en el sistema de cursor interactivo de bleibtgleich.dev (tecla "/")
 */
export const CursorQuickPrompt: React.FC<CursorQuickPromptProps> = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [hasMouse, setHasMouse] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Escuchar movimiento del cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!hasMouse) setHasMouse(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [hasMouse]);

  // Escuchar tecla "/" para abrir y "Escape" para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario ya está escribiendo en otro input o textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || (e.target as HTMLElement)?.isContentEditable;

      if (e.key === '/' && !isInput && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
        triggerHaptic('light');
        playTactileClick();
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        playTactileClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Enfocar automáticamente el input al abrirse
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    playChime();
    triggerHaptic('success');
    onSearch?.(query.trim());
    setIsOpen(false);
    setQuery('');
  };

  const handleSelectSuggestion = (sug: string) => {
    setQuery(sug);
    playChime();
    triggerHaptic('success');
    onSearch?.(sug);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón flotante discreto en esquina inferior derecha para invocar sin teclado */}
      {!isOpen && (
        <button
          type="button"
          className="oy-cursor-hint-badge"
          onClick={() => {
            setIsOpen(true);
            playTactileClick();
            triggerHaptic('light');
          }}
          aria-label="Abrir búsqueda rápida con tecla slash"
          title="Búsqueda rápida al cursor (Presiona /)"
        >
          <Sparkles size={13} className="oy-hint-sparkle" />
          <span className="oy-hint-text">Búsqueda al puntero</span>
          <kbd className="oy-hint-kbd">/</kbd>
        </button>
      )}

      {/* Globo flotante anclado al cursor (estilo bleibtgleich.dev) */}
      <AnimatePresence>
        {isOpen && (
          <div className="oy-cursor-prompt-overlay" onClick={() => setIsOpen(false)}>
            <motion.div
              className="oy-cursor-prompt-bubble"
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
              style={
                hasMouse && mousePos.x > 0
                  ? {
                      position: 'fixed',
                      left: Math.min(mousePos.x + 18, window.innerWidth - 340),
                      top: Math.min(mousePos.y + 18, window.innerHeight - 200)
                    }
                  : undefined
              }
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} className="oy-prompt-form">
                <Search size={15} className="oy-prompt-icon" />
                <input
                  ref={inputRef}
                  type="text"
                  className="oy-prompt-input"
                  placeholder="Escribe un oficio o urgencia..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  maxLength={60}
                />
                {query ? (
                  <button type="submit" className="oy-prompt-submit-btn" aria-label="Buscar">
                    <CornerDownLeft size={13} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="oy-prompt-close-btn"
                    onClick={() => setIsOpen(false)}
                    aria-label="Cerrar búsqueda"
                  >
                    <X size={13} />
                  </button>
                )}
              </form>

              {/* Sugerencias rápidas */}
              <div className="oy-prompt-suggestions">
                <span className="oy-prompt-sug-title">Populares en Bogotá:</span>
                <div className="oy-prompt-pills">
                  {QUICK_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      className="oy-prompt-pill"
                      onClick={() => handleSelectSuggestion(sug)}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
