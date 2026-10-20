import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Volume2, VolumeX } from 'lucide-react';
import './LightBreakIntro.css';

interface LightBreakIntroProps {
  onComplete: () => void;
}

type Stage = 'blackout' | 'switching' | 'glowing' | 'flicker' | 'shatter' | 'finished';

// Partículas de vidrio y chispas cuando se rompe el bombillo
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
}

// Generador de audio web sintético sutil (sin archivos externos)
function playSound(type: 'click' | 'hum' | 'pop') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'click') {
      // Click mecánico de interruptor
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } else if (type === 'pop') {
      // Chispazo y quiebre de cristal sutil
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    }
  } catch {
    // Si el navegador bloquea audio, continúa silenciosamente
  }
}

export const LightBreakIntro: React.FC<LightBreakIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<Stage>('blackout');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSkip = () => {
    document.body.style.overflow = '';
    try {
      sessionStorage.setItem('oy_intro_seen', 'true');
    } catch {
      // ignore
    }
    setStage('finished');
    onComplete();
  };

  // Bloquear scroll de la página y escuchar tecla ESC para saltar
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prev === 'hidden' ? '' : prev;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Generar partículas para el estallido
  const createParticles = () => {
    const list: Particle[] = [];
    const colors = ['#FFC72C', '#F57C00', '#FFFFFF', '#F8FAFC', '#E2E8F0', '#FFA000'];
    for (let i = 0; i < 28; i++) {
      const angle = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5) * 0.4;
      const speed = 150 + Math.random() * 280;
      list.push({
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
      });
    }
    setParticles(list);
  };

  // Manejador del click en el switch rojo
  const handleSwitchOn = () => {
    if (stage !== 'blackout') return;

    if (audioEnabled) playSound('click');
    setStage('switching');

    // 1. Encender el filamento del bombillo
    setTimeout(() => {
      setStage('glowing');
    }, 280);

    // 2. Parpadeo sutil de inestabilidad eléctrica
    setTimeout(() => {
      setStage('flicker');
    }, 1100);

    // 3. Quiebre y estallido del bombillo (chispas, partículas, sonido de cristal)
    setTimeout(() => {
      if (audioEnabled) playSound('pop');
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([30, 40, 50]);
        }
      } catch {
        // Safe fallback
      }
      createParticles();
      setStage('shatter');
    }, 1600);

    // 4. Salida cinematográfica directa hacia la Landing Page
    setTimeout(() => {
      document.body.style.overflow = '';
      try {
        sessionStorage.setItem('oy_intro_seen', 'true');
      } catch {
        // ignore
      }
      setStage('finished');
      onComplete();
    }, 2600);
  };

  if (stage === 'finished') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        key="light-intro-overlay"
        className={`light-intro ${stage}`}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] } }}
      >
        {/* Luz ambiental radial */}
        <div className={`light-intro__glow-ambient stage-${stage}`} />

        {/* Barra superior de controles */}
        <header className="light-intro__topbar">
          <button
            type="button"
            className="light-intro__audio-toggle"
            onClick={() => setAudioEnabled(!audioEnabled)}
            title={audioEnabled ? 'Sonido activado' : 'Sonido silenciado'}
            aria-label="Alternar efectos de sonido"
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{audioEnabled ? 'Audio ON' : 'Audio OFF'}</span>
          </button>

          <button
            type="button"
            className="light-intro__skip-btn"
            onClick={handleSkip}
            aria-label="Saltar introducción e ir a la página principal"
          >
            <span>Saltar intro</span>
            <span className="light-intro__skip-key">ESC</span>
          </button>
        </header>

        {/* Escena central: Bombillo colgante e Interruptor rojo */}
        <div className="light-intro__center">
          {/* Cable y Bombillo */}
          <div className={`light-bulb-wrap ${stage}`}>
            <div className="light-bulb__cord" />
            <div className="light-bulb__socket" />

            <div className="light-bulb__glass-wrap">
              <svg
                className="light-bulb__svg"
                viewBox="0 0 120 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <radialGradient id="bulbGlowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF8E1" stopOpacity="0.95" />
                    <stop offset="40%" stopColor="#FFC72C" stopOpacity="0.8" />
                    <stop offset="75%" stopColor="#F57C00" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
                  </radialGradient>
                  <filter id="bulbBloom" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Resplandor interno cuando enciende */}
                <circle
                  className="light-bulb__aura"
                  cx="60"
                  cy="85"
                  r="48"
                  fill="url(#bulbGlowGrad)"
                  filter="url(#bulbBloom)"
                />

                {/* Cuerpo de cristal del bombillo */}
                <path
                  className="light-bulb__glass"
                  d="M38 32 C38 18, 82 18, 82 32 C82 46, 102 58, 102 85 C102 110, 84 130, 60 130 C36 130, 18 110, 18 85 C18 58, 38 46, 38 32 Z"
                  stroke="rgba(255, 255, 255, 0.65)"
                  strokeWidth="2.5"
                />

                {/* Filamento incandescente */}
                <g className="light-bulb__filament">
                  <line x1="50" y1="36" x2="50" y2="72" stroke="#B45309" strokeWidth="1.8" />
                  <line x1="70" y1="36" x2="70" y2="72" stroke="#B45309" strokeWidth="1.8" />
                  <path
                    d="M50 72 Q55 60 60 72 T70 72"
                    stroke="#FFC72C"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </g>

                {/* Grietas de rotura al estallar */}
                {stage === 'shatter' && (
                  <g className="light-bulb__cracks">
                    <path d="M60 50 L52 75 L38 90" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M60 50 L68 78 L85 86" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M52 75 L62 105" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
                    <path d="M68 78 L60 120" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
                  </g>
                )}
              </svg>

              {/* Partículas de cristal y chispas al estallar */}
              {stage === 'shatter' && (
                <div className="light-bulb__shards-stage">
                  {particles.map(p => (
                    <motion.div
                      key={p.id}
                      className="light-shard"
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                      animate={{
                        x: p.vx,
                        y: p.vy,
                        opacity: 0,
                        scale: 0.3,
                        rotate: p.rotation + 180,
                      }}
                      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        width: p.size,
                        height: p.size * 1.5,
                        backgroundColor: p.color,
                        boxShadow: `0 0 10px ${p.color}`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Placa e Interruptor de pared con botón rojo limpio */}
          <div className="light-switch-container">
            <p className="light-switch__hint">
              {stage === 'blackout'
                ? 'Se fue la luz en la casa... ¿cómo solucionarlo?'
                : stage === 'switching'
                ? 'Activando circuito...'
                : stage === 'glowing'
                ? '¡Encendiendo energía!'
                : stage === 'flicker'
                ? 'Tensión inestable...'
                : '¡CRACK! ¡Se dañó el bombillo!'}
            </p>

            <div className="light-switch-plate">
              <div className="switch-screw switch-screw--top" />
              <div className="switch-screw switch-screw--bottom" />

              <div className="switch-housing">
                <motion.button
                  type="button"
                  className={`switch-rocker ${stage !== 'blackout' ? 'is-on' : 'is-off'}`}
                  onClick={handleSwitchOn}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={stage !== 'blackout'}
                  aria-label="Encender interruptor de energía"
                >
                  <Zap size={44} className="switch-rocker__icon" strokeWidth={2.4} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Flash de transición al estallar */}
        {stage === 'shatter' && (
          <motion.div
            className="light-intro__flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
