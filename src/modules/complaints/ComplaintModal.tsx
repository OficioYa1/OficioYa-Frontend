import React, { useState } from 'react';
import type { ComplaintType, ComplaintTicket, ComplaintAttachment } from '../../types';
import {
  X,
  AlertTriangle,
  Paperclip,
  CheckCircle2,
  FileCheck,
  Film,
  Image as ImageIcon,
  ShieldAlert
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';

interface ComplaintModalProps {
  targetWorkerId: string;
  targetWorkerName: string;
  serviceId?: string;
  onClose: () => void;
  onSubmitComplaint: (ticket: ComplaintTicket) => void;
}

const COMPLAINT_TYPES: ComplaintType[] = [
  'Fraude',
  'Acoso',
  'Inasistencia',
  'Cobro indebido',
  'Otro'
];

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  targetWorkerId,
  targetWorkerName,
  serviceId,
  onClose,
  onSubmitComplaint
}) => {
  const [type, setType] = useState<ComplaintType>('Inasistencia');
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<ComplaintAttachment[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedCase, setGeneratedCase] = useState('');

  // Simulación de carga de archivos (imágenes, video, PDF)
  const handleSimulateAddAttachment = (fileType: 'image' | 'video' | 'pdf') => {
    if (evidenceFiles.length >= 5) return;

    let newAttachment: ComplaintAttachment;
    if (fileType === 'image') {
      newAttachment = { name: `evidencia-foto-${Date.now().toString().slice(-4)}.jpg`, type: 'image/jpeg', size: '1.4 MB' };
    } else if (fileType === 'video') {
      newAttachment = { name: `grabacion-video-${Date.now().toString().slice(-4)}.mp4`, type: 'video/mp4', size: '4.8 MB' };
    } else {
      newAttachment = { name: `comprobante-recibo-${Date.now().toString().slice(-4)}.pdf`, type: 'application/pdf', size: '320 KB' };
    }

    setEvidenceFiles(prev => [...prev, newAttachment]);
  };

  const removeAttachment = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 20) return;

    const caseNumber = `OY-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: ComplaintTicket = {
      id: `cmp-${Date.now()}`,
      caseNumber,
      targetWorkerId,
      targetWorkerName,
      serviceId,
      type,
      description,
      evidenceFiles,
      createdAt: new Date().toISOString(),
      status: 'En revisión'
    };

    // Guardar en localStorage (oy-complaints)
    try {
      const existing: ComplaintTicket[] = JSON.parse(localStorage.getItem('oy-complaints') || '[]');
      localStorage.setItem('oy-complaints', JSON.stringify([newTicket, ...existing]));
    } catch (err) {
      console.error('Error guardando ticket en oy-complaints', err);
    }

    setGeneratedCase(caseNumber);
    setIsSuccess(true);
    onSubmitComplaint(newTicket);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 1100,
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
          maxWidth: '540px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '24px',
          borderRadius: '24px',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '18px', right: '18px', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        {!isSuccess ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Reportar a {targetWorkerName}</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Genera un ticket formal ante el equipo de moderación de OficioYa
                </span>
              </div>
            </div>

            {/* Aviso sobre falsas denuncias */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                background: 'var(--color-warning-bg)',
                border: '1px solid #FDE68A',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#92400E'
              }}
            >
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>
                <strong>Aviso importante:</strong> Toda denuncia falsa o malintencionada afecta la reputación de los trabajadores y acarreará la suspensión definitiva de tu cuenta de contratante.
              </span>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Tipo de Queja */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Tipo de anomalía o motivo
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '6px' }}>
                  {COMPLAINT_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '10px',
                        border: type === t ? '2px solid var(--color-danger)' : '1px solid var(--color-border)',
                        background: type === t ? 'var(--color-danger-bg)' : 'var(--color-surface)',
                        color: type === t ? 'var(--color-danger)' : 'var(--color-text-main)',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción con contador de caracteres (mínimo 20) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700 }}>
                    Descripción detallada de lo sucedido
                  </label>
                  <span style={{ fontSize: '11px', color: description.length < 20 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
                    {description.length}/20 car. mín.
                  </span>
                </div>
                <textarea
                  className="input-base"
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Explica detalladamente qué ocurrió (mínimo 20 caracteres)..."
                  required
                />
              </div>

              {/* Adjuntar Evidencia (Imágenes, Video o PDF, máx 5) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Paperclip size={14} /> Adjuntar Evidencia ({evidenceFiles.length}/5)
                  </label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      disabled={evidenceFiles.length >= 5}
                      onClick={() => handleSimulateAddAttachment('image')}
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '10px' }}
                      title="Adjuntar imagen"
                    >
                      <ImageIcon size={12} /> + Foto
                    </button>
                    <button
                      type="button"
                      disabled={evidenceFiles.length >= 5}
                      onClick={() => handleSimulateAddAttachment('video')}
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '10px' }}
                      title="Adjuntar video"
                    >
                      <Film size={12} /> + Video
                    </button>
                    <button
                      type="button"
                      disabled={evidenceFiles.length >= 5}
                      onClick={() => handleSimulateAddAttachment('pdf')}
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '10px' }}
                      title="Adjuntar PDF o recibo"
                    >
                      <FileCheck size={12} /> + PDF
                    </button>
                  </div>
                </div>

                {/* Chips de archivos adjuntos */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {evidenceFiles.map((file, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      {file.type.includes('image') && <ImageIcon size={12} color="#3B82F6" />}
                      {file.type.includes('video') && <Film size={12} color="#8B5CF6" />}
                      {file.type.includes('pdf') && <FileCheck size={12} color="#EF4444" />}
                      <span>{file.name}</span>
                      <X size={12} style={{ cursor: 'pointer', color: 'var(--color-text-muted)' }} onClick={() => removeAttachment(idx)} />
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={description.length < 20}
                  className="btn btn-danger"
                  style={{ flex: 1.5, opacity: description.length < 20 ? 0.6 : 1 }}
                >
                  Radicar Queja Formal
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Pantalla de Éxito con Caso Único */
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ margin: '0 auto 12px', display: 'inline-block' }}>
              <MascotAvatar size="sm" />
            </div>

            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <CheckCircle2 size={28} />
            </div>

            <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>Ticket Radicado Correctamente</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '16px' }}>
              El equipo de moderación ha recibido el reporte y revisará las evidencias en un plazo máximo de 24 horas.
            </p>

            <div
              style={{
                background: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                padding: '14px',
                marginBottom: '20px',
                display: 'inline-block',
                width: '100%'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
                NÚMERO DE CASO ÚNICO
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--role-primary)', letterSpacing: '1px' }}>
                {generatedCase}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                Guardado en almacenamiento local (oy-complaints)
              </span>
            </div>

            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              Entendido, volver a la aplicación
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
