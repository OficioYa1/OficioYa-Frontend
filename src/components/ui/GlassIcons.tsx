import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import './GlassIcons.css';

/* ============================================================
   GlassIcons · iconos de vidrio sobre una placa de color (WebGL2)
   La placa usa la paleta del manual; el degradado sutil vive solo
   dentro del vidrio. Por defecto la placa se desplaza en diagonal
   (sin girar). Sin WebGL2 o con movimiento reducido se dibuja una
   placa plana con canto de luz y el glifo encima.
   ============================================================ */

export type GlassIconsColor =
  | 'amarillo'
  | 'marino'
  | 'fuego'
  | 'esmeralda'
  | 'many'
  | 'cacao'
  | 'almendra';

export interface GlassIconsItem {
  icon: ReactNode;
  /** Nombre accesible del botón o enlace. Obligatorio. */
  label: string;
  /** Color de la paleta del manual, o cualquier color / linear-gradient CSS. */
  color?: GlassIconsColor | (string & {});
  /** Color del glifo; por defecto se elige según la placa para mantener contraste. */
  iconColor?: string;
  href?: string;
  target?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  id?: string | number;
  className?: string;
}

export interface GlassIconsProps {
  items?: GlassIconsItem[];
  size?: number;
  gap?: number;
  columns?: number;
  roundness?: number;
  refraction?: number;
  bevel?: number;
  dispersion?: number;
  frost?: number;
  shine?: number;
  tint?: string;
  tintOpacity?: number;
  plate?: 'tilt' | 'offset' | 'circle';
  tilt?: number;
  spread?: number;
  hover?: 'lift' | 'float' | 'press' | 'none';
  parallax?: number;
  labels?: 'hover' | 'always' | 'none';
  intro?: boolean;
  /** Canto fino de 1.5px en placa y vidrio. */
  outline?: boolean;
  /** Nombre accesible del grupo. */
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

type Gradient = { angle: number; stops: [number, string][] };

type Motion = {
  h: number;
  hv: number;
  ht: number;
  p: number;
  pv: number;
  pt: number;
  x: number;
  xv: number;
  xt: number;
  y: number;
  yv: number;
  yt: number;
  e: number;
  ev: number;
  et: number;
  at: number;
};

type Settings = {
  count: number;
  tile: number;
  radius: number;
  edge: number;
  strength: number;
  split: number;
  soft: number;
  shine: number;
  tint: string;
  tintOpacity: number;
  plate: string;
  hover: string;
  labels: string;
  tilt: number;
  spread: number;
  parallax: number;
  intro: boolean;
  outline: boolean;
  colors: string[];
  colorKey: string;
};

type Engine = {
  hover: (index: number, on: boolean) => void;
  aim: (index: number, x: number, y: number) => void;
  press: (index: number, on: boolean) => void;
  sync: () => void;
};

const CACAO = '#3E1F14';
const WHITE = '#FFFFFF';

/** Paleta del manual: [inicio, fin] del degradado y color del glifo con contraste AA. */
const PALETTE: Record<GlassIconsColor, { from: string; to: string; ink: string }> = {
  amarillo: { from: '#FFC72C', to: '#F59E0B', ink: CACAO },
  marino: { from: '#1E3A8A', to: '#24439A', ink: WHITE },
  fuego: { from: '#EA580C', to: '#C2410C', ink: WHITE },
  esmeralda: { from: '#10B981', to: '#047857', ink: CACAO },
  many: { from: '#C9622A', to: '#A64F1F', ink: WHITE },
  cacao: { from: '#3E1F14', to: '#5A2E1E', ink: WHITE },
  almendra: { from: '#F8D8A8', to: '#F0C27E', ink: CACAO },
};

const GRADIENTS: Record<string, string> = Object.fromEntries(
  Object.entries(PALETTE).map(([name, c]) => [name, `linear-gradient(135deg, ${c.from}, ${c.to})`]),
);

const paletteOf = (color?: string) =>
  color && color in PALETTE ? PALETTE[color as GlassIconsColor] : undefined;

const PLATES = ['tilt', 'offset', 'circle'];
const HOVERS = ['lift', 'float', 'press', 'none'];
const LABELS = ['hover', 'always', 'none'];
const PLATE_CODES: Record<string, number> = { tilt: 1, offset: 2, circle: 3 };
const SIDES: Record<string, number> = { top: 0, right: 90, bottom: 180, left: 270 };
const STAGGER = 0.07;
const OUTLINE_W = 1.5;
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

const VERTEX = `#version 300 es
in vec2 aCorner;
uniform vec2 uCanvas;
uniform vec2 uCenter;
uniform float uExtent;
out vec2 vLocal;
void main() {
  vLocal = aCorner * uExtent;
  vec2 position = (uCenter + vLocal) / uCanvas * 2.0 - 1.0;
  gl_Position = vec4(position.x, -position.y, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
in vec2 vLocal;
out vec4 outColor;
uniform float uSize;
uniform float uRadius;
uniform float uBevel;
uniform float uStrength;
uniform float uSplit;
uniform float uSoft;
uniform float uShine;
uniform float uShade;
uniform vec4 uTint;
uniform vec2 uLight;
uniform int uPlate;
uniform vec2 uOrigin;
uniform mat2 uTurn;
uniform vec2 uShift;
uniform vec2 uOffset;
uniform float uScale;
uniform float uDisc;
uniform float uRow;
uniform vec2 uDirection;
uniform float uSpan;
uniform sampler2D uGradients;
uniform vec2 uLift;
uniform float uGlassScale;
uniform float uGlassAlpha;
uniform float uPlateAlpha;
uniform float uPixel;
uniform float uOutline;
uniform vec4 uInk;

float roundBox(vec2 p, float reach, float radius) {
  vec2 q = abs(p) - vec2(reach - radius);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

vec2 roundNormal(vec2 p, float reach, float radius) {
  vec2 q = abs(p) - vec2(reach - radius);
  vec2 s = vec2(p.x < 0.0 ? -1.0 : 1.0, p.y < 0.0 ? -1.0 : 1.0);
  if (q.x > 0.0 && q.y > 0.0) return normalize(q) * s;
  return q.x > q.y ? vec2(s.x, 0.0) : vec2(0.0, s.y);
}

vec4 plate(vec2 p, float soft) {
  vec2 q = uTurn * ((p - uOrigin - uShift) / uScale) + uOrigin - uOffset;
  float d = uPlate == 3 ? length(q) - uDisc : roundBox(q, uSize * 0.5, uRadius);
  float a = clamp(0.5 - d / soft, 0.0, 1.0);
  if (a <= 0.0) return vec4(0.0);
  float t = clamp(dot(q, uDirection) / uSpan + 0.5, 0.0, 1.0);
  vec3 base = texture(uGradients, vec2(t, uRow)).rgb;
  if (uOutline > 0.0) {
    float ring = clamp(0.5 - (-d - uOutline) / soft, 0.0, 1.0);
    base = mix(base, uInk.rgb, ring * uInk.a);
  }
  return vec4(base * a, a);
}

void main() {
  vec2 p = vLocal;
  float reach = uSize * 0.5;
  vec2 g = (p - uLift) / uGlassScale;
  float dg = roundBox(g, reach, uRadius);
  float glass = clamp(0.5 - dg * uGlassScale / uPixel, 0.0, 1.0) * uGlassAlpha;

  vec4 color = plate(p, uPixel) * uPlateAlpha;
  if (color.a > 0.0) {
    float drop = roundBox(g - vec2(0.0, uSize * 0.1), reach, uRadius);
    color.rgb *= 1.0 - (1.0 - smoothstep(-uSize * 0.12, uSize * 0.14, drop)) * 0.28 * uGlassAlpha;
  }

  if (glass > 0.0) {
    float inside = max(0.0, -dg);
    float t = 1.0 - clamp(inside / uBevel, 0.0, 1.0);
    vec2 n = roundNormal(g, reach, uRadius);
    vec2 bend = n * pow(t, 2.2);
    vec4 red = plate(p - bend * (uStrength + uSplit), uSoft);
    vec4 green = plate(p - bend * uStrength, uSoft);
    vec4 blue = plate(p - bend * (uStrength - uSplit), uSoft);
    vec4 seen = vec4(red.r, green.g, blue.b, green.a) * uPlateAlpha;
    float luma = dot(seen.rgb, vec3(0.2126, 0.7152, 0.0722));
    seen.rgb = clamp(mix(vec3(luma), seen.rgb, 1.25) * 1.04, 0.0, 1.0);
    seen.rgb = min(mix(seen.rgb, uTint.rgb * seen.a, uTint.a), vec3(seen.a));
    float facing = dot(n, uLight);
    float rim = clamp(inside / 1.2, 0.0, 1.0);
    float shade = (max(-facing, 0.0) * 0.75 + 0.25) * t * t * rim * uShade;
    float light = clamp((max(facing, 0.0) * 0.95 + max(-facing, 0.0) * 0.35) * t * t * t * rim * uShine, 0.0, 1.0);
    seen = seen * (1.0 - shade) + vec4(0.0, 0.0, 0.0, shade);
    seen = seen * (1.0 - light) + vec4(light);
    color = mix(color, seen, glass);
  }
  outColor = color;
}`;

const UNIFORMS = [
  'uCanvas',
  'uCenter',
  'uExtent',
  'uSize',
  'uRadius',
  'uBevel',
  'uStrength',
  'uSplit',
  'uSoft',
  'uShine',
  'uShade',
  'uTint',
  'uLight',
  'uPlate',
  'uOrigin',
  'uTurn',
  'uShift',
  'uOffset',
  'uScale',
  'uDisc',
  'uRow',
  'uDirection',
  'uSpan',
  'uGradients',
  'uLift',
  'uGlassScale',
  'uGlassAlpha',
  'uPlateAlpha',
  'uPixel',
  'uOutline',
  'uInk',
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const fade = (from: number, to: number, t: number) => {
  const x = clamp((t - from) / (to - from), 0, 1);
  return x * x * (3 - 2 * x);
};

const drive = (
  value: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): [number, number] => {
  const next = velocity + (stiffness * (target - value) - damping * velocity) * dt;
  return [value + next * dt, next];
};

const splitTopLevel = (text: string) => {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') depth--;
    else if (text[i] === ',' && depth === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts;
};

const parseGradient = (value: string): Gradient => {
  const text = String(value).trim();
  const match = /^linear-gradient\((.*)\)$/is.exec(text);
  if (!match) {
    return {
      angle: 180,
      stops: [
        [0, text],
        [1, text],
      ],
    };
  }
  const parts = splitTopLevel(match[1]);
  const head = parts[0].toLowerCase();
  let angle = 180;
  if (/^-?[\d.]+(deg|turn|rad|grad)$/.test(head)) {
    const number = parseFloat(head);
    if (head.endsWith('turn')) angle = number * 360;
    else if (head.endsWith('grad')) angle = number * 0.9;
    else if (head.endsWith('rad')) angle = (number * 180) / Math.PI;
    else angle = number;
    parts.shift();
  } else if (head.startsWith('to ')) {
    const sides = head.slice(3).split(/\s+/);
    const vertical = sides.includes('top') ? -1 : sides.includes('bottom') ? 1 : 0;
    const horizontal = sides.includes('left') ? -1 : sides.includes('right') ? 1 : 0;
    angle =
      sides.length === 1 ? (SIDES[sides[0]] ?? 180) : (Math.atan2(horizontal, -vertical) * 180) / Math.PI;
    parts.shift();
  }
  const stops = parts.map((part): [number | null, string] => {
    const stop = /^(.*?)\s+(-?[\d.]+)%$/.exec(part);
    return stop ? [Number(stop[2]) / 100, stop[1].trim()] : [null, part];
  });
  if (!stops.length) stops.push([0, WHITE]);
  if (stops[0][0] === null) stops[0][0] = 0;
  if (stops[stops.length - 1][0] === null) stops[stops.length - 1][0] = 1;
  for (let i = 1; i < stops.length - 1; i++) {
    if (stops[i][0] !== null) continue;
    let next = i + 1;
    while (stops[next][0] === null) next++;
    const from = stops[i - 1][0] as number;
    stops[i][0] = from + ((stops[next][0] as number) - from) / (next - i + 1);
  }
  return { angle, stops: stops as [number, string][] };
};

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const poseOf = (state: Motion, s: Settings) => {
  const size = s.tile;
  const enter = clamp(state.e, 0, 1);
  const swing = ease((enter - 0.18) / 0.82);
  const hover = state.h;
  const lift = s.hover === 'lift' ? hover : 0;
  let liftY = 0;
  let glassScale = 1;
  if (s.hover === 'lift') liftY = -0.08 * size * hover;
  if (s.hover === 'float') liftY = -0.14 * size * hover;
  if (s.hover === 'press') {
    liftY = -0.03 * size * hover;
    glassScale = 1 - 0.08 * state.p;
  }
  const settle = 0.92 + 0.08 * ease(enter);
  const glyphRise = (1 - ease((enter - 0.25) / 0.75)) * 0.1 * size;
  const shift = [-state.x * s.parallax * 0.07 * size, -state.y * s.parallax * 0.07 * size];
  let angle = 0;
  let offset: [number, number] = [0, 0];
  let grow = 1;
  if (s.plate === 'tilt') {
    angle = (s.tilt + 10 * lift) * swing;
    offset = [-0.08 * size * lift, -0.08 * size * lift];
  } else if (s.plate === 'offset') {
    const reach = s.spread * (0.26 + 0.08 * lift) * size * swing;
    offset = [reach, -reach];
  } else if (s.plate === 'circle') {
    const reach = (s.spread * (0.24 + 0.06 * lift) + 0.06 * lift) * size * swing;
    offset = [reach, -reach];
    grow = 1 + 0.08 * lift;
  }
  const light = [-0.55 + state.x * 0.35, -0.83 + state.y * 0.35];
  const length = Math.hypot(light[0], light[1]) || 1;
  return {
    liftY,
    glassScale: glassScale * settle,
    glassAlpha: fade(0, 0.55, enter),
    plateAlpha: fade(0, 0.35, enter),
    faceY: liftY + glyphRise,
    faceScale: glassScale,
    faceAlpha: fade(0.3, 0.85, enter),
    plateScale: (s.hover === 'press' ? 1 - 0.08 * state.p : 1) * grow,
    shift,
    angle,
    offset,
    bend: 1 + 1.2 * (1 - ease(enter)),
    glow: 1 + 0.25 * hover,
    light: [light[0] / length, light[1] / length],
  };
};

const readReduced = () =>
  typeof window !== 'undefined' && (window.matchMedia?.(REDUCE_QUERY).matches ?? false);

export const GlassIcons = ({
  items = [],
  size = 72,
  gap = 40,
  columns = 3,
  roundness = 0.6,
  refraction = 0.8,
  bevel = 0.6,
  dispersion = 0,
  frost = 0.2,
  shine = 0.85,
  tint = WHITE,
  tintOpacity = 0.15,
  plate = 'offset',
  tilt = 30,
  spread = 0.5,
  hover = 'press',
  parallax = 1,
  labels = 'always',
  intro = true,
  outline = false,
  ariaLabel,
  className = '',
  style,
}: GlassIconsProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glassRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const faceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const engineRef = useRef<Engine | null>(null);
  const [gpu, setGpu] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(readReduced);

  const tile = Math.max(24, Math.round(size));
  const radius = Math.round((tile / 2) * clamp(roundness, 0, 1));
  const edge = Math.max(2, Math.round(tile * 0.26 * clamp(bevel, 0, 1)));
  const plateMode = PLATES.includes(plate) ? plate : 'tilt';
  const hoverMode = HOVERS.includes(hover) ? hover : 'press';
  const labelMode = LABELS.includes(labels) ? labels : 'always';
  const colors = items.map(item => (item.color && GRADIENTS[item.color]) || item.color || GRADIENTS.marino);
  const flat = reduced || gpu === false;
  const pad = Math.round(tile * 0.42);

  const settings: Settings = {
    count: items.length,
    tile,
    radius,
    edge,
    strength: tile * 0.3 * clamp(refraction, 0, 1.5),
    split: tile * 0.07 * clamp(dispersion, 0, 1) * clamp(refraction, 0, 1.5),
    soft: 1 + clamp(frost, 0, 1) * tile * 0.15,
    shine: clamp(shine, 0, 1),
    tint,
    tintOpacity: clamp(tintOpacity, 0, 1),
    plate: plateMode,
    hover: hoverMode,
    labels: labelMode,
    tilt,
    spread: clamp(spread, 0, 1),
    parallax: clamp(parallax, 0, 1),
    intro,
    outline,
    colors,
    colorKey: colors.join('|'),
  };
  const settingsRef = useRef(settings);
  useLayoutEffect(() => {
    settingsRef.current = settings;
  });

  useEffect(() => {
    const query = window.matchMedia?.(REDUCE_QUERY);
    if (!query) return undefined;
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    let gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    let program: WebGLProgram | null = null;
    let vertex: WebGLShader | null = null;
    let fragment: WebGLShader | null = null;
    if (gl) {
      vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
      fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
      program = gl.createProgram();
      if (vertex && fragment && program) {
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
      }
      if (!program || !vertex || !fragment || !gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        gl = null;
      }
    }
    if (!gl || !program) {
      setGpu(false);
      return undefined;
    }
    setGpu(true);

    const states: Motion[] = [];
    const layout = { width: 1, height: 1, dpr: 1, centers: [] as number[][] };
    const paint = document.createElement('canvas');
    const paintContext = paint.getContext('2d', { willReadFrequently: true });
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    let gradientKey = '';
    let gradients: Gradient[] = [];
    let tintKey = '';
    let tintColor = [1, 1, 1];
    let inkKey = '';
    let inkColor = [0.243, 0.122, 0.078, 1];
    let raf = 0;
    let last = 0;
    let alive = true;
    let entered = false;

    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const corner = gl.getAttribLocation(program, 'aCorner');
    gl.enableVertexAttribArray(corner);
    gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0);
    for (const name of UNIFORMS) uniforms[name] = gl.getUniformLocation(program, name);
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(uniforms.uGradients, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const stateOf = (index: number): Motion => {
      while (states.length <= index) {
        const start = settingsRef.current.intro ? 0 : 1;
        states.push({
          h: 0,
          hv: 0,
          ht: 0,
          p: 0,
          pv: 0,
          pt: 0,
          x: 0,
          xv: 0,
          xt: 0,
          y: 0,
          yv: 0,
          yt: 0,
          e: start,
          ev: 0,
          et: start,
          at: 0,
        });
      }
      return states[index];
    };

    const toRgba = (value: string) => {
      if (!paintContext) return [1, 1, 1, 1];
      paint.width = 1;
      paint.height = 1;
      paintContext.clearRect(0, 0, 1, 1);
      paintContext.fillStyle = WHITE;
      paintContext.fillStyle = value;
      paintContext.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = paintContext.getImageData(0, 0, 1, 1).data;
      return a ? [r / a, g / a, b / a, a / 255] : [0, 0, 0, 0];
    };

    /* El contorno de la placa sigue al token --stroke-ink (Cacao; Almendra translúcido en modo oscuro). */
    const readInk = () => {
      const value = getComputedStyle(root).getPropertyValue('--stroke-ink').trim() || CACAO;
      if (value === inkKey) return;
      inkKey = value;
      inkColor = toRgba(value);
    };

    const refreshTextures = () => {
      const s = settingsRef.current;
      if (!gl || !paintContext) return;
      if (s.tint !== tintKey) {
        tintKey = s.tint;
        tintColor = toRgba(s.tint).slice(0, 3);
      }
      if (s.colorKey === gradientKey) return;
      gradientKey = s.colorKey;
      gradients = s.colors.map(parseGradient);
      paint.width = 256;
      paint.height = Math.max(1, gradients.length);
      gradients.forEach((gradient, row) => {
        const fill = paintContext.createLinearGradient(0, 0, 256, 0);
        gradient.stops.forEach(([at, color]) => {
          try {
            fill.addColorStop(clamp(at, 0, 1), color);
          } catch {
            fill.addColorStop(clamp(at, 0, 1), WHITE);
          }
        });
        paintContext.fillStyle = fill;
        paintContext.fillRect(0, row, 256, 1);
      });
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, paint);
    };

    const measure = () => {
      layout.width = Math.max(1, root.clientWidth);
      layout.height = Math.max(1, root.clientHeight);
      layout.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(layout.width * layout.dpr);
      const height = Math.round(layout.height * layout.dpr);
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      layout.centers = Array.from(root.querySelectorAll<HTMLElement>('[data-glass-icon]')).map(icon => [
        icon.offsetLeft + icon.offsetWidth / 2,
        icon.offsetTop + icon.offsetHeight / 2,
      ]);
    };

    const applyDom = () => {
      const s = settingsRef.current;
      for (let i = 0; i < s.count; i++) {
        const pose = poseOf(stateOf(i), s);
        const glass = glassRefs.current[i];
        if (glass) {
          glass.style.transform = `translate3d(0, ${pose.liftY.toFixed(2)}px, 0) scale(${pose.glassScale.toFixed(4)})`;
          glass.style.opacity = pose.glassAlpha.toFixed(3);
        }
        const face = faceRefs.current[i];
        if (face) {
          face.style.transform = `translate3d(0, ${pose.faceY.toFixed(2)}px, 0) scale(${pose.faceScale.toFixed(4)})`;
          face.style.opacity = pose.faceAlpha.toFixed(3);
        }
        const label = labelRefs.current[i];
        if (label && s.labels === 'always') label.style.opacity = pose.faceAlpha.toFixed(3);
      }
    };

    const draw = () => {
      if (!gl) return;
      const s = settingsRef.current;
      refreshTextures();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!s.count) return;
      const size = s.tile;
      gl.uniform2f(uniforms.uCanvas, layout.width, layout.height);
      gl.uniform1f(uniforms.uExtent, size * 1.08);
      gl.uniform1f(uniforms.uSize, size);
      gl.uniform1f(uniforms.uRadius, Math.min(s.radius, size / 2));
      gl.uniform1f(uniforms.uBevel, s.edge);
      gl.uniform1f(uniforms.uSoft, s.soft);
      gl.uniform1f(uniforms.uShade, 0.25);
      gl.uniform4f(uniforms.uTint, tintColor[0], tintColor[1], tintColor[2], s.tintOpacity);
      gl.uniform1i(uniforms.uPlate, PLATE_CODES[s.plate]);
      gl.uniform1f(uniforms.uDisc, size * 0.41);
      gl.uniform1f(uniforms.uPixel, 1 / layout.dpr);
      gl.uniform1f(uniforms.uOutline, s.outline ? OUTLINE_W : 0);
      gl.uniform4f(uniforms.uInk, inkColor[0], inkColor[1], inkColor[2], inkColor[3]);
      const origin = s.plate === 'tilt' ? size / 2 : 0;
      gl.uniform2f(uniforms.uOrigin, origin, origin);
      for (let i = 0; i < s.count; i++) {
        const center = layout.centers[i];
        if (!center) continue;
        const pose = poseOf(stateOf(i), s);
        const gradient = gradients[i] ?? { angle: 180 };
        const turn = (-pose.angle * Math.PI) / 180;
        const box = s.plate === 'circle' ? size * 0.82 : size;
        const direction = (gradient.angle * Math.PI) / 180;
        const dx = Math.sin(direction);
        const dy = -Math.cos(direction);
        gl.uniform2f(uniforms.uCenter, center[0], center[1]);
        gl.uniform1f(uniforms.uStrength, s.strength * pose.bend);
        gl.uniform1f(uniforms.uSplit, s.split * pose.bend);
        gl.uniform1f(uniforms.uShine, s.shine * pose.glow);
        gl.uniform2f(uniforms.uLight, pose.light[0], pose.light[1]);
        gl.uniformMatrix2fv(uniforms.uTurn, false, [Math.cos(turn), Math.sin(turn), -Math.sin(turn), Math.cos(turn)]);
        gl.uniform2f(uniforms.uShift, pose.shift[0], pose.shift[1]);
        gl.uniform2f(uniforms.uOffset, pose.offset[0], pose.offset[1]);
        gl.uniform1f(uniforms.uScale, pose.plateScale);
        gl.uniform1f(uniforms.uRow, (i + 0.5) / Math.max(1, gradients.length));
        gl.uniform2f(uniforms.uDirection, dx, dy);
        gl.uniform1f(uniforms.uSpan, Math.max(1, Math.abs(box * dx) + Math.abs(box * dy)));
        gl.uniform2f(uniforms.uLift, 0, pose.liftY);
        gl.uniform1f(uniforms.uGlassScale, pose.glassScale);
        gl.uniform1f(uniforms.uGlassAlpha, pose.glassAlpha);
        gl.uniform1f(uniforms.uPlateAlpha, pose.plateAlpha);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };

    const tick = (now: number) => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      const time = now / 1000;
      const dt = last ? Math.min(1 / 30, time - last) : 1 / 60;
      last = time;
      const steps = Math.max(1, Math.ceil(dt * 240));
      const h = dt / steps;
      let moving = false;
      for (let i = 0; i < s.count; i++) {
        const state = stateOf(i);
        if (state.et === 0) {
          if (entered && time >= state.at) state.et = 1;
          else moving = moving || entered;
        }
        for (let k = 0; k < steps; k++) {
          [state.h, state.hv] = drive(state.h, state.hv, state.ht, 170, 24, h);
          [state.p, state.pv] = drive(state.p, state.pv, state.pt, 420, 40, h);
          [state.x, state.xv] = drive(state.x, state.xv, state.xt, 90, 19, h);
          [state.y, state.yv] = drive(state.y, state.yv, state.yt, 90, 19, h);
          [state.e, state.ev] = drive(state.e, state.ev, state.et, 60, 15.5, h);
        }
        const pairs: [keyof Motion, keyof Motion, keyof Motion][] = [
          ['h', 'hv', 'ht'],
          ['p', 'pv', 'pt'],
          ['x', 'xv', 'xt'],
          ['y', 'yv', 'yt'],
          ['e', 'ev', 'et'],
        ];
        for (const [value, velocity, target] of pairs) {
          if (Math.abs(state[target] - state[value]) < 0.0005 && Math.abs(state[velocity]) < 0.001) {
            state[value] = state[target];
            state[velocity] = 0;
          } else {
            moving = true;
          }
        }
      }
      applyDom();
      draw();
      if (moving) raf = requestAnimationFrame(tick);
      else last = 0;
    };

    const wake = () => {
      if (!raf && alive) raf = requestAnimationFrame(tick);
    };

    const visibility = new IntersectionObserver(
      entries => {
        if (entered || !entries.some(entry => entry.isIntersecting)) return;
        entered = true;
        const time = performance.now() / 1000;
        for (let i = 0; i < settingsRef.current.count; i++) stateOf(i).at = time + i * STAGGER;
        wake();
      },
      { threshold: 0.15 },
    );
    visibility.observe(root);

    const resizeObserver = new ResizeObserver(() => {
      measure();
      applyDom();
      draw();
    });
    resizeObserver.observe(root);

    /* Cambio de tema (clase en <html>): repinta el contorno con el token nuevo. */
    const themeObserver = new MutationObserver(() => {
      readInk();
      draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    const onContextLost = (event: Event) => {
      event.preventDefault();
      gl = null;
      setGpu(false);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    engineRef.current = {
      hover: (index, on) => {
        const state = stateOf(index);
        state.ht = on ? 1 : 0;
        if (!on) {
          state.xt = 0;
          state.yt = 0;
          state.pt = 0;
        }
        wake();
      },
      aim: (index, x, y) => {
        const state = stateOf(index);
        state.xt = x;
        state.yt = y;
        wake();
      },
      press: (index, on) => {
        stateOf(index).pt = on ? 1 : 0;
        wake();
      },
      sync: () => {
        readInk();
        measure();
        applyDom();
        draw();
        wake();
      },
    };
    engineRef.current.sync();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      engineRef.current = null;
      visibility.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      if (gl) {
        gl.deleteTexture(texture);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
      }
    };
  }, [reduced]);

  useLayoutEffect(() => {
    engineRef.current?.sync();
  });

  const point = (index: number, event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    engineRef.current?.aim(index, clamp(x, -1, 1), clamp(y, -1, 1));
  };

  const focusVisible = (element: HTMLElement) => {
    try {
      return element.matches(':focus-visible');
    } catch {
      return false;
    }
  };

  const cols = columns > 0 ? Math.round(columns) : Math.max(1, items.length);
  const rootClass = ['oy-glass-icons', flat ? 'oy-glass-icons--flat' : '', className].filter(Boolean).join(' ');

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={ariaLabel}
      className={rootClass}
      data-intro={intro && !flat ? '' : undefined}
      data-labels={labelMode}
      data-hover={hoverMode}
      data-outline={outline ? '' : undefined}
      style={
        {
          '--glass-icons-size': `${tile}px`,
          '--glass-icons-radius': `${radius}px`,
          '--glass-icons-gap': `${Math.max(0, gap)}px`,
          '--glass-icons-row-gap': `${Math.max(0, gap) + (labelMode === 'always' ? 44 : 0)}px`,
          '--glass-icons-columns': cols,
          '--glass-icons-pad': `${pad}px`,
          ...style,
        } as CSSProperties
      }
    >
      {!flat && <canvas ref={canvasRef} className="oy-glass-icons__canvas" aria-hidden="true" />}

      {items.map((item, index) => {
        const Tag = (item.href ? 'a' : 'button') as 'a';
        const tone = paletteOf(item.color);
        const ink = item.iconColor ?? tone?.ink ?? WHITE;
        const flatFill = tone?.from ?? colors[index];
        return (
          <Tag
            key={item.id ?? index}
            className={`oy-glass-icons__item${item.className ? ` ${item.className}` : ''}`}
            data-glass-icon=""
            aria-label={item.label}
            style={{ '--glass-icons-ink': ink, '--glass-icons-fill': flatFill } as CSSProperties}
            {...(item.href
              ? { href: item.href, target: item.target, rel: item.target === '_blank' ? 'noreferrer' : undefined }
              : { type: 'button' })}
            onClick={item.onClick}
            onPointerEnter={event => {
              if (event.pointerType !== 'touch') engineRef.current?.hover(index, true);
            }}
            onPointerMove={event => point(index, event)}
            onPointerLeave={() => engineRef.current?.hover(index, false)}
            onPointerDown={() => engineRef.current?.press(index, true)}
            onPointerUp={() => engineRef.current?.press(index, false)}
            onPointerCancel={() => engineRef.current?.press(index, false)}
            onFocus={event => {
              if (focusVisible(event.currentTarget)) engineRef.current?.hover(index, true);
            }}
            onBlur={() => engineRef.current?.hover(index, false)}
          >
            {flat ? (
              <span className="oy-glass-icons__plate" aria-hidden="true" />
            ) : (
              <span
                ref={element => {
                  glassRefs.current[index] = element;
                }}
                className="oy-glass-icons__glass"
                aria-hidden="true"
              />
            )}
            <span
              key={flat ? 'face-flat' : 'face-glass'}
              ref={element => {
                faceRefs.current[index] = flat ? null : element;
              }}
              className="oy-glass-icons__face"
              aria-hidden="true"
            >
              <span className="oy-glass-icons__glyph">{item.icon}</span>
            </span>
            {labelMode !== 'none' && (
              <span
                key={flat ? 'label-flat' : 'label-glass'}
                ref={element => {
                  labelRefs.current[index] = flat ? null : element;
                }}
                className="oy-glass-icons__label"
                aria-hidden="true"
              >
                {item.label}
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
};

export default GlassIcons;
