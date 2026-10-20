import React, { useRef, useState } from 'react';
import { playTactileClick } from '../../utils/audioChimes';
import './HoloCard3D.css';

export interface HoloCard3DProps {
  children: React.ReactNode;
  maxTilt?: number;
  className?: string;
  onClick?: () => void;
  sheenColor?: string;
}

/**
 * HoloCard3D inspirado en las tarjetas y piezas de producto 3D de thibaut.cool.
 * - Calcula la perspectiva 3D (rotateX / rotateY) en tiempo real según el cursor.
 * - Proyecta un brillo especular móvil (sheen) que reacciona a la luz virtual.
 * - Produce un sutil clic táctil retro con la Web Audio API al presionar.
 */
export const HoloCard3D: React.FC<HoloCard3DProps> = ({
  children,
  maxTilt = 12,
  className = '',
  onClick,
  sheenColor = 'rgba(255, 255, 255, 0.45)'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState('rotateX(0deg) rotateY(0deg)');
  const [sheenPos, setSheenPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * maxTilt;
    const rotY = ((x - centerX) / centerX) * maxTilt;

    setTransformStyle(`rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
    setSheenPos({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100)
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle('rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  const handleClick = () => {
    playTactileClick();
    onClick?.();
  };

  return (
    <div
      className={`thibaut-holo-card-wrap ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div
        ref={cardRef}
        className="thibaut-holo-card"
        style={{ transform: transformStyle }}
      >
        {/* Reflejo especular móvil */}
        <div
          className="thibaut-holo-sheen"
          style={{
            background: `radial-gradient(circle at ${sheenPos.x}% ${sheenPos.y}%, ${sheenColor} 0%, transparent 65%)`
          }}
        />
        {children}
      </div>
    </div>
  );
};
