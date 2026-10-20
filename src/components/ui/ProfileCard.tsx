import { memo, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { BadgeCheck, MessageCircle } from 'lucide-react';
import './ProfileCard.css';

export type ProfileCardFrame = 'almendra' | 'superficie';

export interface ProfileCardProps {
  /** Nombre del trabajador (Worker.name). */
  name: string;
  /** Oficio (Worker.tradeLabel). */
  title: string;
  /** Foto. Sin foto se muestra el monograma con `initials` sobre `avatarColor`. */
  avatarUrl?: string;
  /** Worker.initials */
  initials?: string;
  /** Worker.avatarColor: un token del manual, p. ej. var(--oy-azul-marino). */
  avatarColor?: string;
  /** Worker.available: Disponible (Esmeralda) o No disponible (gris). */
  available?: boolean;
  /** Texto del estado; por defecto según `available`. */
  status?: string;
  /** Worker.verified: sticker "Verificado" sobre la foto. */
  verified?: boolean;
  /** Línea extra bajo el oficio (calificación, distancia, tarifa…). */
  meta?: ReactNode;
  contactText?: string;
  onContactClick?: () => void;
  /** Callback al hacer click en la tarjeta, foto o resumen del profesional */
  onClick?: () => void;
  /** Nivel del titular con el nombre. */
  headingLevel?: 2 | 3 | 4;
  frame?: ProfileCardFrame;
  /** 0-1: brillo holográfico en tonos del manual (sutil). */
  holo?: number;
  /** 0-1: reflejo que sigue al puntero. */
  glare?: number;
  enableTilt?: boolean;
  tiltStrength?: number;
  /** Desplazamiento de la foto al inclinar (px). */
  parallax?: number;
  className?: string;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Tarjeta de trabajador con inclinación 3D por resorte, marco Almendra (o
 * superficie) con contorno Cacao y un holo sutil Canario/Ámbar/Almendra.
 * Con movimiento reducido no se inclina; nunca hay sombras.
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
  meta,
  contactText,
  onContactClick,
  onClick,
  headingLevel = 3,
  frame = 'almendra',
  holo = 0.35,
  glare = 0.35,
  enableTilt = true,
  tiltStrength = 10,
  parallax = 6,
  className = ''
}: ProfileCardProps) => {
  const rootRef = useRef<HTMLElement>(null);
  const settingsRef = useRef({ enableTilt, tiltStrength, parallax });
  useLayoutEffect(() => {
    settingsRef.current = { enableTilt, tiltStrength, parallax };
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const x = { p: 0, v: 0, target: 0 };
    const y = { p: 0, v: 0, target: 0 };
    const light = { p: 0, target: 0 };
    let raf = 0;
    let last = 0;

    const write = () => {
      const { enableTilt: on, tiltStrength: strength, parallax: depth } = settingsRef.current;
      const angle = on && !reduced ? strength : 0;
      const shift = on && !reduced ? depth : 0;
      const s = root.style;
      s.setProperty('--pc-pointer-x', `${((x.p + 1) * 50).toFixed(2)}%`);
      s.setProperty('--pc-pointer-y', `${((y.p + 1) * 50).toFixed(2)}%`);
      s.setProperty('--pc-band', `${(50 + (x.p + y.p) * 20).toFixed(2)}%`);
      s.setProperty('--pc-rotate-x', `${(y.p * angle).toFixed(3)}deg`);
      s.setProperty('--pc-rotate-y', `${(-x.p * angle).toFixed(3)}deg`);
      s.setProperty('--pc-shift-x', `${(x.p * shift).toFixed(2)}px`);
      s.setProperty('--pc-shift-y', `${(y.p * shift).toFixed(2)}px`);
      s.setProperty('--pc-active', light.p.toFixed(4));
    };

    const frameStep = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const axis of [x, y]) {
          axis.v += (120 * (axis.target - axis.p) - 16 * axis.v) * h;
          axis.p += axis.v * h;
        }
      }
      light.p += (light.target - light.p) * (1 - Math.exp(-dt / (light.target > light.p ? 0.18 : 0.45)));
      write();
      const moving =
        Math.abs(x.target - x.p) > 0.0005 || Math.abs(y.target - y.p) > 0.0005 ||
        Math.abs(x.v) > 0.0005 || Math.abs(y.v) > 0.0005 ||
        Math.abs(light.target - light.p) > 0.002;
      if (moving) {
        raf = requestAnimationFrame(frameStep);
      } else {
        x.p = x.target;
        y.p = y.target;
        light.p = light.target;
        write();
        raf = 0;
      }
    };

    const aim = (nx: number, ny: number, on: boolean) => {
      x.target = clamp(nx, -1, 1);
      y.target = clamp(ny, -1, 1);
      light.target = on ? 1 : 0;
      if (reduced) {
        x.p = x.target;
        y.p = y.target;
        light.p = light.target;
        write();
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frameStep);
      }
    };

    const aimAt = (e: globalThis.PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      aim(((e.clientX - rect.left) / rect.width) * 2 - 1, ((e.clientY - rect.top) / rect.height) * 2 - 1, true);
    };
    const onMove = (e: globalThis.PointerEvent) => {
      if (e.pointerType === 'mouse') aimAt(e);
    };
    const onLeave = (e: globalThis.PointerEvent) => {
      if (e.pointerType === 'mouse') aim(0, 0, false);
    };

    root.addEventListener('pointerenter', onMove);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    write();

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('pointerenter', onMove);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const statusText = status ?? (available ? 'Disponible' : 'No disponible');
  const [photoFailed, setPhotoFailed] = useState(false);
  const monogram = (initials ?? name.split(/\s+/).map(w => w[0]).join('').slice(0, 2)).toUpperCase();

  return (
    <article
      ref={rootRef}
      className={`oy-pcard oy-pcard--${frame}${onClick ? ' oy-pcard--clickable' : ''}${className ? ` ${className}` : ''}`}
      onClick={onClick}
      onKeyDown={
        onClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `Ver perfil de ${name}, ${title}` : undefined}
      style={
        {
          '--pc-holo': clamp(holo, 0, 1),
          '--pc-glare': clamp(glare, 0, 1),
          '--pc-avatar': avatarColor
        } as CSSProperties
      }
    >
      <div className="oy-pcard__body">
        <div className="oy-pcard__tile">
          {avatarUrl && !photoFailed ? (
            <img
              className="oy-pcard__photo"
              src={avatarUrl}
              alt={`Foto de ${name}`}
              loading="lazy"
              draggable={false}
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <span className="oy-pcard__monogram" aria-hidden="true">{monogram}</span>
          )}
          <span className="oy-pcard__holo" aria-hidden="true" />
          <span className="oy-pcard__glare" aria-hidden="true" />
          {verified && (
            <span className="oy-pcard__verified">
              <BadgeCheck size={14} aria-hidden="true" /> Verificado
            </span>
          )}
        </div>

        <div className="oy-pcard__info">
          <Heading className="oy-pcard__name">{name}</Heading>
          <p className="oy-pcard__title">{title}</p>
          {meta && <div className="oy-pcard__meta">{meta}</div>}
        </div>

        <div className="oy-pcard__footer">
          <span className={`oy-pcard__status${available ? ' is-available' : ''}`}>{statusText}</span>
          {contactText && (
            <button
              type="button"
              className="btn btn-primary oy-pcard__contact"
              onClick={onContactClick}
              aria-label={`${contactText} a ${name}`}
            >
              <MessageCircle size={16} aria-hidden="true" />
              {contactText}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export const ProfileCard = memo(ProfileCardBase);
export default ProfileCard;
