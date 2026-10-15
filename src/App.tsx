import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import type {
  Worker,
  ServiceRequest,
  Conversation,
  ChatMessage,
  ComplaintTicket,
  TradeCategory,
  ServiceStatus,
  PushNotification,
  Review
} from './types';
import { applyCompletion, applyReview } from './utils/reputation';
import { createWorkerForUser, findUnclaimedWorkerByName } from './utils/workerProfile';
import type { Coordinates } from './utils/geo';
import { FALLBACK_LOCATION_BOGOTA } from './utils/geo';
import {
  INITIAL_WORKERS,
  INITIAL_SERVICES,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  getStoredData,
  setStoredData
} from './services/mockData';

import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';

import { MascotAssistant } from './components/mascot/MascotAssistant';
import { MascotAvatar } from './components/mascot/MascotAvatar';
import { PushNotificationToast } from './components/common/PushNotificationToast';
import { NotificationInbox } from './components/common/NotificationInbox';

import { LandingPage } from './modules/landing/LandingPage';
import { SeekerDirectory } from './modules/seeker/SeekerDirectory';
import { WorkerProfileModal } from './modules/worker/WorkerProfileModal';
import { BookingModal } from './modules/booking/BookingModal';
import { SendRequestModal } from './modules/requests/SendRequestModal';
import { ChatView } from './modules/chat/ChatView';
import { ProviderDashboard } from './modules/provider/ProviderDashboard';
import { MyServicesView } from './modules/services/MyServicesView';
import { UserProfileView } from './modules/profile/UserProfileView';
import { SettingsModal } from './modules/profile/SettingsModal';
import { ComplaintModal } from './modules/complaints/ComplaintModal';
import { AuthPage } from './modules/auth/AuthPage';
import { AdminModerationModal } from './modules/admin/AdminModerationModal';
import { AppFooter } from './components/layout/AppFooter';
import { SeekerHomeView } from './modules/seeker/SeekerHomeView';
import { ProviderHomeView } from './modules/provider/ProviderHomeView';

import './App.css';

/* El fondo WebGL se carga aparte para no retrasar el primer pintado */
const BrandBackground = React.lazy(() =>
  import('./components/background/BrandBackground').then(m => ({ default: m.BrandBackground }))
);

/* ── CROSSFADE TRANSITION SYSTEM ── */
type ViewMode = 'auth' | 'app' | 'landing';

function useCrossfade(initial: ViewMode) {
  const [view, setView] = React.useState<ViewMode>(initial);
  const [visible, setVisible] = React.useState(true);

  const navigateTo = React.useCallback((next: ViewMode) => {
    // 1. Fade out current (200ms)
    setVisible(false);
    // 2. Swap content at opacity 0, then fade in (300ms)
    setTimeout(() => {
      setView(next);
      setVisible(true);
    }, 220);
  }, []);

  return { view, visible, navigateTo };
}

