import React, { useRef, useState } from 'react';

export interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface OptionWheelProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  visibleCount?: number; // Cuántos elementos mostrar a cada lado del centro (ej. 2 = 5 visibles en total)
}

export const OptionWheel: React.FC<OptionWheelProps> = ({
  options,
  value,
  onChange,
  visibleCount = 2
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Encontrar el índice activo inicial
  const initialIndex = options.findIndex(o => o.value === value);
  const activeIndex = initialIndex === -1 ? 0 : initialIndex;

  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  // Navegar al índice, asegurando límites si no es loop (aquí no usaremos loop para no complicar el drag)
  const goToIndex = (index: number) => {
    if (index < 0) index = 0;
    if (index >= options.length) index = options.length - 1;
    onChange(options[index].value);
  };

  // Manejo de Rueda del Ratón (Wheel)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 10) {
      goToIndex(activeIndex + 1);
    } else if (e.deltaY < -10) {
      goToIndex(activeIndex - 1);
    }
  };

  // Manejo de Arrastre (Drag)
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const diff = e.clientY - startY;
    // Si se arrastra 40px hacia arriba o abajo, cambiamos el índice
    if (diff > 40) {
      goToIndex(activeIndex - 1);
      setStartY(e.clientY);
    } else if (diff < -40) {
      goToIndex(activeIndex + 1);
      setStartY(e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  // Manejo de Teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      goToIndex(activeIndex - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      goToIndex(activeIndex + 1);
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        position: 'relative',
        height: '240px',
        width: '100%',
        maxWidth: '300px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        outline: 'none',
        touchAction: 'none', // Evitar scroll de la página al arrastrar
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {options.map((opt, i) => {
          const offset = i - activeIndex;
          const absOffset = Math.abs(offset);
          
          // Si está fuera de los visibles + 1 de buffer, no lo renderizamos o lo ocultamos totalmente
          if (absOffset > visibleCount + 1) return null;

          // Parámetros físicos (curve, tilt, blur, fade)
          const translateY = offset * 45; // Separación vertical
          const scale = 1 - absOffset * 0.15; // Más pequeño cuanto más lejos
          const opacity = 1 - absOffset * 0.35; // Más transparente cuanto más lejos
          const rotateX = offset * -20; // Efecto de cilindro (tilt/curve)
          const blur = absOffset > 0 ? `${absOffset * 1.5}px` : '0px'; // Desenfoque (blur)

          return (
            <div
              key={opt.value}
              onClick={() => goToIndex(i)}
              style={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                transform: `translateY(${translateY}px) scale(${scale}) perspective(600px) rotateX(${rotateX}deg)`,
                opacity: opacity,
                filter: `blur(${blur})`,
                zIndex: 10 - absOffset,
                cursor: 'pointer',
                color: offset === 0 ? 'var(--role-primary)' : 'var(--color-text-muted)'
              }}
            >
              {/* Contenedor del Icono */}
              {opt.icon && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: offset === 0 ? 'var(--color-surface)' : 'transparent',
                  padding: offset === 0 ? '8px' : '0',
                  borderRadius: '50%',
                  boxShadow: offset === 0 ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  {opt.icon}
                </div>
              )}
              {/* Etiqueta de texto */}
              <span style={{
                fontSize: offset === 0 ? '20px' : '18px',
                fontWeight: offset === 0 ? 800 : 500,
                letterSpacing: '-0.3px',
                transition: 'all 0.3s'
              }}>
                {opt.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
