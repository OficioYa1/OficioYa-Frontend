import React, { useState, useRef, useCallback } from 'react';
import { Sliders } from 'lucide-react';
import './BeforeAfterSlider.css';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  caption?: string;
  tradeLabel?: string;
  className?: string;
  initialPosition?: number;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeAlt = 'Estado antes de la reparación',
  afterAlt = 'Resultado después de la reparación',
  caption,
  tradeLabel,
  className = '',
  initialPosition = 50
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(initialPosition);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(Math.round(percentage));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      updatePosition(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    updatePosition(e.touches[0].clientX);
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <figure className={`before-after-slider ${isDragging ? 'before-after-slider--dragging' : ''} ${className}`}>
      <div
        ref={containerRef}
        className="before-after-slider__container"
        onMouseDown={handleMouseDown}
        onMouseMove={e => isDragging && updatePosition(e.clientX)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* Imagen del Después (Fondo Completo) */}
        <div className="before-after-slider__after">
          <img
            src={afterImage}
            alt={afterAlt}
            className="before-after-slider__image"
            draggable={false}
          />
          <span className="before-after-slider__badge before-after-slider__badge--after">
            Después
          </span>
        </div>

        {/* Imagen del Antes (Recortada por el clip-path horizontal) */}
        <div
          className="before-after-slider__before"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforeImage}
            alt={beforeAlt}
            className="before-after-slider__image"
            draggable={false}
          />
          <span className="before-after-slider__badge before-after-slider__badge--before">
            Antes
          </span>
        </div>

        {/* Línea Divisoria y Agarrador */}
        <div
          className="before-after-slider__handle"
          style={{ left: `${sliderPosition}%` }}
          aria-hidden="true"
        >
          <div className="before-after-slider__line" />
          <div className="before-after-slider__button">
            <Sliders size={14} className="before-after-slider__icon" />
          </div>
        </div>

        {/* Control de rango accesible para teclado y lectores de pantalla (WCAG AA) */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleRangeChange}
          className="before-after-slider__range"
          aria-label={`Comparador antes y después de trabajo${tradeLabel ? ` en ${tradeLabel}` : ''}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={sliderPosition}
          aria-valuetext={`${sliderPosition}% de la foto de antes visible`}
        />
      </div>

      {caption && (
        <figcaption className="before-after-slider__caption">
          {tradeLabel && <span className="before-after-slider__caption-tag">{tradeLabel}</span>}
          <span className="before-after-slider__caption-text">{caption}</span>
        </figcaption>
      )}
    </figure>
  );
};