const MainAppContent: React.FC = () => {
  const { user, role, isLoading } = useAuth();

  // Crossfade entre pantallas + gate de autenticación
  const { view, visible, navigateTo } = useCrossfade('landing');
  const [pendingRole, setPendingRole] = useState<'seeker' | 'provider'>('seeker');
  const [currentTab, setCurrentTab] = useState<string>(role === 'seeker' ? 'inicio_seeker' : 'inicio_pro');
  const [currentTradeCategory, setCurrentTradeCategory] = useState<TradeCategory | undefined>(undefined);

  // Reaccionar a cambios de rol para reiniciar la pestaña principal
  useEffect(() => {
    setCurrentTab(role === 'seeker' ? 'inicio_seeker' : 'inicio_pro');
  }, [role]);

  // RF-63: Geolocalización geoespacial (Bogotá D.C. lat: 4.6768, lng: -74.0482)
  const [userLocation, setUserLocation] = useState<Coordinates>(FALLBACK_LOCATION_BOGOTA);
  const [hasGps, setHasGps] = useState<boolean>(false);

  // RF-61: Notificaciones Push en tiempo real
  const [activePushNotification, setActivePushNotification] = useState<PushNotification | null>(null);
  const [notifications, setNotifications] = useState<PushNotification[]>(() =>
    getStoredData('oy-notifications', INITIAL_NOTIFICATIONS)
  );
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  // Datos Persistentes en localStorage
  const [workers, setWorkers] = useState<Worker[]>(() =>
    getStoredData('oy-workers', INITIAL_WORKERS)
  );

  const [services, setServices] = useState<ServiceRequest[]>(() =>
    getStoredData('oy-services', INITIAL_SERVICES)
  );

  const [conversations, setConversations] = useState<Conversation[]>(() =>
    getStoredData('oy-conversations', INITIAL_CONVERSATIONS)
  );

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() =>
    getStoredData('oy-messages', INITIAL_MESSAGES)
  );

  // Modales
  const [selectedWorkerForProfile, setSelectedWorkerForProfile] = useState<Worker | null>(null);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<Worker | null>(null);
  const [sendRequestWorker, setSendRequestWorker] = useState<Worker | undefined>(undefined);
  const [isSendRequestOpen, setIsSendRequestOpen] = useState(false);
  const [reportingTarget, setReportingTarget] = useState<{ workerId: string; workerName: string; serviceId?: string } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatConvId, setActiveChatConvId] = useState<string | undefined>(undefined);

  const triggerPushNotification = (
    title: string,
    body: string,
    type: 'request' | 'acceptance' | 'message' | 'system'
  ) => {
    const notification: PushNotification = {
      id: `push-${Date.now()}`,
      title,
      body,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setActivePushNotification(notification);
    setNotifications(prev => [notification, ...prev]);
  };

  const closeInbox = React.useCallback(() => {
    setIsInboxOpen(false);
    setNotifications(prev => prev.map(n => (n.read ? n : { ...n, read: true })));
  }, []);

  // RF-63: Capturar y actualizar ubicación geoespacial del dispositivo
  const handleRefreshGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          setHasGps(true);
        },
        _err => {
          setUserLocation(FALLBACK_LOCATION_BOGOTA);
          setHasGps(false);
          triggerPushNotification(
            'Usamos Bogotá como referencia',
            'No pudimos leer tu ubicación. Actívala para ver quién está más cerca.',
            'system'
          );
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserLocation(FALLBACK_LOCATION_BOGOTA);
      setHasGps(false);
    }
  };

  useEffect(() => {
    handleRefreshGps();
  }, []);

  // Guardar cambios de trabajadores
  useEffect(() => {
    setStoredData('oy-workers', workers);
  }, [workers]);

  // Guardar cambios de servicios
  useEffect(() => {
    setStoredData('oy-services', services);
  }, [services]);

  // Guardar cambios de mensajes
  useEffect(() => {
    setStoredData('oy-notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    setStoredData('oy-messages', messages);
    setStoredData('oy-conversations', conversations);
  }, [messages, conversations]);

  // OFY-01: Vincular la cuenta Profesional con su ficha en `workers` (o crearla la primera vez)
  useEffect(() => {
    if (!user || role !== 'provider') return;
    if (workers.some(w => w.ownerUserId === user.id)) return;
    const unclaimed = findUnclaimedWorkerByName(workers, user.name);
    if (unclaimed) {
      setWorkers(prev => prev.map(w => (w.id === unclaimed.id ? { ...w, ownerUserId: user.id } : w)));
    } else {
      setWorkers(prev => [createWorkerForUser(user), ...prev]);
    }
  }, [user, role, workers]);

  // OFY-28: Las solicitudes pendientes vencidas pasan a canceladas ("Expirada sin respuesta")
  const servicesRef = useRef(services);
  useEffect(() => {
    servicesRef.current = services;
  }, [services]);

  useEffect(() => {
    const expirePending = () => {
      const now = Date.now();
      const expired = servicesRef.current.filter(
        s => s.status === 'pendiente' && s.expiresAt && new Date(s.expiresAt).getTime() < now
      );
      if (expired.length === 0) return;
      const ids = new Set(expired.map(s => s.id));
      setServices(prev =>
        prev.map(s =>
          ids.has(s.id)
            ? { ...s, status: 'cancelado', isExpired: true, cancelReason: 'Expirada sin respuesta' }
            : s
        )
      );
    };
    expirePending();
    const timer = setInterval(expirePending, 5000);
    return () => clearInterval(timer);
  }, []);

  // Pantalla de carga (spinner) mientras se verifica el JWT
  if (isLoading) {
    return (
      <div className="jwt-loading-overlay">
        <MascotAvatar size="md" />
        <div className="spinner" />
        <span style={{ marginTop: '16px', fontWeight: 700, fontSize: '15px' }}>
          Verificando sesión...
        </span>
      </div>
    );
  }

  // Pantalla de Login / Registro
  if (view === 'auth') {
    return (
      <div className={`crossfade-wrapper ${visible ? '' : 'crossfade-wrapper--hidden'}`}>
        <AuthPage
          onAuthSuccess={() => {
            navigateTo('app');
          }}
          initialRole={pendingRole}
        />
      </div>
    );
  }

  // Landing page
  if (view === 'landing') {
    return (
      <div className={`crossfade-wrapper ${visible ? '' : 'crossfade-wrapper--hidden'}`}>
        <LandingPage
          onEnterApp={(role) => {
            setPendingRole(role ?? 'seeker');
            navigateTo('auth');
          }}
        />
      </div>
    );
  }

  // Auth Gate: si intenta ver 'app' pero no hay usuario en sesión, va al login.
  if (view === 'app' && !user && !isLoading) {
    navigateTo('auth');
    return null;
  }

  // Handlers para Flujos
  const handleOpenBooking = (worker: Worker) => {
    setSelectedWorkerForProfile(null);
    setSelectedWorkerForBooking(worker);
  };

  const handleBookingSuccess = (newService: ServiceRequest) => {
    setServices(prev => [newService, ...prev]);
    // RF-61: Notificación push en tiempo real
    triggerPushNotification(
      '¡Solicitud enviada!',
      `Le avisamos a ${newService.workerName}. Te contamos apenas responda.`,
      'request'
    );
  };

  const handleOpenChat = (worker: Worker) => {
    setSelectedWorkerForProfile(null);
    let conv = conversations.find(c => c.workerId === worker.id);
    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        workerId: worker.id,
        workerName: worker.name,
        workerTrade: worker.tradeLabel,
        workerAvatarColor: worker.avatarColor,
        workerInitials: worker.initials,
        unreadCount: 0,
        lastMessage: 'Conversación iniciada',
        lastMessageTime: 'Ahora'
      };
      setConversations(prev => [conv!, ...prev]);
      setMessages(prev => ({
        ...prev,
        [conv!.id]: [
          {
            id: `msg-${Date.now()}`,
            conversationId: conv!.id,
            senderId: worker.id,
            senderRole: 'provider',
            text: `¡Hola! Soy ${worker.name}, especialista en ${worker.tradeLabel} en Bogotá. ¿En qué te puedo asesorar?`,
            timestamp: 'Ahora',
            status: 'read'
          }
        ]
      }));
    }
    setActiveChatConvId(conv.id);
    setIsChatOpen(true);
  };

  const handleSendMessage = (conversationId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: user?.id || 'usr-default',
      senderRole: role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg]
    }));

    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: text, lastMessageTime: 'Ahora' }
          : c
      )
    );

  };

  // OFY-51, OFY-61: respuesta simulada de la otra parte + notificación push de mensaje
  const handleReceiveMessage = (conversationId: string, text: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    const fromProvider = role !== 'provider';
    const reply: ChatMessage = {
      id: `msg-${Date.now()}-in`,
      conversationId,
      senderId: fromProvider ? conv?.workerId || 'w-unknown' : `client-${conversationId}`,
      senderRole: fromProvider ? 'provider' : 'seeker',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    };
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), reply]
    }));
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, lastMessage: text, lastMessageTime: 'Ahora' } : c))
    );
    triggerPushNotification(
      `Nuevo mensaje de ${fromProvider ? conv?.workerName ?? 'tu profesional' : 'tu cliente'}`,
      text,
      'message'
    );
  };

  const handleOpenSendRequest = (worker?: Worker | Worker[]) => {
    setSelectedWorkerForProfile(null);
    const target = Array.isArray(worker) ? worker[0] : worker;
    setSendRequestWorker(target);
    setIsSendRequestOpen(true);
  };

  const handleSubmitRequests = (newRequests: ServiceRequest[]) => {
    setServices(prev => [...newRequests, ...prev]);
    // RF-61: Notificación push por solicitud multidestinatario
    triggerPushNotification(
      '¡Solicitud enviada!',
      newRequests.length === 1
        ? `Le avisamos a ${newRequests[0].workerName}. Te contamos apenas responda.`
        : `Le avisamos a ${newRequests.length} profesionales de tu zona. Te contamos apenas respondan.`,
      'request'
    );
  };

  const handleOpenReportFromWorker = (worker: Worker) => {
    setSelectedWorkerForProfile(null);
    setReportingTarget({ workerId: worker.id, workerName: worker.name });
  };

  const handleOpenReportFromService = (service: ServiceRequest) => {
    setReportingTarget({
      workerId: service.workerId,
      workerName: service.workerName,
      serviceId: service.id
    });
  };

  const updateWorker = (workerId: string, patch: Partial<Worker>) => {
    setWorkers(prev => prev.map(w => (w.id === workerId ? { ...w, ...patch } : w)));
  };

  // OFY-26, OFY-24: Aceptar pasa a "en_curso", cancela el resto del envío múltiple y deja al trabajador ocupado (OFY-31, OFY-33)
  const acceptRequest = (id: string) => {
    const target = services.find(s => s.id === id);
    if (!target || target.status !== 'pendiente') return;
    const acceptedAt = new Date().toISOString();
    setServices(prev =>
      prev.map(s => {
        if (s.id === id) return { ...s, status: 'en_curso', acceptedAt };
        if (target.broadcastId && s.broadcastId === target.broadcastId && s.status === 'pendiente') {
          return { ...s, status: 'cancelado', cancelReason: 'Asignado a otro profesional' };
        }
        return s;
      })
    );
    updateWorker(target.workerId, { available: false });
    triggerPushNotification(
      '¡Trabajo aceptado!',
      'Quedó en tu agenda. Escríbele al cliente para coordinar la llegada.',
      'acceptance'
    );
  };

  // OFY-78: Cambio de estado (Pendiente / En progreso / Finalizado / Cancelado)
  const handleUpdateServiceStatus = (
    serviceId: string,
    newStatus: ServiceStatus,
    reason?: string,
    extra?: Partial<ServiceRequest>
  ) => {
    const current = services.find(s => s.id === serviceId);
    if (!current || current.status === newStatus) return;
    if (current.status === 'pendiente' && newStatus === 'en_curso') {
      acceptRequest(serviceId);
      return;
    }

    const completedAt = newStatus === 'finalizado' ? new Date().toISOString() : current.completedAt;
    setServices(prev =>
      prev.map(s =>
        s.id === serviceId
          ? {
              ...s,
              ...extra,
              status: newStatus,
              cancelReason: newStatus === 'cancelado' ? reason : s.cancelReason,
              cancelledBy: newStatus === 'cancelado' ? (role === 'seeker' ? 'client' : 'worker') : s.cancelledBy,
              completedAt
            }
          : s
      )
    );

    // OFY-08, OFY-71: el trabajo finalizado suma al contador; si no tiene otro en curso vuelve a estar disponible
    if (newStatus === 'finalizado' || (newStatus === 'cancelado' && current.status === 'en_curso')) {
      const stillBusy = services.some(
        s => s.id !== serviceId && s.workerId === current.workerId && s.status === 'en_curso'
      );
      setWorkers(prev =>
        prev.map(w => {
          if (w.id !== current.workerId) return w;
          const next = newStatus === 'finalizado' ? applyCompletion(w, current.tradeCategory) : w;
          return stillBusy || next.isPaused ? next : { ...next, available: true };
        })
      );
    }
  };

  // OFY-34, OFY-36, OFY-37, OFY-39, OFY-56: la reseña se guarda en el trabajador y recalcula su reputación
  const handleSubmitReview = (serviceId: string, rating: number, comment: string) => {
    const service = services.find(s => s.id === serviceId);
    const worker = service ? workers.find(w => w.id === service.workerId) : undefined;
    if (!service || !worker || service.reviewDone) return;

    const review: Review = {
      id: `r-${Date.now()}`,
      author: user?.name || 'Cliente',
      rating,
      date: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
      comment: comment.trim() || 'Sin comentario.',
      verifiedWork: true,
      serviceId,
      tradeCategory: service.tradeCategory ?? worker.trade,
      targetRole: 'worker'
    };
    const updated = applyReview(worker, review);
    setWorkers(prev => prev.map(w => (w.id === worker.id ? updated : w)));
    setServices(prev =>
      prev.map(s =>
        s.id === serviceId ? { ...s, reviewDone: true, clientRating: rating, clientReview: review.comment } : s
      )
    );
    triggerPushNotification(
      '¡Gracias por tu reseña!',
      'Tu opinión ayuda a otros vecinos a elegir con confianza.',
      'system'
    );
    if (updated.isPaused && !worker.isPaused) {
      triggerPushNotification(
        `Perfil de ${worker.name} en pausa`,
        'Su promedio reciente bajó de 3.0. No recibirá solicitudes hasta que moderación lo revise.',
        'system'
      );
    }
  };

  // OFY-35: el trabajador califica al contratante
  const handleRateClient = (serviceId: string, rating: number, comment: string) => {
    setServices(prev =>
      prev.map(s =>
        s.id === serviceId
          ? { ...s, workerRatedClient: true, clientRatingByWorker: rating, workerCommentOnClient: comment.trim() }
          : s
      )
    );
  };

  const handleAcceptIncomingRequest = (id: string) => {
    acceptRequest(id);
  };

  const handleRejectIncomingRequest = (id: string) => {
    setServices(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: 'cancelado', cancelReason: 'Rechazado por el profesional', cancelledBy: 'worker' }
          : s
      )
    );
  };

  // RF-48: Volver a contratar trabajador desde el historial
  const handleRehireWorker = (workerId: string) => {
    const target = workers.find(w => w.id === workerId);
    if (target) {
      setSelectedWorkerForBooking(target);
    }
  };

  // RF-39, RF-54: Moderación de suspensión de trabajadores
  const handleToggleWorkerPause = (workerId: string, isPaused: boolean) => {
    setWorkers(prev =>
      prev.map(w =>
        w.id === workerId
          ? { ...w, isPaused, available: !isPaused, pauseReason: isPaused ? 'Suspendido por moderación.' : undefined }
          : w
      )
    );
  };

  const totalUnreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Ficha del profesional en sesión y servicios visibles según el rol
  const currentWorker = user ? workers.find(w => w.ownerUserId === user.id) : undefined;
  const seekerServices = services.filter(s => s.clientId === user?.id);
  const workerServices = currentWorker ? services.filter(s => s.workerId === currentWorker.id) : [];
  const liveProfileWorker = selectedWorkerForProfile
    ? workers.find(w => w.id === selectedWorkerForProfile.id) ?? selectedWorkerForProfile
    : null;

  return (
    <div className={`app-root-layout role-${role} crossfade-wrapper ${visible ? '' : 'crossfade-wrapper--hidden'}`}>
      <PushNotificationToast
        notification={activePushNotification}
        onDismiss={() => setActivePushNotification(null)}
      />

      {/* Barra de Navegación Superior */}
      <AppHeader
        onOpenLanding={() => navigateTo('landing')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdminModeration={() => setIsAdminModalOpen(true)}
        onRefreshGps={handleRefreshGps}
        hasGps={hasGps}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadCount={totalUnreadCount}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        notificationCount={notifications.filter(n => !n.read).length}
        onOpenNotifications={() => setIsInboxOpen(open => !open)}
      />

      {isInboxOpen && (
        <NotificationInbox
          notifications={notifications}
          onClose={closeInbox}
          onDelete={id => setNotifications(prev => prev.filter(n => n.id !== id))}
        />
      )}

      <div className="app-main-body">
        {/* Área Central de Contenido */}
        <main className="app-content-area" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {/* ========================================================
              VISTAS DE CONTRATANTE (SEEKER)
              ======================================================== */}
          {currentTab === 'inicio_seeker' && (
            <SeekerHomeView
              workers={workers}
              userLocation={userLocation}
              onSelectWorker={setSelectedWorkerForProfile}
              onOpenSendRequest={handleOpenSendRequest}
              onChangeTradeCategory={setCurrentTradeCategory}
            />
          )}

          {currentTab === 'buscar' && (
            <SeekerDirectory
              workers={workers}
              userLocation={userLocation}
              onSelectWorker={setSelectedWorkerForProfile}
              onOpenSendRequest={handleOpenSendRequest}
              onChangeTradeCategory={setCurrentTradeCategory}
            />
          )}

          {currentTab === 'solicitudes' && (
            <MyServicesView
              services={seekerServices}
              onUpdateServiceStatus={handleUpdateServiceStatus}
              onSubmitReview={handleSubmitReview}
              onOpenReport={handleOpenReportFromService}
              onRehireWorker={handleRehireWorker}
              onRateClient={handleRateClient}
            />
          )}

          {/* ========================================================
              VISTAS DE PROFESIONAL (PROVIDER)
              ======================================================== */}
          {(currentTab === 'inicio_pro' || currentTab === 'oportunidades') && (
            <ProviderHomeView
              onRecommend={() => triggerPushNotification('Recomendación enviada', 'Compartimos la oportunidad con tus colegas del oficio.', 'system')}
            />
          )}

          {currentTab === 'alertas' && (
            <ProviderDashboard
              worker={currentWorker}
              services={services}
              incomingRequests={workerServices.filter(s => s.status === 'pendiente')}
              onAcceptRequest={handleAcceptIncomingRequest}
              onRejectRequest={handleRejectIncomingRequest}
              onUpdateWorker={patch => currentWorker && updateWorker(currentWorker.id, patch)}
            />
          )}

          {currentTab === 'clientes' && (
            <MyServicesView
              services={workerServices}
              onUpdateServiceStatus={handleUpdateServiceStatus}
              onSubmitReview={handleSubmitReview}
              onOpenReport={handleOpenReportFromService}
              onRehireWorker={handleRehireWorker}
              onRateClient={handleRateClient}
            />
          )}

          {/* Drawer de Mensajes / Chat (Overlay Sidebar) */}
          {isChatOpen && (
            <>
              <div 
                className="hide-on-desktop"
                onClick={() => setIsChatOpen(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(62,31,20,0.45)', zIndex: 999 }}
              />
              <ChatView
                conversations={conversations}
                messages={messages}
                initialConversationId={activeChatConvId}
                onSendMessage={handleSendMessage}
                onReceiveMessage={handleReceiveMessage}
                workers={workers}
                onClose={() => setIsChatOpen(false)}
              />
            </>
          )}

          {/* Pestaña: Perfil */}
          {currentTab === 'perfil' && (
            <UserProfileView
              services={role === 'provider' ? workerServices : seekerServices}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onNavigateToTab={setCurrentTab}
            />
          )}
        </main>
      </div>

      {/* Footer Universal de la App */}
      <AppFooter />

      {/* Barra de Navegación Inferior para Móvil */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => { setIsChatOpen(false); setCurrentTab(tab); }}
        unreadCount={totalUnreadCount}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(open => !open)}
      />

      {/* Widget Interactivo de la Mascota Many */}
      <MascotAssistant
        currentTrade={currentTradeCategory}
        activeView={currentTab}
      />

      {/* Modales del Sistema */}
      {liveProfileWorker && (
        <WorkerProfileModal
          worker={liveProfileWorker}
          onClose={() => setSelectedWorkerForProfile(null)}
          onOpenBooking={handleOpenBooking}
          onOpenChat={handleOpenChat}
          onOpenSendRequest={handleOpenSendRequest}
          onOpenReport={handleOpenReportFromWorker}
        />
      )}

      {selectedWorkerForBooking && (
        <BookingModal
          worker={selectedWorkerForBooking}
          onClose={() => setSelectedWorkerForBooking(null)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {isSendRequestOpen && (
        <SendRequestModal
          workers={workers}
          initialWorker={sendRequestWorker}
          onClose={() => setIsSendRequestOpen(false)}
          onSubmitRequests={handleSubmitRequests}
        />
      )}

      {reportingTarget && (
        <ComplaintModal
          targetWorkerId={reportingTarget.workerId}
          targetWorkerName={reportingTarget.workerName}
          serviceId={reportingTarget.serviceId}
          onClose={() => setReportingTarget(null)}
          onSubmitComplaint={(_ticket: ComplaintTicket) => {
            triggerPushNotification(
              'Recibimos tu reporte',
              'Nuestro equipo lo va a revisar y te contaremos qué pasó.',
              'system'
            );
          }}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isAuthModalOpen && (
        <AuthPage
          onAuthSuccess={() => setIsAuthModalOpen(false)}
        />
      )}

      {isAdminModalOpen && (
        <AdminModerationModal
          workers={workers}
          onClose={() => setIsAdminModalOpen(false)}
          onToggleWorkerPause={handleToggleWorkerPause}
          onUpdateWorker={updateWorker}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <React.Suspense fallback={null}>
          <BrandBackground />
        </React.Suspense>
        <MainAppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
