import React from 'react';
import './ui.css';

type ButtonVariant = 'primary' | 'trust' | 'energy' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

/**
 * Botón base. `primary` es la acción de conversión ("Contratar ahora"),
 * `trust` las acciones estructurales y `energy` el CTA de marca sobre azul.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      block = false,
      loading = false,
      icon,
      iconRight,
      className = '',
      children,
      disabled,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const classes = [
      'oy-btn',
      `oy-btn--${variant}`,
      size !== 'md' ? `oy-btn--${size}` : '',
      block ? 'oy-btn--block' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? <span className="oy-btn__spinner" aria-hidden="true" /> : icon}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);

Button.displayName = 'Button';
