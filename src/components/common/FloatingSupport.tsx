import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Search, Zap, MessageSquareText, X, ArrowUpRight, ChevronRight } from 'lucide-react';
import { BRAND_ASSETS } from '../../utils/assets';
import './FloatingSupport.css';

export interface FloatingSupportProps {
  onStartSeeker?: (trade?: string) => void;
  onOpenContact?: () => void;
  onSelectTrade?: (trade: string) => void;
}

export const FloatingSupport: React.FC<FloatingSupportProps> = ({
  onStartSeeker,
  onOpenContact,
  onSelectTrade,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        btnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        cardRef.current &&
        !cardRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleActionClick = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  const scrollToFaq = () => {
    setIsOpen(false);
    const faqEl = document.getElementById('faq-section');
    if (faqEl) {
      faqEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="oy-floating-support" aria-live="polite">
      {/* Contenedor del trigger interactivo */}
      <div className="oy-floating-support__trigger-wrap">
        <button
          ref={btnRef}
          type="button"
          className="oy-floating-support__btn"
          onClick={() => setIsOpen(prev => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label="¿Necesitas una mano? Abrir asistente de soporte"
          title="¿Necesitas una mano? Soporte OficioYa"
        >
          <div className="oy-floating-support__avatar-box">
            <img
              src={BRAND_ASSETS.manySoporte}
              alt="Many el Castor"
              className="oy-floating-support__avatar-img"
            />
            <span className="oy-floating-support__live-dot" title="Soporte activo" />
          </div>

          <div className="oy-floating-support__expand-text">
            <span className="oy-floating-support__expand-title">¿Necesitas una mano?</span>
            <span className="oy-floating-support__expand-sub">Soporte y ayuda rápida</span>
          </div>
        </button>

        {/* Burbujita sutil en reposo (se oculta al hacer hover sobre el botón) */}
        {!isOpen && (
          <span className="oy-floating-support__badge" aria-hidden="true">
            ¿Necesitas una mano?
          </span>
        )}
      </div>

      {/* Popover / Menú desplegable al hacer clic */}
      {isOpen && (
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="false"
          aria-label="Asistente de ayuda rápida"
          className="oy-floating-support__card"
        >
          <div className="oy-floating-support__header">
            <div className="oy-floating-support__brand">
              <img
                src={BRAND_ASSETS.manySoporte}
                alt="Many el Castor"
                style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '50%' }}
              />
              <div>
                <h4 className="oy-floating-support__header-title">Asistente OficioYa</h4>
                <p className="oy-floating-support__header-sub">¿En qué te ayudamos hoy?</p>
              </div>
            </div>
            <button
              type="button"
              className="oy-floating-support__close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar panel de ayuda"
            >
              <X size={16} />
            </button>
          </div>

          <div className="oy-floating-support__options">
            <button
              type="button"
              className="oy-floating-support__action-btn"
              onClick={() => handleActionClick(() => onStartSeeker?.())}
            >
              <div className="oy-floating-support__action-left">
                <span className="oy-floating-support__action-icon">
                  <Search size={16} />
                </span>
                <span>Buscar expertos cerca de ti</span>
              </div>
              <ChevronRight size={14} color="#8c7a6e" />
            </button>

            <button
              type="button"
              className="oy-floating-support__action-btn"
              onClick={() =>
                handleActionClick(() => {
                  onSelectTrade?.('plomeria');
                  onStartSeeker?.('plomeria');
                })
              }
            >
              <div className="oy-floating-support__action-left">
                <span className="oy-floating-support__action-icon">
                  <Zap size={16} />
                </span>
                <span>Emergencias de plomería / luz</span>
              </div>
              <ChevronRight size={14} color="#8c7a6e" />
            </button>

            <button
              type="button"
              className="oy-floating-support__action-btn"
              onClick={scrollToFaq}
            >
              <div className="oy-floating-support__action-left">
                <span className="oy-floating-support__action-icon">
                  <HelpCircle size={16} />
                </span>
                <span>Preguntas frecuentes</span>
              </div>
              <ChevronRight size={14} color="#8c7a6e" />
            </button>

            <button
              type="button"
              className="oy-floating-support__action-btn"
              onClick={() => handleActionClick(() => onOpenContact?.())}
            >
              <div className="oy-floating-support__action-left">
                <span className="oy-floating-support__action-icon">
                  <MessageSquareText size={16} />
                </span>
                <span>Contactar soporte directo</span>
              </div>
              <ChevronRight size={14} color="#8c7a6e" />
            </button>
          </div>

          <a
            href="https://wa.me/573162209184?text=Hola,%20necesito%20ayuda%20en%20OficioYa"
            target="_blank"
            rel="noopener noreferrer"
            className="oy-floating-support__direct-link"
          >
            <span>Escribir por WhatsApp a soporte</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      )}
    </div>
  );
};
