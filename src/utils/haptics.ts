/**
 * haptics.ts — Utilidad de feedback háptico táctil
 * Inspirado en el motor táctil Web Haptics de bleibtgleich.dev
 * 
 * Proporciona micro-vibraciones físicas coordinadas con las animaciones de la UI.
 */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

export const triggerHaptic = (style: HapticStyle = 'light'): void => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (style) {
      case 'light':
      case 'selection':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(38);
        break;
      case 'success':
        navigator.vibrate([12, 40, 24]);
        break;
      case 'warning':
        navigator.vibrate([28, 30, 28]);
        break;
      case 'error':
        navigator.vibrate([45, 35, 45]);
        break;
    }
  } catch {
    // Silencio seguro si el SO no permite vibración programática
  }
};
