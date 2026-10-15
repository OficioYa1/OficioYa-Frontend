import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, MessageSquare, Info, X } from 'lucide-react';
import type { PushNotification } from '../../types';
import { Shredder } from '../ui';
import { MascotAvatar } from '../mascot/MascotAvatar';
import { useLanguage } from '../../context/LanguageContext';
import { usePopover } from '../layout/usePopover';
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
const MAX_WIDTH = 348;
/* Panel: min(380px, 100vw - 24px), menos 16px de relleno y 1px de borde por lado */
const PANEL_CHROME = 34;

const shredderWidth = () =>
  typeof window === 'undefined'
    ? MAX_WIDTH
    : Math.max(240, Math.min(MAX_WIDTH, Math.floor(Math.min(380, window.innerWidth - 24) - PANEL_CHROME)));

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
  const { t } = useLanguage();
  const panelRef = usePopover<HTMLElement>(onClose);

  const [width, setWidth] = useState(shredderWidth);
  useEffect(() => {
    const onResize = () => setWidth(shredderWidth());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const visible = notifications.slice(0, MAX_VISIBLE);
  const height = visible.length * (CARD_HEIGHT + GAP) + SLIT + FALL;

  return (
    <>
      <div className="inbox-backdrop" onClick={onClose} aria-hidden="true" />
      <section
        ref={panelRef}
        className="inbox-panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="inbox-title"
        tabIndex={-1}
      >
        <header className="inbox-head">
          <div>
            <h2 id="inbox-title" className="inbox-title oy-display">{t('app.inbox.title')}</h2>
            {visible.length > 0 && (
              <p className="inbox-hint">{t('app.inbox.hint')}</p>
            )}
          </div>
          <button type="button" className="inbox-close" onClick={onClose} aria-label={t('app.inbox.close')}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {visible.length === 0 ? (
          <div className="inbox-empty">
            <MascotAvatar size="md" animate="wave" forceImage="wave" />
            <strong className="inbox-empty__title">{t('app.inbox.emptyTitle')}</strong>
            <p>{t('app.inbox.emptyText')}</p>
          </div>
        ) : (
          <Shredder
            className="inbox-shredder"
            items={visible}
            width={width}
            height={height}
            inset={0}
            gap={GAP}
            slitHeight={SLIT}
            fallHeight={FALL}
            stripWidth={9}
            itemLabel={n => `${n.title}. ${n.body}. ${t('app.inbox.deleteHint')}`}
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
