import React from 'react';
import './ui.css';

type CardProps =
  | ({ interactive?: false } & React.HTMLAttributes<HTMLDivElement>)
  | ({ interactive: true } & React.ButtonHTMLAttributes<HTMLButtonElement>);

/**
 * Tarjeta de vidrio (profundidad 1). Con `interactive` se renderiza como <button>
 * para que sea accesible con teclado.
 */
export const Card: React.FC<CardProps> = ({ interactive, className = '', ...rest }) => {
  if (interactive) {
    const { type = 'button', ...buttonProps } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button type={type} className={`oy-card oy-card--interactive ${className}`.trim()} {...buttonProps} />
    );
  }
  return <div className={`oy-card ${className}`.trim()} {...(rest as React.HTMLAttributes<HTMLDivElement>)} />;
};
