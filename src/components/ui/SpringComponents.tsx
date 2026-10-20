import React, { useRef, useState, useEffect } from 'react';
import { useSpring, animated, config as springConfig } from '@react-spring/web';

/**
 * Hook interno para detectar si el usuario prefiere movimiento reducido
 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Hook interno para detectar si el dispositivo soporta puntero fino y hover
 */
function useCanHover(): boolean {
  const [canHover, setCanHover] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onChange = () => setCanHover(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return canHover;
}

// ─────────────────────────────────────────────────────────────
// 1. SpringCounter: Contador numérico con física de resorte
// ─────────────────────────────────────────────────────────────

export interface SpringCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const SpringCounter: React.FC<SpringCounterProps> = ({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  const reduced = usePrefersReducedMotion();

  const { num } = useSpring({
    from: { num: 0 },
    to: { num: value },
    delay: 80,
    config: {
      mass: 1,
      tension: 140,
      friction: 20
    },
    pause: reduced
  });

  if (reduced) {
    const formatted = decimals > 0 
      ? value.toFixed(decimals) 
      : Math.round(value).toLocaleString('es-CO');
    return <span className={className}>{prefix}{formatted}{suffix}</span>;
  }

  return (
    <animated.span className={className}>
      {num.to(v => {
        const formatted = decimals > 0 
          ? v.toFixed(decimals) 
          : Math.round(v).toLocaleString('es-CO');
        return `${prefix}${formatted}${suffix}`;
      })}
    </animated.span>
  );
};

// ─────────────────────────────────────────────────────────────
// 2. SpringTilt: Tarjeta con inclinación 3D e inercia física
// ─────────────────────────────────────────────────────────────

export interface SpringTiltProps {
  children: React.ReactNode;
  maxTilt?: number;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const SpringTilt: React.FC<SpringTiltProps> = ({
  children,
  maxTilt = 7,
  scale = 1.015,
  className = '',
  style = {}
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const canHover = useCanHover();
  const reduced = usePrefersReducedMotion();

  const [{ xys }, api] = useSpring(() => ({
    xys: [0, 0, 1],
    config: {
      mass: 1.2,
      tension: 380,
      friction: 26
    }
  }));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !canHover || reduced) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = -(y / (rect.height / 2)) * maxTilt;
    const rotY = (x / (rect.width / 2)) * maxTilt;

    api.start({ xys: [rotX, rotY, scale] });
  };

  const handleMouseLeave = () => {
    if (!canHover || reduced) return;
    api.start({ xys: [0, 0, 1] });
  };

  if (!canHover || reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <animated.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: xys.to((x, y, s) => `perspective(900px) rotateX(${x.toFixed(2)}deg) rotateY(${y.toFixed(2)}deg) scale(${s.toFixed(3)})`),
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
    >
      {children}
    </animated.div>
  );
};

// ─────────────────────────────────────────────────────────────
// 3. SpringPress: Compresión táctil con retorno elástico
// ─────────────────────────────────────────────────────────────

export interface SpringPressProps {
  children: React.ReactNode;
  scaleDown?: number;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
}

export const SpringPress: React.FC<SpringPressProps> = ({
  children,
  scaleDown = 0.96,
  className = '',
  onClick,
  style = {}
}) => {
  const reduced = usePrefersReducedMotion();

  const [{ s }, api] = useSpring(() => ({
    s: 1,
    config: springConfig.wobbly
  }));

  const handlePointerDown = () => {
    if (reduced) return;
    api.start({ s: scaleDown });
  };

  const handlePointerUp = () => {
    if (reduced) return;
    api.start({ s: 1 });
  };

  if (reduced) {
    return (
      <div className={className} onClick={onClick} style={style}>
        {children}
      </div>
    );
  }

  return (
    <animated.div
      className={className}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        ...style,
        transform: s.to(val => `scale(${val.toFixed(3)})`),
        display: 'inline-flex',
        cursor: onClick ? 'pointer' : undefined,
        willChange: 'transform'
      }}
    >
      {children}
    </animated.div>
  );
};
