import React, { useEffect, useState } from 'react';
import type { PushNotification } from '../../types';
import { Bell, CheckCircle2, MessageSquare, AlertCircle, X } from 'lucide-react';
import { MascotAvatar } from '../mascot/MascotAvatar';
import { useLanguage } from '../../context/LanguageContext';
import './PushNotificationToast.css';

interface PushNotificationToastProps {
  notification: PushNotification | null;
  onDismiss: () => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onDismiss
}) => {
  const { t } = useLanguage();
  /* id del toast que está saliendo: sale con la misma transición por la que entró */
  const [closingId, setClosingId] = useState<string | null>(null);
  const visible = !!notification && closingId !== notification.id;

  useEffect(() => {
    if (!notification) return;
    let dismiss: ReturnType<typeof setTimeout> | undefined;
    const timer = setTimeout(() => {
      setClosingId(notification.id);
      dismiss = setTimeout(onDismiss, 300);
    }, 5000);
    return () => {
      clearTimeout(timer);
      if (dismiss) clearTimeout(dismiss);
    };
  }, [notification, onDismiss]);

  if (!notification) return null;

  const close = () => {
    setClosingId(notification.id);
    setTimeout(onDismiss, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'request':
        return <Bell size={18} color="var(--color-action-strong)" aria-hidden="true" />;
      case 'acceptance':
        return <CheckCircle2 size={18} color="var(--color-status-text)" aria-hidden="true" />;
      case 'message':
        return <MessageSquare size={18} color="var(--color-trust)" aria-hidden="true" />;
      default:
        return <AlertCircle size={18} color="var(--color-accent-text)" aria-hidden="true" />;
    }
  };

  return (
    <div
      key={notification.id}
      className={`push-toast${visible ? ' push-toast--visible' : ''}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="push-toast__card glass-2">
        <div className="push-toast__avatar">
          <MascotAvatar size="xs" />
        </div>

        <div className="push-toast__text">
          <div className="push-toast__head">
            <span className="push-toast__icon">{getIcon()}</span>
            <span className="push-toast__title">{notification.title}</span>
          </div>
          <p className="push-toast__body">{notification.body}</p>
          <span className="push-toast__time">{notification.timestamp}</span>
        </div>

        <button
          type="button"
          className="push-toast__close"
          aria-label={t('app.toast.close')}
          onClick={close}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
