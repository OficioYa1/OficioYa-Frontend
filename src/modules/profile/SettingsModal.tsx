import React, { useState, useId } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { FontScale, ComplaintTicket } from '../../types';
import {
  X,
  Phone,
  MapPin,
  LogOut,
  Save,
  CheckCircle2,
  User,
  Camera,
  RefreshCw,
  Trash2,
  AlertTriangle,
  FileText,
  Settings,
  Upload,
  Loader2,
} from 'lucide-react';
import { SquishSwitch } from '../../components/ui/SquishSwitch';
import { useFlowModal } from '../requests/useFlowModal';
import '../requests/Flows.css';
import './SettingsModal.css';
import { mediaService, MediaUploadError, validateImageFile } from '../../services/mock/mediaService';

interface SettingsModalProps {
  onClose: () => void;
}

const FONT_OPTIONS: { id: FontScale; label: string }[] = [
  { id: 'normal', label: 'Normal (16px)' },
  { id: 'large', label: 'Grande (18px)' },
  { id: 'xlarge', label: 'Muy grande (20px)' }
];

const statusClass = (status: ComplaintTicket['status']) => {
  if (status === 'Resuelto') return 'oy-flow-status--resuelto';
  if (status === 'En revisión') return 'oy-flow-status--revision';
  if (status === 'Abierto') return 'oy-flow-status--abierto';
  return '';
};

