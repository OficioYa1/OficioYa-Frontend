import React, { useState, useMemo, useEffect } from 'react';
import type { Worker, TradeCategory } from '../../types';
import type { Coordinates } from '../../utils/geo';
import { calculateHaversineDistance, formatDistance, FALLBACK_LOCATION_BOGOTA } from '../../utils/geo';
import {
  Search,
  Star,
  MapPin,
  Zap,
  Wrench,
  Paintbrush,
  Key,
  Tv,
  Laptop,
  Home,
  Dog,
  Sparkles,
  Trees,
  Hammer,
  GraduationCap,
  X,
  BookOpen,
  ArrowUpDown,
  Calendar,
  DollarSign,
  AlertCircle,
  SlidersHorizontal,
  Navigation,
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { SquishSwitch } from '../../components/ui/SquishSwitch';
import { GlassIcons } from '../../components/ui/GlassIcons';
import type { GlassIconsColor } from '../../components/ui/GlassIcons';
import { ProfileCard } from '../../components/ui/ProfileCard';
import { PageHero } from '../../components/layout/PageHero';
import './Seeker.css';

type SortKey = 'distancia' | 'reputacion' | 'precio' | 'trabajos';
type TimeSlot = 'manana' | 'tarde' | 'noche';

/** Más allá de esta distancia de Bogotá se usa el centro de la ciudad como origen. */
const MAX_DISTANCE_FROM_BOGOTA_KM = 60;

/** Minúsculas y sin tildes, para comparar texto libre. */
const normalizeText = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// RF-15: franjas horarias (horas en formato 24 h, [inicio, fin))
const TIME_SLOTS: { id: TimeSlot; label: string; hint: string; range: [number, number] }[] = [
  { id: 'manana', label: 'Mañana', hint: '6:00 a 12:00', range: [6, 12] },
  { id: 'tarde', label: 'Tarde', hint: '12:00 a 18:00', range: [12, 18] },
  { id: 'noche', label: 'Noche', hint: '18:00 a 22:00', range: [18, 22] }
];

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

/** Convierte "Lunes a Viernes", "Sábados", "Todos los días"… en índices de día (0 = domingo). */
const parseScheduleDays = (day: string): Set<number> => {
  const text = normalizeText(day);
  if (text.includes('todos los dias') || text.includes('toda la semana')) return new Set([0, 1, 2, 3, 4, 5, 6]);
  const found: number[] = [];
  const re = /(domingo|lunes|martes|miercoles|jueves|viernes|sabado)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) found.push(WEEKDAYS.indexOf(m[1]));
  if (found.length === 2 && /\s(a|al|hasta)\s/.test(text)) {
    const days = new Set<number>();
    for (let d = found[0]; ; d = (d + 1) % 7) {
      days.add(d);
      if (d === found[1]) break;
    }
    return days;
  }
  if (text.includes('fines de semana')) found.push(0, 6);
  return new Set(found);
};

/** Convierte "08:00 - 12:00" o "24 Horas" en un rango de horas [inicio, fin). */
const parseSlotRange = (slot: string): [number, number] | null => {
  const text = normalizeText(slot);
  if (text.includes('24 horas') || text.includes('24/7')) return [0, 24];
  const times = [...text.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/g)]
    .map(t => {
      let h = parseInt(t[1], 10) + (t[2] ? parseInt(t[2], 10) / 60 : 0);
      if (t[3] === 'pm' && h < 12) h += 12;
      if (t[3] === 'am' && h >= 12) h -= 12;
      return h;
    })
    .filter(h => h >= 0 && h <= 24);
  if (times.length < 2) return null;
  const [start, end] = times;
  return end > start ? [start, end] : [start, end + 24];
};

/** ¿La agenda publicada cubre ese día de la semana y esa franja? */
const scheduleCovers = (schedule: Worker['schedule'], weekday: number | null, slot: TimeSlot | null) => {
  const slotRange = slot ? TIME_SLOTS.find(t => t.id === slot)!.range : null;
  return schedule.some(entry => {
    if (weekday !== null && !parseScheduleDays(entry.day).has(weekday)) return false;
    if (!slotRange) return true;
    return entry.slots.some(s => {
      const range = parseSlotRange(s);
      return range !== null && range[0] < slotRange[1] && range[1] > slotRange[0];
    });
  });
};

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDateLabel = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });

const FEATURED_TRADES: { id: TradeCategory; color: GlassIconsColor }[] = [
  { id: 'electricidad', color: 'amarillo' },
  { id: 'plomeria', color: 'marino' },
  { id: 'pintura', color: 'fuego' },
  { id: 'cerrajeria', color: 'many' },
  { id: 'hogar', color: 'esmeralda' },
  { id: 'aseo', color: 'almendra' }
];

const useWideLayout = () => {
  const query = '(min-width: 768px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return wide;
};

interface SeekerDirectoryProps {
  workers: Worker[];
  userLocation: Coordinates;
  onSelectWorker: (worker: Worker) => void;
  onOpenSendRequest: (selectedWorkers?: Worker[]) => void;
  onChangeTradeCategory: (trade?: TradeCategory) => void;
  /** Muestra la banda PageHero propia (la vista de inicio la oculta porque trae la suya). */
  showHero?: boolean;
}

