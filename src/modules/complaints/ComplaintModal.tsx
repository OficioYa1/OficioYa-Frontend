import React, { useId, useRef, useState } from 'react';
import type { ComplaintType, ComplaintTicket, ComplaintAttachment } from '../../types';
import {
  X,
  AlertTriangle,
  Paperclip,
  CheckCircle2,
  FileCheck,
  Film,
  Image as ImageIcon,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { useFlowModal } from '../requests/useFlowModal';
import './Complaint.css';

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
  const [showErrors, setShowErrors] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);

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

  const tooShort = description.trim().length < MIN_CHARS;
  const filesFull = evidenceFiles.length >= MAX_FILES;
  const descError = showErrors && tooShort;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tooShort) {
      setShowErrors(true);
      descRef.current?.focus();
      return;
    }

    const caseNumber = `OY-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: ComplaintTicket = {
      id: `cmp-${Date.now()}`,
      caseNumber,
      targetWorkerId,
      targetWorkerName,
      serviceId,
      type,
      description: description.trim(),
      evidenceFiles,
      createdAt: new Date().toISOString(),
      status: 'En revisión'
    };

    try {
      const existing: ComplaintTicket[] = JSON.parse(localStorage.getItem('oy-complaints') || '[]');
      localStorage.setItem('oy-complaints', JSON.stringify([newTicket, ...existing]));
    } catch {
      /* sin almacenamiento local: el ticket sigue su curso por onSubmitComplaint */
    }

    setGeneratedCase(caseNumber);
    setIsSuccess(true);
    onSubmitComplaint(newTicket);
  };

  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const countId = `${uid}-count`;
  const errorId = `${uid}-error`;

  return (
    <div className="oy-modal-backdrop cmp-layer" onClick={onClose}>
      <div
        ref={dialogRef}
        className="oy-modal cmp"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <header className="oy-modal__head cmp-head">
          <div className="cmp-head__main">
            <span className="cmp-tile" data-done={isSuccess ? '' : undefined} aria-hidden="true">
              {isSuccess ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            </span>
            <div className="cmp-head__text">
              <span className="cmp-kicker">Reporte formal</span>
              <h2 id={titleId} className="oy-modal__title cmp-title">
                {isSuccess ? 'Ticket radicado' : `Reportar a ${targetWorkerName}`}
              </h2>
              {!isSuccess && (
                <p className="cmp-sub">Genera un ticket formal ante el equipo de moderación de OficioYa.</p>
              )}
            </div>
          </div>
          <button type="button" className="oy-icon-btn" onClick={onClose} aria-label="Cerrar reporte">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="oy-modal__body cmp-body">
          {!isSuccess ? (
            <>
              <div className="cmp-note">
                <ShieldAlert size={18} aria-hidden="true" />
                <span>
                  <strong>Aviso importante:</strong> una denuncia falsa afecta la reputación del trabajador y puede
                  llevar a la suspensión definitiva de tu cuenta.
                </span>
              </div>

              <form onSubmit={handleSubmit} className="cmp-form" noValidate>
                <fieldset className="cmp-field">
                  <legend className="cmp-label">
                    <span className="cmp-num" aria-hidden="true">1</span> Tipo de anomalía o motivo
                  </legend>
                  <div className="cmp-choices">
                    {COMPLAINT_TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        className="oy-chip cmp-chip"
                        aria-pressed={type === t}
                        onClick={() => setType(t)}
                      >
                        {type === t && <CheckCircle2 size={14} aria-hidden="true" />} {t}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="cmp-field">
                  <div className="cmp-field__head">
                    <label htmlFor={descId} className="cmp-label">
                      <span className="cmp-num" aria-hidden="true">2</span> Descripción de lo sucedido
                    </label>
                    <span
                      id={countId}
                      className="cmp-counter"
                      data-ok={!tooShort ? '' : undefined}
                    >
                      {description.trim().length}/{MIN_CHARS} caracteres mínimo
                    </span>
                  </div>
                  <textarea
                    ref={descRef}
                    id={descId}
                    className="input-base cmp-textarea"
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    onBlur={() => description.length > 0 && setShowErrors(true)}
                    placeholder="Cuenta qué pasó, cuándo y dónde."
                    aria-invalid={descError}
                    aria-describedby={descError ? `${errorId} ${countId}` : countId}
                    required
                    minLength={MIN_CHARS}
                  />
                  {descError && (
                    <p id={errorId} className="cmp-error" role="alert">
                      <AlertCircle size={14} aria-hidden="true" />
                      Escribe al menos {MIN_CHARS} caracteres para que moderación entienda el caso
                      (faltan {MIN_CHARS - description.trim().length}).
                    </p>
                  )}
                </div>

                <fieldset className="cmp-field">
                  <legend className="cmp-label">
                    <span className="cmp-num" aria-hidden="true">3</span>
                    Evidencia ({evidenceFiles.length}/{MAX_FILES}, opcional)
                  </legend>
                  <div className="cmp-choices">
                    <button type="button" disabled={filesFull} onClick={() => handleSimulateAddAttachment('image')} className="oy-chip cmp-chip">
                      <ImageIcon size={14} aria-hidden="true" /> Foto
                    </button>
                    <button type="button" disabled={filesFull} onClick={() => handleSimulateAddAttachment('video')} className="oy-chip cmp-chip">
                      <Film size={14} aria-hidden="true" /> Video
                    </button>
                    <button type="button" disabled={filesFull} onClick={() => handleSimulateAddAttachment('pdf')} className="oy-chip cmp-chip">
                      <FileCheck size={14} aria-hidden="true" /> PDF o recibo
                    </button>
                  </div>
                  {filesFull && <p className="cmp-hint">Llegaste al máximo de {MAX_FILES} archivos.</p>}

                  {evidenceFiles.length > 0 && (
                    <ul className="cmp-files" aria-label="Evidencias adjuntas">
                      {evidenceFiles.map((file, idx) => (
                        <li key={idx} className="cmp-file">
                          {file.type.includes('image') && <ImageIcon size={16} aria-hidden="true" />}
                          {file.type.includes('video') && <Film size={16} aria-hidden="true" />}
                          {file.type.includes('pdf') && <FileCheck size={16} aria-hidden="true" />}
                          <span className="cmp-file__name">{file.name}</span>
                          <span className="cmp-file__size">{file.size}</span>
                          <button
                            type="button"
                            className="oy-icon-btn cmp-file__remove"
                            onClick={() => removeAttachment(idx)}
                            aria-label={`Quitar ${file.name}`}
                          >
                            <X size={16} aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </fieldset>

                <div className="cmp-actions">
                  <button type="button" onClick={onClose} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn cmp-submit">
                    <Paperclip size={16} aria-hidden="true" /> Radicar queja formal
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="cmp-success" role="status">
              <MascotAvatar size="md" expression="alegre" />
              <h3 className="cmp-success__title">Recibimos tu reporte</h3>
              <p className="cmp-success__text">
                El equipo de moderación revisará las evidencias en un plazo máximo de 24 horas.
              </p>

              <div className="cmp-case">
                <span className="cmp-kicker">Número de caso</span>
                <span className="cmp-case__number">{generatedCase}</span>
              </div>

              <button type="button" onClick={onClose} className="btn btn-primary">
                Entendido, volver
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
