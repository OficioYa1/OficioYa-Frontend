import React, { useState } from 'react';
import { playTactileClick } from '../../utils/audioChimes';
import './DoodleScribble.css';

export interface DoodleScribbleProps {
  children: React.ReactNode;
  type?: 'ellipse' | 'underline';
  strokeColor?: string;
  className?: string;
  onClick?: () => void;
  initiallyDrawn?: boolean;
}

/**
 * DoodleScribble inspirado en la icónica microinteracción de trazo SVG de niccolomiranda.com.
 * Al pasar el mouse, un trazo a mano alzada de lápiz editorial (elipse o subrayado)
 * se dibuja progresivamente alrededor del texto usando stroke-dashoffset con física elástica.
 */
export const DoodleScribble: React.FC<DoodleScribbleProps> = ({
  children,
  type = 'ellipse',
  strokeColor,
  className = '',
  onClick,
  initiallyDrawn = false
}) => {
  const [isDrawn, setIsDrawn] = useState(initiallyDrawn);

  const handleMouseEnter = () => {
    setIsDrawn(true);
    playTactileClick();
  };

  const handleMouseLeave = () => {
    if (!initiallyDrawn) setIsDrawn(false);
  };

  return (
    <span
      className={`niccolo-doodle-wrap ${isDrawn ? 'is-drawn' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <span className="niccolo-doodle-text">{children}</span>

      {type === 'ellipse' ? (
        <svg
          className="niccolo-doodle-svg"
          viewBox="0 0 500 150"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Elipse orgánica con ligera inclinación de boceto */}
          <path
            className="niccolo-doodle-path"
            d="M 28,78 C 30,38 120,18 250,18 C 380,18 472,36 470,76 C 468,118 375,134 250,134 C 115,134 26,114 28,78 Z"
            style={strokeColor ? { stroke: strokeColor } : undefined}
          />
        </svg>
      ) : (
        <svg
          className="niccolo-doodle-svg niccolo-doodle-svg--underline"
          viewBox="0 0 300 24"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Subrayado con doble onda de lápiz */}
          <path
            className="niccolo-doodle-path"
            d="M 4,14 C 70,6 180,20 296,12"
            style={strokeColor ? { stroke: strokeColor } : undefined}
          />
        </svg>
      )}
    </span>
  );
};
