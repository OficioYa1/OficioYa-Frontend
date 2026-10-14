import React, { useEffect } from 'react';
import { Bell, CheckCircle2, MessageSquare, Info, X } from 'lucide-react';
import type { PushNotification } from '../../types';
import { Shredder } from '../ui';
import { MascotAvatar } from '../mascot/MascotAvatar';
import './NotificationInbox.css';

interface NotificationInboxProps {
  notifications: PushNotification[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

const CARD_HEIGHT = 76;
const GAP = 10;
const SLIT = 5;
const FALL = 120;
const MAX_VISIBLE = 5;

const TYPE_ICON: Record<PushNotification['type'], React.ReactNode> = {
  request: <Bell size={17} color="var(--color-action-strong)" aria-hidden="true" />,
  acceptance: <CheckCircle2 size={17} color="var(--color-status-text)" aria-hidden="true" />,
  message: <MessageSquare size={17} color="var(--color-trust)" aria-hidden="true" />,
  system: <Info size={17} color="var(--color-accent-text)" aria-hidden="true" />
};

/**
 * Bandeja de notificaciones. Para borrar una se arrastra hacia la ranura
 * de la trituradora o se enfoca y se pulsa Supr.
 */
export const NotificationInbox: React.FC<NotificationInboxProps> = ({ notifications, onClose, onDelete }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const visible = notifications.slice(0, MAX_VISIBLE);
  const height = visible.length * (CARD_HEIGHT + GAP) + SLIT + FALL;

  return (
    <>
      <div className="inbox-backdrop" onClick={onClose} />
      <section className="inbox-panel" role="dialog" aria-modal="false" aria-labelledby="inbox-title">
        <header className="inbox-head">
          <div>
            <h2 id="inbox-title" className="inbox-title">Notificaciones</h2>
            {visible.length > 0 && (
              <p className="inbox-hint">Arrastra una notificación hasta la ranura para eliminarla, o enfócala y pulsa Supr.</p>
            )}
          </div>
          <button type="button" className="inbox-close" onClick={onClose} aria-label="Cerrar notificaciones">
            <X size={18} />
          </button>
        </header>

        {visible.length === 0 ? (
          <div className="inbox-empty">
            <MascotAvatar size="md" animate="wave" forceImage="wave" />
            <strong>¡Todo al día!</strong>
            <p>No tienes notificaciones pendientes.</p>
          </div>
        ) : (
          <Shredder
            className="inbox-shredder"
            items={visible}
            width={348}
            height={height}
            inset={0}
            gap={GAP}
            slitHeight={SLIT}
            fallHeight={FALL}
            stripWidth={9}
            itemLabel={n => `${n.title}. ${n.body}. Pulsa Supr para eliminar`}
            onShred={n => onDelete(n.id)}
            renderItem={n => (
              <article className="inbox-card" data-unread={n.read ? undefined : ''}>
                <span className="inbox-icon">{TYPE_ICON[n.type]}</span>
                <div className="inbox-text">
                  <p className="inbox-card-title">
                    <span>{n.title}</span>
                    <span className="inbox-time">{n.timestamp}</span>
                  </p>
                  <p className="inbox-card-body">{n.body}</p>
                </div>
              </article>
            )}
          />
        )}
      </section>
    </>
  );
};