export const CATEGORIES: { id: TradeCategory; label: string; icon: React.ReactNode; avgRate: number; description: string; sampleTasks: string[] }[] = [
  {
    id: 'electricidad',
    label: 'Electricidad',
    icon: <Zap size={16} />,
    avgRate: 45000,
    description: 'Instalaciones residenciales, cortocircuitos, breakers, cableado estructurado e iluminación.',
    sampleTasks: ['Reparar cortocircuito', 'Instalar lámparas LED', 'Cambio de tablero eléctrico', 'Puntos 110V y 220V']
  },
  {
    id: 'plomeria',
    label: 'Plomería',
    icon: <Wrench size={16} />,
    avgRate: 40000,
    description: 'Detección de fugas no visibles, destape de cañerías, griferías, motobombas y calentadores.',
    sampleTasks: ['Arreglar gotera / filtración', 'Destape de sifón con sonda', 'Cambio de grifería', 'Instalación de calentador']
  },
  {
    id: 'pintura',
    label: 'Pintura',
    icon: <Paintbrush size={16} />,
    avgRate: 35000,
    description: 'Pintura de interiores y fachadas, estuco veneciano, impermeabilización y resanes.',
    sampleTasks: ['Pintar apartamento', 'Tratamiento antihumedad', 'Estucado fino', 'Impermeabilizar terraza']
  },
  {
    id: 'cerrajeria',
    label: 'Cerrajería',
    icon: <Key size={16} />,
    avgRate: 50000,
    description: 'Aperturas de emergencia 24/7, cambio de guardas, cerraduras digitales y cantoneras.',
    sampleTasks: ['Apertura de puerta sin daño', 'Cambio de cerradura', 'Instalar chapa digital', 'Llaves con chip']
  },
  {
    id: 'electrodomesticos',
    label: 'Electrodomésticos',
    icon: <Tv size={16} />,
    avgRate: 48000,
    description: 'Reparación y mantenimiento de neveras, lavadoras, secadoras, hornos y calentadores.',
    sampleTasks: ['Nevera no enfría', 'Lavadora bota agua / no centrifuga', 'Carga de gas refrigerante', 'Repuestos originales']
  },
  {
    id: 'computacion',
    label: 'Computación',
    icon: <Laptop size={16} />,
    avgRate: 40000,
    description: 'Mantenimiento de PC/Mac, redes Wi-Fi Mesh, formateo, repotenciación SSD y virus.',
    sampleTasks: ['Optimizar Wi-Fi de casa', 'Formatear y respaldar datos', 'Cambio de disco a SSD', 'Eliminación de virus']
  },
  {
    id: 'hogar',
    label: 'Hogar & Reparaciones',
    icon: <Home size={16} />,
    avgRate: 35000,
    description: 'Instalación de repisas, cortinas, cortineros, soportes de TV y pequeñas refacciones.',
    sampleTasks: ['Instalar soporte de TV', 'Colgar cuadros y cortinas', 'Armar muebles modulares', 'Ajuste de puertas']
  },
  {
    id: 'mascotas',
    label: 'Mascotas',
    icon: <Dog size={16} />,
    avgRate: 35000,
    description: 'Peluquería canina y felina a domicilio, paseos diarios, guardería y baño.',
    sampleTasks: ['Baño y corte a domicilio', 'Paseo canino estructurado', 'Cuidado durante viajes', 'Corte de uñas']
  },
  {
    id: 'aseo',
    label: 'Aseo & Limpieza',
    icon: <Sparkles size={16} />,
    avgRate: 32000,
    description: 'Aseo profundo pos-mudanza, lavado de muebles y tapetes a vapor, limpieza por días.',
    sampleTasks: ['Aseo general por horas', 'Lavado de sofás con vapor', 'Aseo pos-obra', 'Desinfección de colchones']
  },
  {
    id: 'jardineria',
    label: 'Jardinería',
    icon: <Trees size={16} />,
    avgRate: 30000,
    description: 'Corte de césped, poda de setos, diseño de jardineras, abono y control de plagas.',
    sampleTasks: ['Poda de prado con guadaña', 'Poda ornamental de setos', 'Abono y fertilización', 'Fumigación de plagas']
  },
  {
    id: 'albanileria',
    label: 'Albañilería',
    icon: <Hammer size={16} />,
    avgRate: 38000,
    description: 'Enchape cerámico, muros en drywall, resanes, mampostería y pisos.',
    sampleTasks: ['Pegar baldosas de baño', 'Construir muro en drywall', 'Resanar grietas en pared', 'Reparar cielo raso']
  },
  {
    id: 'clases',
    label: 'Clases Particulares',
    icon: <GraduationCap size={16} />,
    avgRate: 40000,
    description: 'Tutorías escolares, matemáticas, inglés, guitarra y preparación para exámenes.',
    sampleTasks: ['Refuerzo de matemáticas', 'Clases de inglés conversacional', 'Guitarra para principiantes', 'Tutoría ICFES']
  }
];

const BOGOTA_ZONES = [
  'Todas las zonas',
  'Chapinero / Chicó',
  'Usaquén / Santa Bárbara',
  'Cedritos / Usaquén',
  'Suba / Niza',
  'Teusaquillo / Galerías',
  'La Candelaria / Centro',
  'Ciudad Salitre / Modelia',
  'Guaymaral / Torca',
  'Antonio Nariño / Restrepo'
];

