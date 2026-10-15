// Ficha profesional: conversión entre lo que edita el trabajador y lo que ve el contratante
// (OFY-01..06, OFY-09, OFY-57, OFY-67)

import type {
  RateUnit,
  TradeCategory,
  User,
  WeekDay,
  WeeklyAvailability,
  Worker,
  WorkerSchedule,
  WorkerServiceProfile
} from '../types';

export const TRADE_LABELS: Record<TradeCategory, string> = {
  plomeria: 'Plomería',
  electricidad: 'Electricidad',
  pintura: 'Pintura',
  cerrajeria: 'Cerrajería',
  electrodomesticos: 'Electrodomésticos',
  computacion: 'Computación',
  hogar: 'Hogar y reparaciones',
  mascotas: 'Cuidado de mascotas',
  aseo: 'Aseo profundo',
  jardineria: 'Jardinería',
  albanileria: 'Albañilería',
  clases: 'Clases particulares'
};

export const RATE_UNITS: { id: RateUnit; label: string; short: string }[] = [
  { id: 'hora', label: 'Por hora', short: 'h' },
  { id: 'visita', label: 'Por visita', short: 'visita' },
  { id: 'm2', label: 'Por metro cuadrado', short: 'm²' },
  { id: 'servicio', label: 'Por servicio completo', short: 'servicio' }
];

/** Sufijo corto de la unidad de cobro: "h", "visita", "m²"... */
export const rateUnitShort = (unit?: RateUnit) =>
  RATE_UNITS.find(u => u.id === (unit ?? 'hora'))?.short ?? 'h';

/** Motivo con el que se oculta del directorio una ficha recién creada y sin oficios. */
export const PROFILE_INCOMPLETE_REASON = 'Perfil en construcción: aún no registra su primer oficio.';

