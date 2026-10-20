import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Conversation, ChatMessage, Worker } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import {
  Send,
  CheckCheck,
  Check,
  ArrowLeft,
  Phone,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Search,
  User,
  Clock,
  X,
  Compass,
  CheckCircle2,
  Zap,
  PhoneCall,
  Lock
} from 'lucide-react';
import './Chat.css';

export interface ChatViewProps {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  initialConversationId?: string;
  onSendMessage: (conversationId: string, text: string) => void;
  /** OFY-51: mensaje entrante de la otra parte (respuesta simulada en el mock). */
  onReceiveMessage?: (conversationId: string, text: string) => void;
  workers: Worker[];
  onSelectWorker?: (worker: Worker) => void;
  onNavigateToDirectory?: () => void;
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
  onSelectWorker,
  onNavigateToDirectory
}) => {
  const { user, role } = useAuth();

  const [activeConvId, setActiveConvId] = useState<string | null>(
    initialConversationId || (conversations.length > 0 ? conversations[0].id : null)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prevInitialId, setPrevInitialId] = useState(initialConversationId);
  if (initialConversationId && initialConversationId !== prevInitialId) {
    setPrevInitialId(initialConversationId);
    setActiveConvId(initialConversationId);
  }

  const activeConv = conversations.find(c => c.id === activeConvId);
  const currentMessages = activeConvId && messages[activeConvId] ? messages[activeConvId] : [];
  const workerDetail = workers.find(w => w.id === activeConv?.workerId);

  // Auto-scroll del contenedor INTERNO de mensajes sin alterar la posición ni el scroll de la página principal
  useEffect(() => {
    if (activeConvId && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [activeConvId, currentMessages.length, isTyping]);

  // Filtrado de conversaciones
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const matchesSearch =
        c.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.workerTrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = filterMode === 'all' || (filterMode === 'unread' && c.unreadCount > 0);

      return matchesSearch && matchesFilter;
    });
  }, [conversations, searchQuery, filterMode]);

  // Métricas rápidas
  const totalUnread = useMemo(() => {
    return conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  }, [conversations]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConvId) return;

    onSendMessage(activeConvId, text.trim());
    setInputText('');

    const isDeal = text.includes('[ACUERDO');

    // Simular respuesta automática con retardo de escritura (···)
    setIsTyping(true);
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    const convId = activeConvId;
    replyTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      const simulatedReplies = isDeal
        ? [
            '¡Acuerdo confirmado! Acepto y respeto el valor de la visita diagnóstica acordada. Llevo herramienta para evaluar el trabajo.',
            'Entendido y pactado. Queda registrado el valor de la visita técnica. Nos vemos a la hora acordada.'
          ]
        : [
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

  return (
    <div className="chat-fullpage container">
      {/* ── CABECERA COMPACTA DE MENSAJERÍA ── */}
      <div className="chat-topbar">
        <div className="chat-topbar__info">
          <div className="chat-topbar__eyebrow">
            <span className="oy-eyebrow">
              <MessageCircle size={13} aria-hidden="true" /> Centro de Mensajes &amp; Coordinación
            </span>
          </div>
          <h1 className="chat-topbar__title">Mensajes &amp; Acuerdos Directos</h1>
        </div>

        {/* ── BARRA DE MÉTRICAS RÁPIDAS ── */}
        <div className="chat-stats" aria-label="Resumen de mensajería">
          <div className="oy-stat chat-stat chat-stat--marino">
            <span className="oy-stat__value">{conversations.length}</span>
            <span className="oy-stat__label">Conversaciones</span>
          </div>
          <div className="oy-stat chat-stat chat-stat--amarillo">
            <span className="oy-stat__value">{totalUnread}</span>
            <span className="oy-stat__label">Sin leer</span>
          </div>
          <div className="oy-stat chat-stat chat-stat--esmeralda">
            <span className="oy-stat__value">{workers.length}</span>
            <span className="oy-stat__label">Especialistas activos</span>
          </div>
          <div className="oy-stat chat-stat chat-stat--gris">
            <span className="oy-stat__value">&lt; 15m</span>
            <span className="oy-stat__label">Tiempo de respuesta</span>
          </div>
        </div>
      </div>

      {/* ── CARD CONTENEDOR SPLIT: SIDEBAR DE CHATS + CONVERSACIÓN ACTIVA ── */}
      <div className={`chat-fullpage__card ${activeConv ? 'has-active-chat' : 'no-active-chat'}`}>
        
        {/* ── COLUMNA IZQUIERDA: LISTA DE CONVERSACIONES ── */}
        <aside className="chat-sidebar" aria-label="Lista de conversaciones">
          {/* Cabecera del sidebar con buscador */}
          <div className="chat-sidebar__header">
            <div className="chat-sidebar__title-row">
              <h2 className="chat-sidebar__title">
                Conversaciones
                <span className="chat-sidebar__count-badge">{conversations.length}</span>
              </h2>
            </div>

            {/* Buscador de chats */}
            <div className="chat-search">
              <Search size={15} className="chat-search__icon" aria-hidden="true" />
              <input
                type="text"
                className="chat-search__input"
                placeholder="Buscar por nombre u oficio..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Buscar en conversaciones"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="chat-search__clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filtros rápidos: Todos / No leídos */}
            <div className="chat-sidebar__filters" role="tablist" aria-label="Filtro de chats">
              <button
                type="button"
                role="tab"
                aria-selected={filterMode === 'all'}
                className={`chat-filter-chip ${filterMode === 'all' ? 'chat-filter-chip--active' : ''}`}
                onClick={() => setFilterMode('all')}
              >
                Todos ({conversations.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filterMode === 'unread'}
                className={`chat-filter-chip ${filterMode === 'unread' ? 'chat-filter-chip--active' : ''}`}
                onClick={() => setFilterMode('unread')}
              >
                Sin leer {totalUnread > 0 && <span className="chat-filter-chip__unread-dot" />}
              </button>
            </div>
          </div>

          {/* Lista scrolleable de chats */}
          <div className="chat-sidebar__list">
            {filteredConversations.length === 0 ? (
              <div className="chat-empty-list">
                <MascotAvatar expression="guino" size="sm" animate="none" />
                <p className="chat-empty-list__text">
                  {conversations.length === 0
                    ? 'Aún no tienes conversaciones. Inicia una enviando una petición desde el directorio de profesionales.'
                    : 'No encontramos conversaciones que coincidan con tu búsqueda.'}
                </p>
                {conversations.length === 0 && onNavigateToDirectory && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm chat-empty-list__btn"
                    onClick={onNavigateToDirectory}
                  >
                    <Compass size={15} aria-hidden="true" /> Explorar profesionales
                  </button>
                )}
              </div>
            ) : (
              <ul className="chat-list__items" role="list">
                {filteredConversations.map(conv => {
                  const isSelected = conv.id === activeConvId;
                  return (
                    <li key={conv.id}>
                      <button
                        type="button"
                        className={`chat-conv ${isSelected ? 'chat-conv--active' : ''}`}
                        aria-pressed={isSelected}
                        onClick={() => setActiveConvId(conv.id)}
                      >
                        <div className="chat-avatar-wrap">
                          <span
                            className="chat-avatar"
                            style={{ background: conv.workerAvatarColor || 'var(--role-primary)' }}
                            aria-hidden="true"
                          >
                            {conv.workerInitials}
                          </span>
                          <span className="chat-avatar__online-dot" aria-hidden="true" />
                        </div>

                        <div className="chat-conv__text">
                          <div className="chat-conv__row">
                            <span className="chat-conv__name">{conv.workerName}</span>
                            <span className="chat-conv__time">{conv.lastMessageTime}</span>
                          </div>
                          <span className="chat-conv__trade">{conv.workerTrade}</span>
                          <span className="chat-conv__last">{conv.lastMessage}</span>
                        </div>

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
        </aside>

        {/* ── COLUMNA DERECHA: CONVERSACIÓN ACTIVA O ESTADO VACÍO ── */}
        <main className="chat-main" aria-label="Ventana de conversación">
          {activeConv ? (
            <div className="chat-pane chat-pane--active">
              {/* Header del Chat Activo */}
              <header className="chat-head">
                <div className="chat-head__left">
                  {/* Botón Volver para pantallas móviles */}
                  <button
                    type="button"
                    onClick={() => setActiveConvId(null)}
                    className="btn btn-secondary btn-sm chat-head__back"
                    aria-label="Volver a la lista de mensajes"
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                    <span>Volver</span>
                  </button>

                  <div className="chat-avatar-wrap">
                    <span
                      className="chat-avatar chat-avatar--sm"
                      style={{ background: activeConv.workerAvatarColor || 'var(--role-primary)' }}
                      aria-hidden="true"
                    >
                      {activeConv.workerInitials}
                    </span>
                    <span className="chat-avatar__online-dot" aria-hidden="true" />
                  </div>

                  <div className="chat-head__who">
                    <div className="chat-head__name-row">
                      <span className="chat-head__name">{activeConv.workerName}</span>
                      <span className="badge badge-verified chat-verified">
                        <ShieldCheck size={11} aria-hidden="true" /> Verificado
                      </span>
                    </div>
                    <span className="chat-head__status">
                      <span className="chat-online-dot" aria-hidden="true" />
                      {activeConv.workerTrade} • En línea • Bogotá D.C.
                    </span>
                  </div>
                </div>

                {/* Acciones del chat activo: Ver Perfil y Llamar */}
                <div className="chat-head__actions">
                  {workerDetail && onSelectWorker && (
                    <button
                      type="button"
                      onClick={() => onSelectWorker(workerDetail)}
                      className="btn btn-secondary btn-sm chat-action-btn"
                      title="Ver perfil completo y reputación del profesional"
                    >
                      <User size={14} aria-hidden="true" />
                      <span className="hide-on-mobile">Ver Perfil</span>
                    </button>
                  )}

                  {workerDetail && (
                    <button
                      type="button"
                      onClick={() => setIsCallModalOpen(true)}
                      className="btn btn-secondary btn-sm chat-action-btn chat-action-btn--phone"
                      title="Llamar directamente al profesional con protocolo seguro"
                      aria-label="Llamar directamente al profesional con protocolo seguro"
                    >
                      <Phone size={14} aria-hidden="true" />
                      <span className="hide-on-mobile">Llamar</span>
                    </button>
                  )}
                </div>
              </header>

              {/* Banner informativo de seguridad y confianza */}
              <div className="chat-trust-banner">
                <ShieldCheck size={15} className="chat-trust-banner__icon" aria-hidden="true" />
                <span className="chat-trust-banner__text">
                  <strong>Trato directo y transparente:</strong> Coordina siempre el valor de la visita y los repuestos antes de iniciar los trabajos.
                </span>
              </div>

              {/* Contenedor scrolleable de mensajes */}
              <div
                ref={messagesContainerRef}
                className="chat-messages"
                role="log"
                aria-live="polite"
                aria-label={`Conversación con ${activeConv.workerName}`}
              >
                {/* Separador de fecha de inicio */}
                <div className="chat-date-separator">
                  <span>Hoy</span>
                </div>

                {currentMessages.map(msg => {
                  const isMe = msg.senderRole === role || msg.senderId === user?.id;
                  const isDeal = msg.text.includes('[ACUERDO');

                  return (
                    <div
                      key={msg.id}
                      className={`chat-msg ${isMe ? 'chat-msg--me' : 'chat-msg--them'} ${isDeal ? 'chat-msg--deal' : ''}`}
                    >
                      {isDeal ? (
                        <div className="chat-bubble chat-bubble--deal">
                          <div className="chat-deal-badge">
                            <ShieldCheck size={13} aria-hidden="true" />
                            <span>Pacto de Transparencia OficioYa</span>
                          </div>
                          <div className="chat-deal-body">
                            <p className="chat-deal-text">
                              {msg.text.replace(/\[ACUERDO OFICIAL\]|\[ACUERDO PACTADO\]/g, '').trim()}
                            </p>
                            <div className="chat-deal-footer">
                              <span className="chat-deal-status">
                                <CheckCircle2 size={12} aria-hidden="true" /> Registrado para ambas partes
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="chat-bubble">{msg.text}</div>
                      )}

                      <div className="chat-msg__meta">
                        <Clock size={11} aria-hidden="true" />
                        <span>{msg.timestamp}</span>
                        {isMe && (
                          <span
                            title={msg.status === 'read' ? 'Leído' : 'Enviado'}
                            className="chat-msg__tick"
                          >
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

                {/* Indicador de escritura animado (···) */}
                {isTyping && (
                  <div className="chat-typing" role="status">
                    <Sparkles size={13} aria-hidden="true" /> {activeConv.workerName} está escribiendo
                    <span className="chat-typing__dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                )}
              </div>

              {/* Chips de Respuestas Rápidas & Pacto Smart */}
              <div className="chat-quick" role="group" aria-label="Respuestas rápidas frecuentes">
                <span className="chat-quick__label">
                  <Zap size={12} aria-hidden="true" /> Opciones:
                </span>
                {QUICK_REPLIES.map((reply, i) => (
                  <button
                    key={i}
                    type="button"
                    className="oy-chip chat-quick__chip"
                    onClick={() => handleSend(reply)}
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Caja de Redacción y Envío */}
              <div className="chat-compose">
                <div className="chat-compose__pill">
                  <input
                    type="text"
                    className="chat-compose__input"
                    aria-label="Escribe un mensaje"
                    placeholder="Escribe un mensaje aquí... (Presiona Enter para enviar)"
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
          ) : (
            /* Estado Vacío de Selección en Pantalla Completa (Desktop) */
            <div className="chat-empty-selection">
              <div className="chat-empty-selection__content">
                <MascotAvatar expression="entusiasta" forceImage="wave" size="lg" animate="bounce" />
                <h3 className="chat-empty-selection__title">Tus conversaciones y acuerdos en vivo</h3>
                <p className="chat-empty-selection__subtitle">
                  Selecciona una conversación del listado lateral para coordinar detalles de tus servicios, acordar presupuestos o consultar tiempos de llegada.
                </p>

                <div className="chat-empty-selection__grid">
                  <div className="chat-empty-feature">
                    <div className="chat-empty-feature__icon chat-empty-feature__icon--blue">
                      <Zap size={18} />
                    </div>
                    <div>
                      <strong>Respuestas en tiempo real</strong>
                      <p>Coordina al instante sin intermediarios engorrosos ni esperas.</p>
                    </div>
                  </div>

                  <div className="chat-empty-feature">
                    <div className="chat-empty-feature__icon chat-empty-feature__icon--green">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <strong>Trato directo y confiable</strong>
                      <p>Todo el acuerdo queda registrado en la plataforma para tu tranquilidad.</p>
                    </div>
                  </div>

                  <div className="chat-empty-feature">
                    <div className="chat-empty-feature__icon chat-empty-feature__icon--orange">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <strong>Reputación real</strong>
                      <p>Reseñas que solo dejan clientes con un servicio completado.</p>
                    </div>
                  </div>
                </div>

                {conversations.length === 0 && onNavigateToDirectory && (
                  <button
                    type="button"
                    className="btn btn-primary chat-empty-selection__cta"
                    onClick={onNavigateToDirectory}
                  >
                    <Compass size={18} aria-hidden="true" /> Explorar directorio de profesionales
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL DE PROTOCOLO DE LLAMADA DIRECTA & SEGURIDAD ── */}
      {isCallModalOpen && workerDetail && (
        <div className="oy-modal-backdrop chat-precall-backdrop">
          <div
            className="oy-modal chat-precall-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="precall-modal-title"
          >
            <header className="chat-precall-head">
              <div className="chat-precall-head__info">
                <div className="chat-precall-badge">
                  <Lock size={12} aria-hidden="true" /> Contacto Directo Seguro
                </div>
                <h3 id="precall-modal-title" className="chat-precall-title">
                  Llamada con {workerDetail.name}
                </h3>
                <span className="chat-precall-sub">
                  {workerDetail.trade} • {workerDetail.phone}
                </span>
              </div>
              <button
                type="button"
                className="oy-icon-btn"
                onClick={() => setIsCallModalOpen(false)}
                aria-label="Cerrar modal de llamada"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div className="chat-precall-body">
              <div className="chat-precall-mascot-row">
                <MascotAvatar expression="concentrado" size="sm" animate="none" />
                <div className="chat-precall-mascot-tip">
                  <strong>Recomendación de Many para tu tranquilidad:</strong>
                  <p>
                    Revisa estos 3 puntos clave con el profesional antes de confirmar su desplazamiento:
                  </p>
                </div>
              </div>

              <div className="chat-precall-tips">
                <div className="chat-precall-tip">
                  <div className="chat-precall-tip__num">1</div>
                  <div className="chat-precall-tip__content">
                    <strong>Tarifa de diagnóstico previa</strong>
                    <p>Confirma si la visita técnica tiene costo base o si se abona al valor final de la reparación.</p>
                  </div>
                </div>

                <div className="chat-precall-tip">
                  <div className="chat-precall-tip__num">2</div>
                  <div className="chat-precall-tip__content">
                    <strong>Cero sobrecostos de intermediación</strong>
                    <p>El valor de los servicios se cancela directamente al especialista sin comisiones sorpresa.</p>
                  </div>
                </div>

                <div className="chat-precall-tip">
                  <div className="chat-precall-tip__num">3</div>
                  <div className="chat-precall-tip__content">
                    <strong>Pacto documentado en la plataforma</strong>
                    <p>Puedes usar la opción "Pactar visita" en el chat para registrar el acuerdo con valor formal.</p>
                  </div>
                </div>
              </div>
            </div>

            <footer className="chat-precall-actions">
              <a
                href={`tel:${workerDetail.phone}`}
                className="btn btn-primary chat-precall-callbtn"
                onClick={() => setIsCallModalOpen(false)}
              >
                <PhoneCall size={16} aria-hidden="true" />
                <span>Marcar a {workerDetail.phone}</span>
              </a>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsCallModalOpen(false)}
              >
                Permanecer en el chat
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
