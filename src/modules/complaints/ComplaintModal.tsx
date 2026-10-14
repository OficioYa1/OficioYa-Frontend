import React, { useId, useState } from 'react';
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
import { useFlowModal } from '../requests/useFlowModal';
import '../requests/Flows.css';

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

const MAX_FILES = 5;
const MIN_CHARS = 20;

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  targetWorkerId,
  targetWorkerName,
  serviceId,
  onClose,
  onSubmitComplaint
}) => {
  const uid = useId();
  const dialogRef = useFlowModal(onClose);

  const [type, setType] = useState<ComplaintType>('Inasistencia');
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<ComplaintAttachment[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedCase, setGeneratedCase] = useState('');

  // Simulación de carga de archivos (imágenes, video, PDF)
  const handleSimulateAddAttachment = (fileType: 'image' | 'video' | 'pdf') => {
    if (evidenceFiles.length >= MAX_FILES) return;

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
    if (description.length < MIN_CHARS) return;

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

  const titleId = `${uid}-title`;
  const tooShort = description.length < MIN_CHARS;
  const filesFull = evidenceFiles.length >= MAX_FILES;

  return (
    <div className="oy-modal-backdrop oy-flow-layer--raised">
      <div
        ref={dialogRef}
        className="oy-modal oy-flow"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className={`oy-modal__head oy-flow-head ${isSuccess ? 'oy-flow-head--esmeralda' : 'oy-flow-head--fuego'}`}>
          <div className="oy-flow-head__main">
            <span className="oy-flow-tile" aria-hidden="true">
              <AlertTriangle size={24} />
            </span>
            <div className="oy-flow-head__text">
              <span className="oy-eyebrow oy-flow-kicker">Reporte formal</span>
              <h2 id={titleId} className="oy-modal__title oy-display">
                {isSuccess ? 'Ticket radicado' : `Reportar a ${targetWorkerName}`}
              </h2>
              {!isSuccess && (
                <p className="oy-flow-head__sub">
                  Genera un ticket formal ante el equipo de moderación de OficioYa
                </p>
              )}
            </div>
          </div>
          <button type="button" className="oy-icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="oy-modal__body">
          {!isSuccess ? (
            <div className="oy-flow-body">
              {/* Aviso sobre falsas denuncias */}
              <div className="oy-flow-note oy-flow-note--fuego">
                <ShieldAlert size={18} aria-hidden="true" />
                <span>
                  <strong>Aviso importante:</strong> Toda denuncia falsa o malintencionada afecta la reputación de los trabajadores y acarreará la suspensión definitiva de tu cuenta de contratante.
                </span>
              </div>

              <form onSubmit={handleSubmit} className="oy-flow-form">
                {/* Tipo de Queja */}
                <section className="oy-flow-section" aria-labelledby={`${uid}-s1`}>
                  <h3 id={`${uid}-s1`} className="oy-flow-section__title">
                    <span className="oy-flow-num">1</span> Tipo de anomalía o motivo
                  </h3>
                  <div className="oy-flow-choices" role="group" aria-labelledby={`${uid}-s1`}>
                    {COMPLAINT_TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        className="oy-chip oy-flow-chip--danger"
                        aria-pressed={type === t}
                        onClick={() => setType(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Descripción con contador de caracteres (mínimo 20) */}
                <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s2`}>
                  <div className="oy-flow-section__head">
                    <h3 id={`${uid}-s2`} className="oy-flow-section__title">
                      <span className="oy-flow-num">2</span> Descripción detallada de lo sucedido
                    </h3>
                    <span
                      id={`${uid}-count`}
                      className={`oy-flow-counter ${tooShort ? 'oy-flow-counter--low' : 'oy-flow-counter--ok'}`}
                    >
                      {description.length}/{MIN_CHARS} car. mín.
                    </span>
                  </div>
                  <div className="oy-flow-field">
                    <textarea
                      className="input-base"
                      rows={4}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Explica detalladamente qué ocurrió (mínimo 20 caracteres)..."
                      aria-labelledby={`${uid}-s2`}
                      aria-describedby={`${uid}-count`}
                      required
                    />
                  </div>
                </section>

                {/* Adjuntar Evidencia (Imágenes, Video o PDF, máx 5) */}
                <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s3`}>
                  <div className="oy-flow-section__head">
                    <h3 id={`${uid}-s3`} className="oy-flow-section__title">
                      <span className="oy-flow-num">3</span>
                      <Paperclip size={16} aria-hidden="true" /> Adjuntar Evidencia ({evidenceFiles.length}/{MAX_FILES})
                    </h3>
                  </div>
                  <div className="oy-flow-choices">
                    <button
                      type="button"
                      disabled={filesFull}
                      onClick={() => handleSimulateAddAttachment('image')}
                      className="oy-flow-link"
                      title="Adjuntar imagen"
                    >
                      <ImageIcon size={14} aria-hidden="true" /> + Foto
                    </button>
                    <button
                      type="button"
                      disabled={filesFull}
                      onClick={() => handleSimulateAddAttachment('video')}
                      className="oy-flow-link"
                      title="Adjuntar video"
                    >
                      <Film size={14} aria-hidden="true" /> + Video
                    </button>
                    <button
                      type="button"
                      disabled={filesFull}
                      onClick={() => handleSimulateAddAttachment('pdf')}
                      className="oy-flow-link"
                      title="Adjuntar PDF o recibo"
                    >
                      <FileCheck size={14} aria-hidden="true" /> + PDF
                    </button>
                  </div>

                  {/* Fichas de archivos adjuntos */}
                  {evidenceFiles.length > 0 && (
                    <ul className="oy-flow-choices oy-flow-plain-list" aria-label="Evidencias adjuntas">
                      {evidenceFiles.map((file, idx) => (
                        <li key={idx} className="oy-flow-token">
                          {file.type.includes('image') && <ImageIcon size={14} aria-hidden="true" />}
                          {file.type.includes('video') && <Film size={14} aria-hidden="true" />}
                          {file.type.includes('pdf') && <FileCheck size={14} aria-hidden="true" />}
                          <span className="oy-flow-token__label">{file.name}</span>
                          <button
                            type="button"
                            className="oy-flow-token__remove"
                            onClick={() => removeAttachment(idx)}
                            aria-label={`Quitar ${file.name}`}
                          >
                            <X size={14} aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <div className="oy-flow-actions">
                  <button type="button" onClick={onClose} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={tooShort}
                    className="btn btn-danger oy-flow-cta"
                  >
                    Radicar Queja Formal
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Pantalla de Éxito con Caso Único */
            <div className="oy-flow-success" role="status">
              <div className="oy-flow-success__mascot">
                <MascotAvatar size="md" />
                <span className="oy-flow-success__check" aria-hidden="true">
                  <CheckCircle2 size={24} />
                </span>
              </div>

              <h3 className="oy-flow-success__title oy-display">Ticket Radicado Correctamente</h3>
              <p className="oy-flow-success__text">
                El equipo de moderación ha recibido el reporte y revisará las evidencias en un plazo máximo de 24 horas.
              </p>

              <div className="oy-flow-case">
                <span className="oy-label">Número de caso único</span>
                <span className="oy-flow-case__number">{generatedCase}</span>
                <span className="oy-flow-case__meta">Guardado en almacenamiento local (oy-complaints)</span>
              </div>

              <button type="button" onClick={onClose} className="btn btn-primary oy-flow-cta">
                Entendido, volver a la aplicación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
