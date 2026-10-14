import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TrueFocusProps {
  sentence: string;
  blurAmount?: number;
  borderColor?: string;
  animationDuration?: number;
}

export const TrueFocus: React.FC<TrueFocusProps> = ({
  sentence,
  blurAmount = 3,
  borderColor = '#2F6BFF',
  animationDuration = 0.5
}) => {
  const words = sentence.split(' ');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusRect, setFocusRect] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const updateFocusRect = () => {
      if (hoveredIndex === null) return;
      
      const activeElement = wordRefs.current[hoveredIndex];
      const container = containerRef.current;
      
      if (activeElement && container) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();
        
        setFocusRect({
          width: activeRect.width,
          height: activeRect.height,
          x: activeRect.left - containerRect.left,
          y: activeRect.top - containerRect.top
        });
      }
    };

    updateFocusRect();
    window.addEventListener('resize', updateFocusRect);
    return () => window.removeEventListener('resize', updateFocusRect);
  }, [hoveredIndex]);

  return (
    <div 
      ref={containerRef} 
      onPointerLeave={() => setHoveredIndex(null)}
      style={{ 
        position: 'relative', 
        display: 'inline-flex', 
        flexWrap: 'wrap', 
        gap: '8px', 
        justifyContent: 'center',
        padding: '12px',
        cursor: 'pointer'
      }}
    >
      <motion.div
        initial={false}
        animate={{
          width: hoveredIndex !== null ? focusRect.width + 16 : 0,
          height: hoveredIndex !== null ? focusRect.height + 12 : 0,
          x: hoveredIndex !== null ? focusRect.x - 8 : focusRect.x,
          y: hoveredIndex !== null ? focusRect.y - 6 : focusRect.y,
          opacity: hoveredIndex !== null ? 1 : 0
        }}
        transition={{
          type: 'spring',
          stiffness: 250,
          damping: 25,
          mass: 0.8,
          duration: animationDuration
        }}
        style={{
          position: 'absolute',
          border: `2px solid ${borderColor}`,
          borderRadius: '8px',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          top: 0,
          left: 0
        }}
      />
      
      {words.map((word, index) => {
        const isHovered = hoveredIndex === index;
        const isAnyHovered = hoveredIndex !== null;
        
        return (
          <motion.span
            key={index}
            ref={(el) => { wordRefs.current[index] = el; }}
            onPointerEnter={() => setHoveredIndex(index)}
            animate={{
              filter: !isAnyHovered || isHovered ? 'blur(0px)' : `blur(${blurAmount}px)`,
              opacity: !isAnyHovered || isHovered ? 1 : 0.6
            }}
            transition={{ duration: animationDuration }}
            style={{
              display: 'inline-block',
              position: 'relative',
              zIndex: 1,
              transition: 'color 0.3s ease'
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
};
