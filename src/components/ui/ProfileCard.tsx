import { memo, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowUpRight, BadgeCheck, MapPin, Star } from 'lucide-react';
import './ProfileCard.css';

export interface ProfileCardProps {
  /** Nombre del trabajador (Worker.name). */
  name: string;
  /** Oficio (Worker.tradeLabel). */
  title: string;
  /** Foto. Sin foto (o si falla) se muestra el monograma con `initials` sobre `avatarColor`. */
  avatarUrl?: string;
  /** Worker.initials */
  initials?: string;
  /** Worker.avatarColor: un token del manual, p. ej. var(--oy-azul-marino). */
  avatarColor?: string;
  /** Worker.available: píldora Esmeralda "Disponible" o de vidrio "Ocupado". */
  available?: boolean;
  /** Texto del estado; por defecto según `available`. */
  status?: string;
  /** Worker.verified: píldora de vidrio "Verificado" sobre la foto. */
  verified?: boolean;
  /** Calificación promedio (0-5). */
  rating?: number;
  /** Número de reseñas verificadas. */
  reviewCount?: number;
  /** Distancia ya formateada ("1,2 km"). */
  distance?: string;
  /** Barrio o zona de atención. */
  zone?: string;
  /** Tarifa ya formateada ("$45.000"). */
  rate?: string;
  /** Unidad de la tarifa ("hora", "visita"…). */
  rateUnit?: string;
  /** Contenido extra bajo el oficio. */
  meta?: ReactNode;
  contactText?: string;
  onContactClick?: () => void;
  /** Nivel del titular con el nombre. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/**
 * Tarjeta de trabajador en vidrio: foto con esquinas de 24px, insignias en
 * píldora, nombre ligero y una fila de datos (reputación, distancia, tarifa)
 * con jerarquía clara. Al pasar el puntero se eleva; nunca rota.
 */
const ProfileCardBase = ({
  name,
  title,
  avatarUrl,
  initials,
  avatarColor = 'var(--oy-azul-marino)',
  available = true,
  status,
  verified = false,
  rating,
  reviewCount,
  distance,
  zone,
  rate,
  rateUnit,
  meta,
  contactText = 'Ver perfil',
  onContactClick,
  headingLevel = 3,
  className = ''
}: ProfileCardProps) => {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const statusText = status ?? (available ? 'Disponible' : 'No disponible');
  const [photoFailed, setPhotoFailed] = useState(false);
  const monogram = (initials ?? name.split(/\s+/).map(w => w[0]).join('').slice(0, 2)).toUpperCase();
  const hasRating = typeof rating === 'number' && (reviewCount ?? 1) > 0;

  return (
    <article
      className={`oy-pcard${className ? ` ${className}` : ''}`}
      style={{ '--pc-avatar': avatarColor } as CSSProperties}
    >
      <div className="oy-pcard__media">
        {avatarUrl && !photoFailed ? (
          <img
            className="oy-pcard__photo"
            src={avatarUrl}
            alt=""
            loading="lazy"
            draggable={false}
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <span className="oy-pcard__monogram" aria-hidden="true">{monogram}</span>
        )}
        <span className="oy-pcard__badges">
          {verified && (
            <span className="oy-pcard__pill oy-pcard__pill--verified">
              <BadgeCheck size={14} aria-hidden="true" /> Verificado
            </span>
          )}
          <span className={`oy-pcard__pill oy-pcard__pill--status${available ? ' is-available' : ''}`}>
            <span className="oy-pcard__dot" aria-hidden="true" />
            {statusText}
          </span>
        </span>
      </div>

      <div className="oy-pcard__info">
        <p className="oy-pcard__title">{title}</p>
        <Heading className="oy-pcard__name">{name}</Heading>

        {(hasRating || distance || zone) && (
          <p className="oy-pcard__facts">
            {hasRating && (
              <span className="oy-pcard__fact">
                <Star size={14} fill="var(--color-star)" color="var(--color-star)" aria-hidden="true" />
                <strong>{rating!.toFixed(1)}</strong>
                {typeof reviewCount === 'number' && (
                  <span className="oy-pcard__muted">({reviewCount}<span className="oy-pcard__sr"> reseñas</span>)</span>
                )}
              </span>
            )}
            {(distance || zone) && (
              <span className="oy-pcard__fact oy-pcard__muted">
                <MapPin size={14} aria-hidden="true" />
                {distance && <span>{distance}</span>}
                {distance && zone && <span aria-hidden="true">·</span>}
                {zone && <span className="oy-pcard__zone">{zone}</span>}
              </span>
            )}
          </p>
        )}
        {meta && <div className="oy-pcard__meta">{meta}</div>}
      </div>

      <div className="oy-pcard__footer">
        {rate && (
          <p className="oy-pcard__rate">
            <span className="oy-pcard__rate-label">Desde</span>
            <span className="oy-pcard__rate-value">{rate}</span>
            {rateUnit && <span className="oy-pcard__rate-unit">/{rateUnit}</span>}
          </p>
        )}
        {contactText && (
          <button
            type="button"
            className="btn btn-secondary oy-pcard__contact"
            onClick={onContactClick}
            aria-label={`${contactText} de ${name}`}
          >
            {contactText}
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
};

export const ProfileCard = memo(ProfileCardBase);
export default ProfileCard;
