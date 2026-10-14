import React, { useState, useEffect } from 'react';
import type {
  WorkerServiceProfile,
  ServiceRequest,
  TradeCategory,
  ClientProfile,
  AcceptedPaymentMethod,
  ReferralRecord
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
  Zap
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { SquishSwitch } from '../../components/ui/SquishSwitch';
import { PageHero } from '../../components/layout/PageHero';
import './Provider.css';

type WeekDay = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';

interface DaySchedule {
  active: boolean;
  from: string;
  to: string;
}

const WEEK_DAYS: { key: WeekDay; label: string }[] = [
  { key: 'lun', label: 'Lunes' },
  { key: 'mar', label: 'Martes' },
  { key: 'mie', label: 'Miércoles' },
  { key: 'jue', label: 'Jueves' },
  { key: 'vie', label: 'Viernes' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' }
];

const PAYMENT_OPTIONS: AcceptedPaymentMethod[] = ['efectivo', 'nequi', 'daviplata', 'bre_b', 'tarjeta'];

// RF-46: Servicios más solicitados del periodo (datos referenciales)
const TOP_REQUESTED: { label: string; count: number }[] = [
  { label: 'Tableros y breakers', count: 18 },
  { label: 'Instalación de tomas', count: 12 },
  { label: 'Calentadores', count: 7 },
  { label: 'Neveras', count: 5 }
];

interface ProviderDashboardProps {
  incomingRequests: ServiceRequest[];
  onAcceptRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  incomingRequests,
  onAcceptRequest,
  onRejectRequest
}) => {
  const [isAvailableNow, setIsAvailableNow] = useState(true);

  // RF-59: Foto de perfil
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // RF-06: Disponibilidad semanal (días y franjas horarias)
  const [weeklySchedule, setWeeklySchedule] = useState<Record<WeekDay, DaySchedule>>({
    lun: { active: true, from: '07:00', to: '18:00' },
    mar: { active: true, from: '07:00', to: '18:00' },
    mie: { active: true, from: '07:00', to: '18:00' },
    jue: { active: true, from: '07:00', to: '18:00' },
    vie: { active: true, from: '07:00', to: '17:00' },
    sab: { active: true, from: '08:00', to: '13:00' },
    dom: { active: false, from: '09:00', to: '12:00' }
  });

  // RF-01, RF-02, RF-03, RF-04, RF-05, RF-09, RF-66, RF-67: Oficios registrados con detalles específicos
  const [services, setServices] = useState<WorkerServiceProfile[]>([
    {
      id: 'srv-prof-1',
      trade: 'electricidad',
      tradeLabel: 'Electricista Residencial & Comercial SENA',
      hourlyRate: 45000,
      experienceYears: 8,
      coverageZones: ['Chapinero', 'Chicó', 'Usaquén', 'Cedritos'],
      bio: 'Instalaciones eléctricas certificadas, tableros de protección y cableado.',
      phone: '+57 312 458 9012',
      specializations: ['Tableros trifásicos', 'Cableado estructurado', 'Automatización domótica'],
      equipment: ['Multímetro digital Fluke', 'Ponchadora hidráulica', 'Detector sin contacto'],
      brands: ['Schneider Electric', 'Legrand', 'Bticino', 'Philips']
    },
    {
      id: 'srv-prof-2',
      trade: 'electrodomesticos',
      tradeLabel: 'Reparación de Calentadores y Neveras',
      hourlyRate: 40000,
      experienceYears: 5,
      coverageZones: ['Chapinero', 'Teusaquillo', 'Suba'],
      bio: 'Mantenimiento preventivo y cambio de repuestos originales.',
      phone: '+57 312 458 9012',
      specializations: ['Carga de gas refrigerante', 'Termostatos', 'Bombas de desagüe'],
      equipment: ['Manómetro refrigeración', 'Bomba de vacío'],
      brands: ['Haceb', 'Whirlpool', 'Samsung']
    }
  ]);

  // RF-60: Métodos de pago aceptados configurables
  const [paymentMethods, setPaymentMethods] = useState<AcceptedPaymentMethod[]>([
    'efectivo',
    'nequi',
    'daviplata',
    'bre_b'
  ]);

  // RF-07: Portafolio de fotografías
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop'
  ]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // RF-41, RF-42, RF-43: Verificación de Identidad
  const [completedJobsCount] = useState(42); // >= 10 requerido para elegibilidad (RF-41)
  const [isIdentityVerified, setIsIdentityVerified] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [docNumber, setDocNumber] = useState('1.020.845.912');

  // RF-68, RF-69: Referidos
  const [referralCode] = useState('MGOMEZ-2026');
  const [referralsList, setReferralsList] = useState<ReferralRecord[]>([
    { name: 'Carlos Restrepo', trade: 'Plomería', status: 'verificado' },
    { name: 'Elena Jaramillo', trade: 'Pintura', status: 'verificado' },
    { name: 'Andrés Henao', trade: 'Cerrajería', status: 'verificado' }
  ]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [newReferralName, setNewReferralName] = useState('');
  const [newReferralTrade, setNewReferralTrade] = useState('pintura');

  // RF-53: Consulta de Perfil de Contratante
  const [selectedClientForProfile, setSelectedClientForProfile] = useState<ClientProfile | null>(null);

  // Modal para Añadir Servicio (RF-01, RF-09, RF-66, RF-67)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newTrade, setNewTrade] = useState<TradeCategory>('plomeria');
  const [newTradeLabel, setNewTradeLabel] = useState('');
  const [newHourlyRate, setNewHourlyRate] = useState('42000');
  const [newExpYears, setNewExpYears] = useState('4');
  const [newZones, setNewZones] = useState('Chapinero, Chicó, Usaquén');
  const [newBio, setNewBio] = useState('Atención de emergencias y servicios a domicilio en Bogotá.');
  const [newEquipment, setNewEquipment] = useState('Herramienta manual, tester');
  const [newBrands, setNewBrands] = useState('Grival, Corona, Pavco');
  const [newSpecializations, setNewSpecializations] = useState('Destapes urgentes, griferías');

  // RF-28: Cálculo de tiempo restante de solicitudes (30 minutos sin respuesta)
  const [timeLeftMap, setTimeLeftMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const updated: Record<string, number> = {};
      incomingRequests.forEach(req => {
        const createdMs = req.createdAt ? new Date(req.createdAt).getTime() : now;
        const expiryMs = req.expiresAt ? new Date(req.expiresAt).getTime() : createdMs + 30 * 60 * 1000;
        const diffSeconds = Math.max(0, Math.floor((expiryMs - now) / 1000));
        updated[req.id] = diffSeconds;
      });
      setTimeLeftMap(updated);
    }, 1000);
    return () => clearInterval(timer);
  }, [incomingRequests]);

  useEffect(() => {
    return () => {
      if (profilePhoto) URL.revokeObjectURL(profilePhoto);
    };
  }, [profilePhoto]);

  const handleProfilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhoto(URL.createObjectURL(file));
    e.target.value = '';
  };

  const updateDay = (day: WeekDay, patch: Partial<DaySchedule>) => {
    setWeeklySchedule(prev => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  };

  const openNewService = () => {
    setEditingServiceId(null);
    setNewTradeLabel('');
    setShowAddModal(true);
  };

  // RF-57, RF-67: Editar tarifa, zonas y especializaciones de un oficio
  const openEditService = (srv: WorkerServiceProfile) => {
    setEditingServiceId(srv.id);
    setNewTrade(srv.trade);
    setNewTradeLabel(srv.tradeLabel);
    setNewHourlyRate(String(srv.hourlyRate));
    setNewExpYears(String(srv.experienceYears));
    setNewZones(srv.coverageZones.join(', '));
    setNewBio(srv.bio);
    setNewEquipment((srv.equipment ?? []).join(', '));
    setNewBrands((srv.brands ?? []).join(', '));
    setNewSpecializations((srv.specializations ?? []).join(', '));
    setShowAddModal(true);
  };

  const closeServiceModal = () => {
    setShowAddModal(false);
    setEditingServiceId(null);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    const created: WorkerServiceProfile = {
      id: editingServiceId ?? `srv-prof-${Date.now()}`,
      trade: newTrade,
      tradeLabel: newTradeLabel || `Servicio de ${newTrade}`,
      hourlyRate: parseInt(newHourlyRate) || 40000,
      experienceYears: parseInt(newExpYears) || 3,
      coverageZones: newZones.split(',').map(z => z.trim()),
      bio: newBio,
      phone: '+57 312 458 9012',
      equipment: newEquipment.split(',').map(e => e.trim()).filter(Boolean),
      brands: newBrands.split(',').map(b => b.trim()).filter(Boolean),
      specializations: newSpecializations.split(',').map(s => s.trim()).filter(Boolean)
    };

    setServices(prev =>
      editingServiceId ? prev.map(s => (s.id === editingServiceId ? created : s)) : [...prev, created]
    );
    closeServiceModal();
    setNewTradeLabel('');
  };

  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const togglePaymentMethod = (method: AcceptedPaymentMethod) => {
    setPaymentMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim()) {
      setPortfolioPhotos(prev => [...prev, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
      setShowPhotoModal(false);
    }
  };

  const handleAddReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReferralName.trim()) return;
    setReferralsList(prev => [
      ...prev,
      { name: newReferralName.trim(), trade: newReferralTrade, status: 'verificado' }
    ]);
    setNewReferralName('');
    setShowReferralModal(false);
  };

  // RF-69: Insignia de Referente Comunitario Verificado (mínimo 3 oficios distintos)
  const distinctTradesCount = new Set(referralsList.map(r => r.trade.toLowerCase())).size;
  const isCommunityReferrer = distinctTradesCount >= 3;

  // RF-45: Calcular ingresos mensuales referenciales
  const monthlyRevenue = 1890000;

  const activeDays = WEEK_DAYS.filter(d => weeklySchedule[d.key].active).length;
  const topMax = Math.max(...TOP_REQUESTED.map(t => t.count));

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
            {profilePhoto ? (
              <img className="pv-avatar__img" src={profilePhoto} alt="Tu foto de perfil" />
            ) : (
              <div className="pv-avatar__img">
                <MascotAvatar trade="electricidad" size="sm" />
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
              />
            </label>
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 className="pv-live__title oy-display">
              {isAvailableNow ? 'Disponible ya' : 'Fuera de línea'}
            </h2>
            <p className="pv-live__text">
              {isAvailableNow ? 'Visible en el mapa local' : 'Oculto para nuevos pedidos'}
            </p>
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
          <span className="pv-row">
            <span className="pv-dot" data-on={isAvailableNow} aria-hidden="true" />
            {isAvailableNow ? 'DISPONIBLE YA' : 'FUERA DE LÍNEA'}
          </span>
          <SquishSwitch
            checked={isAvailableNow}
            onChange={setIsAvailableNow}
            ariaLabel="Disponible Ya"
            trackOnColor="var(--oy-cacao-profundo)"
            width={60}
            height={34}
            radius={17}
          />
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
          <span className="oy-stat__value">4.9</span>
          <span className="oy-stat__label">Calificación Promedio</span>
          <span className="pv-stat__note">(38 reseñas)</span>
        </div>
        <div className="oy-stat pv-stat--fuego">
          <span className="pv-stat__icon"><DollarSign size={20} aria-hidden="true" /></span>
          <span className="oy-stat__value">${monthlyRevenue.toLocaleString()}</span>
          <span className="oy-stat__label">Ingresos Mes</span>
          <span className="pv-stat__note">COP · referencial</span>
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
            <MascotAvatar trade="electricidad" size="md" expression="alegre" />
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
                      onClick={() =>
                        setSelectedClientForProfile({
                          id: req.clientId,
                          name: req.clientName,
                          avatarColor: 'var(--oy-azul-marino)',
                          rating: 4.9,
                          reviewCount: 12,
                          completedServicesCount: 15,
                          registeredSince: 'Enero 2025'
                        })
                      }
                    >
                      <strong>{req.clientName}</strong>
                      <small>Ver reputación del contratante ↗</small>
                    </button>
                    <span className={`pv-tag ${req.urgency === 'urgente' ? 'pv-tag--danger' : 'pv-tag--esmeralda'}`}>
                      {req.urgency === 'urgente' ? <><Zap size={12} aria-hidden="true" /> Urgente</> : 'Normal'}
                    </span>
                  </div>

                  <span className="pv-muted" style={{ fontSize: '13px' }}>{req.address}</span>

                  <p className="pv-ticket__quote">"{req.problemDescription}"</p>

                  {/* Foto de la solicitud si existe (RF-20) */}
                  {req.photos && req.photos.length > 0 && (
                    <div className="pv-evidence">
                      <img src={req.photos[0]} alt="Evidencia del problema" />
                      <span>Foto del problema adjunta por el cliente</span>
                    </div>
                  )}

                  <div className="pv-ticket__meta pv-row--between">
                    <span><Clock size={14} aria-hidden="true" /> {req.time}</span>
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
                      onClick={() => handleDeleteService(srv.id)}
                      title="Eliminar este oficio secundario"
                      aria-label={`Eliminar ${srv.tradeLabel}`}
                      style={{ color: 'var(--color-danger)' }}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{srv.tradeLabel}</h3>
              <p className="pv-muted" style={{ margin: 0, fontSize: '14px' }}>{srv.bio}</p>

              <div className="pv-row">
                <span className="pv-tag pv-tag--fuego"><DollarSign size={13} aria-hidden="true" /> ${srv.hourlyRate.toLocaleString()} COP/h</span>
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
              {(srv.equipment || srv.brands) && (
                <div className="pv-details">
                  {srv.equipment && <div><strong>Equipo:</strong> {srv.equipment.join(', ')}</div>}
                  {srv.brands && <div><strong>Marcas:</strong> {srv.brands.join(', ')}</div>}
                </div>
              )}

              <div className="pv-details">
                <span className="pv-label">Zonas de cobertura en Bogotá</span>
                <div className="pv-row">
                  {srv.coverageZones.map((z, i) => (
                    <span key={i} className="pv-tag">{z}</span>
                  ))}
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
                    <span className="pv-muted" style={{ fontSize: '13px', textAlign: 'center' }}>Descanso</span>
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
            <p className="pv-muted" style={{ margin: 0, fontSize: '14px' }}>
              Selecciona los canales en los que recibes pagos para informar al contratante antes del servicio.
            </p>
            <div className="pv-chips">
              {PAYMENT_OPTIONS.map(method => (
                <button
                  key={method}
                  type="button"
                  className="oy-chip"
                  aria-pressed={paymentMethods.includes(method)}
                  onClick={() => togglePaymentMethod(method)}
                  style={{ textTransform: method === 'bre_b' ? 'none' : 'capitalize' }}
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
            <p className="pv-muted" style={{ margin: 0, fontSize: '14px' }}>
              {portfolioPhotos.length} fotos publicadas para generar confianza en tus contratantes.
            </p>
            <div className="pv-portfolio">
              {portfolioPhotos.map((url, i) => (
                <div key={i} className="pv-portfolio__item">
                  <img src={url} alt={`Trabajo ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* RF-46: Servicios más solicitados */}
          <div className="oy-panel oy-panel--gris">
            <h3 className="pv-panel-title"><TrendingUp size={22} aria-hidden="true" /> Servicios más solicitados</h3>
            <p className="pv-muted" style={{ margin: 0, fontSize: '14px' }}>Trabajos completados por categoría este mes.</p>
            <ol className="pv-top-list">
              {TOP_REQUESTED.map(t => (
                <li key={t.label}>
                  <div className="pv-row pv-row--between" style={{ fontSize: '14px', fontWeight: 700 }}>
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
            <p className="pv-muted" style={{ margin: 0, fontSize: '14px' }}>
              {completedJobsCount >= 10
                ? `Has completado ${completedJobsCount} trabajos (mínimo 10 requeridos). Eres elegible para el distintivo oficial.`
                : `Completa al menos 10 trabajos para solicitar la verificación de identidad.`}
            </p>
            <div className="pv-summary pv-row pv-row--between">
              <div>
                <span className="pv-label">Estado actual</span>
                <span className={`pv-tag ${isIdentityVerified ? 'pv-tag--esmeralda' : 'pv-tag--danger'}`}>
                  {isIdentityVerified ? <><CheckCircle2 size={13} aria-hidden="true" /> Identidad Verificada Activa</> : 'Pendiente de Documento'}
                </span>
              </div>
              <button type="button" onClick={() => setShowVerificationModal(true)} className="btn btn-secondary">
                {isIdentityVerified ? 'Ver Soporte' : 'Enviar Cédula'}
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
            <p className="pv-muted" style={{ margin: 0, fontSize: '14px' }}>
              Tu código de referido: <span className="pv-code">{referralCode}</span>. Invita a trabajadores a registrarse.
            </p>
            <div className="pv-summary">
              <div className="pv-row pv-row--between">
                <span>Referidos activos:</span>
                <strong>{referralsList.length} colegas</strong>
              </div>
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
            className="oy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pv-client-title"
            style={{ '--oy-modal-w': '480px' } as React.CSSProperties}
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
                  <h4 style={{ margin: 0, fontSize: '1.15rem' }}>{selectedClientForProfile.name}</h4>
                  <span className="pv-muted" style={{ fontSize: '13px' }}>
                    Miembro desde {selectedClientForProfile.registeredSince}
                  </span>
                </div>
              </div>

              <div className="oy-panel oy-panel--amarillo" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <span className="pv-label">Reputación histórica como contratante</span>
                <div className="pv-rating">
                  <Star size={22} fill="var(--color-star)" color="var(--oy-cacao-profundo)" aria-hidden="true" /> {selectedClientForProfile.rating}
                  <span className="pv-muted" style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 500 }}>
                    ({selectedClientForProfile.reviewCount} calificaciones de otros profesionales)
                  </span>
                </div>
                <span className="pv-ok" style={{ marginTop: '6px' }}>
                  <CheckCircle2 size={14} aria-hidden="true" /> {selectedClientForProfile.completedServicesCount} servicios contratados y pagados puntualmente
                </span>
              </div>

              <p className="pv-muted" style={{ margin: '0 0 var(--space-4)', fontSize: '13px' }}>
                Esta información te permite evaluar si aceptar la solicitud con base en el historial verificado del usuario.
              </p>

              <button type="button" onClick={() => setSelectedClientForProfile(null)} className="btn btn-primary" style={{ width: '100%' }}>
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
            className="oy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pv-photo-title"
            style={{ '--oy-modal-w': '440px' } as React.CSSProperties}
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
            className="oy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pv-verify-title"
            style={{ '--oy-modal-w': '460px', '--oy-modal-head-bg': 'var(--wash-esmeralda)' } as React.CSSProperties}
            onClick={e => e.stopPropagation()}
          >
            <div className="oy-modal__head">
              <h3 id="pv-verify-title" className="oy-modal__title">Soporte de Identidad Verificada</h3>
              <button type="button" className="oy-icon-btn" onClick={() => setShowVerificationModal(false)} aria-label="Cerrar">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="oy-modal__body pv-form">
              <p className="pv-muted" style={{ margin: 0, fontSize: '14px' }}>
                Documento validado para emitir el distintivo de Identidad Verificada en tu perfil público de Bogotá.
              </p>
              <div>
                <label htmlFor="pv-doc" className="pv-label">Número de Cédula de Ciudadanía</label>
                <input
                  id="pv-doc"
                  type="text"
                  className="input-base"
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value)}
                />
              </div>
              <div className="pv-summary" style={{ margin: 0 }}>
                <span className="pv-ok"><CheckCircle2 size={14} aria-hidden="true" /> Cédula digital validada ante Registraduría</span>
                <span className="pv-muted" style={{ fontSize: '12px' }}>Vigente hasta Diciembre 2027</span>
              </div>
              <div className="pv-form__actions">
                <button type="button" onClick={() => setShowVerificationModal(false)} className="btn btn-secondary">Cerrar</button>
                <button
                  type="button"
                  onClick={() => {
                    setIsIdentityVerified(true);
                    setShowVerificationModal(false);
                  }}
                  className="btn btn-primary"
                >
                  Confirmar Verificación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Referir Colega (RF-68) */}
      {showReferralModal && (
        <div className="oy-modal-backdrop" onClick={() => setShowReferralModal(false)}>
          <div
            className="oy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pv-ref-title"
            style={{ '--oy-modal-w': '440px' } as React.CSSProperties}
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
            className="oy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pv-trade-title"
            style={{ '--oy-modal-w': '560px', '--oy-modal-head-bg': 'var(--wash-fuego)' } as React.CSSProperties}
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
                  <label htmlFor="pv-rate" className="pv-label">Tarifa / Hora (COP)</label>
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
