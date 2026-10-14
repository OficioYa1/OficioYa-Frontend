import React, { useState, useMemo } from 'react';
import type { Worker, UrgencyLevel, ServiceRequest, PaymentMethod } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Send,
  Clock,
  DollarSign,
  Users,
  Search,
  CheckCircle2,
  MapPin,
  Camera,
  Calendar,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';

interface SendRequestModalProps {
  workers: Worker[];
  initialWorker?: Worker;
  onClose: () => void;
  onSubmitRequests: (requests: ServiceRequest[]) => void;
}

const BOGOTA_NEIGHBORHOODS = [
  'Chapinero / Chicó',
  'Usaquén / Santa Bárbara',
  'Cedritos',
  'Suba / Niza',
  'Teusaquillo / Galerías',
  'La Candelaria / Centro',
  'Ciudad Salitre / Modelia',
  'Colina Campestre',
  'Fontibón'
];

export const SendRequestModal: React.FC<SendRequestModalProps> = ({
  workers,
  initialWorker,
  onClose,
  onSubmitRequests
}) => {
  const { user } = useAuth();

  const [description, setDescription] = useState('');
  const [expectedDate, setExpectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedZone, setSelectedZone] = useState('Chapinero / Chicó');
  const [addressDetail, setAddressDetail] = useState('Carrera 15 # 85-20');
  const [urgency, setUrgency] = useState<UrgencyLevel>('urgente');
  const [budget, setBudget] = useState('80000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bre_b');
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop'
  ]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);

  // Lista de trabajadores seleccionados (RF-23 si es 1, RF-24 si son múltiples)
  const [selectedWorkers, setSelectedWorkers] = useState<Worker[]>(() => {
    return initialWorker ? [initialWorker] : [];
  });
  const [searchWorkerQuery, setSearchWorkerQuery] = useState('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [createdList, setCreatedList] = useState<ServiceRequest[]>([]);

  // RF-22: Identificar trabajadores cercanos compatibles con la zona seleccionada
  const compatibleWorkers = useMemo(() => {
    const zoneKeyword = selectedZone.split('/')[0].trim().toLowerCase();
    return workers.filter(
      w =>
        w.available &&
        !w.isPaused &&
        (w.location.zoneName.toLowerCase().includes(zoneKeyword) ||
          w.services.some(s => s.coverageZones.some(cz => cz.toLowerCase().includes(zoneKeyword))))
    );
  }, [workers, selectedZone]);

  const addWorker = (worker: Worker) => {
    if (!selectedWorkers.some(sw => sw.id === worker.id)) {
      setSelectedWorkers(prev => [...prev, worker]);
    }
    setSearchWorkerQuery('');
  };

  const removeWorker = (id: string) => {
    setSelectedWorkers(prev => prev.filter(w => w.id !== id));
  };

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim()) {
      setAttachedPhotos(prev => [...prev, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
      setShowPhotoInput(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setAttachedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // RF-24: Enviar simultáneamente solicitud a varios trabajadores con plazo de 30 minutos (RF-28)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || selectedWorkers.length === 0) return;

    const expirationDate = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos (RF-28)

    const newRequests: ServiceRequest[] = selectedWorkers.map(w => ({
      id: `srv-${Date.now()}-${w.id}`,
      workerId: w.id,
      workerName: w.name,
      workerTrade: w.tradeLabel,
      workerAvatarColor: w.avatarColor,
      clientId: user?.id || 'usr-default',
      clientName: user?.name || 'Cliente',
      clientEmail: user?.email || 'cliente@correo.com',
      date: expectedDate,
      time: urgency === 'urgente' ? 'Inmediato (< 30 min)' : 'En el transcurso del día',
      address: `${addressDetail}, ${selectedZone}, Bogotá D.C.`,
      coverageZone: selectedZone,
      problemDescription: description,
      paymentMethod,
      status: 'en_curso',
      urgency,
      budget: parseInt(budget) || 50000,
      amount: parseInt(budget) || 50000,
      photos: attachedPhotos,
      broadcastCandidates: selectedWorkers.map(sw => sw.id),
      expiresAt: expirationDate,
      createdAt: new Date().toISOString()
    }));

    setCreatedList(newRequests);
    setIsSuccess(true);
    onSubmitRequests(newRequests);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '24px',
          borderRadius: '24px',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '18px', right: '18px', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {!isSuccess ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--role-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--role-primary)' }}>
                <Send size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Crear Petición de Servicio (RF-19, RF-24)</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Describe tu necesidad, adjunta evidencia fotográfica y notifica a expertos compatibles
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* RF-21: Registrar zona donde se requiere el servicio */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <MapPin size={13} /> Zona de Bogotá (RF-21)
                  </label>
                  <select
                    className="input-base"
                    value={selectedZone}
                    onChange={e => setSelectedZone(e.target.value)}
                  >
                    {BOGOTA_NEIGHBORHOODS.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Calendar size={13} /> Fecha esperada (RF-19)
                  </label>
                  <input
                    type="date"
                    className="input-base"
                    value={expectedDate}
                    onChange={e => setExpectedDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Dirección exacta o punto de referencia
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={addressDetail}
                  onChange={e => setAddressDetail(e.target.value)}
                  placeholder="Ej. Calle 93 # 13-25, Apto 402"
                  required
                />
              </div>

              {/* RF-19: Descripción del trabajo */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Descripción detallada de la necesidad (RF-19)
                </label>
                <textarea
                  className="input-base"
                  rows={3}
                  placeholder="Describe qué ocurre, qué herramientas o repuestos crees que se requieren..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* RF-20: Adjuntar fotografía a la solicitud */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Camera size={14} color="var(--role-primary)" /> Evidencia fotográfica del problema (RF-20)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPhotoInput(!showPhotoInput)}
                    style={{ fontSize: '11px', color: 'var(--role-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                  >
                    + Adjuntar otra foto
                  </button>
                </div>

                {showPhotoInput && (
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="input-base"
                      placeholder="URL de foto o imagen de evidencia"
                      value={newPhotoUrl}
                      onChange={e => setNewPhotoUrl(e.target.value)}
                      style={{ fontSize: '12px' }}
                    />
                    <button type="button" onClick={handleAddPhoto} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Agregar
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {attachedPhotos.map((url, idx) => (
                    <div key={idx} style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: '1px solid var(--color-border)' }}>
                      <img src={url} alt="Evidencia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'rgba(0,0,0,0.6)',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Presupuesto y Urgencia */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <DollarSign size={13} /> Presupuesto estimado (COP)
                  </label>
                  <input
                    type="number"
                    className="input-base"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Nivel de urgencia
                  </label>
                  <select
                    className="input-base"
                    value={urgency}
                    onChange={e => setUrgency(e.target.value as UrgencyLevel)}
                  >
                    <option value="urgente">Urgente (Hoy mismo)</option>
                    <option value="normal">Normal (Esta semana)</option>
                  </select>
                </div>
              </div>

              {/* RF-22 & RF-24: Destinatarios y compatibilidad */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} /> Profesionales Destinatarios (RF-23, RF-24)
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {selectedWorkers.length} {selectedWorkers.length === 1 ? 'destinatario directo' : 'candidatos simultáneos'}
                  </span>
                </div>

                {/* Chips de seleccionados */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {selectedWorkers.map(w => (
                    <span
                      key={w.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--role-primary-light)',
                        color: 'var(--role-primary)',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: '1px solid var(--role-primary)'
                      }}
                    >
                      {w.name} ({w.tradeLabel})
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeWorker(w.id)} />
                    </span>
                  ))}
                </div>

                {/* RF-22: Sugerencias compatibles en la zona */}
                {compatibleWorkers.length > 0 && (
                  <div style={{ background: 'var(--color-surface-hover)', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--role-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <Sparkles size={12} /> Expertos cercanos compatibles con {selectedZone} (RF-22):
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {compatibleWorkers.slice(0, 4).map(w => {
                        const isAdded = selectedWorkers.some(sw => sw.id === w.id);
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => addWorker(w)}
                            disabled={isAdded}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              background: isAdded ? 'var(--color-border)' : 'var(--color-surface)',
                              border: '1px solid var(--color-border)',
                              cursor: isAdded ? 'default' : 'pointer'
                            }}
                          >
                            {isAdded ? '✓' : '+'} {w.name} (${w.hourlyRate.toLocaleString()}/h)
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Aviso de expiración a los 30 min (RF-28) */}
              <div style={{ background: '#FEF3C7', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', color: '#92400E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} />
                <span>
                  <strong>Plazo de respuesta (RF-28):</strong> Los trabajadores recibirán una alerta push con un plazo de 30 minutos para responder antes de que la invitación expire.
                </span>
              </div>

              <button
                type="submit"
                disabled={selectedWorkers.length === 0}
                className="btn btn-primary"
                style={{ padding: '12px', fontSize: '14px', fontWeight: 800, marginTop: '6px' }}
              >
                Enviar Solicitud a {selectedWorkers.length} Profesional{selectedWorkers.length === 1 ? '' : 'es'} (RF-24)
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 8px' }}>
            <MascotAvatar trade="plomeria" size="md" />
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '14px auto 10px' }}>
              <CheckCircle2 size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>¡Solicitud enviada con éxito!</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto 16px' }}>
              Despachamos la notificación a los <strong>{createdList.length}</strong> profesionales seleccionados en Bogotá.
              Cuentan con 30 minutos para aceptar antes de expirar (RF-28).
            </p>

            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '14px' }}
            >
              Entendido, ir a Mis Servicios
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
