import { useEffect, useState } from 'react';

/** true cuando la ventana bajó más de `threshold` px. Listener pasivo y un cálculo por cuadro. */
export function useScrolledPast(threshold: number) {
  const [past, setPast] = useState(() => typeof window !== 'undefined' && window.scrollY > threshold);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setPast(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return past;
}
