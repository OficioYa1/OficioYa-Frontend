import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';

/*
  PlasmaWarp · plasma de bloques con líneas de barrido, inspirado en
  CRTWarp pero hecho con ogl (ya está en el bundle por MicroSlats) en
  vez de three.js. Pensado para paneles de marca, no para todo el fondo:
  la intensidad está limitada para que el texto encima siga en AA.
*/

export interface PlasmaWarpProps {
  color?: string;
  backgroundColor?: string;
  /** Cuánto se mezcla la onda con el fondo (0–1). */
  intensity?: number;
  speed?: number;
  curvature?: number;
  scanlineStrength?: number;
  scanlineFrequency?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  bloom?: number;
  bloomRadius?: number;
  mouseStrength?: number;
  fps?: number;
  className?: string;
  style?: CSSProperties;
}

const vertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uBackground;
uniform float uIntensity;
uniform float uCurvature;
uniform float uScanlineStrength;
uniform float uScanlineFrequency;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uBloom;
uniform float uBloomRadius;
uniform vec2 uPointer;
uniform float uMouseStrength;

vec2 crtCurve(vec2 uv, float radius) {
  vec2 p = (uv - 0.5) * 2.0;
  float r = max(radius, 1.415);
  float corner = r / sqrt(max(r * r - 2.0, 0.001));
  p = r * p / sqrt(max(r * r - dot(p, p), 0.001));
  p /= corner;
  return p * 0.5 + 0.5;
}

float plasma(vec2 uv, float t) {
  float fs = max(uWaveFrequency / 2.2, 0.001);
  uv = (uv - 0.5) * fs + 0.5;
  float scan = 0.5 - 0.5 * cos(uv.y * 3.14159265 * uScanlineFrequency);
  scan = mix(1.0, scan, uScanlineStrength);
  uv = ceil(uv * vec2(80.0, 24.0)) / vec2(80.0, 24.0);
  float amp = uWaveAmplitude / 0.28;
  float f = 0.7 * sin(0.5 * uv.x + t / 5.0);
  f += 3.0 * sin(1.6 * uv.y + t / 5.0);
  f += sin(10.0 * (uv.y * sin(t / 2.0) + uv.x * cos(t / 5.0)) + t / 2.0);
  float cx = uv.x + 0.5 * sin(t / 2.0);
  float cy = uv.y + 0.5 * cos(t / 4.0);
  f += 0.4 * sin(sqrt(100.0 * cx * cx + 100.0 * cy * cy + 1.0) + t);
  f += 0.9 * sin(sqrt(75.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);
  f -= 1.4 * sin(sqrt(256.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);
  f += 0.3 * sin(0.5 * uv.y + uv.x + sin(t));
  return scan * floor(3.0 * (0.5 + 0.499 * sin(f * amp))) / 3.0;
}

void main() {
  float radius = (1.1 + 0.42 / max(uCurvature, 0.001)) * exp(-uPointer.y * uMouseStrength * 0.4);
  vec2 uv = crtCurve(vUv, radius);
  uv.x -= uPointer.x * uMouseStrength * 0.035;

  float s = plasma(uv, uTime);
  float r = 0.01 * uBloomRadius;
  float glow = s * 0.2;
  glow += (plasma(uv + vec2(r, 0.0), uTime) + plasma(uv - vec2(r, 0.0), uTime)) * 0.12;
  glow += (plasma(uv + vec2(0.0, r), uTime) + plasma(uv - vec2(0.0, r), uTime)) * 0.12;

  float mask = clamp(s * 0.82 + glow * 0.52 * uBloom, 0.0, 1.0) * uIntensity;
  gl_FragColor = vec4(mix(uBackground, uColor, mask), 1.0);
}
`;

export default function PlasmaWarp({
  color = '#F59E0B',
  backgroundColor = '#1E3A8A',
  intensity = 0.24,
  speed = 0.5,
  curvature = 0.25,
  scanlineStrength = 0.3,
  scanlineFrequency = 200,
  waveAmplitude = 0.3,
  waveFrequency = 2.5,
  bloom = 1.2,
  bloomRadius = 1,
  mouseStrength = 0.5,
  fps = 30,
  className,
  style
}: PlasmaWarpProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return undefined;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: 1, alpha: false, antialias: false, powerPreference: 'low-power' });
    } catch {
      return undefined; // sin WebGL queda el color de fondo del contenedor
    }
    const gl = renderer.gl;
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.display = 'block';
    host.appendChild(gl.canvas);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(color) },
        uBackground: { value: new Color(backgroundColor) },
        uIntensity: { value: intensity },
        uCurvature: { value: curvature },
        uScanlineStrength: { value: scanlineStrength },
        uScanlineFrequency: { value: scanlineFrequency },
        uWaveAmplitude: { value: waveAmplitude },
        uWaveFrequency: { value: waveFrequency },
        uBloom: { value: bloom },
        uBloomRadius: { value: bloomRadius },
        uPointer: { value: [0, 0] },
        uMouseStrength: { value: mouseStrength }
      }
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => renderer.setSize(Math.max(host.clientWidth, 1), Math.max(host.clientHeight, 1));
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const target = [0, 0];
    const pointer = program.uniforms.uPointer.value as number[];
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      target[0] = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      target[1] = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    const onLeave = () => {
      target[0] = 0;
      target[1] = 0;
    };
    // El contenido va encima del canvas, así que el puntero se lee en el panel
    const area = host.parentElement ?? host;
    if (finePointer && !reduce) {
      area.addEventListener('pointermove', onMove);
      area.addEventListener('pointerleave', onLeave);
    }

    let visible = false;
    let raf = 0;
    let last = 0;
    let time = 4; // arranca en un punto con forma, no en el patrón plano de t = 0
    const frameMs = 1000 / Math.max(1, fps);

    const draw = () => renderer.render({ scene: mesh });
    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      raf = requestAnimationFrame(tick);
      if (now - last < frameMs) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      time += dt * speed;
      pointer[0] += (target[0] - pointer[0]) * 0.08;
      pointer[1] += (target[1] - pointer[1]) * 0.08;
      program.uniforms.uTime.value = time;
      draw();
    };

    program.uniforms.uTime.value = time;
    draw();

    // Solo se anima cuando el panel está en pantalla y sin movimiento reducido
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !reduce;
      if (visible && !raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(host);

    return () => {
      io.disconnect();
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      area.removeEventListener('pointermove', onMove);
      area.removeEventListener('pointerleave', onLeave);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      gl.canvas.remove();
    };
  }, [color, backgroundColor, intensity, speed, curvature, scanlineStrength, scanlineFrequency, waveAmplitude, waveFrequency, bloom, bloomRadius, mouseStrength, fps]);

  return <div ref={ref} className={className} style={style} aria-hidden="true" />;
}
