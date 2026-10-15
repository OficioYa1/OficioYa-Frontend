import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Conversation, ChatMessage, Worker } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Send,
  CheckCheck,
  Check,
  ArrowLeft,
  Phone,
  ShieldCheck,
  X,
  MessageCircle
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import './Chat.css';

interface ChatViewProps {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  initialConversationId?: string;
  onSendMessage: (conversationId: string, text: string) => void;
  /** OFY-51: mensaje entrante de la otra parte (respuesta simulada en el mock). */
  onReceiveMessage?: (conversationId: string, text: string) => void;
  workers: Worker[];
  onClose?: () => void;
}

const QUICK_REPLIES = [
  'Hola, ¿tienes disponibilidad hoy?',
  '¿Cuál es el valor aproximado de la visita?',
  '¿En cuánto tiempo puedes llegar?',
  'Listo, te confirmo la dirección',
  'Muchas gracias por el trabajo'
];

export const ChatView: React.FC<ChatViewProps> = ({
  conversations,
  messages,
  initialConversationId,
  onSendMessage,
  onReceiveMessage,
  workers,
  onClose
}) => {
  const { user, role } = useAuth();
  const [activeConvId, setActiveConvId] = useState<string | null>(
    initialConversationId || (conversations.length > 0 ? conversations[0].id : null)
  );
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const currentMessages = activeConvId && messages[activeConvId] ? messages[activeConvId] : [];
  const workerDetail = workers.find(w => w.id === activeConv?.workerId);

  // Auto-scroll al final del chat
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    messagesEndRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' });
  }, [currentMessages, isTyping]);

  // Esc: vuelve a la lista desde una conversación; desde la lista, cierra el panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (activeConvId) setActiveConvId(null);
      else onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeConvId, onClose]);

  useEffect(() => () => {
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
  }, []);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConvId) return;

    onSendMessage(activeConvId, text.trim());
    setInputText('');

    // Simular respuesta automática con retardo de escritura (···)
    setIsTyping(true);
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    const convId = activeConvId;
    replyTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      const simulatedReplies = [
        '¡Perfecto! Ya tengo la dirección registrada en el mapa, voy saliendo.',
        'Con gusto. Cuento con todas las herramientas y repuestos necesarios.',
        'Entendido, en unos 15 minutos estoy tocando la puerta.',
        'Listo, cualquier duda me puedes marcar directamente.'
      ];
      const randomReply = simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];
      if (onReceiveMessage) onReceiveMessage(convId, randomReply);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return createPortal(
    <aside className="chat-drawer" aria-label="Mensajes">
      {/* VISTA 1: Lista de Mensajes (Solo se muestra si no hay un chat activo) */}
      {!activeConv && (
        <div className="chat-pane chat-pane--list">
          <header className="chat-list-head">
            <div>
              <span className="chat-kicker">
                <MessageCircle size={14} aria-hidden="true" /> Chat en vivo
              </span>
              <h2 className="chat-list-title">Mensajes</h2>
              <span className="chat-muted">
                {conversations.length === 1 ? '1 conversación activa' : `${conversations.length} conversaciones activas`}
              </span>
            </div>
            {onClose && (
              <button type="button" onClick={onClose} className="oy-icon-btn" aria-label="Cerrar mensajes">
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </header>

          <div className="chat-list">
            {conversations.length === 0 ? (
              <div className="oy-empty chat-empty">
                <MascotAvatar expression="guino" size="md" animate="none" />
                <h3 className="oy-empty__title">Aún no hay mensajes</h3>
                <p className="oy-empty__text">
                  Inicia un chat desde el perfil de un profesional y aquí verás la conversación.
                </p>
                {onClose && (
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Explorar profesionales
                  </button>
                )}
              </div>
            ) : (
              <ul className="chat-list__items">
                {conversations.map(conv => {
                  const isSelected = conv.id === activeConvId;
                  return (
                    <li key={conv.id}>
                      <button
                        type="button"
                        className="chat-conv"
                        data-active={isSelected ? '' : undefined}
                        onClick={() => setActiveConvId(conv.id)}
                      >
                        <span className="chat-avatar" style={{ background: conv.workerAvatarColor }} aria-hidden="true">
                          {conv.workerInitials}
                        </span>

                        <span className="chat-conv__text">
                          <span className="chat-conv__row">
                            <span className="chat-conv__name">{conv.workerName}</span>
                            <span className="chat-conv__time">{conv.lastMessageTime}</span>
                          </span>
                          <span className="chat-conv__trade">{conv.workerTrade}</span>
                          <span className="chat-conv__last">{conv.lastMessage}</span>
                        </span>

                        {conv.unreadCount > 0 && (
                          <span className="chat-unread" aria-label={`${conv.unreadCount} sin leer`}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* VISTA 2: Chat Activo (Solo se muestra si hay un chat activo) */}
      {activeConv && (
        <div className="chat-pane">
          {/* Header del Chat Activo */}
          <header className="chat-head">
            <div className="chat-head__pill">
              <button type="button" onClick={() => setActiveConvId(null)} className="oy-icon-btn chat-head__back" aria-label="Volver a la lista de mensajes">
                <ArrowLeft size={18} aria-hidden="true" />
              </button>

              <span className="chat-avatar chat-avatar--sm" style={{ background: activeConv.workerAvatarColor }} aria-hidden="true">
                {activeConv.workerInitials}
              </span>

              <div className="chat-head__who">
                <div className="chat-head__name-row">
                  <span className="chat-head__name">{activeConv.workerName}</span>
                  <span className="chat-verified">
                    <ShieldCheck size={12} aria-hidden="true" /> Verificado
                  </span>
                </div>
                <span className="chat-head__status">
                  <span className="chat-online-dot" aria-hidden="true" />
                  {activeConv.workerTrade} • En línea
                </span>
              </div>

              {workerDetail && (
                <a
                  href={`tel:${workerDetail.phone}`}
                  className="btn btn-secondary chat-call"
                  title="Llamar directamente al profesional"
                  aria-label="Llamar directamente al profesional"
                >
                  <Phone size={16} aria-hidden="true" /> <span className="hide-on-mobile">Llamar</span>
                </a>
              )}
              {onClose && (
                <button type="button" onClick={onClose} className="oy-icon-btn chat-head__close" aria-label="Cerrar mensajes">
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </div>
          </header>

          {/* Mensajes del Chat */}
          <div className="chat-messages" role="log" aria-live="polite" aria-label={`Conversación con ${activeConv.workerName}`}>
            {currentMessages.map(msg => {
              const isMe = msg.senderRole === role || msg.senderId === user?.id;

              return (
                <div key={msg.id} className={`chat-msg ${isMe ? 'chat-msg--me' : 'chat-msg--them'}`}>
                  <div className="chat-bubble">{msg.text}</div>

                  <div className="chat-msg__meta">
                    <span>{msg.timestamp}</span>
                    {isMe && (
                      <span title={msg.status === 'read' ? 'Leído' : 'Enviado'} className="chat-msg__tick">
                        {msg.status === 'read' ? (
                          <CheckCheck size={13} aria-label="Leído" />
                        ) : (
                          <Check size={13} aria-label="Enviado" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Delay de escritura animado (···) */}
            {isTyping && (
              <div className="chat-msg chat-msg--them chat-typing" role="status">
                <span className="chat-bubble chat-typing__bubble">
                  <span className="chat-typing__dots" aria-hidden="true"><i /><i /><i /></span>
                  <span className="chat-sr">{activeConv.workerName} está escribiendo</span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chips de Respuestas Rápidas */}
          <div className="chat-quick" role="group" aria-label="Respuestas rápidas">
            {QUICK_REPLIES.map((reply, i) => (
              <button key={i} type="button" className="oy-chip chat-quick__chip" onClick={() => handleSend(reply)}>
                {reply}
              </button>
            ))}
          </div>

          {/* Input y Envío */}
          <div className="chat-compose">
            <div className="chat-compose__pill">
              <input
                type="text"
                className="chat-compose__input"
                aria-label="Escribe un mensaje"
                placeholder="Escribe un mensaje…"
                enterKeyHint="send"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className="btn btn-primary chat-send"
                title="Enviar mensaje"
                aria-label="Enviar mensaje"
              >
                <Send size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>,
    document.body
  );
};
