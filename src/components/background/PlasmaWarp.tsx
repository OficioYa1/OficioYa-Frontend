import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';

/*
  PlasmaWarp · fondo líquido iridiscente (domain warping sobre ruido fbm)
  hecho con ogl. Mezcla un color base con cuatro colores del manual en
  corrientes lentas. Se renderiza a media resolución (el líquido es suave,
  el reescalado no se nota), a 30 fps como máximo, solo mientras está en
  pantalla y nunca con movimiento reducido. Se carga con React.lazy.
*/

export interface PlasmaWarpProps {
  /** Color base y cuatro colores de corriente, en hex. */
  colors: [string, string, string, string, string];
  /** Cuánto se mezclan las corrientes con la base (0–1). */
  intensity?: number;
  speed?: number;
  /** Desplazamiento del líquido hacia el puntero (solo puntero fino). */
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
uniform float uAspect;
uniform float uIntensity;
uniform vec2 uPointer;
uniform vec3 uBase;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uC4;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y) * 1.35;
  p += uPointer * 0.12;
  float t = uTime * 0.07;

  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.2 * q + vec2(1.7, 9.2) + 1.2 * t),
                fbm(p + 3.2 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p + 3.0 * r);

  vec3 col = uBase;
  col = mix(col, uC1, smoothstep(0.25, 0.85, f));
  col = mix(col, uC2, smoothstep(0.45, 1.05, length(q)) * 0.85);
  col = mix(col, uC3, smoothstep(0.5, 0.95, r.x));
  col = mix(col, uC4, smoothstep(0.58, 1.0, r.y) * 0.8);

  float sheen = pow(0.5 + 0.5 * sin(f * 11.0 + t * 5.0), 8.0);
  col += sheen * 0.05;

  gl_FragColor = vec4(mix(uBase, col, uIntensity), 1.0);
}
`;

export default function PlasmaWarp({
  colors,
  intensity = 1,
  speed = 1,
  mouseStrength = 1,
  fps = 30,
  className,
  style,
}: PlasmaWarpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [base, c1, c2, c3, c4] = colors;

  useEffect(() => {
    const host = ref.current;
    if (!host) return undefined;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: 0.5, alpha: false, antialias: false, powerPreference: 'low-power' });
    } catch {
      return undefined; // sin WebGL queda el degradado CSS del contenedor
    }
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 1200ms cubic-bezier(0.19,1,0.22,1)';
    host.appendChild(canvas);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uIntensity: { value: intensity },
        uPointer: { value: [0, 0] },
        uBase: { value: new Color(base) },
        uC1: { value: new Color(c1) },
        uC2: { value: new Color(c2) },
        uC3: { value: new Color(c3) },
        uC4: { value: new Color(c4) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const draw = () => renderer.render({ scene: mesh });

    const resize = () => {
      const w = Math.max(host.clientWidth, 1);
      const h = Math.max(host.clientHeight, 1);
      renderer.setSize(w, h);
      program.uniforms.uAspect.value = w / h;
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const target = [0, 0];
    const pointer = program.uniforms.uPointer.value as number[];
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      target[0] = (((e.clientX - rect.left) / rect.width) * 2 - 1) * mouseStrength;
      target[1] = (-(((e.clientY - rect.top) / rect.height) * 2 - 1)) * mouseStrength;
    };
    const onLeave = () => {
      target[0] = 0;
      target[1] = 0;
    };
    // El contenido va encima del canvas, así que el puntero se lee en el contenedor padre
    const area = host.parentElement ?? host;
    if (finePointer && !reduce && mouseStrength > 0) {
      area.addEventListener('pointermove', onMove);
      area.addEventListener('pointerleave', onLeave);
    }

    let visible = false;
    let raf = 0;
    let last = 0;
    let time = 12; // arranca en un punto con forma, no en el patrón de t = 0
    const frameMs = 1000 / Math.max(1, fps);

    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      raf = requestAnimationFrame(tick);
      if (now - last < frameMs) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      time += dt * speed;
      pointer[0] += (target[0] - pointer[0]) * 0.04;
      pointer[1] += (target[1] - pointer[1]) * 0.04;
      program.uniforms.uTime.value = time;
      draw();
    };

    program.uniforms.uTime.value = time;
    draw();
    const fadeIn = requestAnimationFrame(() => { canvas.style.opacity = '1'; });

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
      cancelAnimationFrame(fadeIn);
      if (raf) cancelAnimationFrame(raf);
      area.removeEventListener('pointermove', onMove);
      area.removeEventListener('pointerleave', onLeave);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, [base, c1, c2, c3, c4, intensity, speed, mouseStrength, fps]);

  return <div ref={ref} className={className} style={style} aria-hidden="true" />;
}