export const WEEK_DAYS: { key: WeekDay; label: string }[] = [
  { key: 'lun', label: 'Lunes' },
  { key: 'mar', label: 'Martes' },
  { key: 'mie', label: 'Miércoles' },
  { key: 'jue', label: 'Jueves' },
  { key: 'vie', label: 'Viernes' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' }
];

const DAY_ORDER: WeekDay[] = WEEK_DAYS.map(d => d.key);

export const DEFAULT_WEEK: WeeklyAvailability = {
  lun: { active: true, from: '08:00', to: '18:00' },
  mar: { active: true, from: '08:00', to: '18:00' },
  mie: { active: true, from: '08:00', to: '18:00' },
  jue: { active: true, from: '08:00', to: '18:00' },
  vie: { active: true, from: '08:00', to: '18:00' },
  sab: { active: true, from: '08:00', to: '13:00' },
  dom: { active: false, from: '09:00', to: '12:00' }
};

const DAY_WORDS: [RegExp, WeekDay][] = [
  [/lunes/, 'lun'],
  [/martes/, 'mar'],
  [/mi[eé]rcoles/, 'mie'],
  [/jueves/, 'jue'],
  [/viernes/, 'vie'],
  [/s[aá]bado/, 'sab'],
  [/domingo/, 'dom']
];

/** Días que nombra un rótulo como "Lunes a Viernes", "Sábados" o "Todos los días". */
const daysFromLabel = (label: string): WeekDay[] => {
  const text = label.toLowerCase();
  if (text.includes('todos')) return DAY_ORDER;
  const found = DAY_WORDS.filter(([re]) => re.test(text)).map(([, d]) => d);
  if (found.length === 2 && /\sa\s/.test(text)) {
    const start = DAY_ORDER.indexOf(found[0]);
    const end = DAY_ORDER.indexOf(found[1]);
    return DAY_ORDER.slice(start, end + 1);
  }
  return found;
};

/** Convierte la agenda en texto sembrada en una semana editable. */
export const weekFromSchedule = (schedule: WorkerSchedule[]): WeeklyAvailability => {
  if (schedule.length === 0) return DEFAULT_WEEK;
  const week: WeeklyAvailability = {
    lun: { ...DEFAULT_WEEK.lun, active: false },
    mar: { ...DEFAULT_WEEK.mar, active: false },
    mie: { ...DEFAULT_WEEK.mie, active: false },
    jue: { ...DEFAULT_WEEK.jue, active: false },
    vie: { ...DEFAULT_WEEK.vie, active: false },
    sab: { ...DEFAULT_WEEK.sab, active: false },
    dom: { ...DEFAULT_WEEK.dom, active: false }
  };
  schedule.forEach(entry => {
    const times = entry.slots.join(' ').match(/\d{1,2}:\d{2}/g) ?? [];
    const allDay = entry.slots.some(s => /24/.test(s));
    const from = allDay ? '00:00' : times[0] ?? '08:00';
    const to = allDay ? '23:59' : times[times.length - 1] ?? '18:00';
    daysFromLabel(entry.day).forEach(d => {
      week[d] = { active: true, from: from.padStart(5, '0'), to: to.padStart(5, '0') };
    });
  });
  return week;
};

/** Agenda legible para el perfil público: agrupa días seguidos con el mismo horario. */
export const scheduleFromWeek = (week: WeeklyAvailability): WorkerSchedule[] => {
  const out: WorkerSchedule[] = [];
  let i = 0;
  while (i < DAY_ORDER.length) {
    const day = week[DAY_ORDER[i]];
    if (!day.active) {
      i += 1;
      continue;
    }
    let j = i;
    while (
      j + 1 < DAY_ORDER.length &&
      week[DAY_ORDER[j + 1]].active &&
      week[DAY_ORDER[j + 1]].from === day.from &&
      week[DAY_ORDER[j + 1]].to === day.to
    ) {
      j += 1;
    }
    const first = WEEK_DAYS[i].label;
    const last = WEEK_DAYS[j].label;
    out.push({ day: i === j ? first : `${first} a ${last}`, slots: [`${day.from} - ${day.to}`] });
    i = j + 1;
  }
  return out;
};

const unique = <T,>(items: T[]) => Array.from(new Set(items));

/**
 * Campos del trabajador que dependen de sus oficios: el primero es el principal (OFY-02),
 * el resto son secundarios (OFY-03); tarifa, zonas y detalles salen de ahí.
 */
export const workerPatchFromServices = (
  worker: Worker,
  services: WorkerServiceProfile[]
): Partial<Worker> => {
  const primary = services[0];
  if (!primary) return { services };
  const zones = unique(services.flatMap(s => s.coverageZones).filter(Boolean));
  const listOrUndefined = (values: string[]) => (values.length > 0 ? values : undefined);
  const wasIncomplete = worker.isPaused && worker.pauseReason === PROFILE_INCOMPLETE_REASON;
  return {
    services,
    trade: primary.trade,
    tradeLabel: primary.tradeLabel,
    secondaryTrades: unique(services.slice(1).map(s => s.trade).filter(t => t !== primary.trade)),
    hourlyRate: primary.hourlyRate,
    rateUnit: primary.rateUnit ?? 'hora',
    maxDistanceKm: Math.max(0, ...services.map(s => s.maxDistanceKm ?? 0)) || undefined,
    bio: primary.bio || worker.bio,
    location: {
      ...worker.location,
      zoneName: zones.length > 0 ? zones.join(' / ') : worker.location.zoneName
    },
    specializations: listOrUndefined(unique(services.flatMap(s => s.specializations ?? []))),
    equipment: listOrUndefined(unique(services.flatMap(s => s.equipment ?? []))),
    brands: listOrUndefined(unique(services.flatMap(s => s.brands ?? []))),
    species: listOrUndefined(unique(services.flatMap(s => s.species ?? []))),
    ...(wasIncomplete ? { isPaused: false, pauseReason: undefined } : {})
  };
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || 'OY';

/** Ficha profesional vacía para una cuenta que entra como Profesional por primera vez (OFY-01). */
export const createWorkerForUser = (user: User): Worker => {
  const initials = initialsOf(user.name);
  return {
    id: `w-${user.id}`,
    ownerUserId: user.id,
    name: user.name,
    initials,
    avatarColor: user.avatarColor ?? 'var(--oy-azul-marino)',
    photoUrl: user.avatarUrl,
    trade: 'hogar',
    tradeLabel: 'Perfil en construcción',
    secondaryTrades: [],
    rating: 0,
    reviewCount: 0,
    completedJobsCount: 0,
    verified: false,
    available: false,
    hourlyRate: 0,
    rateUnit: 'hora',
    responseTime: '< 30 min',
    location: {
      lat: 4.6768,
      lng: -74.0482,
      zoneName: user.city ?? 'Bogotá D.C.',
      address: ''
    },
    gallery: [],
    schedule: scheduleFromWeek(DEFAULT_WEEK),
    weeklyAvailability: DEFAULT_WEEK,
    reviews: [],
    bio: '',
    phone: user.phone ?? '',
    services: [],
    ratingByTrade: {},
    acceptedPaymentMethods: ['efectivo', 'nequi'],
    isPaused: true,
    pauseReason: PROFILE_INCOMPLETE_REASON,
    referrals: {
      code: `${initials}-${user.id.slice(-4).toUpperCase()}`,
      count: 0,
      distinctTradesCount: 0,
      isCommunityReferrer: false,
      referredList: []
    },
    identityVerification: { status: 'none' }
  };
};

const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/** Ficha sin dueño cuyo nombre coincide con la cuenta (p. ej. "Mateo Gómez" ↔ w-1). */
export const findUnclaimedWorkerByName = (workers: Worker[], name: string) =>
  workers.find(w => !w.ownerUserId && normalize(w.name) === normalize(name));
