import React, { useState, useEffect } from 'react';
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
  PushNotification
} from './types';
import type { Coordinates } from './utils/geo';
import { FALLBACK_LOCATION_BOGOTA } from './utils/geo';
import {
  INITIAL_WORKERS,
  INITIAL_SERVICES,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  getStoredData,
  setStoredData
} from './services/mockData';

import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';

import { MascotAssistant } from './components/mascot/MascotAssistant';
import { MascotAvatar } from './components/mascot/MascotAvatar';
import { PushNotificationToast } from './components/common/PushNotificationToast';

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
    setActivePushNotification({
      id: `push-${Date.now()}`,
      title,
      body,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    });
  };

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
          triggerPushNotification(
            'GPS Actualizado (RF-63)',
            `Coordenadas capturadas con éxito: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
            'system'
          );
        },
        _err => {
          setUserLocation(FALLBACK_LOCATION_BOGOTA);
          setHasGps(false);
          triggerPushNotification(
            'Ubicación Bogotá D.C. (RF-63)',
            'Usando punto central Chapinero/Chicó (4.6768, -74.0482)',
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
    setStoredData('oy-messages', messages);
    setStoredData('oy-conversations', conversations);
  }, [messages, conversations]);

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
      'Solicitud de Servicio Emitida (RF-61)',
      `Tu solicitud con ${newService.workerName} ha sido agendada con éxito.`,
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

    // RF-61: Notificación push
    triggerPushNotification(
      'Mensaje Enviado (RF-61)',
      text.length > 45 ? `${text.slice(0, 45)}...` : text,
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
      'Petición Multidestinatario Despachada (RF-24, RF-61)',
      `Notificamos a ${newRequests.length} profesionales compatibles en tu zona de Bogotá.`,
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

  const handleUpdateServiceStatus = (serviceId: string, newStatus: ServiceStatus, reason?: string) => {
    setServices(prev =>
      prev.map(s =>
        s.id === serviceId ? { ...s, status: newStatus, cancelReason: reason } : s
      )
    );
  };

  const handleSubmitReview = (serviceId: string, _rating: number, _comment: string) => {
    setServices(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, reviewDone: true } : s))
    );
    triggerPushNotification(
      'Reseña Publicada (RF-36)',
      'Tu valoración ha sido vinculada al servicio completado.',
      'system'
    );
  };

  const handleAcceptIncomingRequest = (id: string) => {
    setServices(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'en_curso' } : s))
    );
    triggerPushNotification(
      '¡Trabajo Aceptado! (RF-26, RF-61)',
      'El servicio ha sido confirmado e iniciado en tu agenda.',
      'acceptance'
    );
  };

  const handleRejectIncomingRequest = (id: string) => {
    setServices(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'cancelado', cancelReason: 'Rechazado por el profesional' } : s))
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
          ? { ...w, isPaused, available: !isPaused }
          : w
      )
    );
  };

  const totalUnreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

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
      />

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
              services={services}
              onUpdateServiceStatus={handleUpdateServiceStatus}
              onSubmitReview={handleSubmitReview}
              onOpenReport={handleOpenReportFromService}
              onRehireWorker={handleRehireWorker}
            />
          )}

          {/* ========================================================
              VISTAS DE PROFESIONAL (PROVIDER)
              ======================================================== */}
          {(currentTab === 'inicio_pro' || currentTab === 'oportunidades') && (
            <ProviderHomeView
              onRecommend={(id) => console.log('Recomendar', id)}
            />
          )}

          {currentTab === 'alertas' && (
            <ProviderDashboard
              incomingRequests={services.filter(s => s.status === 'en_curso')}
              onAcceptRequest={handleAcceptIncomingRequest}
              onRejectRequest={handleRejectIncomingRequest}
            />
          )}

          {currentTab === 'clientes' && (
            <MyServicesView
              services={services}
              onUpdateServiceStatus={handleUpdateServiceStatus}
              onSubmitReview={handleSubmitReview}
              onOpenReport={handleOpenReportFromService}
              onRehireWorker={handleRehireWorker}
            />
          )}

          {/* Drawer de Mensajes / Chat (Overlay Sidebar) */}
          {isChatOpen && (
            <>
              <div 
                className="hide-on-desktop"
                onClick={() => setIsChatOpen(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, backdropFilter: 'blur(2px)' }}
              />
              <ChatView
                conversations={conversations}
                messages={messages}
                initialConversationId={activeChatConvId}
                onSendMessage={handleSendMessage}
                workers={workers}
                onClose={() => setIsChatOpen(false)}
              />
            </>
          )}

          {/* Pestaña: Perfil */}
          {currentTab === 'perfil' && (
            <UserProfileView
              services={services}
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
        onSelectTab={setCurrentTab}
        unreadCount={totalUnreadCount}
      />

      {/* Widget Interactivo de la Mascota Many */}
      <MascotAssistant
        currentTrade={currentTradeCategory}
        activeView={currentTab}
      />

      {/* Modales del Sistema */}
      {selectedWorkerForProfile && (
        <WorkerProfileModal
          worker={selectedWorkerForProfile}
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
              'Reporte Registrado (RF-64)',
              'Tu queja ha sido turnada al equipo de moderación.',
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
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainAppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