// Diccionario de interpretación en lenguaje natural (RF-11)
const NLP_DICTIONARY: { keywords: string[]; trade: TradeCategory; label: string; problemTitle: string }[] = [
  {
    keywords: ['gotera', 'fuga', 'agua', 'inund', 'tubo', 'tuberia', 'sifon', 'lavamanos', 'sanitario', 'inodoro', 'desague', 'grifo', 'destape'],
    trade: 'plomeria',
    label: 'Plomería',
    problemTitle: 'Filtración, gotera o problemas hidráulicos'
  },
  {
    keywords: ['corto', 'luz', 'breaker', 'cable', 'apagon', 'enchufe', 'tomacorriente', 'corriente', 'lampara', 'bombillo', 'chispazo'],
    trade: 'electricidad',
    label: 'Electricidad',
    problemTitle: 'Falla eléctrica, breaker o iluminación'
  },
  {
    keywords: ['llave', 'chapa', 'cerradura', 'puerta', 'bloquead', 'trabad', 'candado', 'ganzua'],
    trade: 'cerrajeria',
    label: 'Cerrajería',
    problemTitle: 'Apertura de puerta o cambio de cerradura'
  },
  {
    keywords: ['nevera', 'lavadora', 'secadora', 'congelador', 'enfria', 'centrifuga', 'haceb', 'whirlpool', 'electrodomestico', 'calentador'],
    trade: 'electrodomesticos',
    label: 'Electrodomésticos',
    problemTitle: 'Reparación técnica de electrodoméstico'
  },
  {
    keywords: ['pintar', 'pintura', 'pared', 'estuco', 'humedad pared', 'mancha', 'fachada', 'techo'],
    trade: 'pintura',
    label: 'Pintura',
    problemTitle: 'Pintura arquitectónica o retoque de paredes'
  },
  {
    keywords: ['computador', 'pc', 'laptop', 'wifi', 'internet', 'formatear', 'virus', 'pantalla azul', 'lento'],
    trade: 'computacion',
    label: 'Computación',
    problemTitle: 'Mantenimiento de equipo de cómputo o red Wi-Fi'
  },
  {
    keywords: ['perro', 'gato', 'mascota', 'banar', 'peluqueria canina', 'pasear', 'corte pelo perro'],
    trade: 'mascotas',
    label: 'Mascotas',
    problemTitle: 'Cuidado, baño o paseo de mascota'
  },
  {
    keywords: ['aseo', 'limpieza', 'desinfeccion', 'sofa', 'mueble', 'colchon', 'mudanza'],
    trade: 'aseo',
    label: 'Aseo',
    problemTitle: 'Limpieza profunda o aseo general'
  },
  {
    keywords: ['pasto', 'cesped', 'jardin', 'podar', 'arbol', 'maleza', 'guadana'],
    trade: 'jardineria',
    label: 'Jardinería',
    problemTitle: 'Mantenimiento de zonas verdes o jardín'
  },
  {
    keywords: ['baldosa', 'enchape', 'drywall', 'muro', 'piso', 'cemento', 'resane', 'remodelar'],
    trade: 'albanileria',
    label: 'Albañilería',
    problemTitle: 'Arreglos de albañilería, drywall o enchapes'
  }
];