interface DeleteAccountDialogProps {
  deleteConfirmed: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/* Confirmación de borrado lógico (OFY-58): diálogo anidado con su propio foco */
const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ deleteConfirmed, onCancel, onConfirm }) => {
  const uid = useId();
  const dialogRef = useFlowModal(() => {
    if (!deleteConfirmed) onCancel();
  });

  return (
    <div className="oy-modal-backdrop oy-flow-layer--alert">
      <div
        ref={dialogRef}
        className="oy-modal oy-flow oy-flow--sm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        aria-describedby={`${uid}-desc`}
        tabIndex={-1}
      >
        <header className={`oy-modal__head oy-flow-head ${deleteConfirmed ? 'oy-flow-head--esmeralda' : 'oy-flow-head--fuego'}`}>
          <div className="oy-flow-head__main">
            <span className={`oy-flow-tile ${deleteConfirmed ? 'oy-flow-tile--esmeralda' : 'oy-flow-tile--fuego'}`} aria-hidden="true">
              {deleteConfirmed ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            </span>
            <h2 id={`${uid}-title`} className="oy-modal__title oy-display">
              {deleteConfirmed ? 'Cuenta dada de baja' : '¿Eliminar tu cuenta?'}
            </h2>
          </div>
        </header>
        <div className="oy-modal__body oy-flow-body">
          {!deleteConfirmed ? (
            <>
              <p id={`${uid}-desc`} className="oy-flow-text">
                Por privacidad y cumplimiento normativo, se aplicará un <strong>borrado lógico</strong>.
                Tu cuenta quedará inhabilitada de inmediato, pero el historial de transacciones y calificaciones que otros usuarios recibieron se conservará para no romper la reputación del sistema.
              </p>
              <div className="oy-flow-actions">
                <button type="button" onClick={onCancel} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="button" onClick={onConfirm} className="btn btn-danger">
                  Sí, dar de baja
                </button>
              </div>
            </>
          ) : (
            <p id={`${uid}-desc`} className="oy-flow-text" role="status">Cerrando sesión...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { user, role, switchRole, logout, updateUserProfile } = useAuth();
  const { theme, toggleTheme, fontScale, setFontScale } = useTheme();
  const uid = useId();

  // OFY-57: Editar información básica del perfil
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+57 300 123 4567');
  const [city, setCity] = useState(user?.city || 'Bogotá D.C.');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // OFY-59: carga de foto desde el dispositivo (adaptador Cloudinary simulado)
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoNotice, setPhotoNotice] = useState('');
  const isUploadedPhoto = avatarUrl.startsWith('data:');

  // OFY-58: Modal de confirmación de eliminación lógica de cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  // OFY-73: Estado de reportes enviados por el usuario
  const [userReports] = useState<ComplaintTicket[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('oy-complaints') || '[]');
    } catch {
      return [];
    }
  });

  const dialogRef = useFlowModal(onClose, !showDeleteModal);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, phone, city, avatarUrl });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    setPhotoError('');
    setPhotoNotice('');
    const problem = validateImageFile(file);
    if (problem) {
      setPhotoError(problem);
      return;
    }
    setUploading(true);
    try {
      const media = await mediaService.uploadImage(file, { folder: 'avatars', maxSide: 512 });
      setAvatarUrl(media.url);
      updateUserProfile({ avatarUrl: media.url });
      setPhotoNotice('Foto de perfil actualizada.');
    } catch (err) {
      setPhotoError(err instanceof MediaUploadError ? err.message : 'No pudimos subir la foto. Intenta de nuevo en un momento.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    updateUserProfile({ avatarUrl: undefined });
    setPhotoError('');
    setPhotoNotice('Quitamos tu foto. Se mostrarán tus iniciales.');
  };

  // OFY-58: Borrado lógico de cuenta propia
  const handleExecuteDeleteAccount = () => {
    updateUserProfile({ isDeleted: true });
    setDeleteConfirmed(true);
    setTimeout(() => {
      logout();
      onClose();
    }, 2000);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const titleId = `${uid}-title`;
  const isSeeker = role === 'seeker';

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
        <header className="oy-modal__head oy-flow-head oy-flow-head--almendra">
          <div className="oy-flow-head__main">
            <span className="oy-flow-tile oy-flow-tile--marino" aria-hidden="true">
              <Settings size={24} />
            </span>
            <div className="oy-flow-head__text">
              <span className="oy-eyebrow oy-flow-kicker">Tu cuenta</span>
              <h2 id={titleId} className="oy-modal__title oy-display">Configuración & Perfil</h2>
            </div>
          </div>
          <button type="button" className="oy-icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="oy-modal__body oy-flow-body">
          {/* Tarjeta de usuario con OFY-59 (Avatar) y OFY-55 (Alternar Rol) */}
          <div className="oy-panel oy-panel--marino oy-flow-profile">
            <div className="oy-flow-item__who">
              <div
                className="oy-flow-avatar oy-flow-avatar--round"
                style={{ background: user?.avatarColor || 'var(--role-primary)' }}
                aria-hidden={avatarUrl ? undefined : true}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={`Foto de perfil de ${user?.name ?? 'tu cuenta'}`} />
                ) : user?.name ? (
                  user.name.slice(0, 2).toUpperCase()
                ) : (
                  'OY'
                )}
              </div>
              <div className="oy-flow-min0">
                <span className="oy-flow-profile__name">{user?.name}</span>
                <span className="oy-flow-profile__mail">{user?.email}</span>
                <span className={`oy-flow-tag oy-flow-tag--spaced ${isSeeker ? '' : 'oy-flow-tag--fuego'}`}>
                  Rol activo: {isSeeker ? 'Contratante' : 'Profesional'}
                </span>
              </div>
            </div>

            {/* OFY-55: Alternar Rol sin desloguearse */}
            <button
              type="button"
              onClick={() => switchRole(isSeeker ? 'provider' : 'seeker')}
              className="btn btn-secondary oy-flow-small"
              title="Alternar entre modo contratante y modo profesional"
            >
              <RefreshCw size={14} aria-hidden="true" />
              <span>Cambiar a {isSeeker ? 'Profesional' : 'Contratante'}</span>
            </button>
          </div>

          {/* Formulario de Datos Básicos y Foto de Perfil (OFY-57, OFY-59) */}
          <form onSubmit={handleSaveContact} className="oy-flow-section" aria-labelledby={`${uid}-s1`}>
            <h3 id={`${uid}-s1`} className="oy-flow-section__title">
              <span className="oy-flow-num">1</span> Editar Información Básica
            </h3>

            <div className="oy-flow-field">
              <label className="oy-flow-label" htmlFor={`${uid}-name`}>Nombre completo</label>
              <div className="oy-flow-input-icon">
                <User size={16} aria-hidden="true" />
                <input
                  id={`${uid}-name`}
                  type="text"
                  className="input-base"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="oy-flow-grid2">
              <div className="oy-flow-field">
                <label className="oy-flow-label" htmlFor={`${uid}-phone`}>Teléfono / WhatsApp</label>
                <div className="oy-flow-input-icon">
                  <Phone size={16} aria-hidden="true" />
                  <input
                    id={`${uid}-phone`}
                    type="tel"
                    className="input-base"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              <div className="oy-flow-field">
                <label className="oy-flow-label" htmlFor={`${uid}-city`}>Ciudad / Localidad</label>
                <div className="oy-flow-input-icon">
                  <MapPin size={16} aria-hidden="true" />
                  <input
                    id={`${uid}-city`}
                    type="text"
                    className="input-base"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    autoComplete="address-level2"
                    required
                  />
                </div>
              </div>
            </div>

            {/* OFY-59: Cargar y actualizar foto de perfil */}
            <div className="oy-flow-field">
              <span className="oy-flow-label" id={`${uid}-photo`}>Foto de perfil</span>
              <div className="settings-photo" role="group" aria-labelledby={`${uid}-photo`}>
                <input
                  id={`${uid}-photo-file`}
                  type="file"
                  accept="image/*"
                  className="settings-photo__input"
                  onChange={handlePhotoFile}
                  disabled={uploading}
                  aria-describedby={`${uid}-photo-hint`}
                />
                <label
                  htmlFor={`${uid}-photo-file`}
                  className="btn btn-secondary oy-flow-small settings-photo__pick"
                  aria-disabled={uploading || undefined}
                >
                  {uploading ? (
                    <Loader2 size={16} className="settings-photo__spin" aria-hidden="true" />
                  ) : (
                    <Upload size={16} aria-hidden="true" />
                  )}
                  {uploading ? 'Subiendo foto…' : 'Subir desde mi dispositivo'}
                </label>
                {avatarUrl && !uploading && (
                  <button type="button" className="btn btn-secondary oy-flow-small" onClick={handleRemovePhoto}>
                    <Trash2 size={16} aria-hidden="true" /> Quitar foto
                  </button>
                )}
              </div>
              <p id={`${uid}-photo-hint`} className="oy-flow-section__hint">
                JPG, PNG, WebP o GIF de hasta 5 MB. La ajustamos a 512 px para que cargue rápido.
              </p>
              {photoError && (
                <p className="oy-flow-note oy-flow-note--fuego settings-photo__msg" role="alert">
                  <AlertTriangle size={16} aria-hidden="true" /> {photoError}
                </p>
              )}
              {photoNotice && !photoError && (
                <span className="oy-flow-saved" role="status">
                  <CheckCircle2 size={16} aria-hidden="true" /> {photoNotice}
                </span>
              )}
            </div>

            <div className="oy-flow-field">
              <label className="oy-flow-label" htmlFor={`${uid}-avatar`}>O pega la URL de una foto</label>
              <div className="oy-flow-input-icon">
                <Camera size={16} aria-hidden="true" />
                <input
                  id={`${uid}-avatar`}
                  type="text"
                  inputMode="url"
                  className="input-base"
                  placeholder={isUploadedPhoto ? 'Usando la foto que subiste' : 'https://images.unsplash.com/...'}
                  value={isUploadedPhoto ? '' : avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="oy-flow-end">
              {savedSuccess && (
                <span className="oy-flow-saved" role="status">
                  <CheckCircle2 size={16} aria-hidden="true" /> Guardado con éxito
                </span>
              )}
              <button type="submit" className="btn btn-primary oy-flow-small">
                <Save size={16} aria-hidden="true" /> Guardar Cambios
              </button>
            </div>
          </form>

          {/* OFY-73: Consultar el estado de un reporte enviado */}
          <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s2`}>
            <div className="oy-flow-section__head">
              <h3 id={`${uid}-s2`} className="oy-flow-section__title">
                <span className="oy-flow-num">2</span>
                <FileText size={16} aria-hidden="true" /> Estado de Mis Reportes Enviados
              </h3>
            </div>
            <p className="oy-flow-section__hint">
              Seguimiento y transparencia de quejas o reportes de reseñas enviadas a moderación.
            </p>

            {userReports.length === 0 ? (
              <div className="oy-flow-empty-line">No has enviado ningún ticket de reporte o queja.</div>
            ) : (
              <ul className="oy-flow-list oy-flow-list--scroll">
                {userReports.map(ticket => (
                  <li key={ticket.id} className="oy-flow-item oy-flow-item--compact">
                    <div className="oy-flow-item__row">
                      <div className="oy-flow-min0">
                        <p className="oy-flow-item__title">Caso {ticket.caseNumber}: {ticket.type}</p>
                        <p className="oy-flow-item__meta">Contra: {ticket.targetWorkerName}</p>
                      </div>
                      <span className={`oy-flow-status ${statusClass(ticket.status)}`}>{ticket.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Preferencias de Accesibilidad */}
          <section className="oy-flow-section oy-flow-section--ruled" aria-labelledby={`${uid}-s3`}>
            <h3 id={`${uid}-s3`} className="oy-flow-section__title">
              <span className="oy-flow-num">3</span> Apariencia & Accesibilidad
            </h3>

            <div className="oy-flow-row">
              <div>
                <span className="oy-flow-row__label">Modo oscuro</span>
                <span className="oy-flow-row__hint">
                  Modo actual: {theme === 'light' ? 'Claro' : 'Oscuro'}
                </span>
              </div>
              <SquishSwitch
                checked={theme === 'dark'}
                onChange={toggleTheme}
                ariaLabel="Modo oscuro"
              />
            </div>

            <div className="oy-flow-field">
              <span className="oy-flow-row__label" id={`${uid}-font`}>Tamaño de Fuente (Accesibilidad)</span>
              <div className="oy-flow-choices oy-flow-choices--grid" role="group" aria-labelledby={`${uid}-font`}>
                {FONT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className="oy-chip"
                    aria-pressed={fontScale === opt.id}
                    onClick={() => setFontScale(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Zona de Peligro: OFY-58 Eliminar cuenta propia & Cerrar Sesión */}
          <section className="oy-flow-danger" aria-label="Sesión y cuenta">
            <button type="button" onClick={handleLogout} className="btn btn-secondary oy-flow-cta">
              <LogOut size={16} aria-hidden="true" /> Cerrar Sesión
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="oy-flow-danger__delete"
              aria-haspopup="dialog"
            >
              <Trash2 size={16} aria-hidden="true" /> Eliminar mi cuenta (borrado lógico)
            </button>
          </section>
        </div>
      </div>

      {/* Modal Confirmación de Borrado Lógico (OFY-58) */}
      {showDeleteModal && (
        <DeleteAccountDialog
          deleteConfirmed={deleteConfirmed}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleExecuteDeleteAccount}
        />
      )}
    </div>
  );
};
