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
  Wrench,
  Tag,
  Image as ImageIcon,
  UserCheck,
  X,
  AlertCircle
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';

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

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    const created: WorkerServiceProfile = {
      id: `srv-prof-${Date.now()}`,
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

    setServices(prev => [...prev, created]);
    setShowAddModal(false);
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

  return (
    <div className="provider-dashboard container" style={{ padding: '24px 0 60px' }}>
      {/* Banner Principal con Toggle "Disponible Ya" (RF-30, RF-31) y Mascota */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(255, 199, 44, 0.12) 100%)',
          border: '2px solid var(--role-primary)',
          borderRadius: '24px',
          padding: '24px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <MascotAvatar trade="electricidad" size="md" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.4rem' }}>Panel de Control Profesional</h2>
              {isIdentityVerified && (
                <span className="badge badge-verified" title="Identidad validada con cédula (RF-43)">
                  <ShieldCheck size={13} /> Identidad Verificada (RF-43)
                </span>
              )}
              {isCommunityReferrer && (
                <span className="badge" style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #F59E0B' }}>
                  <Award size={13} /> Referente Comunitario (RF-69)
                </span>
              )}
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: '4px 0 0' }}>
              Gestiona tus oficios, cotizaciones entrantes y tu visibilidad en tiempo real para clientes en Bogotá D.C.
            </p>
          </div>
        </div>

        {/* Toggle Disponible Ya (RF-30, RF-31) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: 'var(--color-surface)',
            padding: '12px 20px',
            borderRadius: '999px',
            border: '1.5px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: isAvailableNow ? '#10B981' : '#94A3B8',
                  animation: isAvailableNow ? 'pulseGlow 2s infinite' : 'none'
                }}
              />
              {isAvailableNow ? 'DISPONIBLE YA (RF-30)' : 'FUERA DE LÍNEA (RF-31)'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {isAvailableNow ? 'Visible en el mapa local' : 'Oculto para nuevos pedidos'}
            </span>
          </div>

          <button
            onClick={() => setIsAvailableNow(!isAvailableNow)}
            style={{
              width: '52px',
              height: '28px',
              borderRadius: '999px',
              background: isAvailableNow ? '#10B981' : 'var(--color-border)',
              position: 'relative',
              transition: 'background 0.2s',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#FFFFFF',
                position: 'absolute',
                top: '3px',
                left: isAvailableNow ? '26px' : '4px',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            />
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas del Proveedor (RF-08, RF-10, RF-45) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block' }}>Trabajos Completados (RF-08)</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 900 }}>{completedJobsCount}</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={24} fill="#FBBF24" color="#FBBF24" />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block' }}>Calificación Promedio (RF-10)</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 900 }}>4.9 <small style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 400 }}>(38 reseñas)</small></span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--role-primary-light)', color: 'var(--role-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block' }}>Ingresos Mes (RF-45)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>${monthlyRevenue.toLocaleString()} <small style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>COP</small></span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BellRing size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block' }}>Solicitudes Pendientes (RF-25)</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 900 }}>{incomingRequests.length}</span>
          </div>
        </div>
      </div>

      {/* Sección 1: Bandeja de Solicitudes Entrantes (RF-25, RF-26, RF-27, RF-28, RF-53) */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Bandeja de Solicitudes Entrantes (RF-25)</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Clientes en Bogotá solicitando atención. Tiempo de respuesta límite: 30 minutos (RF-28).
            </span>
          </div>
          <span className="badge badge-closest">{incomingRequests.length} pendientes</span>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
            <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 10px' }} />
            <p>¡Estás al día! No tienes solicitudes pendientes de respuesta en este momento.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {incomingRequests.map(req => {
              const secondsLeft = timeLeftMap[req.id] !== undefined ? timeLeftMap[req.id] : 1800;
              const minutes = Math.floor(secondsLeft / 60);
              const seconds = secondsLeft % 60;
              const isUrgentExpiration = secondsLeft < 300; // Menos de 5 minutos

              return (
                <div key={req.id} className="card" style={{ borderLeft: '4px solid var(--role-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      {/* Enlace para consultar perfil del contratante (RF-53) */}
                      <button
                        onClick={() =>
                          setSelectedClientForProfile({
                            id: req.clientId,
                            name: req.clientName,
                            avatarColor: '#2563EB',
                            rating: 4.9,
                            reviewCount: 12,
                            completedServicesCount: 15,
                            registeredSince: 'Enero 2025'
                          })
                        }
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--role-primary)', textDecoration: 'underline' }}>
                          {req.clientName}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
                          Ver reputación del contratante (RF-53) ↗
                        </span>
                      </button>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{req.address}</span>
                    </div>

                    <span
                      className={`badge ${req.urgency === 'urgente' ? 'badge-danger' : 'badge-available'}`}
                      style={{ fontSize: '11px', textTransform: 'uppercase' }}
                    >
                      {req.urgency === 'urgente' ? '⚡ Urgente' : 'Normal'}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', background: 'var(--color-surface-hover)', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
                    "{req.problemDescription}"
                  </p>

                  {/* Foto de la solicitud si existe (RF-20) */}
                  {req.photos && req.photos.length > 0 && (
                    <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <img
                        src={req.photos[0]}
                        alt="Evidencia del problema"
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Foto del problema adjunta por el cliente (RF-20)
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>
                      <Clock size={13} /> {req.time}
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--color-success)', fontSize: '14px' }}>
                      Presupuesto: ${req.amount.toLocaleString()} COP
                    </span>
                  </div>

                  {/* Contador Regresivo de Expiración (RF-28) */}
                  <div
                    style={{
                      background: isUrgentExpiration ? '#FEE2E2' : '#EFF6FF',
                      color: isUrgentExpiration ? '#991B1B' : '#1E40AF',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px'
                    }}
                  >
                    <span>⏱ Tiempo para responder (RF-28):</span>
                    <span>{minutes}:{seconds < 10 ? `0${seconds}` : seconds} min</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onRejectRequest(req.id)}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                    >
                      Rechazar (RF-27)
                    </button>
                    <button
                      onClick={() => onAcceptRequest(req.id)}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                    >
                      Aceptar Trabajo (RF-26)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sección 2: Multi-Servicio & Especializaciones (RF-01, RF-02, RF-03, RF-09, RF-66, RF-67) */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Mis Oficios, Especializaciones y Tarifas (RF-01, RF-02, RF-03)</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Configura detalles específicos como equipos, marcas y especialidades (RF-09, RF-67)
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <Plus size={16} /> Añadir otro oficio
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {services.map((srv, index) => (
            <div key={srv.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <span className="badge badge-verified" style={{ marginBottom: '6px' }}>
                    {index === 0 ? 'OFICIO PRINCIPAL' : 'OFICIO SECUNDARIO'}
                  </span>
                  <h4 style={{ fontSize: '15px', fontWeight: 800 }}>{srv.tradeLabel}</h4>
                </div>

                {index > 0 && (
                  <button
                    onClick={() => handleDeleteService(srv.id)}
                    style={{ padding: '4px', color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}
                    title="Eliminar este oficio secundario"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                {srv.bio}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700 }}>💰 ${srv.hourlyRate.toLocaleString()} COP/h</span>
                <span style={{ color: 'var(--color-text-muted)' }}>🕒 {srv.experienceYears} años exp.</span>
              </div>

              {/* Especializaciones (RF-66, RF-67) */}
              {srv.specializations && srv.specializations.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                    Especializaciones (RF-67):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {srv.specializations.map((spec, i) => (
                      <span key={i} style={{ background: 'var(--role-primary-light)', color: 'var(--role-primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        ★ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipos & Marcas (RF-09) */}
              {(srv.equipment || srv.brands) && (
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '10px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
                  {srv.equipment && <div><strong>Equipo:</strong> {srv.equipment.join(', ')}</div>}
                  {srv.brands && <div><strong>Marcas:</strong> {srv.brands.join(', ')}</div>}
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                  Zonas de cobertura en Bogotá (RF-04):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {srv.coverageZones.map((z, i) => (
                    <span key={i} style={{ background: 'var(--color-surface-hover)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                      {z}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección 3: Métodos de Pago & Portafolio (RF-60, RF-07) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        {/* RF-60: Métodos de Pago */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <CreditCard size={20} color="var(--role-primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>Métodos de Pago Aceptados (RF-60)</h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
            Selecciona los canales en los que recibes pagos para informar al contratante antes del servicio.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {(['efectivo', 'nequi', 'daviplata', 'bre_b', 'tarjeta'] as AcceptedPaymentMethod[]).map(method => (
              <label
                key={method}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: paymentMethods.includes(method) ? 'var(--role-primary-light)' : 'var(--color-surface)',
                  border: paymentMethods.includes(method) ? '1px solid var(--role-primary)' : '1px solid var(--color-border)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              >
                <input
                  type="checkbox"
                  checked={paymentMethods.includes(method)}
                  onChange={() => togglePaymentMethod(method)}
                  style={{ cursor: 'pointer' }}
                />
                {method === 'bre_b' ? 'Bre-B (Interoperable)' : method}
              </label>
            ))}
          </div>
        </div>

        {/* RF-07: Portafolio de Fotografías */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ImageIcon size={20} color="var(--role-primary)" />
              <h3 style={{ fontSize: '1.15rem' }}>Portafolio de Trabajos (RF-07)</h3>
            </div>
            <button
              onClick={() => setShowPhotoModal(true)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              + Subir foto
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
            {portfolioPhotos.length} fotos publicadas para generar confianza en tus contratantes.
          </p>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
            {portfolioPhotos.map((url, i) => (
              <div key={i} style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                <img src={url} alt={`Trabajo ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección 4: Verificación de Identidad & Referidos (RF-41, RF-42, RF-43, RF-68, RF-69) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* RF-41, RF-42, RF-43: Verificación de Identidad */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <ShieldCheck size={22} color={isIdentityVerified ? '#10B981' : 'var(--role-primary)'} />
            <h3 style={{ fontSize: '1.15rem' }}>Verificación de Identidad (RF-41, RF-42, RF-43)</h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
            {completedJobsCount >= 10
              ? `✅ Has completado ${completedJobsCount} trabajos (mínimo 10 requeridos). Eres elegible para el distintivo oficial.`
              : `Completa al menos 10 trabajos para solicitar la verificación de identidad.`}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Estado Actual:</span>
              <span className={`badge ${isIdentityVerified ? 'badge-verified' : 'badge-danger'}`} style={{ fontSize: '12px' }}>
                {isIdentityVerified ? '✓ Identidad Verificada Activa' : 'Pendiente de Documento'}
              </span>
            </div>
            <button
              onClick={() => setShowVerificationModal(true)}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {isIdentityVerified ? 'Ver Soporte' : 'Enviar Cédula'}
            </button>
          </div>
        </div>

        {/* RF-68, RF-69: Referidos y Crecimiento Comunitario */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={22} color="var(--role-primary)" />
              <h3 style={{ fontSize: '1.15rem' }}>Referidos Comunitarios (RF-68, RF-69)</h3>
            </div>
            <button
              onClick={() => setShowReferralModal(true)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              + Referir colega
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
            Tu código de referido: <strong>{referralCode}</strong>. Invita a trabajadores a registrarse.
          </p>

          <div style={{ background: 'var(--color-surface-hover)', padding: '10px', borderRadius: '10px', marginBottom: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Referidos activos:</span>
              <strong>{referralsList.length} colegas</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Oficios distintos:</span>
              <strong>{distinctTradesCount} oficios (mínimo 3 para insignia)</strong>
            </div>
          </div>

          {isCommunityReferrer && (
            <span className="badge" style={{ background: '#F59E0B', color: '#FFF', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Award size={13} /> Insignia Permanente: Referente Comunitario Verificado (RF-69)
            </span>
          )}
        </div>
      </div>

      {/* Modal Consulta de Perfil de Contratante (RF-53) */}
      {selectedClientForProfile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            padding: '16px'
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '480px', borderRadius: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={22} color="var(--role-primary)" />
                <h3 style={{ fontSize: '1.25rem' }}>Perfil del Contratante (RF-53)</h3>
              </div>
              <button onClick={() => setSelectedClientForProfile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: selectedClientForProfile.avatarColor,
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '20px'
                }}
              >
                {selectedClientForProfile.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800 }}>{selectedClientForProfile.name}</h4>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Miembro desde {selectedClientForProfile.registeredSince}
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--color-surface-hover)', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                Reputación histórica como contratante:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.4rem', fontWeight: 900, color: '#D97706' }}>
                <Star size={22} fill="#FBBF24" color="#FBBF24" /> {selectedClientForProfile.rating}
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                  ({selectedClientForProfile.reviewCount} calificaciones de otros profesionales)
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600, display: 'block', marginTop: '6px' }}>
                ✓ {selectedClientForProfile.completedServicesCount} servicios contratados y pagados puntualmente
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 16px' }}>
              Esta información te permite evaluar si aceptar la solicitud con base en el historial verificado del usuario.
            </p>

            <button
              onClick={() => setSelectedClientForProfile(null)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}

      {/* Modal Subir Foto de Portafolio (RF-07) */}
      {showPhotoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            padding: '16px'
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Publicar Fotografía en Portafolio (RF-07)</h3>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              URL de la imagen o captura
            </label>
            <input
              type="text"
              className="input-base"
              placeholder="https://images.unsplash.com/..."
              value={newPhotoUrl}
              onChange={e => setNewPhotoUrl(e.target.value)}
              style={{ marginBottom: '14px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowPhotoModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancelar
              </button>
              <button onClick={handleAddPhoto} className="btn btn-primary" style={{ flex: 1 }}>
                Guardar Foto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Verificación de Identidad (RF-42, RF-43) */}
      {showVerificationModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            padding: '16px'
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Soporte de Identidad Verificada (RF-42, RF-43)</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Documento validado para emitir el distintivo de Identidad Verificada en tu perfil público de Bogotá.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Número de Cédula de Ciudadanía
              </label>
              <input
                type="text"
                className="input-base"
                value={docNumber}
                onChange={e => setDocNumber(e.target.value)}
              />
            </div>

            <div style={{ padding: '12px', background: 'var(--color-surface-hover)', borderRadius: '10px', marginBottom: '18px', fontSize: '12px' }}>
              <span style={{ fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Cédula digital validada ante Registraduría
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Vigente hasta Diciembre 2027</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowVerificationModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cerrar
              </button>
              <button
                onClick={() => {
                  setIsIdentityVerified(true);
                  setShowVerificationModal(false);
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Confirmar Verificación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Referir Colega (RF-68) */}
      {showReferralModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            padding: '16px'
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Registrar un Referido (RF-68)</h3>
            <form onSubmit={handleAddReferral} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Nombre del Trabajador
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej. Gustavo Bolívar"
                  value={newReferralName}
                  onChange={e => setNewReferralName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Oficio del Colega
                </label>
                <select
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

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowReferralModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Registrar Referido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Nuevo Oficio (RF-01, RF-02, RF-03, RF-09, RF-67) */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '520px', borderRadius: '24px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Registrar Nuevo Oficio (RF-01, RF-03)</h3>
            <form onSubmit={handleAddService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Categoría de Oficio (RF-02, RF-03)</label>
                <select
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
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Título del Servicio</label>
                <input
                  type="text"
                  className="input-base"
                  value={newTradeLabel}
                  onChange={e => setNewTradeLabel(e.target.value)}
                  placeholder="Ej. Plomero especialista en destapes y fugas"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tarifa / Hora (COP) (RF-05)</label>
                  <input
                    type="number"
                    className="input-base"
                    value={newHourlyRate}
                    onChange={e => setNewHourlyRate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Años Experiencia</label>
                  <input
                    type="number"
                    className="input-base"
                    value={newExpYears}
                    onChange={e => setNewExpYears(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Zonas de Cobertura en Bogotá (RF-04)</label>
                <input
                  type="text"
                  className="input-base"
                  value={newZones}
                  onChange={e => setNewZones(e.target.value)}
                  placeholder="Chapinero, Usaquén, Cedritos, Suba"
                  required
                />
              </div>

              {/* RF-09: Equipamiento y Marcas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Equipos / Herramientas (RF-09)</label>
                  <input
                    type="text"
                    className="input-base"
                    value={newEquipment}
                    onChange={e => setNewEquipment(e.target.value)}
                    placeholder="Sonda eléctrica, Geófono"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Marcas atendidas (RF-09)</label>
                  <input
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
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Especializaciones registradas (RF-67)</label>
                <input
                  type="text"
                  className="input-base"
                  value={newSpecializations}
                  onChange={e => setNewSpecializations(e.target.value)}
                  placeholder="Destapes no invasivos, detección por termografía"
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Descripción / Bio del Servicio</label>
                <textarea
                  className="input-base"
                  rows={2}
                  value={newBio}
                  onChange={e => setNewBio(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Guardar Oficio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
