import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export interface MagneticProps {
  children: React.ReactNode;
  /** Intensidad de atracción magnética (0 a 1). Por defecto 0.28. */
  strength?: number;
  /** Radio de influencia en píxeles. Por defecto 100. */
  radius?: number;
  className?: string;
  active?: boolean;
}

const SPRING_CONFIG = { stiffness: 280, damping: 18, mass: 0.6 };

/**
 * Componente Magnetic inspirado en bleibtgleich.dev y Emil Kowalski.
 * Atrae el elemento hacia el cursor suavemente con física de resorte.
 * Solo activo en dispositivos con puntero fino (mouse/trackpad).
 */
export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 0.28,
  radius = 100,
  className = '',
  active = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [canHover, setCanHover] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
           !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const rmMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setCanHover(mq.matches && !rmMq.matches);
    mq.addEventListener('change', update);
    rmMq.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      rmMq.removeEventListener('change', update);
    };
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, SPRING_CONFIG);
  const springY = useSpring(y, SPRING_CONFIG);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active || !canHover || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
    if (dist < radius) {
      x.set((e.clientX - centerX) * strength);
      y.set((e.clientY - centerY) * strength);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!active || !canHover) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
};
