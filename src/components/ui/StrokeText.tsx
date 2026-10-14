import { useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './StrokeText.css';

gsap.registerPlugin(ScrollTrigger);

export type StrokeTextTrigger = 'mount' | 'hover' | 'scroll' | 'loop';
export type StrokeTextFillMode = 'wipe' | 'fade' | 'none';
/** marino: relleno Azul Marino y trazo Cacao · cacao: relleno Cacao y trazo Azul Marino */
export type StrokeTextTone = 'marino' | 'cacao';

export interface StrokeTextProps {
  text: string;
  tone?: StrokeTextTone;
  /** Sobrescribe el trazo del tono (acepta var(--token)). */
  strokeColor?: string;
  /** Sobrescribe el relleno del tono (acepta var(--token)). */
  fillColor?: string;
  strokeWidth?: number;
  drawDuration?: number;
  fillDelay?: number;
  stagger?: number;
  ease?: string;
  trigger?: StrokeTextTrigger;
  fillMode?: StrokeTextFillMode;
  fontSize?: number;
  fontWeight?: number | string;
  letterSpacing?: number;
  reverse?: boolean;
  /**
   * El SVG no hace salto de línea: por debajo de 768 px se muestra el texto
   * normal (hereda los estilos del titular que lo contiene).
   */
  mobileFallback?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface Box { x: number; y: number; width: number; height: number }

/**
 * Titular que se dibuja trazo a trazo y luego se rellena (GSAP).
 * Pensado para ir DENTRO de un h1/h2: el texto real vive en un span que los
 * lectores de pantalla leen siempre; el SVG es decorativo (aria-hidden).
 */
export const StrokeText = ({
  text,
  tone = 'marino',
  strokeColor,
  fillColor,
  strokeWidth = 1.5,
  drawDuration = 1.4,
  fillDelay = 0.15,
  stagger = 0.04,
  ease = 'power2.out',
  trigger = 'mount',
  fillMode = 'wipe',
  fontSize = 64,
  fontWeight = 800,
  letterSpacing = -2,
  reverse = false,
  mobileFallback = true,
  className = '',
  style
}: StrokeTextProps) => {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const strokeTextRef = useRef<SVGTextElement | null>(null);
  const wipeRectRef = useRef<SVGRectElement | null>(null);
  const [box, setBox] = useState<Box | null>(null);

  const rawId = useId();
  const wipeId = `oy-stroke-wipe-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const characters = useMemo(() => Array.from(text), [text]);
  const dash = Math.max(fontSize * 7, 200);

  const fontStyle = useMemo<CSSProperties>(
    () => ({ fontSize: `${fontSize}px`, fontWeight, letterSpacing: `${letterSpacing}px` }),
    [fontSize, fontWeight, letterSpacing]
  );

  // Medida del texto: al montar, cuando cargan las fuentes y cuando el SVG
  // pasa de oculto (móvil) a visible.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    let cancelled = false;

    const measure = () => {
      const node = strokeTextRef.current;
      if (cancelled || !node) return;
      let bbox: DOMRect | undefined;
      try {
        bbox = node.getBBox();
      } catch {
        return;
      }
      if (!bbox || !bbox.width) return;
      const pad = Math.max(strokeWidth, fontSize * 0.1);
      const next = { x: bbox.x - pad, y: bbox.y - pad, width: bbox.width + pad * 2, height: bbox.height + pad * 2 };
      setBox(prev =>
        prev &&
        Math.abs(prev.x - next.x) < 0.5 &&
        Math.abs(prev.width - next.width) < 0.5 &&
        Math.abs(prev.y - next.y) < 0.5
          ? prev
          : next
      );
    };

    measure();
    document.fonts?.ready.then(measure).catch(() => undefined);
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [characters, fontSize, fontWeight, letterSpacing, strokeWidth]);

  // Layout effect: el estado inicial (trazo oculto) se fija antes de pintar.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !box) return undefined;

    const strokes = gsap.utils.toArray<SVGTSpanElement>(root.querySelectorAll('[data-stroke-char]'));
    const fills = gsap.utils.toArray<SVGTSpanElement>(root.querySelectorAll('[data-fill-char]'));
    const wipe = wipeRectRef.current;
    if (!strokes.length) return undefined;

    const fillEnabled = fillMode !== 'none';
    const useWipe = fillMode === 'wipe';
    const fillDuration = Math.max(0.4, drawDuration * 0.5);
    const staggerConfig: number | gsap.StaggerVars = reverse ? { each: stagger, from: 'end' } : stagger;
    const targets: Element[] = [...strokes, ...fills, ...(wipe ? [wipe] : [])];

    const setStart = () => {
      gsap.killTweensOf(targets);
      gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: dash });
      gsap.set(fills, { opacity: useWipe ? 1 : 0 });
      if (wipe) gsap.set(wipe, { attr: { width: 0 } });
    };

    const setEnd = () => {
      gsap.killTweensOf(targets);
      gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: 0 });
      gsap.set(fills, { opacity: fillEnabled ? 1 : 0 });
      if (wipe) gsap.set(wipe, { attr: { width: fillEnabled ? box.width : 0 } });
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEnd();
      return () => gsap.killTweensOf(targets);
    }

    const build = () => {
      setStart();
      const tl = gsap.timeline({
        paused: true,
        repeat: trigger === 'loop' ? -1 : 0,
        repeatDelay: trigger === 'loop' ? 0.9 : 0,
        defaults: { overwrite: 'auto' }
      });
      tl.to(strokes, { strokeDashoffset: 0, duration: drawDuration, ease, stagger: staggerConfig }, 0);
      if (useWipe && wipe) {
        tl.to(wipe, { attr: { width: box.width }, duration: fillDuration, ease: 'power2.inOut' }, drawDuration + fillDelay);
      } else if (fillEnabled) {
        tl.to(fills, { opacity: 1, duration: fillDuration, ease: 'power2.out', stagger: staggerConfig }, drawDuration + fillDelay);
      }
      return tl;
    };

    let timeline: gsap.core.Timeline | null = null;
    let scrollTrigger: ScrollTrigger | null = null;
    let removeHover: (() => void) | null = null;

    if (trigger === 'hover') {
      setEnd();
      const play = () => {
        timeline?.kill();
        timeline = build();
        timeline.play(0);
      };
      root.addEventListener('pointerenter', play);
      removeHover = () => root.removeEventListener('pointerenter', play);
    } else {
      timeline = build();
      if (trigger === 'scroll') {
        scrollTrigger = ScrollTrigger.create({
          trigger: root,
          start: 'top 85%',
          once: true,
          onEnter: () => timeline?.play(0)
        });
      } else {
        timeline.play(0);
      }
    }

    return () => {
      removeHover?.();
      scrollTrigger?.kill();
      timeline?.kill();
      gsap.killTweensOf(targets);
    };
  }, [box, dash, drawDuration, fillDelay, stagger, ease, trigger, fillMode, reverse]);

  const viewBox = box ? `${box.x} ${box.y} ${box.width} ${box.height}` : `0 ${-fontSize} 600 ${fontSize * 1.3}`;
  const rootStyle = {
    ...(strokeColor ? { '--st-stroke': strokeColor } : null),
    ...(fillColor ? { '--st-fill': fillColor } : null),
    ...style
  } as CSSProperties;

  return (
    <span
      ref={rootRef}
      className={[
        'oy-stroke-text',
        `oy-stroke-text--${tone}`,
        mobileFallback && 'oy-stroke-text--fallback',
        trigger === 'hover' && 'oy-stroke-text--hover',
        className
      ].filter(Boolean).join(' ')}
      style={rootStyle}
    >
      <span className="oy-stroke-text__label">{text}</span>
      <svg
        className="oy-stroke-text__svg"
        style={box ? { width: `${box.width}px` } : undefined}
        viewBox={viewBox}
        preserveAspectRatio="xMinYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        {fillMode === 'wipe' && box && (
          <defs>
            <clipPath id={wipeId} clipPathUnits="userSpaceOnUse">
              <rect ref={wipeRectRef} x={box.x} y={box.y} width="0" height={box.height} />
            </clipPath>
          </defs>
        )}
        <text
          ref={strokeTextRef}
          className="oy-stroke-text__stroke"
          x="0"
          y="0"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={fontStyle}
        >
          {characters.map((char, index) => (
            <tspan data-stroke-char key={`s-${index}`}>{char}</tspan>
          ))}
        </text>
        <text
          className="oy-stroke-text__fill"
          x="0"
          y="0"
          style={fontStyle}
          clipPath={fillMode === 'wipe' && box ? `url(#${wipeId})` : undefined}
        >
          {characters.map((char, index) => (
            <tspan data-fill-char key={`f-${index}`}>{char}</tspan>
          ))}
        </text>
      </svg>
    </span>
  );
};

export default StrokeText;
