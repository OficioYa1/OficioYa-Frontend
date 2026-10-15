import React from 'react';
import './RollingText.css';

export interface RollingTextProps {
  text: string;
  alternateText?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * RollingText inspirado en la barra de navegación de danilodemarco.com
 * Cada enlace tiene dos capas apiladas: al hacer hover, la primera sube y la segunda
 * entra desde abajo con una curva cúbica fluida tipo tipografía editorial cinemática.
 */
export const RollingText: React.FC<RollingTextProps> = ({
  text,
  alternateText,
  className = '',
  onClick
}) => {
  return (
    <span
      className={`danilo-rolling-text ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="danilo-rolling-track">
        <span className="danilo-rolling-primary">{text}</span>
        <span className="danilo-rolling-secondary" aria-hidden="true">
          {alternateText || text}
        </span>
      </span>
    </span>
  );
};
