/**
 * ManyCharacter — Mascota SVG animada de OficioYa
 *
 * SVG puro en React: cada parte del cuerpo es un elemento independiente.
 * El brazo derecho se anima de forma aislada con CSS transform-origin
 * apuntando al hombro → el resto del cuerpo permanece estático.
 *
 * ¿Por qué SVG en vez de PNG?
 * → Con PNG se anima la imagen completa.
 * → Con SVG agrupamos el brazo en su propio <g> y rotamos solo ese grupo.
 */
import React, { useState, useEffect } from 'react';
import './ManyCharacter.css';

interface ManyCharacterProps {
  size?: number;
  animate?: 'float' | 'bounce' | 'idle' | 'none';
  /** Fuerza animación de saludo one-shot */
  waving?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ManyCharacter: React.FC<ManyCharacterProps> = ({
  size = 220,
  animate = 'float',
  waving = false,
  onClick,
  className = '',
}) => {
  const [internalWave, setInternalWave] = useState(false);

  // Auto-saludo al montar
  useEffect(() => {
    const t = setTimeout(() => {
      setInternalWave(true);
      setTimeout(() => setInternalWave(false), 700);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  // Prop externa de saludo
  useEffect(() => {
    if (waving) {
      setInternalWave(true);
      const t = setTimeout(() => setInternalWave(false), 700);
      return () => clearTimeout(t);
    }
  }, [waving]);

  const handleClick = () => {
    setInternalWave(true);
    setTimeout(() => setInternalWave(false), 700);
    onClick?.();
  };

  // Clase de animación del cuerpo
  const bodyClass = internalWave
    ? 'many-svg-wave'
    : animate !== 'none' ? `many-svg-${animate}` : '';

  const w = size * (200 / 270);
  const h = size;

  return (
    <div
      className={`many-svg-root ${bodyClass} ${className}`}
      style={{ width: w, height: h }}
      onClick={handleClick}
      role="img"
      aria-label="Many el Castor de OficioYa"
      title="Many — Asistente de OficioYa. Clic para saludar."
    >
      <svg
        viewBox="0 0 200 270"
        width={w}
        height={h}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Gradiente fur principal */}
          <radialGradient id="mc-fur" cx="38%" cy="28%" r="72%">
            <stop offset="0%"   stopColor="#D88A48" />
            <stop offset="100%" stopColor="#9E5228" />
          </radialGradient>
          {/* Gradiente panza / cara clara */}
          <radialGradient id="mc-belly" cx="50%" cy="28%" r="65%">
            <stop offset="0%"   stopColor="#F2C278" />
            <stop offset="100%" stopColor="#D49040" />
          </radialGradient>
          {/* Gradiente oreja interior */}
          <radialGradient id="mc-ear-in" cx="40%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#E09050" />
            <stop offset="100%" stopColor="#B86830" />
          </radialGradient>
          {/* Gradiente cola */}
          <radialGradient id="mc-tail" cx="30%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#7A4218" />
            <stop offset="100%" stopColor="#4A2008" />
          </radialGradient>
        </defs>

        {/* ──────────────────────────────────────────────
            COLA — detrás del cuerpo
            ────────────────────────────────────────────── */}
        <g transform="rotate(-18, 148, 242)">
          <ellipse cx="148" cy="242" rx="42" ry="22" fill="url(#mc-tail)" />
          {/* Textura rombo */}
          {[[-10,0],[4,0],[18,0],[-3,-10],[11,-10],[5,10],[19,10]].map(([dx,dy],i) => (
            <rect key={i}
              x={140+dx} y={236+dy} width="7" height="7"
              rx="1" fill="none" stroke="#3A1408" strokeWidth="0.8" opacity="0.55"
              transform={`rotate(45, ${143.5+dx}, ${239.5+dy})`}
            />
          ))}
        </g>

        {/* ──────────────────────────────────────────────
            BRAZO IZQUIERDO — estático
            ────────────────────────────────────────────── */}
        <g transform="translate(38, 170) rotate(22)">
          <rect x="-13" y="-4" width="26" height="48" rx="13" fill="url(#mc-fur)" />
          {/* Mano */}
          <circle cx="0" cy="48" r="16" fill="#9A5628" />
          <ellipse cx="-10" cy="42" rx="6" ry="9" fill="#8E4E22" transform="rotate(-20,-10,42)"/>
          <ellipse cx="10" cy="42" rx="6" ry="9" fill="#8E4E22" transform="rotate(20,10,42)" />
        </g>

        {/* ──────────────────────────────────────────────
            CUERPO
            ────────────────────────────────────────────── */}
        <ellipse cx="100" cy="185" rx="64" ry="62" fill="url(#mc-fur)" />
        {/* Panza */}
        <ellipse cx="100" cy="190" rx="38" ry="46" fill="url(#mc-belly)" />

        {/* ──────────────────────────────────────────────
            CINTURÓN DE HERRAMIENTAS
            ────────────────────────────────────────────── */}
        {/* Correa */}
        <rect x="44" y="155" width="112" height="20" rx="8" fill="#7B500E" />
        <rect x="44" y="155" width="112" height="7"  rx="8" fill="#9B6A1A" opacity="0.55" />
        {/* Hebilla */}
        <rect x="82" y="151" width="36" height="28" rx="6" fill="#B0B8C0" />
        <rect x="87" y="156" width="26" height="18" rx="5" fill="#8A9198" />
        <rect x="93" y="160" width="14" height="10" rx="3" fill="#5C6470" />
        {/* Bolsa izquierda */}
        <rect x="48" y="161" width="22" height="16" rx="4" fill="#6A400E" />
        <rect x="48" y="161" width="22" height="5"  rx="4" fill="#8A580E" opacity="0.5"/>
        {/* Herramientas izq */}
        <rect x="53" y="153" width="4" height="10" rx="2" fill="#EF4444" />
        <rect x="59" y="153" width="3" height="10" rx="1.5" fill="#C0C0C0" />
        {/* Bolsa derecha */}
        <rect x="130" y="161" width="22" height="16" rx="4" fill="#6A400E" />
        <rect x="130" y="161" width="22" height="5"  rx="4" fill="#8A580E" opacity="0.5"/>
        {/* Herramientas der */}
        <rect x="135" y="153" width="3" height="10" rx="1.5" fill="#FBBF24" />
        <rect x="140" y="153" width="3" height="10" rx="1.5" fill="#B0B8C0" />
        <rect x="145" y="153" width="3" height="10" rx="1.5" fill="#EF4444" />

        {/* ──────────────────────────────────────────────
            CABEZA
            ────────────────────────────────────────────── */}
        <circle cx="100" cy="88" r="54" fill="url(#mc-fur)" />
        {/* Área clara cara */}
        <ellipse cx="100" cy="100" rx="34" ry="28" fill="url(#mc-belly)" />

        {/* ──────────────────────────────────────────────
            OREJAS
            ────────────────────────────────────────────── */}
        <g className="many-ear-left">
          <circle cx="54"  cy="44" r="22" fill="#7A3E12" />
          <circle cx="54"  cy="44" r="14" fill="url(#mc-ear-in)" />
          <circle cx="54"  cy="44" r="7"  fill="#A05830" />
        </g>
        <g className="many-ear-right">
          <circle cx="146" cy="44" r="22" fill="#7A3E12" />
          <circle cx="146" cy="44" r="14" fill="url(#mc-ear-in)" />
          <circle cx="146" cy="44" r="7"  fill="#A05830" />
        </g>

        {/* ──────────────────────────────────────────────
            PELO EN PUNTA (tufo característico de Many)
            ────────────────────────────────────────────── */}
        {[
          { d: "M 92 35 Q 96 18 100 14 Q 104 18 108 35", f: "#7A3E12" },
          { d: "M 84 38 Q 88 22 92 18 Q 95 26 90 38",    f: "#8A4818" },
          { d: "M 108 38 Q 113 22 108 18 Q 112 26 116 38", f: "#8A4818" },
          { d: "M 97 36 Q 100 20 103 17 Q 106 24 102 36", f: "#904E1A" },
        ].map((t, i) => (
          <path key={i} d={t.d} fill={t.f} stroke="#6A3010" strokeWidth="0.4" />
        ))}

        {/* ──────────────────────────────────────────────
            CARA — OJOS
            ────────────────────────────────────────────── */}
        {/* Blancos de ojo */}
        <ellipse cx="82"  cy="80" rx="13" ry="14" fill="white" />
        <ellipse cx="118" cy="80" rx="13" ry="14" fill="white" />
        {/* Iris izquierdo */}
        <g className="many-eye-left"
           style={{ transformBox: 'fill-box', transformOrigin: 'center center' }}>
          <circle cx="84"  cy="83" r="9"   fill="#3A1600" />
          <circle cx="85"  cy="84" r="5"   fill="#0A0400" />
          <circle cx="87"  cy="80" r="3"   fill="white" />
          <circle cx="89"  cy="83" r="1.2" fill="white" />
        </g>
        {/* Iris derecho */}
        <g className="many-eye-right"
           style={{ transformBox: 'fill-box', transformOrigin: 'center center' }}>
          <circle cx="120" cy="83" r="9"   fill="#3A1600" />
          <circle cx="121" cy="84" r="5"   fill="#0A0400" />
          <circle cx="123" cy="80" r="3"   fill="white" />
          <circle cx="125" cy="83" r="1.2" fill="white" />
        </g>

        {/* Cejas expresivas */}
        <path d="M 72 65 Q 83 59 93 65"  stroke="#5A2800" strokeWidth="3.2" fill="none" strokeLinecap="round"/>
        <path d="M 107 65 Q 117 59 128 65" stroke="#5A2800" strokeWidth="3.2" fill="none" strokeLinecap="round"/>

        {/* Nariz */}
        <ellipse cx="100" cy="100" rx="10" ry="8"  fill="#52240A" />
        <ellipse cx="100" cy="98"  rx="5"  ry="3.5" fill="#724018" opacity="0.6" />

        {/* Sonrisa */}
        <path d="M 84 112 Q 100 128 116 112"
          stroke="#52240A" strokeWidth="2.8" fill="none" strokeLinecap="round"/>

        {/* Dientes (2 paletos de castor) */}
        <rect x="91"  y="111" width="9"  height="12" rx="3" fill="white" />
        <rect x="101" y="111" width="9"  height="12" rx="3" fill="white" />
        <line x1="100" y1="111" x2="100" y2="123" stroke="#E0E0E0" strokeWidth="1"/>

        {/* Sonrojado */}
        <ellipse cx="70"  cy="96" rx="11" ry="7.5" fill="#E07858" opacity="0.28"/>
        <ellipse cx="130" cy="96" rx="11" ry="7.5" fill="#E07858" opacity="0.28"/>

        {/* ──────────────────────────────────────────────
            BRAZO DERECHO — ANIMADO (wave independiente)
            La key es que este <g> tiene transform-origin
            en el hombro (esquina sup-izq del bounding box).
            CSS anima solo este grupo → el resto no se mueve.
            ────────────────────────────────────────────── */}
        <g className="many-arm-right">
          {/* Hombro / parte superior del brazo */}
          <ellipse cx="162" cy="145" rx="15" ry="32"
            fill="url(#mc-fur)" transform="rotate(-38, 162, 145)" />
          {/* Antebrazo */}
          <ellipse cx="178" cy="117" rx="12" ry="26"
            fill="#C07838" transform="rotate(-22, 178, 117)" />
          {/* Mano / pata */}
          <circle cx="187" cy="96" r="17" fill="#9A5428" />
          {/* Dedos sugeridos */}
          <ellipse cx="178" cy="86" rx="6" ry="10" fill="#8E4E22"
            transform="rotate(-25, 178, 86)" />
          <ellipse cx="187" cy="80" rx="6" ry="10" fill="#8E4E22"
            transform="rotate(-5, 187, 80)" />
          <ellipse cx="197" cy="86" rx="6" ry="10" fill="#8E4E22"
            transform="rotate(20, 197, 86)" />
        </g>

        {/* ──────────────────────────────────────────────
            PIES
            ────────────────────────────────────────────── */}
        <ellipse cx="76"  cy="241" rx="22" ry="14" fill="#7A3E12" />
        <ellipse cx="76"  cy="241" rx="16" ry="9"  fill="#8E4E1E" />
        <ellipse cx="124" cy="241" rx="22" ry="14" fill="#7A3E12" />
        <ellipse cx="124" cy="241" rx="16" ry="9"  fill="#8E4E1E" />

      </svg>
    </div>
  );
};