export const SeekerDirectory: React.FC<SeekerDirectoryProps> = ({
  workers,
  userLocation,
  onSelectWorker,
  onOpenSendRequest,
  onChangeTradeCategory,
  showHero = true
}) => {
  const wideLayout = useWideLayout();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TradeCategory | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('Todas las zonas');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(12);
  const [maxBudgetRate, setMaxBudgetRate] = useState<number>(70000);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [availabilityDay, setAvailabilityDay] = useState<string>('todos');
  const [availabilityDate, setAvailabilityDate] = useState<string>('');
  const [availabilitySlot, setAvailabilitySlot] = useState<TimeSlot | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('distancia');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);

  // RF-11: Detección inteligente en lenguaje natural
  const nlpMatch = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 4) return null;
    const q = normalizeText(searchQuery);
    for (const item of NLP_DICTIONARY) {
      if (item.keywords.some(k => q.includes(k))) {
        return item;
      }
    }
    return null;
  }, [searchQuery]);

  const queryTokens = useMemo(
    () => normalizeText(searchQuery).split(/\s+/).filter(t => t.length > 1),
    [searchQuery]
  );

  // Si el GPS ubica al usuario lejos de Bogotá, las distancias se calculan desde la ciudad
  const isOutsideBogota = useMemo(
    () => calculateHaversineDistance(userLocation, FALLBACK_LOCATION_BOGOTA) > MAX_DISTANCE_FROM_BOGOTA_KM,
    [userLocation]
  );
  const originLocation = isOutsideBogota ? FALLBACK_LOCATION_BOGOTA : userLocation;

  // Distancia Haversine para todos los trabajadores
  const workersWithDistance = useMemo(() => {
    return workers.map(w => {
      const distanceKm = calculateHaversineDistance(originLocation, {
        lat: w.location.lat,
        lng: w.location.lng
      });
      return { ...w, distanceKm };
    });
  }, [workers, originLocation]);

  // RF-70: Filtrado estándar vs Auto-ampliación si no hay resultados en radio inicial
  const { filteredWorkers, isRadiusExpanded, originalRadius } = useMemo(() => {
    const applyFilters = (radiusLimit: number) => {
      return workersWithDistance.filter(w => {
        // Excluir trabajadores pausados automáticamente por bajas calificaciones
        if (w.isPaused) return false;

        // RF-11: si Many interpretó la frase como un oficio, se busca por ese oficio
        // (salvo que el usuario haya elegido otro) en lugar de exigir el texto literal.
        if (nlpMatch) {
          if (!selectedCategory && w.trade !== nlpMatch.trade && !w.secondaryTrades?.includes(nlpMatch.trade)) {
            return false;
          }
        } else if (queryTokens.length > 0) {
          // Texto libre: cada palabra debe aparecer en nombre, oficio, barrio, bio,
          // especializaciones, servicios, marcas o equipos
          const haystack = normalizeText([
            w.name,
            w.tradeLabel,
            w.trade,
            w.location.zoneName,
            w.bio,
            ...(w.specializations ?? []),
            ...(w.equipment ?? []),
            ...(w.brands ?? []),
            ...(w.species ?? []),
            ...(w.services ?? []).flatMap(s => [
              s.tradeLabel,
              s.bio,
              ...(s.specializations ?? []),
              ...(s.equipment ?? []),
              ...(s.brands ?? []),
              ...(s.species ?? [])
            ])
          ].join(' '));
          if (!queryTokens.every(token => haystack.includes(token))) {
            return false;
          }
        }

        // Filtro de categoría principal o secundaria (RF-02, RF-03)
        if (selectedCategory) {
          const hasMain = w.trade === selectedCategory;
          const hasSecondary = w.secondaryTrades?.includes(selectedCategory);
          if (!hasMain && !hasSecondary) return false;
        }

        // Filtro de zona (RF-13)
        if (selectedZone !== 'Todas las zonas') {
          if (!w.location.zoneName.toLowerCase().includes(selectedZone.toLowerCase().split('/')[0].trim())) {
            return false;
          }
        }

        // Filtro de radio (RF-04)
        if (w.distanceKm && w.distanceKm > radiusLimit) {
          return false;
        }

        // Filtro de tarifa aproximada (RF-14)
        if (w.hourlyRate > maxBudgetRate) {
          return false;
        }

        // Filtro de calificación mínima (RF-16)
        if (minRating > 0 && w.rating < minRating) {
          return false;
        }

        // Solo disponibles YA (RF-32)
        if (onlyAvailable && !w.available) {
          return false;
        }

        // Filtro de disponibilidad semanal (RF-15)
        if (availabilityDay === 'fines_semana') {
          const hasWeekend = w.schedule.some(s => s.day.toLowerCase().includes('sábado') || s.day.toLowerCase().includes('domingo') || s.day.toLowerCase().includes('todos los días'));
          if (!hasWeekend) return false;
        }

        // RF-15: fecha y franja solicitadas contra la agenda publicada
        if (availabilityDate || availabilitySlot) {
          const weekday = availabilityDate ? new Date(`${availabilityDate}T12:00:00`).getDay() : null;
          if (!scheduleCovers(w.schedule ?? [], weekday, availabilitySlot)) return false;
        }

        return true;
      });
    };

    let results = applyFilters(maxRadiusKm);
    let expanded = false;

    // RF-70: Ampliación progresiva si 0 resultados en el radio seleccionado
    if (results.length === 0 && maxRadiusKm < 25) {
      const expandedResults = applyFilters(25);
      if (expandedResults.length > 0) {
        results = expandedResults;
        expanded = true;
      }
    }

    // Ordenamiento (RF-17 y RF-18)
    results.sort((a, b) => {
      if (sortBy === 'distancia') {
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      }
      if (sortBy === 'reputacion') {
        // Fórmula de reputación ponderada: calificación * 10 + log(reviewCount)
        const repA = a.rating * 10 + (a.reviewCount || 0) * 0.5 + (a.completedJobsCount || 0) * 0.2;
        const repB = b.rating * 10 + (b.reviewCount || 0) * 0.5 + (b.completedJobsCount || 0) * 0.2;
        return repB - repA;
      }
      if (sortBy === 'precio') {
        return a.hourlyRate - b.hourlyRate;
      }
      if (sortBy === 'trabajos') {
        return (b.completedJobsCount || 0) - (a.completedJobsCount || 0);
      }
      return 0;
    });

    return {
      filteredWorkers: results,
      isRadiusExpanded: expanded,
      originalRadius: maxRadiusKm
    };
  }, [
    workersWithDistance,
    nlpMatch,
    queryTokens,
    selectedCategory,
    selectedZone,
    maxRadiusKm,
    maxBudgetRate,
    minRating,
    onlyAvailable,
    availabilityDay,
    availabilityDate,
    availabilitySlot,
    sortBy
  ]);

  const handleCategoryChange = (val: string) => {
    if (val === 'todos') {
      setSelectedCategory(null);
      onChangeTradeCategory(undefined);
    } else {
      setSelectedCategory(val as TradeCategory);
      onChangeTradeCategory(val as TradeCategory);
    }
  };

  const removeFilter = (filterKey: string) => {
    if (filterKey === 'category') {
      setSelectedCategory(null);
      onChangeTradeCategory(undefined);
    }
    if (filterKey === 'zone') setSelectedZone('Todas las zonas');
    if (filterKey === 'radius') setMaxRadiusKm(12);
    if (filterKey === 'budget') setMaxBudgetRate(70000);
    if (filterKey === 'rating') setMinRating(0);
    if (filterKey === 'available') setOnlyAvailable(false);
    if (filterKey === 'nlp') setSearchQuery('');
    if (filterKey === 'date') setAvailabilityDate('');
    if (filterKey === 'slot') setAvailabilitySlot(null);
  };

  const resetAllFilters = () => {
    setSelectedCategory(null);
    onChangeTradeCategory(undefined);
    setSelectedZone('Todas las zonas');
    setMaxRadiusKm(15);
    setMaxBudgetRate(70000);
    setMinRating(0);
    setOnlyAvailable(false);
    setAvailabilityDay('todos');
    setAvailabilityDate('');
    setAvailabilitySlot(null);
    setSearchQuery('');
  };

  // Cierre de modales con Escape (soporte de teclado)
  useEffect(() => {
    if (!showFilterModal && !showCatalogModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowFilterModal(false);
        setShowCatalogModal(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showFilterModal, showCatalogModal]);

  const hasAdvancedFilters =
    selectedZone !== 'Todas las zonas' || maxBudgetRate < 70000 || minRating > 0 || onlyAvailable ||
    Boolean(availabilityDate) || Boolean(availabilitySlot);
  const hasActiveFilters =
    Boolean(selectedCategory) || hasAdvancedFilters || maxRadiusKm !== 12 || availabilityDay !== 'todos';
  const nlpApplied = Boolean(nlpMatch) && selectedCategory === nlpMatch?.trade;
  const selectedCategoryLabel = CATEGORIES.find(c => c.id === selectedCategory)?.label;

  const SORT_OPTIONS: { value: SortKey; label: string; icon: React.ReactNode }[] = [
    { value: 'distancia', label: 'Más cercanos', icon: <MapPin size={14} /> },
    { value: 'reputacion', label: 'Mejor reputación', icon: <Star size={14} /> },
    { value: 'precio', label: 'Menor tarifa', icon: <DollarSign size={14} /> },
    { value: 'trabajos', label: 'Más trabajos', icon: <Hammer size={14} /> }
  ];

  return (
    <div className="seeker-directory">
      {showHero && (
        <PageHero
          tone="marino"
          eyebrow={<><MapPin size={14} aria-hidden="true" /> Directorio en Bogotá D.C.</>}
          title={<>Encuentra a tu<br />experto</>}
          subtitle="Profesionales verificados cerca de ti, ordenados por distancia y reputación real."
          stickers={[
            { icon: <Zap size={26} />, tone: 'amarillo', style: { top: '14%', right: '6%', rotate: '-10deg' } },
            { icon: <Wrench size={26} />, tone: 'esmeralda', style: { top: '46%', right: '15%', rotate: '8deg' } },
            { icon: <Paintbrush size={26} />, tone: 'fuego', style: { top: '12%', right: '24%', rotate: '6deg' } },
            { icon: <>4.8 ★</>, tone: 'blanco', pill: true, style: { bottom: '14%', right: '5%', rotate: '-4deg' } }
          ]}
        />
      )}

      {/* Buscador en píldora + accesos rápidos */}
      <div className="seeker-toolbar">
        <div className="seeker-search">
          <Search size={20} className="seeker-search__icon" aria-hidden="true" />
          <input
            type="text"
            className="seeker-search__input"
            placeholder="¿Qué necesitas solucionar?"
            aria-label="Buscar por problema, oficio, nombre o barrio"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="oy-icon-btn seeker-search__clear"
              onClick={() => setSearchQuery('')}
              aria-label="Borrar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="seeker-toolbar__actions">
          <button type="button" onClick={() => setShowCatalogModal(true)} className="btn btn-secondary seeker-toolbar__btn">
            <BookOpen size={16} aria-hidden="true" /> Oficios
          </button>
          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            className="btn btn-secondary seeker-toolbar__btn"
            aria-label={hasAdvancedFilters ? 'Filtros (hay filtros activos)' : 'Filtros'}
          >
            <SlidersHorizontal size={16} aria-hidden="true" /> Filtros
            {hasAdvancedFilters && <span className="seeker-dot" aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => onOpenSendRequest()} className="btn btn-primary seeker-toolbar__btn">
            Solicitar
          </button>
        </div>
      </div>

      {/* Búsqueda libre interpretada por Many (RF-11) */}
      {nlpMatch && (
        <div className="seeker-nlp" role="status">
          <div className="seeker-nlp__text">
            <MascotAvatar trade={nlpMatch.trade} size="sm" />
            <div>
              <span className="seeker-nlp__title">
                Búsqueda Inteligente: Interpretamos tu consulta como "{nlpMatch.label}"
              </span>
              <span className="seeker-nlp__sub">
                {nlpMatch.problemTitle} en Bogotá D.C.
                {selectedCategory && selectedCategory !== nlpMatch.trade
                  ? ` · Mostrando ${CATEGORIES.find(c => c.id === selectedCategory)?.label ?? 'el oficio elegido'} porque lo elegiste.`
                  : ''}
              </span>
            </div>
          </div>
          <div className="seeker-nlp__actions">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(nlpMatch.trade);
                onChangeTradeCategory(nlpMatch.trade);
              }}
              className="btn btn-primary seeker-btn-sm"
              aria-pressed={nlpApplied}
            >
              {nlpApplied ? `Filtrando por ${nlpMatch.label}` : `Filtrar por ${nlpMatch.label}`}
            </button>
            <button
              type="button"
              className="oy-icon-btn"
              onClick={() => removeFilter('nlp')}
              aria-label="Descartar sugerencia"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Oficios más buscados (RF-12) */}
      <section className="seeker-featured" aria-labelledby="seeker-featured-title">
        <h2 id="seeker-featured-title" className="seeker-featured__title">Oficios más buscados</h2>
        <GlassIcons
          ariaLabel="Oficios más buscados"
          columns={wideLayout ? 6 : 3}
          gap={wideLayout ? 48 : 28}
          items={FEATURED_TRADES.map(({ id, color }) => {
            const category = CATEGORIES.find(c => c.id === id)!;
            return { icon: category.icon, label: category.label, color, onClick: () => handleCategoryChange(id) };
          })}
        />
      </section>

      {/* Oficios en chips (RF-12) */}
      <div className="seeker-chip-row" role="group" aria-label="Filtrar por oficio">
        <button
          type="button"
          className="oy-chip"
          aria-pressed={!selectedCategory}
          onClick={() => handleCategoryChange('todos')}
        >
          <Search size={14} aria-hidden="true" /> Todos los oficios
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            type="button"
            className="oy-chip"
            aria-pressed={selectedCategory === c.id}
            onClick={() => handleCategoryChange(c.id)}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Orden (RF-17, RF-18) y disponibilidad inmediata (RF-32) */}
      <div className="seeker-sortbar">
        <div className="seeker-sortbar__group" role="group" aria-label="Ordenar resultados">
          <span className="oy-label seeker-sortbar__label">
            <ArrowUpDown size={14} aria-hidden="true" /> Ordenar
          </span>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              className="oy-chip"
              aria-pressed={sortBy === opt.value}
              onClick={() => setSortBy(opt.value)}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
        <div className="seeker-available-toggle">
          <span>Disponibles ya</span>
          <SquishSwitch
            checked={onlyAvailable}
            onChange={setOnlyAvailable}
            ariaLabel="Solo profesionales disponibles ahora"
            trackOnColor="var(--oy-verde-esmeralda)"
          />
        </div>
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="seeker-active-filters" aria-label="Filtros activos">
          <span className="oy-label seeker-sortbar__label">Filtros</span>
          {selectedCategory && (
            <button type="button" className="seeker-tag seeker-tag--marino" onClick={() => removeFilter('category')} aria-label={`Quitar filtro de oficio ${selectedCategoryLabel}`}>
              Oficio: {selectedCategoryLabel} <X size={12} aria-hidden="true" />
            </button>
          )}
          {selectedZone !== 'Todas las zonas' && (
            <button type="button" className="seeker-tag" onClick={() => removeFilter('zone')} aria-label={`Quitar filtro de zona ${selectedZone}`}>
              Zona: {selectedZone} <X size={12} aria-hidden="true" />
            </button>
          )}
          {maxRadiusKm !== 12 && (
            <button type="button" className="seeker-tag" onClick={() => removeFilter('radius')} aria-label="Quitar filtro de radio">
              Radio {maxRadiusKm} km <X size={12} aria-hidden="true" />
            </button>
          )}
          {maxBudgetRate < 70000 && (
            <button type="button" className="seeker-tag" onClick={() => removeFilter('budget')} aria-label="Quitar filtro de tarifa">
              Hasta ${maxBudgetRate.toLocaleString()} COP/h <X size={12} aria-hidden="true" />
            </button>
          )}
          {minRating > 0 && (
            <button type="button" className="seeker-tag seeker-tag--amarillo" onClick={() => removeFilter('rating')} aria-label="Quitar filtro de calificación">
              {minRating}+ estrellas <X size={12} aria-hidden="true" />
            </button>
          )}
          {availabilityDay === 'fines_semana' && (
            <button type="button" className="seeker-tag" onClick={() => setAvailabilityDay('todos')} aria-label="Quitar filtro de fines de semana">
              Sábados y Domingos <X size={12} aria-hidden="true" />
            </button>
          )}
          {availabilityDate && (
            <button type="button" className="seeker-tag" onClick={() => removeFilter('date')} aria-label={`Quitar filtro de fecha ${formatDateLabel(availabilityDate)}`}>
              Disponible el {formatDateLabel(availabilityDate)} <X size={12} aria-hidden="true" />
            </button>
          )}
          {availabilitySlot && (
            <button type="button" className="seeker-tag" onClick={() => removeFilter('slot')} aria-label="Quitar filtro de franja horaria">
              En la {TIME_SLOTS.find(t => t.id === availabilitySlot)?.label.toLowerCase()} <X size={12} aria-hidden="true" />
            </button>
          )}
          {onlyAvailable && (
            <button type="button" className="seeker-tag seeker-tag--esmeralda" onClick={() => removeFilter('available')} aria-label="Quitar filtro de solo disponibles">
              ● Solo disponibles YA <X size={12} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/* GPS fuera de Bogotá: distancias desde la ciudad */}
      {isOutsideBogota && (
        <p className="seeker-geo-note" role="status">
          <Navigation size={14} aria-hidden="true" />
          Tu ubicación está a más de {MAX_DISTANCE_FROM_BOGOTA_KM} km de Bogotá, así que medimos las distancias desde Chapinero (Bogotá D.C.).
        </p>
      )}

      {/* Ampliación automática de zona (RF-70) */}
      {isRadiusExpanded && (
        <div className="seeker-expanded" role="status">
          <span className="seeker-expanded__icon" aria-hidden="true"><AlertCircle size={20} /></span>
          <p>
            <strong>Zona de búsqueda ampliada automáticamente:</strong> No encontramos profesionales en tu radio inicial de {originalRadius} km.
            Ampliamos la cobertura a 25 km en Bogotá D.C. para mostrarte {filteredWorkers.length} candidatos compatibles.
          </p>
        </div>
      )}

      {/* Encabezado del directorio */}
      <div className="oy-section-head seeker-results-head">
        <div>
          <h2 className="oy-section-title">
            {selectedCategory ? `Profesionales en ${selectedCategoryLabel}` : 'Directorio de Profesionales'}
          </h2>
          <p className="oy-section-sub">{filteredWorkers.length} perfiles disponibles</p>
        </div>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="oy-empty">
          <MascotAvatar size="lg" />
          <h3 className="oy-empty__title">No encontramos profesionales con estos filtros</h3>
          <p className="oy-empty__text">
            Intenta aumentar el presupuesto, seleccionar otra zona o restablecer el oficio para ver más opciones en Bogotá D.C.
          </p>
          <button type="button" onClick={resetAllFilters} className="btn btn-secondary">
            Restablecer todos los filtros
          </button>
        </div>
      ) : (
        <ul className="seeker-directory-grid">
          {filteredWorkers.map(worker => {
            return (
              <li key={worker.id}>
                <ProfileCard
                  name={worker.name}
                  title={worker.tradeLabel}
                  avatarUrl={`https://i.pravatar.cc/300?u=${worker.id}`}
                  initials={worker.initials}
                  avatarColor={worker.avatarColor}
                  available={worker.available}
                  status={worker.available ? 'Disponible' : 'Ocupado'}
                  verified={worker.verified}
                  meta={
                    <span className="seeker-card-meta">
                      <Star size={13} fill="var(--color-star)" color="var(--color-star)" aria-hidden="true" />
                      <strong>{worker.rating.toFixed(1)}</strong>
                      <span aria-hidden="true">·</span>
                      <span>{formatDistance(worker.distanceKm || 0)}</span>
                      <span aria-hidden="true">·</span>
                      <strong>${worker.hourlyRate.toLocaleString()}/h</strong>
                    </span>
                  }
                  contactText="Ver perfil"
                  onContactClick={() => onSelectWorker(worker)}
                  headingLevel={3}
                  frame="almendra"
                  className="seeker-profile-card"
                />
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal de filtros avanzados (RF-13, RF-14, RF-15, RF-16, RF-32) */}
      {showFilterModal && (
        <div className="oy-modal-backdrop" onClick={e => e.target === e.currentTarget && setShowFilterModal(false)}>
          <div className="oy-modal seeker-modal--filters" role="dialog" aria-modal="true" aria-labelledby="seeker-filters-title">
            <div className="oy-modal__head">
              <div>
                <span className="oy-eyebrow"><SlidersHorizontal size={12} aria-hidden="true" /> Afina tu búsqueda</span>
                <h3 id="seeker-filters-title" className="oy-modal__title seeker-modal__title">Filtros avanzados de búsqueda</h3>
              </div>
              <button type="button" className="oy-icon-btn" onClick={() => setShowFilterModal(false)} aria-label="Cerrar filtros">
                <X size={20} />
              </button>
            </div>

            <div className="oy-modal__body seeker-filter-body">
              {/* RF-13: Zona / Barrio */}
              <div className="seeker-field">
                <label htmlFor="seeker-zone" className="seeker-field__label">
                  <MapPin size={14} aria-hidden="true" /> Zona / Localidad en Bogotá
                </label>
                <select
                  id="seeker-zone"
                  className="input-base seeker-select"
                  value={selectedZone}
                  onChange={e => setSelectedZone(e.target.value)}
                >
                  {BOGOTA_ZONES.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              {/* RF-14: Tarifa máxima */}
              <div className="seeker-field">
                <div className="seeker-field__row">
                  <label htmlFor="seeker-budget" className="seeker-field__label">
                    <DollarSign size={14} aria-hidden="true" /> Presupuesto máx. por hora
                  </label>
                  <span className="seeker-field__value">${maxBudgetRate.toLocaleString()} COP/h</span>
                </div>
                <input
                  id="seeker-budget"
                  type="range"
                  min="25000"
                  max="80000"
                  step="5000"
                  value={maxBudgetRate}
                  onChange={e => setMaxBudgetRate(parseInt(e.target.value))}
                  className="slider-custom"
                />
                <div className="seeker-field__scale" aria-hidden="true">
                  <span>$25.000 COP</span>
                  <span>$50.000 COP</span>
                  <span>$80.000 COP</span>
                </div>
              </div>

              {/* Radio de distancia */}
              <div className="seeker-field">
                <div className="seeker-field__row">
                  <label htmlFor="seeker-radius" className="seeker-field__label">Radio de cobertura geográfica</label>
                  <span className="seeker-field__value">{maxRadiusKm} km</span>
                </div>
                <input
                  id="seeker-radius"
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={maxRadiusKm}
                  onChange={e => setMaxRadiusKm(parseFloat(e.target.value))}
                  className="slider-custom"
                />
              </div>

              {/* RF-15: Disponibilidad semanal */}
              <div className="seeker-field">
                <span className="seeker-field__label" id="seeker-days-label">
                  <Calendar size={14} aria-hidden="true" /> Disponibilidad en agenda
                </span>
                <div className="seeker-chip-grid" role="group" aria-labelledby="seeker-days-label">
                  <button type="button" className="oy-chip" aria-pressed={availabilityDay === 'todos'} onClick={() => setAvailabilityDay('todos')}>
                    Cualquier día
                  </button>
                  <button type="button" className="oy-chip" aria-pressed={availabilityDay === 'fines_semana'} onClick={() => setAvailabilityDay('fines_semana')}>
                    Sábados y Domingos
                  </button>
                </div>

                <label htmlFor="seeker-date" className="seeker-field__label seeker-field__label--sub">
                  Fecha en que necesitas el servicio
                </label>
                <div className="seeker-date-row">
                  <input
                    id="seeker-date"
                    type="date"
                    className="input-base seeker-date"
                    min={todayIso()}
                    value={availabilityDate}
                    onChange={e => setAvailabilityDate(e.target.value)}
                    aria-describedby="seeker-date-hint"
                  />
                  {availabilityDate && (
                    <button type="button" className="btn btn-secondary seeker-btn-sm" onClick={() => setAvailabilityDate('')}>
                      Quitar fecha
                    </button>
                  )}
                </div>

                <span className="seeker-field__label seeker-field__label--sub" id="seeker-slot-label">Franja horaria</span>
                <div className="seeker-chip-grid seeker-chip-grid--slots" role="group" aria-labelledby="seeker-slot-label">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      className="oy-chip seeker-slot-chip"
                      aria-pressed={availabilitySlot === slot.id}
                      onClick={() => setAvailabilitySlot(current => (current === slot.id ? null : slot.id))}
                    >
                      <span>{slot.label}</span>
                      <span className="seeker-slot-chip__hint">{slot.hint}</span>
                    </button>
                  ))}
                </div>
                <p id="seeker-date-hint" className="seeker-field__hint">
                  Comparamos el día y la franja con la agenda que publica cada profesional.
                </p>
              </div>

              {/* RF-16: Calificación mínima */}
              <div className="seeker-field">
                <span className="seeker-field__label" id="seeker-rating-label">
                  <Star size={14} aria-hidden="true" /> Calificación mínima del profesional
                </span>
                <div className="seeker-chip-grid seeker-chip-grid--4" role="group" aria-labelledby="seeker-rating-label">
                  {[0, 4.0, 4.5, 4.8].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      className="oy-chip"
                      aria-pressed={minRating === rating}
                      onClick={() => setMinRating(rating)}
                    >
                      {rating === 0 ? 'Todas' : `${rating}+ estrellas`}
                    </button>
                  ))}
                </div>
              </div>

              {/* RF-32: Solo disponibles ya */}
              <div className="seeker-switch-row">
                <div>
                  <span className="seeker-switch-row__title">Disponible ahora</span>
                  <span className="seeker-switch-row__sub">Excluir profesionales que estén fuera de línea</span>
                </div>
                <SquishSwitch
                  checked={onlyAvailable}
                  onChange={setOnlyAvailable}
                  ariaLabel="Solo profesionales disponibles ahora"
                  trackOnColor="var(--oy-verde-esmeralda)"
                />
              </div>

              <div className="seeker-modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedZone('Todas las zonas');
                    setMaxBudgetRate(70000);
                    setMaxRadiusKm(12);
                    setMinRating(0);
                    setOnlyAvailable(false);
                    setAvailabilityDay('todos');
                    setAvailabilityDate('');
                    setAvailabilitySlot(null);
                  }}
                  className="btn btn-secondary"
                >
                  Limpiar
                </button>
                <button type="button" onClick={() => setShowFilterModal(false)} className="btn btn-primary">
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Catálogo de oficios disponibles (RF-77) */}
      {showCatalogModal && (
        <div className="oy-modal-backdrop" onClick={e => e.target === e.currentTarget && setShowCatalogModal(false)}>
          <div className="oy-modal seeker-modal--catalog" role="dialog" aria-modal="true" aria-labelledby="seeker-catalog-title">
            <div className="oy-modal__head">
              <div>
                <span className="oy-eyebrow"><BookOpen size={12} aria-hidden="true" /> 12 categorías</span>
                <h3 id="seeker-catalog-title" className="oy-modal__title seeker-modal__title">Catálogo de Oficios Disponibles</h3>
                <p className="seeker-modal__sub">12 categorías técnicas y asistenciales habilitadas en OficioYa Bogotá</p>
              </div>
              <button type="button" className="oy-icon-btn" onClick={() => setShowCatalogModal(false)} aria-label="Cerrar catálogo">
                <X size={20} />
              </button>
            </div>

            <div className="oy-modal__body">
              <ul className="seeker-catalog-grid">
                {CATEGORIES.map(cat => {
                  const count = workers.filter(w => w.trade === cat.id).length;
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        className="seeker-catalog-card"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          onChangeTradeCategory(cat.id);
                          setShowCatalogModal(false);
                        }}
                      >
                        <span className="seeker-catalog-card__head">
                          <span className="seeker-catalog-card__name">
                            <span className="seeker-catalog-card__icon" aria-hidden="true">{cat.icon}</span>
                            {cat.label}
                          </span>
                          <span className="badge badge-verified seeker-catalog-card__count">
                            {count} {count === 1 ? 'experto' : 'expertos'}
                          </span>
                        </span>
                        <span className="seeker-catalog-card__desc">{cat.description}</span>
                        <span className="seeker-catalog-card__tasks">
                          <strong>Tareas habituales:</strong> {cat.sampleTasks.slice(0, 3).join(', ')}
                        </span>
                        <span className="seeker-catalog-card__foot">
                          <span>Tarifa ref.: ${cat.avgRate.toLocaleString()} COP/h</span>
                          <span className="seeker-catalog-card__cta">Explorar &rarr;</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
