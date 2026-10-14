import React, { useEffect, useState } from 'react';
import type { PushNotification } from '../../types';
import { Bell, CheckCircle2, MessageSquare, AlertCircle, X } from 'lucide-react';
import { MascotAvatar } from '../mascot/MascotAvatar';

interface PushNotificationToastProps {
  notification: PushNotification | null;
  onDismiss: () => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onDismiss
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification, onDismiss]);

  if (!notification && !visible) return null;

  const getIcon = () => {
    if (!notification) return <Bell size={18} />;
    switch (notification.type) {
      case 'request':
        return <Bell size={18} color="#EA580C" />;
      case 'acceptance':
        return <CheckCircle2 size={18} color="#10B981" />;
      case 'message':
        return <MessageSquare size={18} color="#2563EB" />;
      default:
        return <AlertCircle size={18} color="#6366F1" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '380px',
        width: 'calc(100% - 40px)',
        transform: visible ? 'translateY(0)' : 'translateY(-30px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      <div
        className="card"
        style={{
          boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
          border: '1.5px solid var(--role-primary)',
          borderRadius: '16px',
          padding: '14px 16px',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}
      >
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
          <MascotAvatar size="xs" />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            {getIcon()}
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {notification?.title}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.35 }}>
            {notification?.body}
          </p>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
            Push en tiempo real (RF-61) • {notification?.timestamp}
          </span>
        </div>

        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
          }}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
