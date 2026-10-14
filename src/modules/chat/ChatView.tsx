import React, { useState, useEffect, useRef } from 'react';
import type { Conversation, ChatMessage, Worker } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Send,
  CheckCheck,
  Check,
  ArrowLeft,
  Phone,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface ChatViewProps {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  initialConversationId?: string;
  onSendMessage: (conversationId: string, text: string) => void;
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

  const activeConv = conversations.find(c => c.id === activeConvId);
  const currentMessages = activeConvId && messages[activeConvId] ? messages[activeConvId] : [];
  const workerDetail = workers.find(w => w.id === activeConv?.workerId);

  // Auto-scroll al final del chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConvId) return;

    onSendMessage(activeConvId, text.trim());
    setInputText('');

    // Simular respuesta automática con retardo de escritura (···)
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const simulatedReplies = [
        '¡Perfecto! Ya tengo la dirección registrada en el mapa, voy saliendo.',
        'Con gusto. Cuento con todas las herramientas y repuestos necesarios.',
        'Entendido, en unos 15 minutos estoy tocando la puerta.',
        'Listo, cualquier duda me puedes marcar directamente.'
      ];
      const randomReply = simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];
      onSendMessage(activeConvId, randomReply);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className="chat-drawer" 
      style={{ 
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '380px',
        background: 'var(--color-bg)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* VISTA 1: Lista de Mensajes (Solo se muestra si no hay un chat activo) */}
        {!activeConv && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-surface)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Mensajes</h3>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {conversations.length} conversaciones activas
                </span>
              </div>
              {onClose && (
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--color-text-muted)' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold' }}>×</span>
                </button>
              )}
            </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No tienes conversaciones activas. Inicia un chat desde el perfil de un profesional.
              </div>
            ) : (
              conversations.map(conv => {
                const isSelected = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--color-surface-hover)' : 'transparent',
                      borderLeft: isSelected ? '4px solid var(--role-primary)' : '4px solid transparent',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: conv.workerAvatarColor,
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '14px',
                        flexShrink: 0
                      }}
                    >
                      {conv.workerInitials}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conv.workerName}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                          {conv.lastMessageTime}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>
                        {conv.workerTrade}
                      </span>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span
                        style={{
                          background: 'var(--color-danger)',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 800,
                          borderRadius: '999px',
                          padding: '2px 6px'
                        }}
                      >
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
            </div>
          </div>
        )}

        {/* VISTA 2: Chat Activo (Solo se muestra si hay un chat activo) */}
        {activeConv && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg)' }}>
            {/* Header del Chat Activo */}
            <div
              style={{
                padding: '16px',
                background: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setActiveConvId(null)}
                    style={{ padding: '4px', color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: activeConv.workerAvatarColor,
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '14px'
                    }}
                  >
                    {activeConv.workerInitials}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '15px' }}>{activeConv.workerName}</span>
                      <span className="badge badge-verified" style={{ padding: '2px 6px', fontSize: '10px' }}>
                        <ShieldCheck size={11} /> Verificado
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {activeConv.workerTrade} • En línea
                    </span>
                  </div>
                </div>

                {workerDetail && (
                  <a
                    href={`tel:${workerDetail.phone}`}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    title="Llamar directamente al profesional"
                  >
                    <Phone size={14} /> <span className="hide-on-mobile">Llamar</span>
                  </a>
                )}
              </div>

              {/* Mensajes del Chat */}
              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {currentMessages.map(msg => {
                  const isMe = msg.senderRole === role || msg.senderId === user?.id;

                  // Color de burbuja adaptado al rol (Azul navy para contratante, Naranja para trabajador)
                  const myBubbleBg = role === 'seeker' ? '#1E3A8A' : '#EA580C';

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMe ? myBubbleBg : 'var(--color-surface)',
                          color: isMe ? '#FFFFFF' : 'var(--color-text-main)',
                          boxShadow: 'var(--shadow-sm)',
                          fontSize: '14px',
                          lineHeight: 1.4,
                          border: isMe ? 'none' : '1px solid var(--color-border)'
                        }}
                      >
                        {msg.text}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10px',
                          color: 'var(--color-text-muted)',
                          marginTop: '3px',
                          padding: '0 4px'
                        }}
                      >
                        <span>{msg.timestamp}</span>
                        {isMe && (
                          <span title={msg.status === 'read' ? 'Leído' : 'Enviado'}>
                            {msg.status === 'read' ? (
                              <CheckCheck size={13} color="#3B82F6" />
                            ) : (
                              <Check size={13} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Delay de escritura animado (···) */}
                {isTyping && (
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      padding: '8px 14px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={12} color="var(--brand-amber)" /> {activeConv.workerName} está escribiendo...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chips de Respuestas Rápidas */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  padding: '6px 16px',
                  overflowX: 'auto',
                  borderTop: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-surface)',
                  scrollbarWidth: 'none'
                }}
              >
                {QUICK_REPLIES.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(reply)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      background: 'var(--color-surface-hover)',
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                      fontWeight: 600
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Input y Envío */}
              <div
                style={{
                  padding: '12px 16px',
                  background: 'var(--color-surface)',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center'
                }}
              >
                <input
                  type="text"
                  className="input-base"
                  placeholder="Escribe un mensaje aquí... (Presiona Enter para enviar)"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ borderRadius: '999px', padding: '10px 18px' }}
                />

                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim()}
                  className="btn btn-primary"
                  style={{
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    padding: 0,
                    flexShrink: 0
                  }}
                  title="Enviar mensaje"
                >
                  <Send size={18} />
                </button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};
