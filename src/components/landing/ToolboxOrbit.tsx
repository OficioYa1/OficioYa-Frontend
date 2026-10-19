import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Wrench, Zap, PaintBucket, KeyRound, Tv2, BookOpen
} from 'lucide-react';
import type { TradeCategory } from '../../types';
import { playTactileClick, playChime } from '../../utils/audioChimes';
import './ToolboxOrbit.css';

export interface ToolboxOrbitProps {
  currentTrade?: TradeCategory;
  onSelectTrade: (trade: TradeCategory) => void;
  className?: string;
}

interface OrbitTool {
  key: TradeCategory;
  name: string;
  toolName: string;
  tagline: string;
  icon: React.ReactNode;
  color: string;
  bgGlow: string;
  accentBorder: string;
}

const TOOLS: OrbitTool[] = [
  {
    key: 'electricidad',
    name: 'Electricidad',
    toolName: 'Multímetro & Alicate Aislado',
    tagline: 'Instalaciones eléctricas, cableado seguro y certificación RETIE.',
    icon: <Zap size={24} strokeWidth={2.4} />,
    color: 'var(--oy-amarillo-canario, #FFC72C)',
    bgGlow: 'rgba(255, 199, 44, 0.4)',
    accentBorder: '#D97706',
  },
  {
    key: 'plomeria',
    name: 'Plomería',
    toolName: 'Llave Stilson 18" de Acero',
    tagline: 'Fugas urgentes, destapes con sonda y redes hidráulicas.',
    icon: <Wrench size={24} strokeWidth={2.4} />,
    color: 'var(--oy-azul-marino, #2563EB)',
    bgGlow: 'rgba(37, 99, 235, 0.4)',
    accentBorder: '#1D4ED8',
  },
  {
    key: 'pintura',
    name: 'Pintura',
    toolName: 'Brocha de Cerdas Finas & Rodillo',
    tagline: 'Pintura arquitectónica, estuco y acabados finos sin manchas.',
    icon: <PaintBucket size={24} strokeWidth={2.4} />,
    color: 'var(--oy-verde-esmeralda, #10B981)',
    bgGlow: 'rgba(16, 185, 129, 0.4)',
    accentBorder: '#059669',
  },
  {
    key: 'cerrajeria',
    name: 'Cerrajería',
    toolName: 'Ganzúa & Llave Maestra',
    tagline: 'Aperturas de emergencia 24/7 sin forzar ni dañar cerraduras.',
    icon: <KeyRound size={24} strokeWidth={2.4} />,
    color: '#F59E0B',
    bgGlow: 'rgba(245, 158, 11, 0.4)',
    accentBorder: '#B45309',
  },
  {
    key: 'electrodomesticos',
    name: 'Electrodomésticos',
    toolName: 'Tester Digital de Circuitos',
    tagline: 'Diagnóstico y reparación de lavadoras, neveras y microondas.',
    icon: <Tv2 size={24} strokeWidth={2.4} />,
    color: 'var(--oy-naranja-fuego, #EA580C)',
    bgGlow: 'rgba(234, 88, 12, 0.4)',
    accentBorder: '#C2410C',
  },
  {
    key: 'clases',
    name: 'Clases & Asistencia',
    toolName: 'Escuadra Técnica & Manual',
    tagline: 'Profesores particulares verificados para ciencias, artes y refuerzo.',
    icon: <BookOpen size={24} strokeWidth={2.4} />,
    color: '#8B5CF6',
    bgGlow: 'rgba(139, 92, 246, 0.4)',
    accentBorder: '#7C3AED',
  },
];

