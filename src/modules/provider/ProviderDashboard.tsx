import React, { useState, useEffect } from 'react';
import type {
  Worker,
  WorkerServiceProfile,
  ServiceRequest,
  TradeCategory,
  ClientProfile,
  AcceptedPaymentMethod,
  ReferralRecord,
  RateUnit,
  WeekDay,
  DaySchedule,
  WeeklyAvailability,
  WorkerReferrals
} from '../../types';
import {
  Star,
  DollarSign,
  BellRing,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  CreditCard,
  Image as ImageIcon,
  UserCheck,
  X,
  Pencil,
  Camera,
  CalendarDays,
  TrendingUp,
  Zap,
  MapPin,
  ArrowUpCircle,
  Hourglass
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { SquishSwitch } from '../../components/ui/SquishSwitch';
import { Upload } from '../../components/ui/Upload';
import { PageHero } from '../../components/layout/PageHero';
import { mediaService, MediaUploadError } from '../../services/mock/mediaService';
import { computeClientReputation, monthlyIncome, topRequested } from '../../utils/reputation';
import {
  PROFILE_INCOMPLETE_REASON,
  RATE_UNITS,
  TRADE_LABELS,
  WEEK_DAYS,
  rateUnitShort,
  scheduleFromWeek,
  weekFromSchedule,
  workerPatchFromServices
} from '../../utils/workerProfile';
import './Provider.css';

const PAYMENT_OPTIONS: AcceptedPaymentMethod[] = ['efectivo', 'nequi', 'daviplata', 'bre_b', 'tarjeta'];

const splitList = (text: string) => text.split(',').map(t => t.trim()).filter(Boolean);

/** Recalcula contadores e insignia de referidos: solo cuentan los verificados (OFY-68, OFY-69). */
const referralsWith = (base: WorkerReferrals, referredList: ReferralRecord[]): WorkerReferrals => {
  const verified = referredList.filter(r => r.status === 'verificado');
  const distinct = new Set(verified.map(r => r.trade.toLowerCase())).size;
  return {
    ...base,
    referredList,
    count: verified.length,
    distinctTradesCount: distinct,
    isCommunityReferrer: distinct >= 3
  };
};

interface ProviderDashboardProps {
  /** Ficha del profesional en sesión (fuente: `workers` en App, persistida en `oy-workers`). */
  worker?: Worker;
  /** Todas las solicitudes, para estadísticas y reputación de contratantes. */
  services?: ServiceRequest[];
  incomingRequests: ServiceRequest[];
  onAcceptRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onUpdateWorker?: (patch: Partial<Worker>) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  worker,
  services: allServices = [],
  incomingRequests,
  onAcceptRequest,
  onRejectRequest,
  onUpdateWorker
}) => {
  const update = (patch: Partial<Worker>) => onUpdateWorker?.(patch);

  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // RF-41, RF-42: Envío de cédula para revisión
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [docNumber, setDocNumber] = useState(worker?.identityVerification?.documentNumber ?? '');
  const [docFileUrl, setDocFileUrl] = useState<string | undefined>(worker?.identityVerification?.documentFileUrl);

  // RF-68: Referidos
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [newReferralName, setNewReferralName] = useState('');
  const [newReferralTrade, setNewReferralTrade] = useState('pintura');

  // RF-53: Consulta de Perfil de Contratante
  const [selectedClientForProfile, setSelectedClientForProfile] = useState<ClientProfile | null>(null);

  // Modal para Añadir Servicio (RF-01, RF-04, RF-05, RF-09, RF-66, RF-67)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newTrade, setNewTrade] = useState<TradeCategory>('plomeria');
  const [newTradeLabel, setNewTradeLabel] = useState('');
  const [newHourlyRate, setNewHourlyRate] = useState('42000');
  const [newRateUnit, setNewRateUnit] = useState<RateUnit>('hora');
  const [newExpYears, setNewExpYears] = useState('4');
  const [newZones, setNewZones] = useState('Chapinero, Chicó, Usaquén');
  const [newMaxDistance, setNewMaxDistance] = useState('8');
  const [newBio, setNewBio] = useState('Atención de emergencias y servicios a domicilio en Bogotá.');
  const [newEquipment, setNewEquipment] = useState('Herramienta manual, tester');
  const [newBrands, setNewBrands] = useState('Grival, Corona, Pavco');
  const [newSpecializations, setNewSpecializations] = useState('Destapes urgentes, griferías');
  const [newSpecies, setNewSpecies] = useState('');

  // RF-28: Cálculo de tiempo restante de solicitudes (30 minutos sin respuesta)
  const [timeLeftMap, setTimeLeftMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const updated: Record<string, number> = {};
      incomingRequests.forEach(req => {
        const createdMs = req.createdAt ? new Date(req.createdAt).getTime() : now;
        const expiryMs = req.expiresAt ? new Date(req.expiresAt).getTime() : createdMs + 30 * 60 * 1000;
        updated[req.id] = Math.max(0, Math.floor((expiryMs - now) / 1000));
      });
      setTimeLeftMap(updated);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [incomingRequests]);

  if (!worker) {
    return (
      <div className="provider-dashboard container pv-page">
        <div className="oy-empty" role="status">
          <MascotAvatar size="md" expression="pensativo" />
          <h2 className="oy-empty__title oy-display">Preparando tu ficha profesional…</h2>
          <p className="oy-empty__text">Entra con una cuenta en modo Profesional para gestionar tus oficios.</p>
        </div>
      </div>
    );
  }

  const isProfileIncomplete = worker.services.length === 0;
  const isPaused = !!worker.isPaused;
  const isAvailableNow = worker.available && !isPaused;
  const services = worker.services;
  const paymentMethods = worker.acceptedPaymentMethods ?? [];
  const portfolioPhotos = worker.gallery;
  const completedJobsCount = worker.completedJobsCount;
  const weeklySchedule: WeeklyAvailability = worker.weeklyAvailability ?? weekFromSchedule(worker.schedule);
  const verificationStatus = worker.identityVerification?.status ?? (worker.verified ? 'verified' : 'none');
  const isIdentityVerified = verificationStatus === 'verified';
  const isVerificationPending = verificationStatus === 'pending';
  const isEligibleForVerification = completedJobsCount >= 10;
  const referrals: WorkerReferrals = worker.referrals ?? {
    code: `${worker.initials}-${worker.id.slice(-4).toUpperCase()}`,
    count: 0,
    distinctTradesCount: 0,
    isCommunityReferrer: false,
    referredList: []
  };
  const referralsList = referrals.referredList;

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    setPhotoError(null);
    setIsUploading(true);
    try {
      const media = await mediaService.uploadImage(file, { folder, maxSide: 720 });
      return media.url;
    } catch (err) {
      setPhotoError(err instanceof MediaUploadError ? err.message : 'No pudimos subir la foto. Intenta de nuevo.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // RF-59: Foto de perfil
  const handleProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = await uploadImage(file, 'avatars');
    if (url) update({ photoUrl: url });
  };

  // RF-30, RF-31: "Disponible ya"
  const setAvailable = (value: boolean) => {
    if (isPaused) return;
    update({ available: value });
  };

  // RF-06: Agenda semanal
  const updateDay = (day: WeekDay, patch: Partial<DaySchedule>) => {
    const next: WeeklyAvailability = { ...weeklySchedule, [day]: { ...weeklySchedule[day], ...patch } };
    update({ weeklyAvailability: next, schedule: scheduleFromWeek(next) });
  };

  const saveServices = (list: WorkerServiceProfile[]) => {
    update(workerPatchFromServices(worker, list));
  };

  const openNewService = () => {
    setEditingServiceId(null);
    setNewTradeLabel('');
    setNewSpecies('');
    setShowAddModal(true);
  };

  // RF-57, RF-67: Editar tarifa, zonas y especializaciones de un oficio
  const openEditService = (srv: WorkerServiceProfile) => {
    setEditingServiceId(srv.id);
    setNewTrade(srv.trade);
    setNewTradeLabel(srv.tradeLabel);
    setNewHourlyRate(String(srv.hourlyRate));
    setNewRateUnit(srv.rateUnit ?? 'hora');
    setNewExpYears(String(srv.experienceYears));
    setNewZones(srv.coverageZones.join(', '));
    setNewMaxDistance(srv.maxDistanceKm ? String(srv.maxDistanceKm) : '');
    setNewBio(srv.bio);
    setNewEquipment((srv.equipment ?? []).join(', '));
    setNewBrands((srv.brands ?? []).join(', '));
    setNewSpecializations((srv.specializations ?? []).join(', '));
    setNewSpecies((srv.species ?? []).join(', '));
    setShowAddModal(true);
  };

  const closeServiceModal = () => {
    setShowAddModal(false);
    setEditingServiceId(null);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    const species = splitList(newSpecies);
    const created: WorkerServiceProfile = {
      id: editingServiceId ?? `srv-prof-${Date.now()}`,
      trade: newTrade,
      tradeLabel: newTradeLabel || `Servicio de ${TRADE_LABELS[newTrade]}`,
      hourlyRate: parseInt(newHourlyRate) || 40000,
      rateUnit: newRateUnit,
      experienceYears: parseInt(newExpYears) || 3,
      coverageZones: splitList(newZones),
      maxDistanceKm: parseInt(newMaxDistance) || undefined,
      bio: newBio,
      phone: worker.phone,
      equipment: splitList(newEquipment),
      brands: splitList(newBrands),
      specializations: splitList(newSpecializations),
      species: species.length > 0 ? species : undefined
    };

    saveServices(
      editingServiceId ? services.map(s => (s.id === editingServiceId ? created : s)) : [...services, created]
    );
    closeServiceModal();
    setNewTradeLabel('');
  };

  const handleDeleteService = (id: string) => {
    saveServices(services.filter(s => s.id !== id));
  };

  // RF-02: Elegir cuál oficio es el principal
  const handleMakePrimary = (id: string) => {
    const target = services.find(s => s.id === id);
    if (!target) return;
    saveServices([target, ...services.filter(s => s.id !== id)]);
  };

  const togglePaymentMethod = (method: AcceptedPaymentMethod) => {
    update({
      acceptedPaymentMethods: paymentMethods.includes(method)
        ? paymentMethods.filter(m => m !== method)
        : [...paymentMethods, method]
    });
  };

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim()) {
      update({ gallery: [...portfolioPhotos, newPhotoUrl.trim()] });
      setNewPhotoUrl('');
      setShowPhotoModal(false);
    }
  };

  const handlePortfolioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = await uploadImage(file, 'portfolio');
    if (url) {
      update({ gallery: [...portfolioPhotos, url] });
      setShowPhotoModal(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    update({ gallery: portfolioPhotos.filter((_, i) => i !== index) });
  };

  const handleDocFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = await uploadImage(file, 'identity');
    if (url) setDocFileUrl(url);
  };

  // RF-42: el envío queda "en revisión" hasta que moderación lo aprueba
  const handleSubmitVerification = () => {
    if (!docNumber.trim()) return;
    update({
      identityVerification: {
        status: 'pending',
        documentType: 'Cédula de Ciudadanía',
        documentNumber: docNumber.trim(),
        documentFileUrl: docFileUrl,
        submittedAt: new Date().toISOString()
      }
    });
    setShowVerificationModal(false);
  };

  const handleAddReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReferralName.trim()) return;
    const label = TRADE_LABELS[newReferralTrade as TradeCategory] ?? newReferralTrade;
    update({
      referrals: referralsWith(referrals, [
        ...referralsList,
        { name: newReferralName.trim(), trade: label, status: 'pendiente' }
      ])
    });
    setNewReferralName('');
    setShowReferralModal(false);
  };

  // RF-69: Insignia de Referente Comunitario Verificado (mínimo 3 oficios distintos verificados)
  const distinctTradesCount = referrals.distinctTradesCount;
  const isCommunityReferrer = referrals.isCommunityReferrer;
  const pendingReferrals = referralsList.filter(r => r.status === 'pendiente').length;

  // RF-45: Ingresos reales del mes (servicios finalizados)
  const monthlyRevenue = monthlyIncome(allServices, worker.id);

  // RF-46: Servicios más solicitados del mes
  const topRequestedList = topRequested(allServices, worker.id, s =>
    s.tradeCategory ? TRADE_LABELS[s.tradeCategory] : s.workerTrade
  );

  // RF-53: Reputación del contratante calculada con las calificaciones de otros profesionales
  const openClientProfile = (req: ServiceRequest) => {
    const rep = computeClientReputation(allServices, req.clientId);
    setSelectedClientForProfile({
      id: req.clientId,
      name: req.clientName,
      avatarColor: 'var(--oy-azul-marino)',
      ...rep
    });
  };

  const activeDays = WEEK_DAYS.filter(d => weeklySchedule[d.key].active).length;
  const topMax = Math.max(1, ...topRequestedList.map(t => t.count));

  return (
    <div className="provider-dashboard container pv-page">
      <PageHero
        tone="fuego"
        eyebrow={<><Zap size={14} aria-hidden="true" /> Panel profesional</>}
        title="Panel de Control Profesional"
        subtitle="Gestiona tus oficios, cotizaciones entrantes y tu visibilidad en tiempo real para clientes en Bogotá D.C."
        actions={
          <button type="button" onClick={openNewService} className="btn btn-primary">
            <Plus size={16} aria-hidden="true" /> Añadir otro oficio
          </button>
        }
        stickers={[
          { icon: <Star size={26} />, tone: 'amarillo', style: { top: '12%', right: '6%', rotate: '-9deg' } },
          { icon: <>${(monthlyRevenue / 1000000).toFixed(1)}M</>, tone: 'blanco', pill: true, style: { top: '18%', right: '20%', rotate: '5deg' } }
        ]}
      />

      {/* Panel "Disponible Ya" (RF-30, RF-31), foto de perfil (RF-59) e insignias (RF-43, RF-69) */}
      <section className="pv-live" data-on={isAvailableNow} aria-label="Estado de disponibilidad">
        <div className="pv-live__who">
          <div className="pv-avatar">
            {worker.photoUrl ? (
              <img className="pv-avatar__img" src={worker.photoUrl} alt="Tu foto de perfil" />
            ) : (
              <div className="pv-avatar__img">
                <MascotAvatar trade={worker.trade} size="sm" />
              </div>
            )}
            <label className="pv-avatar__edit" title="Cambiar foto de perfil">
              <Camera size={16} aria-hidden="true" />
              <span className="pv-visually-hidden">Cambiar foto de perfil</span>
              <input
                type="file"
                accept="image/*"
                className="pv-visually-hidden"
                onChange={handleProfilePhoto}
                disabled={isUploading}
              />
            </label>
          </div>
          <div className="pv-live__info">
            <h2 className="pv-live__title oy-display">
              {isAvailableNow ? 'Disponible ya' : 'Fuera de línea'}
            </h2>
            <p className="pv-live__text">
              {isPaused
                ? worker.pauseReason === PROFILE_INCOMPLETE_REASON
                  ? 'Registra tu primer oficio para aparecer en el directorio'
                  : `Perfil en pausa: ${worker.pauseReason ?? 'revisión de moderación'}`
                : isAvailableNow ? 'Visible en el mapa local' : 'Oculto para nuevos pedidos'}
            </p>
            {photoError && <p className="pv-live__text" role="alert">{photoError}</p>}
            <div className="pv-badges">
              {isIdentityVerified && (
                <span className="pv-tag" title="Identidad validada con cédula">
                  <ShieldCheck size={13} aria-hidden="true" /> Identidad Verificada
                </span>
              )}
              {isCommunityReferrer && (
                <span className="pv-tag">
                  <Award size={13} aria-hidden="true" /> Referente Comunitario
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="pv-live__switch">
          <span className="pv-row pv-row--status" data-on={isAvailableNow}>
            <span className="pv-dot" data-on={isAvailableNow} aria-hidden="true" />
            {isAvailableNow ? 'DISPONIBLE YA' : 'FUERA DE LÍNEA'}
          </span>
          {/* Verde Esmeralda con halo radar: el manual lo reserva para este estado */}
          <span className="oy-halo pv-switch-halo" data-on={isAvailableNow}>
            <SquishSwitch
              checked={isAvailableNow}
              onChange={setAvailable}
              disabled={isPaused}
              ariaLabel="Disponible Ya"
              trackOnColor="var(--oy-verde-esmeralda)"
              width={60}
              height={34}
              radius={17}
            />
          </span>
        </div>
      </section>

      {/* Estadísticas (RF-08, RF-10, RF-45) */}
      <div className="pv-stats">
        <div className="oy-stat pv-stat--esmeralda">
          <span className="pv-stat__icon"><CheckCircle2 size={20} aria-hidden="true" /></span>
          <span className="oy-stat__value">{completedJobsCount}</span>
          <span className="oy-stat__label">Trabajos Completados</span>
        </div>
        <div className="oy-stat pv-stat--amarillo">
          <span className="pv-stat__icon"><Star size={20} aria-hidden="true" /></span>
          <span className="oy-stat__value">{worker.reviewCount > 0 ? worker.rating.toFixed(1) : '—'}</span>
          <span className="oy-stat__label">Calificación Promedio</span>
          <span className="pv-stat__note">({worker.reviewCount} reseñas)</span>
        </div>
        <div className="oy-stat pv-stat--fuego">
          <span className="pv-stat__icon"><DollarSign size={20} aria-hidden="true" /></span>
          <span className="oy-stat__value">${monthlyRevenue.toLocaleString()}</span>
          <span className="oy-stat__label">Ingresos Mes</span>
          <span className="pv-stat__note">COP · servicios finalizados este mes</span>
        </div>
        <div className="oy-stat pv-stat--marino">
          <span className="pv-stat__icon"><BellRing size={20} aria-hidden="true" /></span>
          <span className="oy-stat__value">{incomingRequests.length}</span>
          <span className="oy-stat__label">Solicitudes Pendientes</span>
        </div>
      </div>

      {/* Sección 1: Bandeja de Solicitudes Entrantes (RF-25, RF-26, RF-27, RF-28, RF-53) */}
      <section aria-labelledby="pv-inbox-title">
        <div className="oy-section-head">
          <div>
            <h2 id="pv-inbox-title" className="oy-section-title oy-display">Bandeja de Solicitudes Entrantes</h2>
            <p className="oy-section-sub">
              Clientes en Bogotá solicitando atención. Tiempo de respuesta límite: 30 minutos.
            </p>
          </div>
          <span className="pv-tag pv-tag--fuego">{incomingRequests.length} pendientes</span>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="oy-empty">
            <MascotAvatar trade={worker.trade} size="md" expression="alegre" />
            <h3 className="oy-empty__title oy-display">¡Estás al día!</h3>
            <p className="oy-empty__text">No tienes solicitudes pendientes de respuesta en este momento.</p>
          </div>
        ) : (
          <div className="pv-grid">
            {incomingRequests.map(req => {
              const secondsLeft = timeLeftMap[req.id] !== undefined ? timeLeftMap[req.id] : 1800;
              const minutes = Math.floor(secondsLeft / 60);
              const seconds = secondsLeft % 60;
              const isUrgentExpiration = secondsLeft < 300; // Menos de 5 minutos

              return (
                <article key={req.id} className="pv-ticket">
                  <div className="pv-ticket__band pv-row pv-row--between">
                    {/* Enlace para consultar perfil del contratante (RF-53) */}
                    <button
                      type="button"
                      className="pv-client-link"
                      onClick={() => openClientProfile(req)}
                    >
                      <strong>{req.clientName}</strong>
                      <small>Ver reputación del contratante ↗</small>
                    </button>
                    <span className={`pv-tag ${req.urgency === 'urgente' ? 'pv-tag--danger' : 'pv-tag--esmeralda'}`}>
                      {req.urgency === 'urgente' ? <><Zap size={12} aria-hidden="true" /> Urgente</> : 'Normal'}
                    </span>
                  </div>

                  <span className="pv-muted pv-note">{req.address}</span>

                  <p className="pv-ticket__quote">"{req.problemDescription}"</p>

                  {/* Foto de la solicitud si existe (RF-20) */}
                  {req.photos && req.photos.length > 0 && (
                    <div className="pv-evidence">
                      <img src={req.photos[0]} alt="Evidencia del problema" />
                      <span>Foto del problema adjunta por el cliente</span>
                    </div>
                  )}

                  <div className="pv-ticket__meta pv-row--between">
                    <span><CalendarDays size={14} aria-hidden="true" /> {req.date}</span>
                    <span><Clock size={14} aria-hidden="true" /> {req.time}</span>
                    {req.coverageZone && <span><MapPin size={14} aria-hidden="true" /> {req.coverageZone}</span>}
                  </div>

                  <div className="pv-ticket__budget">
                    Presupuesto: ${req.amount.toLocaleString()} COP
                  </div>

                  {/* Contador Regresivo de Expiración (RF-28) */}
                  <div className="pv-timer" data-urgent={isUrgentExpiration} role="timer" aria-live="off">
                    <span>Tiempo para responder:</span>
                    <span className="pv-timer__clock">
                      {minutes}:{seconds < 10 ? `0${seconds}` : seconds} min
                    </span>
                  </div>

                  <div className="pv-ticket__actions">
                    <button type="button" onClick={() => onRejectRequest(req.id)} className="btn btn-secondary">
                      Rechazar
                    </button>
                    <button type="button" onClick={() => onAcceptRequest(req.id)} className="btn btn-primary">
                      Aceptar Trabajo
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Sección 2: Multi-Servicio & Especializaciones (RF-01, RF-02, RF-03, RF-04, RF-05, RF-09, RF-57, RF-66, RF-67) */}
      <section aria-labelledby="pv-trades-title">
        <div className="oy-section-head">
          <div>
            <h2 id="pv-trades-title" className="oy-section-title oy-display">Mis Oficios, Especializaciones y Tarifas</h2>
            <p className="oy-section-sub">Configura detalles específicos como equipos, marcas y especialidades</p>
          </div>
          <button type="button" onClick={openNewService} className="btn btn-primary">
            <Plus size={16} aria-hidden="true" /> Añadir otro oficio
          </button>
        </div>

        {isProfileIncomplete && (
          <div className="oy-empty">
            <MascotAvatar size="md" expression="entusiasta" />
            <h3 className="oy-empty__title oy-display">Registra tu primer oficio</h3>
            <p className="oy-empty__text">
              Cuéntale a tus vecinos qué haces, cuánto cobras y en qué zonas trabajas. Así apareces en el directorio.
            </p>
            <button type="button" onClick={openNewService} className="btn btn-primary">
              <Plus size={16} aria-hidden="true" /> Registrar oficio
            </button>
          </div>
        )}

        <div className="pv-grid">
          {services.map((srv, index) => (
            <article key={srv.id} className="pv-ticket">
              <div className={`pv-ticket__band pv-row pv-row--between${index === 0 ? '' : ' pv-ticket__band--almendra'}`}>
                <span className={`pv-tag${index === 0 ? ' pv-tag--solid' : ''}`}>
                  {index === 0 ? 'OFICIO PRINCIPAL' : 'OFICIO SECUNDARIO'}
                </span>
                <div className="pv-row">
                  <button
                    type="button"
                    className="oy-icon-btn"
                    onClick={() => openEditService(srv)}
                    title="Editar este oficio"
                    aria-label={`Editar ${srv.tradeLabel}`}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  {index > 0 && (
                    <button
                      type="button"
                      className="oy-icon-btn"
                      onClick={() => handleMakePrimary(srv.id)}
                      title="Marcar como oficio principal"
                      aria-label={`Marcar ${srv.tradeLabel} como oficio principal`}
                    >
                      <ArrowUpCircle size={16} aria-hidden="true" />
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      type="button"
                      className="oy-icon-btn pv-icon-btn--danger"
                      onClick={() => handleDeleteService(srv.id)}
                      title="Eliminar este oficio secundario"
                      aria-label={`Eliminar ${srv.tradeLabel}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="pv-ticket__title">{srv.tradeLabel}</h3>
              <p className="pv-muted pv-copy">{srv.bio}</p>

              <div className="pv-row">
                <span className="pv-tag pv-tag--fuego"><DollarSign size={13} aria-hidden="true" /> ${srv.hourlyRate.toLocaleString()} COP/{rateUnitShort(srv.rateUnit)}</span>
                <span className="pv-tag"><Clock size={13} aria-hidden="true" /> {srv.experienceYears} años exp.</span>
              </div>

              {/* Especializaciones (RF-66, RF-67) */}
              {srv.specializations && srv.specializations.length > 0 && (
                <div>
                  <span className="pv-label">Especializaciones</span>
                  <div className="pv-row">
                    {srv.specializations.map((spec, i) => (
                      <span key={i} className="pv-tag pv-tag--almendra">
                        <Star size={11} aria-hidden="true" /> {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipos & Marcas (RF-09) */}
              {(srv.equipment?.length || srv.brands?.length || srv.species?.length) ? (
                <div className="pv-details">
                  {srv.equipment && srv.equipment.length > 0 && <div><strong>Equipo:</strong> {srv.equipment.join(', ')}</div>}
                  {srv.brands && srv.brands.length > 0 && <div><strong>Marcas:</strong> {srv.brands.join(', ')}</div>}
                  {srv.species && srv.species.length > 0 && <div><strong>Especies:</strong> {srv.species.join(', ')}</div>}
                </div>
              ) : null}

              <div className="pv-details">
                <span className="pv-label">Zonas de cobertura en Bogotá</span>
                <div className="pv-row">
                  {srv.coverageZones.map((z, i) => (
                    <span key={i} className="pv-tag">{z}</span>
                  ))}
                  {srv.maxDistanceKm && (
                    <span className="pv-tag pv-tag--marino"><MapPin size={13} aria-hidden="true" /> Hasta {srv.maxDistanceKm} km</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Sección 3: Disponibilidad semanal (RF-06) */}
      <section aria-labelledby="pv-week-title">
        <div className="oy-section-head">
          <div>
            <h2 id="pv-week-title" className="oy-section-title oy-display">Disponibilidad Semanal</h2>
            <p className="oy-section-sub">Días y franjas horarias habituales en que atiendes servicios.</p>
          </div>
          <span className="pv-tag pv-tag--fuego"><CalendarDays size={13} aria-hidden="true" /> {activeDays} días activos</span>
        </div>
        <div className="oy-panel oy-panel--almendra">
          <div className="pv-week">
            {WEEK_DAYS.map(d => {
              const day = weeklySchedule[d.key];
              return (
                <div key={d.key} className="pv-day" data-on={day.active}>
                  <button
                    type="button"
                    className="oy-chip"
                    aria-pressed={day.active}
                    onClick={() => updateDay(d.key, { active: !day.active })}
                  >
                    {d.label}
                  </button>
                  {day.active ? (
                    <div className="pv-day__slot">
                      <input
                        type="time"
                        className="input-base"
                        value={day.from}
                        aria-label={`${d.label}: desde`}
                        onChange={e => updateDay(d.key, { from: e.target.value })}
                      />
                      <input
                        type="time"
                        className="input-base"
                        value={day.to}
                        aria-label={`${d.label}: hasta`}
                        onChange={e => updateDay(d.key, { to: e.target.value })}
                      />
                    </div>
                  ) : (
                    <span className="pv-muted pv-day__rest">Descanso</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sección 4: Métodos de Pago, Portafolio y servicios más solicitados (RF-60, RF-07, RF-46) */}
      <section aria-labelledby="pv-profile-title">
        <div className="oy-section-head">
          <div>
            <h2 id="pv-profile-title" className="oy-section-title oy-display">Pagos, portafolio y demanda</h2>
            <p className="oy-section-sub">Lo que ve el contratante antes de solicitarte un servicio.</p>
          </div>
        </div>

        <div className="pv-grid--2 pv-grid">
          {/* RF-60: Métodos de Pago */}
          <div className="oy-panel oy-panel--amarillo">
            <h3 className="pv-panel-title"><CreditCard size={22} aria-hidden="true" /> Métodos de Pago Aceptados</h3>
            <p className="pv-muted pv-copy">
              Selecciona los canales en los que recibes pagos para informar al contratante antes del servicio.
            </p>
            <div className="pv-chips">
              {PAYMENT_OPTIONS.map(method => (
                <button
                  key={method}
                  type="button"
                  className={`oy-chip${method === 'bre_b' ? '' : ' pv-chip--cap'}`}
                  aria-pressed={paymentMethods.includes(method)}
                  onClick={() => togglePaymentMethod(method)}
                >
                  {paymentMethods.includes(method) && <CheckCircle2 size={14} aria-hidden="true" />}
                  {method === 'bre_b' ? 'Bre-B (Interoperable)' : method}
                </button>
              ))}
            </div>
          </div>

          {/* RF-07: Portafolio de Fotografías */}
          <div className="oy-panel oy-panel--marino">
            <div className="pv-row pv-row--between">
              <h3 className="pv-panel-title"><ImageIcon size={22} aria-hidden="true" /> Portafolio de Trabajos</h3>
              <button type="button" onClick={() => setShowPhotoModal(true)} className="btn btn-secondary">
                <Plus size={14} aria-hidden="true" /> Subir foto
              </button>
            </div>
            <p className="pv-muted pv-copy">
              {portfolioPhotos.length} fotos publicadas para generar confianza en tus contratantes.
            </p>
            <div className="pv-portfolio">
              {portfolioPhotos.map((url, i) => (
                <div key={`${i}-${url.slice(-12)}`} className="pv-portfolio__item">
                  <img src={url} alt={`Trabajo ${i + 1}`} />
                  <button
                    type="button"
                    className="oy-icon-btn pv-icon-btn--danger pv-portfolio__remove"
                    onClick={() => handleRemovePhoto(i)}
                    aria-label={`Quitar trabajo ${i + 1} del portafolio`}
                    title="Quitar del portafolio"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RF-46: Servicios más solicitados */}
          <div className="oy-panel oy-panel--gris">
            <h3 className="pv-panel-title"><TrendingUp size={22} aria-hidden="true" /> Servicios más solicitados</h3>
            <p className="pv-muted pv-copy">Trabajos completados por categoría este mes.</p>
            {topRequestedList.length === 0 && (
              <p className="pv-muted pv-copy">Aún no tienes trabajos finalizados este mes.</p>
            )}
            <ol className="pv-top-list">
              {topRequestedList.map(t => (
                <li key={t.label}>
                  <div className="pv-row pv-row--between pv-top-list__row">
                    <span>{t.label}</span>
                    <span>{t.count}</span>
                  </div>
                  <div className="pv-bar" aria-hidden="true">
                    <div className="pv-bar__fill" style={{ width: `${(t.count / topMax) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Sección 5: Verificación de Identidad & Referidos (RF-41, RF-42, RF-43, RF-68, RF-69) */}
      <section aria-labelledby="pv-trust-title">
        <div className="oy-section-head">
          <div>
            <h2 id="pv-trust-title" className="oy-section-title oy-display">Confianza y comunidad</h2>
            <p className="oy-section-sub">Distintivos que te hacen destacar en el directorio.</p>
          </div>
        </div>

        <div className="pv-grid--2 pv-grid">
          {/* RF-41, RF-42, RF-43: Verificación de Identidad */}
          <div className="oy-panel oy-panel--esmeralda">
            <h3 className="pv-panel-title"><ShieldCheck size={22} aria-hidden="true" /> Verificación de Identidad</h3>
            <p className="pv-muted pv-copy">
              {isEligibleForVerification
                ? `Has completado ${completedJobsCount} trabajos (mínimo 10 requeridos). Eres elegible para el distintivo oficial.`
                : `Llevas ${completedJobsCount} trabajos. Completa al menos 10 para solicitar la verificación de identidad.`}
            </p>
            <div className="pv-summary pv-row pv-row--between">
              <div>
                <span className="pv-label">Estado actual</span>
                <span className={`pv-tag ${isIdentityVerified ? 'pv-tag--esmeralda' : isVerificationPending ? 'pv-tag--marino' : 'pv-tag--danger'}`}>
                  {isIdentityVerified
                    ? <><CheckCircle2 size={13} aria-hidden="true" /> Identidad Verificada Activa</>
                    : isVerificationPending
                      ? <><Hourglass size={13} aria-hidden="true" /> En revisión por moderación</>
                      : 'Pendiente de Documento'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowVerificationModal(true)}
                className="btn btn-secondary"
                disabled={!isIdentityVerified && !isVerificationPending && !isEligibleForVerification}
              >
                {isIdentityVerified || isVerificationPending ? 'Ver Soporte' : 'Enviar Cédula'}
              </button>
            </div>
          </div>

          {/* RF-68, RF-69: Referidos y Crecimiento Comunitario */}
          <div className="oy-panel oy-panel--almendra">
            <div className="pv-row pv-row--between">
              <h3 className="pv-panel-title"><Users size={22} aria-hidden="true" /> Referidos Comunitarios</h3>
              <button type="button" onClick={() => setShowReferralModal(true)} className="btn btn-secondary">
                <Plus size={14} aria-hidden="true" /> Referir colega
              </button>
            </div>
            <p className="pv-muted pv-copy">
              Tu código de referido: <span className="pv-code">{referrals.code}</span>. Invita a trabajadores a registrarse.
            </p>
            <div className="pv-summary">
              <div className="pv-row pv-row--between">
                <span>Referidos verificados:</span>
                <strong>{referrals.count} colegas</strong>
              </div>
              {pendingReferrals > 0 && (
                <div className="pv-row pv-row--between">
                  <span>En verificación:</span>
                  <strong>{pendingReferrals} colegas</strong>
                </div>
              )}
              <div className="pv-row pv-row--between">
                <span>Oficios distintos:</span>
                <strong>{distinctTradesCount} oficios (mínimo 3 para insignia)</strong>
              </div>
            </div>
            {isCommunityReferrer && (
              <span className="pv-tag pv-tag--solid">
                <Award size={13} aria-hidden="true" /> Insignia Permanente: Referente Comunitario Verificado
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Modal Consulta de Perfil de Contratante (RF-53) */}
      {selectedClientForProfile && (
        <div className="oy-modal-backdrop" onClick={() => setSelectedClientForProfile(null)}>
          <div
            className="oy-modal pv-modal--client"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pv-client-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="oy-modal__head">
              <h3 id="pv-client-title" className="oy-modal__title pv-row">
                <UserCheck size={24} aria-hidden="true" /> Perfil del Contratante
              </h3>
              <button type="button" className="oy-icon-btn" onClick={() => setSelectedClientForProfile(null)} aria-label="Cerrar">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="oy-modal__body">
              <div className="pv-client-head">
                <div className="pv-client-avatar" style={{ background: selectedClientForProfile.avatarColor }}>
                  {selectedClientForProfile.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="pv-client-name">{selectedClientForProfile.name}</h4>
                  <span className="pv-muted pv-note">
                    Miembro desde {selectedClientForProfile.registeredSince}
                  </span>
                </div>
              </div>

              <div className="oy-panel oy-panel--amarillo pv-client-rep">
                <span className="pv-label">Reputación histórica como contratante</span>
                <div className="pv-rating">
                  <Star size={22} fill="var(--color-star)" color="var(--oy-cacao-profundo)" aria-hidden="true" /> {selectedClientForProfile.reviewCount > 0 ? selectedClientForProfile.rating.toFixed(1) : '—'}
                  <span className="pv-muted pv-rating__count">
                    ({selectedClientForProfile.reviewCount} calificaciones de otros profesionales)
                  </span>
                </div>
                <span className="pv-ok pv-ok--spaced">
                  <CheckCircle2 size={14} aria-hidden="true" /> {selectedClientForProfile.completedServicesCount} servicios contratados y finalizados en OficioYa
                </span>
              </div>

              <p className="pv-muted pv-client-note">
                Esta información te permite evaluar si aceptar la solicitud con base en el historial verificado del usuario.
              </p>

              <button type="button" onClick={() => setSelectedClientForProfile(null)} className="btn btn-primary pv-btn-block">
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Subir Foto de Portafolio (RF-07) */}
      {showPhotoModal && (
        <div className="oy-modal-backdrop" onClick={() => setShowPhotoModal(false)}>
          <div
            className="oy-modal pv-modal--sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pv-photo-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="oy-modal__head">
              <h3 id="pv-photo-title" className="oy-modal__title">Publicar Fotografía en Portafolio</h3>
              <button type="button" className="oy-icon-btn" onClick={() => setShowPhotoModal(false)} aria-label="Cerrar">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="oy-modal__body pv-form">
              <div>
                <label htmlFor="pv-photo-url" className="pv-label">URL de la imagen o captura</label>
                <input
                  id="pv-photo-url"
                  type="text"
                  className="input-base"
                  placeholder="https://images.unsplash.com/..."
                  value={newPhotoUrl}
                  onChange={e => setNewPhotoUrl(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="pv-photo-file" className="pv-label">O sube una foto desde tu celular</label>
                <input
                  id="pv-photo-file"
                  type="file"
                  accept="image/*"
                  className="input-base"
                  onChange={handlePortfolioFile}
                  disabled={isUploading}
                />
                {isUploading && <span className="pv-muted pv-caption" role="status">Subiendo foto…</span>}
                {photoError && <span className="pv-muted pv-caption" role="alert">{photoError}</span>}
              </div>
              <div className="pv-form__actions">
                <button type="button" onClick={() => setShowPhotoModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="button" onClick={handleAddPhoto} className="btn btn-primary">Guardar Foto</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Verificación de Identidad (RF-42, RF-43) */}
      {showVerificationModal && (
        <div className="oy-modal-backdrop" onClick={() => setShowVerificationModal(false)}>
          <div
            className="oy-modal pv-modal--verify"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pv-verify-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="oy-modal__head">
              <h3 id="pv-verify-title" className="oy-modal__title">Soporte de Identidad Verificada</h3>
              <button type="button" className="oy-icon-btn" onClick={() => setShowVerificationModal(false)} aria-label="Cerrar">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="oy-modal__body pv-form">
              <p className="pv-muted pv-copy">
                {isIdentityVerified
                  ? 'Documento validado para emitir el distintivo de Identidad Verificada en tu perfil público de Bogotá.'
                  : isVerificationPending
                    ? 'Recibimos tu documento. Moderación lo revisa y te avisamos cuando el distintivo quede activo.'
                    : 'Envía tu cédula y una foto del documento. Moderación la revisa antes de activar el distintivo.'}
              </p>
              <div>
                <label htmlFor="pv-doc" className="pv-label">Número de Cédula de Ciudadanía</label>
                <input
                  id="pv-doc"
                  type="text"
                  inputMode="numeric"
                  className="input-base"
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value)}
                  readOnly={isIdentityVerified || isVerificationPending}
                  required
                />
              </div>
              {!isIdentityVerified && !isVerificationPending && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label className="pv-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                    Soporte de documento (Arrastra el archivo o sube una foto):
                  </label>
                  <Upload
                    onComplete={(f) => {
                      if (f.id === 'img') {
                        setDocFileUrl('https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80');
                      }
                    }}
                  />
                  <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                    <label htmlFor="pv-doc-file" className="btn btn-secondary oy-flow-small" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                      O elegir foto desde mi dispositivo
                    </label>
                    <input
                      id="pv-doc-file"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: 'none' }}
                      onChange={handleDocFile}
                      disabled={isUploading}
                    />
                  </div>
                  {isUploading && <span className="pv-muted pv-caption" role="status">Subiendo foto…</span>}
                  {photoError && <span className="pv-muted pv-caption" role="alert">{photoError}</span>}
                </div>
              )}
              {docFileUrl && (
                <div className="pv-evidence">
                  <img src={docFileUrl} alt="Soporte de la cédula" />
                  <span>Soporte adjunto</span>
                </div>
              )}
              {isIdentityVerified && (
                <div className="pv-summary pv-summary--flush">
                  <span className="pv-ok"><CheckCircle2 size={14} aria-hidden="true" /> Cédula revisada por moderación</span>
                </div>
              )}
              <div className="pv-form__actions">
                <button type="button" onClick={() => setShowVerificationModal(false)} className="btn btn-secondary">Cerrar</button>
                {!isIdentityVerified && !isVerificationPending && (
                  <button
                    type="button"
                    onClick={handleSubmitVerification}
                    className="btn btn-primary"
                    disabled={!docNumber.trim() || isUploading}
                  >
                    Enviar a revisión
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Referir Colega (RF-68) */}
      {showReferralModal && (
        <div className="oy-modal-backdrop" onClick={() => setShowReferralModal(false)}>
          <div
            className="oy-modal pv-modal--sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pv-ref-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="oy-modal__head">
              <h3 id="pv-ref-title" className="oy-modal__title">Registrar un Referido</h3>
              <button type="button" className="oy-icon-btn" onClick={() => setShowReferralModal(false)} aria-label="Cerrar">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleAddReferral} className="oy-modal__body pv-form">
              <div>
                <label htmlFor="pv-ref-name" className="pv-label">Nombre del Trabajador</label>
                <input
                  id="pv-ref-name"
                  type="text"
                  className="input-base"
                  placeholder="Ej. Gustavo Bolívar"
                  value={newReferralName}
                  onChange={e => setNewReferralName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="pv-ref-trade" className="pv-label">Oficio del Colega</label>
                <select
                  id="pv-ref-trade"
                  className="input-base"
                  value={newReferralTrade}
                  onChange={e => setNewReferralTrade(e.target.value)}
                >
                  <option value="pintura">Pintura</option>
                  <option value="plomeria">Plomería</option>
                  <option value="cerrajeria">Cerrajería</option>
                  <option value="albanileria">Albañilería</option>
                  <option value="aseo">Aseo Profundo</option>
                  <option value="jardineria">Jardinería</option>
                  <option value="mascotas">Mascotas</option>
                </select>
              </div>
              <div className="pv-form__actions">
                <button type="button" onClick={() => setShowReferralModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar Referido</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar / Editar Oficio (RF-01, RF-02, RF-03, RF-04, RF-05, RF-09, RF-57, RF-67) */}
      {showAddModal && (
        <div className="oy-modal-backdrop" onClick={closeServiceModal}>
          <div
            className="oy-modal pv-modal--trade"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pv-trade-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="oy-modal__head">
              <h3 id="pv-trade-title" className="oy-modal__title">
                {editingServiceId ? 'Editar Oficio' : 'Registrar Nuevo Oficio'}
              </h3>
              <button type="button" className="oy-icon-btn" onClick={closeServiceModal} aria-label="Cerrar">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleAddService} className="oy-modal__body pv-form">
              <div>
                <label htmlFor="pv-trade" className="pv-label">Categoría de Oficio</label>
                <select
                  id="pv-trade"
                  className="input-base"
                  value={newTrade}
                  onChange={e => setNewTrade(e.target.value as TradeCategory)}
                >
                  <option value="plomeria">Plomería</option>
                  <option value="electricidad">Electricidad</option>
                  <option value="pintura">Pintura</option>
                  <option value="cerrajeria">Cerrajería</option>
                  <option value="electrodomesticos">Electrodomésticos</option>
                  <option value="computacion">Computación</option>
                  <option value="albanileria">Albañilería</option>
                  <option value="aseo">Aseo Profundo</option>
                  <option value="jardineria">Jardinería</option>
                  <option value="mascotas">Cuidado de Mascotas</option>
                  <option value="hogar">Hogar y reparaciones</option>
                  <option value="clases">Clases particulares</option>
                </select>
              </div>

              <div>
                <label htmlFor="pv-trade-label" className="pv-label">Título del Servicio</label>
                <input
                  id="pv-trade-label"
                  type="text"
                  className="input-base"
                  value={newTradeLabel}
                  onChange={e => setNewTradeLabel(e.target.value)}
                  placeholder="Ej. Plomero especialista en destapes y fugas"
                  required
                />
              </div>

              <div className="pv-form__pair">
                <div>
                  <label htmlFor="pv-rate" className="pv-label">Tarifa (COP)</label>
                  <input
                    id="pv-rate"
                    type="number"
                    className="input-base"
                    value={newHourlyRate}
                    onChange={e => setNewHourlyRate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="pv-rate-unit" className="pv-label">Modalidad de cobro</label>
                  <select
                    id="pv-rate-unit"
                    className="input-base"
                    value={newRateUnit}
                    onChange={e => setNewRateUnit(e.target.value as RateUnit)}
                  >
                    {RATE_UNITS.map(u => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pv-form__pair">
                <div>
                  <label htmlFor="pv-exp" className="pv-label">Años Experiencia</label>
                  <input
                    id="pv-exp"
                    type="number"
                    className="input-base"
                    value={newExpYears}
                    onChange={e => setNewExpYears(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="pv-distance" className="pv-label">Distancia máxima (km)</label>
                  <input
                    id="pv-distance"
                    type="number"
                    min={1}
                    max={60}
                    className="input-base"
                    value={newMaxDistance}
                    onChange={e => setNewMaxDistance(e.target.value)}
                    placeholder="8"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pv-zones" className="pv-label">Zonas de Cobertura en Bogotá</label>
                <input
                  id="pv-zones"
                  type="text"
                  className="input-base"
                  value={newZones}
                  onChange={e => setNewZones(e.target.value)}
                  placeholder="Chapinero, Usaquén, Cedritos, Suba"
                  required
                />
              </div>

              {/* RF-09: Equipamiento y Marcas */}
              <div className="pv-form__pair">
                <div>
                  <label htmlFor="pv-equip" className="pv-label">Equipos / Herramientas</label>
                  <input
                    id="pv-equip"
                    type="text"
                    className="input-base"
                    value={newEquipment}
                    onChange={e => setNewEquipment(e.target.value)}
                    placeholder="Sonda eléctrica, Geófono"
                  />
                </div>
                <div>
                  <label htmlFor="pv-brands" className="pv-label">Marcas atendidas</label>
                  <input
                    id="pv-brands"
                    type="text"
                    className="input-base"
                    value={newBrands}
                    onChange={e => setNewBrands(e.target.value)}
                    placeholder="Grival, Corona, Pavco"
                  />
                </div>
              </div>

              {/* RF-67: Especializaciones */}
              <div>
                <label htmlFor="pv-specs" className="pv-label">Especializaciones registradas</label>
                <input
                  id="pv-specs"
                  type="text"
                  className="input-base"
                  value={newSpecializations}
                  onChange={e => setNewSpecializations(e.target.value)}
                  placeholder="Destapes no invasivos, detección por termografía"
                />
              </div>

              {/* RF-09: Especies atendidas (mascotas) */}
              {(newTrade === 'mascotas' || newSpecies) && (
                <div>
                  <label htmlFor="pv-species" className="pv-label">Especies atendidas</label>
                  <input
                    id="pv-species"
                    type="text"
                    className="input-base"
                    value={newSpecies}
                    onChange={e => setNewSpecies(e.target.value)}
                    placeholder="Perros, gatos, aves"
                  />
                </div>
              )}

              <div>
                <label htmlFor="pv-bio" className="pv-label">Descripción / Bio del Servicio</label>
                <textarea
                  id="pv-bio"
                  className="input-base"
                  rows={2}
                  value={newBio}
                  onChange={e => setNewBio(e.target.value)}
                  required
                />
              </div>

              <div className="pv-form__actions">
                <button type="button" onClick={closeServiceModal} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  {editingServiceId ? 'Guardar Cambios' : 'Guardar Oficio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
