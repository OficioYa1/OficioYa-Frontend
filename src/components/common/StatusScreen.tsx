import type { ReactNode } from 'react';
import { MascotAvatar } from '../mascot/MascotAvatar';
import './StatusScreen.css';

interface StatusScreenProps {
  code: string;
  title: string;
  message: string;
  actions: ReactNode;
}

/** Pantalla de estado guiada por Many (404, errores inesperados). */
export const StatusScreen = ({ code, title, message, actions }: StatusScreenProps) => (
  <section className="status-screen" role="alert" aria-live="assertive">
    <div className="status-screen__card glass-2">
      <MascotAvatar size="lg" forceImage="base" animate="idle" />
      <p className="status-screen__code" aria-hidden="true">{code}</p>
      <h1 className="status-screen__title">{title}</h1>
      <p className="status-screen__message">{message}</p>
      <div className="status-screen__actions">{actions}</div>
    </div>
  </section>
);