export const ToolboxOrbit: React.FC<ToolboxOrbitProps> = ({
  currentTrade = 'electricidad',
  onSelectTrade,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTool, setHoveredTool] = useState<OrbitTool | null>(null);
  const [activeTrade, setActiveTrade] = useState<TradeCategory>(currentTrade);
  const [justClicked, setJustClicked] = useState<TradeCategory | null>(null);

  // Physics angle
  const angleRef = useRef(0);
  const velocityRef = useRef(0.007); // Base smooth speed
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Orbit radius state
  const [radii, setRadii] = useState({ rx: 220, ry: 62 });
  const [toolPositions, setToolPositions] = useState<{ x: number; y: number; zIndex: number; scale: number; opacity: number }[]>([]);

  // Update responsive radius
  useEffect(() => {
    const updateSize = () => {
      const width = containerRef.current?.clientWidth || window.innerWidth;
      if (width < 480) {
        setRadii({ rx: 140, ry: 45 });
      } else if (width < 768) {
        setRadii({ rx: 185, ry: 58 });
      } else {
        setRadii({ rx: 235, ry: 72 });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update current trade from props
  useEffect(() => {
    setActiveTrade(currentTrade);
  }, [currentTrade]);

  // Main animation loop
  useEffect(() => {
    const numTools = TOOLS.length;

    const tick = () => {
      if (!isDraggingRef.current) {
        if (hoveredTool) {
          // Slow down smoothly when hovering over a tool
          velocityRef.current += (0.001 - velocityRef.current) * 0.1;
        } else {
          // Smooth return to base cruise speed
          velocityRef.current += (0.0068 - velocityRef.current) * 0.05;
        }
        angleRef.current += velocityRef.current;
      }

      // Calculate 3D projected coordinates for each tool
      const currentAngle = angleRef.current;
      const positions = TOOLS.map((_, i) => {
        const toolAngle = currentAngle + (i * (2 * Math.PI / numTools));
        const x = Math.cos(toolAngle) * radii.rx;
        const y = Math.sin(toolAngle) * radii.ry - 38;
        
        // Depth factor (0 = back, 1 = front)
        const depth = (Math.sin(toolAngle) + 1) / 2;
        const scale = 0.82 + depth * 0.38;
        const opacity = 0.72 + depth * 0.28;
        // z-index: Toolbox lid sits at 25. Front tools > 25, back tools < 25
        const zIndex = Math.round(depth * 50);

        return { x, y, zIndex, scale, opacity };
      });

      setToolPositions(positions);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [radii, hoveredTool]);

  // Pointer drag interactions
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const handleStagePointerDown = (e: React.PointerEvent) => {
    // If the click is on an orbit node, let the node handle it
    const target = e.target as HTMLElement;
    if (target.closest('.toolbox-orbit-node')) {
      return;
    }
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleStagePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastXRef.current;
    if (Math.abs(deltaX) > 2) {
      hasDraggedRef.current = true;
    }
    lastXRef.current = e.clientX;
    
    // Rotate with mouse drag
    angleRef.current += deltaX * 0.008;
    velocityRef.current = deltaX * 0.004;
  };

  const handleStagePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Node pointer handlers to guarantee 100% click delivery on desktop & mobile
  const handleNodePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleNodePointerUp = (e: React.PointerEvent, tool: OrbitTool) => {
    e.stopPropagation();
    const dist = Math.hypot(
      e.clientX - pointerStartRef.current.x,
      e.clientY - pointerStartRef.current.y
    );
    if (dist < 8) {
      handleToolClick(tool);
    }
  };

  // Tool click handler
  const handleToolClick = useCallback((tool: OrbitTool) => {
    playTactileClick();
    playChime();
    setActiveTrade(tool.key);
    setJustClicked(tool.key);
    onSelectTrade(tool.key);

    setTimeout(() => {
      setJustClicked(null);
    }, 1200);

    // Smooth scroll to the technical inspector section with offset for navbar
    const targetElement = document.getElementById('inspector-section') || document.querySelector('.thibaut-inspector-section');
    if (targetElement) {
      const topOffset = targetElement.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: Math.max(0, topOffset),
        behavior: 'smooth'
      });
    }
  }, [onSelectTrade]);

  // Current trade displayed on the central toolbox plaque
  const displayedTrade = hoveredTool 
    ? hoveredTool 
    : TOOLS.find(t => t.key === activeTrade) || TOOLS[0];

  return (
    <div className={`toolbox-orbit-container ${className}`} ref={containerRef}>
      
      {/* ── STAGE ORBITAL ── */}
      <div
        className="toolbox-orbit-stage"
        onPointerDown={handleStagePointerDown}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handleStagePointerUp}
        onPointerCancel={handleStagePointerUp}
        title="Arrastra horizontalmente para girar la órbita de herramientas"
        role="region"
        aria-label="Caja de herramientas de OficioYa con oficios orbitando"
      >
        {/* Glow ambient background disk */}
        <div className="toolbox-orbit-ambient" aria-hidden="true" />

        {/* Orbit track ring (perspective ellipse) */}
        <div
          className="toolbox-orbit-track"
          style={{
            width: `${radii.rx * 2}px`,
            height: `${radii.ry * 2}px`,
          }}
          aria-hidden="true"
        />

        {/* ── LA CAJA DE HERRAMIENTAS (CENTRAL) ── */}
        <div className="toolbox-chest" aria-hidden="true">
          {/* Sombra de apoyo */}
          <div className="toolbox-shadow" />

          {/* Rayo de luz dorada ascendente desde la caja abierta */}
          <div className="toolbox-light-beam" />

          {/* Cuerpo principal de la caja */}
          <div className="toolbox-body">
            {/* Tapa abatida abierta */}
            <div className="toolbox-lid-open">
              <div className="toolbox-lid-inner">
                <span className="toolbox-lid-groove" />
              </div>
            </div>

            {/* Bandeja interior con herramientas almacenadas */}
            <div className="toolbox-tray">
              <span className="toolbox-tray-tool toolbox-tray-tool--1" />
              <span className="toolbox-tray-tool toolbox-tray-tool--2" />
              <span className="toolbox-tray-tool toolbox-tray-tool--3" />
            </div>

            {/* Fachada frontal */}
            <div className="toolbox-front">
              {/* Esquinas reforzadas */}
              <span className="toolbox-corner toolbox-corner--tl" />
              <span className="toolbox-corner toolbox-corner--tr" />
              <span className="toolbox-corner toolbox-corner--bl" />
              <span className="toolbox-corner toolbox-corner--br" />

              {/* Broches metálicos dorados */}
              <div className="toolbox-latches">
                <span className="toolbox-latch" />
                <span className="toolbox-latch" />
              </div>

              {/* Placa metálica grabada con el oficio activo */}
              <div className="toolbox-brass-plate" key={displayedTrade.key}>
                <span className="toolbox-plate-star">✦</span>
                <span className="toolbox-plate-text">{displayedTrade.name.toUpperCase()}</span>
                <span className="toolbox-plate-star">✦</span>
              </div>
            </div>

            {/* Asa de cuero / acero superior */}
            <div className="toolbox-handle">
              <div className="toolbox-handle-grip" />
            </div>
          </div>
        </div>

        {/* ── LAS 6 HERRAMIENTAS ORBITANDO (CÍRCULOS PERFECTOS) ── */}
        {TOOLS.map((tool, idx) => {
          const pos = toolPositions[idx];
          if (!pos) return null;

          const isSelected = activeTrade === tool.key;
          const isClickedAnim = justClicked === tool.key;

          return (
            <div
              key={tool.key}
              className={`toolbox-orbit-node ${isSelected ? 'is-selected' : ''} ${isClickedAnim ? 'is-clicked' : ''}`}
              style={{
                transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${pos.scale})`,
                zIndex: pos.zIndex,
                opacity: pos.opacity,
              }}
              onMouseEnter={() => setHoveredTool(tool)}
              onMouseLeave={() => setHoveredTool(null)}
              onPointerDown={handleNodePointerDown}
              onPointerUp={(e) => handleNodePointerUp(e, tool)}
              onClick={(e) => {
                e.stopPropagation();
                handleToolClick(tool);
              }}
              title={`${tool.name} — Clic para ver ficha técnica`}
              aria-label={`Herramienta de ${tool.name}. Clic para explorar este oficio.`}
            >
              {/* Contenedor circular perfecto sin cortes */}
              <div
                className="toolbox-node-badge"
                style={{
                  backgroundColor: isSelected ? tool.color : '#ffffff',
                  color: isSelected ? '#0f172a' : '#1e293b',
                  boxShadow: isSelected
                    ? `0 0 20px ${tool.bgGlow}, 3px 4px 0 var(--stroke-ink, #1e293b)`
                    : `0 3px 8px rgba(0, 0, 0, 0.08), 3px 4px 0 var(--stroke-ink, #1e293b)`,
                }}
              >
                {tool.icon}
              </div>

              {/* Efecto de chispas en clic */}
              {isClickedAnim && (
                <div className="toolbox-click-sparks" aria-hidden="true">
                  <span>✦</span>
                  <span>⚡</span>
                  <span>✦</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
