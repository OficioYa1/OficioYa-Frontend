import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface TextRevealProps {
  text: string;
  /** Tipo de división: 'words' (por palabras) o 'chars' (carácter por carácter). Por defecto 'words'. */
  splitBy?: 'words' | 'chars';
  /** Retardo inicial en segundos. */
  delay?: number;
  /** Duración de la animación por elemento. */
  duration?: number;
  /** Escalonamiento (stagger) entre elementos. */
  stagger?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

/**
 * TextReveal inspirado en Danilo De Marco y bleibtgleich.dev (SplitText).
 * Revela tipografía con máscaras de recorte 'overflow: hidden' y animación vertical
 * escalonada con curvas editoriales suaves.
 */
export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  splitBy = 'words',
  delay = 0,
  duration = 0.65,
  stagger = 0.035,
  className = '',
  as: Component = 'span'
}) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <Component className={className}>{text}</Component>;
  }

  const items = splitBy === 'words' ? text.split(' ') : text.split('');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay
      }
    }
  };

  const childVariants = {
    hidden: {
      y: '115%',
      opacity: 0
    },
    visible: {
      y: '0%',
      opacity: 1,
      transition: {
        duration,
        ease: [0.215, 0.61, 0.355, 1] as const
      }
    }
  };

  const MotionComponent = motion[Component] as typeof motion.span;

  return (
    <MotionComponent
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={containerVariants}
      style={{ display: 'inline-block' }}
    >
      {items.map((item, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'bottom',
            paddingBottom: '0.08em',
            marginRight: splitBy === 'words' && index < items.length - 1 ? '0.28em' : undefined
          }}
        >
          <motion.span
            variants={childVariants}
            style={{ display: 'inline-block', willChange: 'transform' }}
          >
            {item}
          </motion.span>
        </span>
      ))}
    </MotionComponent>
  );
};
