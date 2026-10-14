// Definiciones de tipos del sistema OficioYa

export type UserRole = 'seeker' | 'provider' | 'admin';

export type TradeCategory = 
  | 'plomeria' 
  | 'electricidad' 
  | 'pintura' 
  | 'cerrajeria' 
  | 'electrodomesticos' 
  | 'computacion' 
  | 'hogar' 
  | 'mascotas' 
  | 'aseo' 
  | 'jardineria' 
  | 'albanileria' 
  | 'clases';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city?: string;
  avatarColor?: string;
  avatarUrl?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  isDeleted?: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedWork: boolean;
  serviceId?: string;
  tradeCategory?: TradeCategory;
  isReported?: boolean;
  reportReason?: string;
  targetRole?: 'worker' | 'client';
}

export interface WorkerServiceProfile {
  id: string;
  trade: TradeCategory;
  tradeLabel: string;
  hourlyRate: number;
  experienceYears: number;
  coverageZones: string[];
  bio: string;
  phone: string;
  specializations?: string[];
  equipment?: string[];
  brands?: string[];
  species?: string[];
}

export interface WorkerLocation {
  lat: number;
  lng: number;
  zoneName: string;
  address: string;
}

export interface WorkerSchedule {
  day: string;
  slots: string[];
}

export interface TradeReputation {
  rating: number;
  reviewCount: number;
  completedJobs: number;
}

export interface ReferralRecord {
  name: string;
  trade: string;
  status: 'verificado' | 'pendiente';
}

export interface WorkerReferrals {
  code: string;
  count: number;
  distinctTradesCount: number;
  isCommunityReferrer: boolean;
  referredList: ReferralRecord[];
}

export interface WorkerIdentityVerification {
  status: 'none' | 'eligible' | 'pending' | 'verified';
  documentType?: string;
  documentNumber?: string;
  documentFileUrl?: string;
  submittedAt?: string;
}

export type AcceptedPaymentMethod = 'efectivo' | 'nequi' | 'daviplata' | 'tarjeta' | 'bre_b';

export interface Worker {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  trade: TradeCategory;
  tradeLabel: string;
  secondaryTrades?: TradeCategory[];
  rating: number;
  reviewCount: number;
  completedJobsCount: number;
  verified: boolean;
  available: boolean;
  hourlyRate: number;
  responseTime: string;
  location: WorkerLocation;
  distanceKm?: number;
  gallery: string[];
  schedule: WorkerSchedule[];
  reviews: Review[];
  bio: string;
  phone: string;
  services: WorkerServiceProfile[];
  
  // RF-09, RF-66, RF-67: Detalles específicos por oficio
  equipment?: string[];
  brands?: string[];
  species?: string[];
  specializations?: string[];
  
  // RF-56, RF-71, RF-74: Reputación y trabajos completados diferenciados por oficio
  ratingByTrade?: Record<string, TradeReputation>;
  
  // RF-60: Métodos de pago aceptados
  acceptedPaymentMethods?: AcceptedPaymentMethod[];
  
  // RF-39: Pausa automática si promedio de últimas 5 reseñas < 3.0
  isPaused?: boolean;
  pauseReason?: string;
  
  // RF-68, RF-69: Referidos e insignia de referente comunitario
  referrals?: WorkerReferrals;
  
  // RF-41, RF-42, RF-43: Verificación de identidad con soporte
  identityVerification?: WorkerIdentityVerification;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'bre_b' | 'nequi' | 'daviplata';

export type ServiceStatus = 'pendiente' | 'en_curso' | 'finalizado' | 'cancelado';

export type UrgencyLevel = 'normal' | 'semana' | 'urgente';

export interface ServiceRequest {
  id: string;
  workerId: string;
  workerName: string;
  workerTrade: string;
  workerAvatarColor: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  address: string;
  coverageZone?: string;
  problemDescription: string;
  paymentMethod: PaymentMethod;
  status: ServiceStatus;
  urgency: UrgencyLevel;
  budget?: number;
  cancelReason?: string;
  cancelledBy?: 'client' | 'worker';
  reviewDone?: boolean;
  createdAt: string;
  amount: number;
  
  // RF-20: Fotografía adjunta a la solicitud
  photos?: string[];
  
  // RF-62: Evidencia fotográfica de trabajo finalizado
  completionEvidence?: string[];
  
  // RF-24: Solicitud simultánea a varios trabajadores
  broadcastCandidates?: string[];
  
  // RF-28: Expiración tras 30 minutos sin respuesta
  expiresAt?: string;
  isExpired?: boolean;
  
  // RF-34, RF-35: Calificación bilateral
  clientRating?: number;
  clientReview?: string;
  workerRatedClient?: boolean;
  clientRatingByWorker?: number;
  workerCommentOnClient?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  avatarColor: string;
  rating: number;
  reviewCount: number;
  completedServicesCount: number;
  registeredSince: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  workerId: string;
  workerName: string;
  workerTrade: string;
  workerAvatarColor: string;
  workerInitials: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
}

export type ComplaintType = 'Fraude' | 'Acoso' | 'Inasistencia' | 'Cobro indebido' | 'Reseña Falsa' | 'Otro';

export interface ComplaintAttachment {
  name: string;
  type: string;
  size: string;
}

export interface ComplaintTicket {
  id: string;
  caseNumber: string;
  targetWorkerId: string;
  targetWorkerName: string;
  reporterId?: string;
  reporterName?: string;
  serviceId?: string;
  type: ComplaintType;
  description: string;
  evidenceFiles: ComplaintAttachment[];
  createdAt: string;
  status: 'Abierto' | 'En revisión' | 'Resuelto' | 'Desestimado';
  resolutionNotes?: string;
  isFakeReviewReport?: boolean;
  reviewId?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  type: 'request' | 'acceptance' | 'message' | 'system';
  timestamp: string;
  read: boolean;
}

export type MascotExpression = 
  | 'alegre' 
  | 'sorprendido' 
  | 'guino' 
  | 'pensativo' 
  | 'concentrado' 
  | 'entusiasta';

export type FontScale = 'normal' | 'large' | 'xlarge';
export type AppTheme = 'light' | 'dark';
