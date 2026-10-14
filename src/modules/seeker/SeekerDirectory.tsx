import React, { useState, useMemo } from 'react';
import type { Worker, TradeCategory } from '../../types';
import type { Coordinates } from '../../utils/geo';
import { calculateHaversineDistance, formatDistance, getProximityStatus } from '../../utils/geo';
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  ChevronRight,
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
  Award
} from 'lucide-react';
import { MascotAvatar } from '../../components/mascot/MascotAvatar';
import { OptionWheel } from '../../components/ui/OptionWheel';

interface SeekerDirectoryProps {
  workers: Worker[];
  userLocation: Coordinates;
  onSelectWorker: (worker: Worker) => void;
  onOpenSendRequest: (selectedWorkers?: Worker[]) => void;
  onChangeTradeCategory: (trade?: TradeCategory) => void;
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
  onChangeTradeCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TradeCategory | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('Todas las zonas');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(12);
  const [maxBudgetRate, setMaxBudgetRate] = useState<number>(70000);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [availabilityDay, setAvailabilityDay] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'distancia' | 'reputacion' | 'precio' | 'trabajos'>('distancia');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);

  // RF-11: Detección inteligente en lenguaje natural
  const nlpMatch = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 4) return null;
    const q = searchQuery.toLowerCase();
    for (const item of NLP_DICTIONARY) {
      if (item.keywords.some(k => q.includes(k))) {
        return item;
      }
    }
    return null;
  }, [searchQuery]);

  // Distancia Haversine para todos los trabajadores
  const workersWithDistance = useMemo(() => {
    return workers.map(w => {
      const distanceKm = calculateHaversineDistance(userLocation, {
        lat: w.location.lat,
        lng: w.location.lng
      });
      return { ...w, distanceKm };
    });
  }, [workers, userLocation]);

  // RF-70: Filtrado estándar vs Auto-ampliación si no hay resultados en radio inicial
  const { filteredWorkers, isRadiusExpanded, originalRadius } = useMemo(() => {
    const applyFilters = (radiusLimit: number) => {
      return workersWithDistance.filter(w => {
        // Excluir trabajadores pausados automáticamente por bajas calificaciones
        if (w.isPaused) return false;

        // Filtro de texto libre (nombre, oficio, barrio, bio, marcas o equipos)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = w.name.toLowerCase().includes(q);
          const matchesTrade = w.tradeLabel.toLowerCase().includes(q) || w.trade.toLowerCase().includes(q);
          const matchesZone = w.location.zoneName.toLowerCase().includes(q);
          const matchesBio = w.bio.toLowerCase().includes(q);
          const matchesEquip = w.equipment?.some(eq => eq.toLowerCase().includes(q));
          const matchesBrands = w.brands?.some(b => b.toLowerCase().includes(q));
          if (!matchesName && !matchesTrade && !matchesZone && !matchesBio && !matchesEquip && !matchesBrands) {
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
    searchQuery,
    selectedCategory,
    selectedZone,
    maxRadiusKm,
    maxBudgetRate,
    minRating,
    onlyAvailable,
    availabilityDay,
    sortBy
  ]);

  // Strip de los 3 disponibles más cercanos
  const top3Closest = useMemo(() => {
    return workersWithDistance.filter(w => w.available && !w.isPaused).slice(0, 3);
  }, [workersWithDistance]);

  const handleWheelChange = (val: string) => {
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
  };

  return (
    <div className="seeker-directory" style={{ padding: '24px 0 60px' }}>
      <div className="container">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              className="input-base"
              placeholder="¿Qué necesitas solucionar?"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '48px', height: '56px', fontSize: '16px', borderRadius: '28px' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowCatalogModal(true)}
              className="btn btn-secondary"
              style={{ height: '56px', padding: '0 20px', borderRadius: '28px', fontSize: '14px' }}
            >
              Oficios
            </button>

            <button
              onClick={() => setShowFilterModal(true)}
              className="btn btn-secondary"
              style={{ height: '56px', padding: '0 20px', borderRadius: '28px', fontSize: '14px' }}
            >
              Filtros
              {(selectedZone !== 'Todas las zonas' || maxBudgetRate < 70000 || minRating > 0 || onlyAvailable) && (
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-text-main)', marginLeft: '8px' }} />
              )}
            </button>

            <button
              onClick={() => onOpenSendRequest()}
              className="btn btn-primary"
              style={{ height: '56px', padding: '0 24px', borderRadius: '28px', fontSize: '14px' }}
            >
              Solicitar
            </button>
          </div>
        </div>

        {/* Banner de Búsqueda Libre / Asistente NLP de Many (RF-11) */}
        {nlpMatch && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.09) 0%, rgba(255, 199, 44, 0.14) 100%)',
              border: '1.5px solid var(--role-primary)',
              borderRadius: '16px',
              padding: '12px 18px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MascotAvatar trade={nlpMatch.trade} size="sm" />
              <div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--role-primary)', display: 'block' }}>
                  Búsqueda Inteligente: Interpretamos tu consulta como "{nlpMatch.label}"
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {nlpMatch.problemTitle} en Bogotá D.C.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setSelectedCategory(nlpMatch.trade);
                  onChangeTradeCategory(nlpMatch.trade);
                }}
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                Filtrar por {nlpMatch.label}
              </button>
              <button
                onClick={() => removeFilter('nlp')}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Selector de Oficios Interactivo (OptionWheel) */}
        <div style={{ marginBottom: '32px' }}>
          <OptionWheel
            options={[
              { value: 'todos', label: 'Todos los oficios', icon: <Search size={20} /> },
              ...CATEGORIES.map(c => ({ value: c.id, label: c.label, icon: c.icon }))
            ]}
            value={selectedCategory || 'todos'}
            onChange={handleWheelChange}
            visibleCount={2}
          />
        </div>

        {/* Barra de Filtros Activos y Ordenamiento */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Filtros:</span>

            {selectedCategory && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--role-primary-light)',
                  color: 'var(--role-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: '1px solid var(--role-primary)'
                }}
              >
                Oficio: {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeFilter('category')} />
              </span>
            )}

            {selectedZone !== 'Todas las zonas' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--color-surface-hover)',
                  color: 'var(--color-text-main)',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: '1px solid var(--color-border)'
                }}
              >
                Zona: {selectedZone}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeFilter('zone')} />
              </span>
            )}

            {maxBudgetRate < 70000 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--color-surface-hover)',
                  color: 'var(--color-text-main)',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: '1px solid var(--color-border)'
                }}
              >
                Hasta ${maxBudgetRate.toLocaleString()} COP/h
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeFilter('budget')} />
              </span>
            )}

            {minRating > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#FEF3C7',
                  color: '#B45309',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '999px'
                }}
              >
                {minRating}+ estrellas
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeFilter('rating')} />
              </span>
            )}

            {onlyAvailable && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--color-success-bg)',
                  color: '#065F46',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '999px'
                }}
              >
                ● Solo disponibles YA
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeFilter('available')} />
              </span>
            )}
          </div>

          {/* Selector de Ordenamiento (RF-17, RF-18) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown size={14} /> Ordenar por:
            </span>
            <select
              className="input-base"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{ fontSize: '12px', padding: '6px 12px', height: '34px', width: 'auto' }}
            >
              <option value="distancia">Distancia (Más cercanos)</option>
              <option value="reputacion">Mayor reputación (Calificación + Reseñas)</option>
              <option value="precio">Tarifa (Menor a mayor)</option>
              <option value="trabajos">Más trabajos completados</option>
            </select>
          </div>
        </div>

        {/* Alerta de Ampliación de Zona Automática (RF-70) */}
        {isRadiusExpanded && (
          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #3B82F6',
              borderRadius: '14px',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#1E3A8A',
              fontSize: '13px'
            }}
          >
            <AlertCircle size={20} color="#2563EB" />
            <div>
              <strong>Zona de búsqueda ampliada automáticamente (RF-70):</strong> No encontramos profesionales en tu radio inicial de {originalRadius} km.
              Ampliamos la cobertura a 25 km en Bogotá D.C. para mostrarte {filteredWorkers.length} candidatos compatibles.
            </div>
          </div>
        )}


        {/* Encabezado del Directorio General */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(150, 150, 150, 0.15)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
              {selectedCategory ? `Profesionales en ${CATEGORIES.find(c => c.id === selectedCategory)?.label}` : 'Directorio de Profesionales'}
            </h2>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {filteredWorkers.length} perfiles disponibles
            </span>
          </div>
        </div>

        {/* Cuadrícula de Tarjetas de Profesionales */}
        {filteredWorkers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}></span>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No encontramos profesionales con estos filtros</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', maxWidth: '440px', margin: '0 auto 16px' }}>
              Intenta aumentar el presupuesto, seleccionar otra zona o restablecer el oficio para ver más opciones en Bogotá D.C.
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedZone('Todas las zonas');
                setMaxRadiusKm(15);
                setMaxBudgetRate(70000);
                setMinRating(0);
                setOnlyAvailable(false);
                setSearchQuery('');
              }}
              className="btn btn-secondary"
            >
              Restablecer todos los filtros
            </button>
          </div>
        ) : (
          <div className="seeker-directory-grid">
            {filteredWorkers.map((worker, index) => {
              const category = CATEGORIES.find(c => c.id === worker.trade);
              
              const organicRadii = [
                '40% 60% 70% 30% / 40% 50% 60% 50%',
                '60% 40% 30% 70% / 60% 30% 70% 40%',
                '50% 50% 20% 80% / 25% 80% 20% 75%',
                '30% 70% 70% 30% / 30% 30% 70% 70%'
              ];
              const shapeRadius = organicRadii[index % organicRadii.length];
              const tagRadius = organicRadii[(index + 2) % organicRadii.length];
              const isEven = index % 2 === 0;

              return (
                <div
                  key={worker.id}
                  onClick={() => onSelectWorker(worker)}
                  className="seeker-worker-row"
                >
                  {/* FOTO PROTAGONISTA */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img 
                      src={`https://i.pravatar.cc/150?u=${worker.id}`} 
                      alt={worker.name}
                      className="seeker-worker-img"
                      style={{
                        width: '110px',
                        height: '110px',
                        objectFit: 'cover',
                        borderRadius: shapeRadius,
                        boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
                      }}
                    />
                    {/* Acento del oficio (icono) integrado sutilmente */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-4px',
                      [isEven ? 'right' : 'left']: '-4px',
                      background: worker.avatarColor,
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {category?.icon}
                    </div>
                  </div>
                  
                  {/* INFORMACIÓN TEXTUAL (Minimizada y enfocada) */}
                  <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    gap: '4px' 
                  }}>
                    {/* Nombre y Disponibilidad */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--color-text)', letterSpacing: '-0.3px' }}>
                        {worker.name}
                      </span>
                      <div 
                        style={{ width: 8, height: 8, borderRadius: '50%', background: worker.available ? '#10B981' : '#EF4444' }} 
                        title={worker.available ? 'Disponible' : 'Ocupado'}
                      />
                    </div>

                    {/* Oficio con color de marca suave */}
                    <span style={{ fontSize: '15px', color: worker.avatarColor, fontWeight: 700, letterSpacing: '0.2px' }}>
                      {worker.tradeLabel}
                    </span>

                    {/* Línea secundaria única: Calificación y Distancia */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      fontSize: '13px',
                      color: 'var(--color-text-muted)',
                      marginTop: '2px'
                    }}>
                      <Star size={13} fill="#FBBF24" color="#FBBF24" style={{ marginTop: '-2px' }} />
                      <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{worker.rating.toFixed(1)}</span>
                      <span style={{ opacity: 0.4 }}>•</span>
                      <span>{formatDistance(worker.distanceKm || 0)}</span>
                    </div>

                    {/* ACCIÓN CONTEXTUAL (Aparece en hover) y PRECIO */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                      <div style={{
                        background: 'var(--color-surface)',
                        border: `1.5px solid ${worker.avatarColor}`,
                        color: worker.avatarColor,
                        padding: '4px 10px',
                        borderRadius: tagRadius,
                        fontWeight: 800,
                        fontSize: '13px',
                        display: 'inline-block'
                      }}>
                        ${worker.hourlyRate.toLocaleString()}/h
                      </div>
                      
                      <div className="seeker-worker-action hide-on-mobile" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--role-primary-light)',
                        color: 'var(--role-primary)'
                      }}>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Filtros Avanzados (RF-13, RF-14, RF-15, RF-16) */}
      {showFilterModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            padding: '16px'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              borderRadius: '24px',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Filtros avanzados de búsqueda</h3>
              <button onClick={() => setShowFilterModal(false)} style={{ color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* RF-13: Filtrar por Zona / Barrio en Bogotá */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <MapPin size={14} /> Zona / Localidad en Bogotá (RF-13)
              </label>
              <select
                className="input-base"
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
              >
                {BOGOTA_ZONES.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            {/* RF-14: Tarifa aproximada máxima */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={14} /> Presupuesto máx. por hora (RF-14)
                </label>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--role-primary)' }}>
                  ${maxBudgetRate.toLocaleString()} COP/h
                </span>
              </div>
              <input
                type="range"
                min="25000"
                max="80000"
                step="5000"
                value={maxBudgetRate}
                onChange={e => setMaxBudgetRate(parseInt(e.target.value))}
                className="slider-custom"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                <span>$25.000 COP</span>
                <span>$50.000 COP</span>
                <span>$80.000 COP</span>
              </div>
            </div>

            {/* Radio de distancia */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700 }}>Radio de cobertura geográfica</label>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--role-primary)' }}>{maxRadiusKm} km</span>
              </div>
              <input
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
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <Calendar size={14} /> Disponibilidad en agenda (RF-15)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAvailabilityDay('todos')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: availabilityDay === 'todos' ? 'var(--role-primary)' : 'var(--color-surface)',
                    color: availabilityDay === 'todos' ? '#FFF' : 'var(--color-text-main)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  Cualquier día
                </button>
                <button
                  type="button"
                  onClick={() => setAvailabilityDay('fines_semana')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: availabilityDay === 'fines_semana' ? 'var(--role-primary)' : 'var(--color-surface)',
                    color: availabilityDay === 'fines_semana' ? '#FFF' : 'var(--color-text-main)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  Sábados y Domingos
                </button>
              </div>
            </div>

            {/* RF-16: Calificación mínima */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                Calificación mínima del profesional (RF-16)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[0, 4.0, 4.5, 4.8].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setMinRating(rating)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: minRating === rating ? '#FEF3C7' : 'var(--color-surface)',
                      color: minRating === rating ? '#B45309' : 'var(--color-text-main)',
                      border: minRating === rating ? '1.5px solid #F59E0B' : '1px solid var(--color-border)'
                    }}
                  >
                    {rating === 0 ? 'Todas' : `${rating}+ estrellas`}
                  </button>
                ))}
              </div>
            </div>

            {/* RF-32: Solo Disponibles Ya */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--color-surface-hover)', borderRadius: '12px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>Disponible ahora (RF-32)</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Excluir profesionales que estén fuera de línea</span>
              </div>
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={e => setOnlyAvailable(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedZone('Todas las zonas');
                  setMaxBudgetRate(70000);
                  setMaxRadiusKm(12);
                  setMinRating(0);
                  setOnlyAvailable(false);
                  setAvailabilityDay('todos');
                }}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Catálogo de Oficios Disponibles (RF-77) */}
      {showCatalogModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            padding: '16px'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '720px',
              borderRadius: '24px',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={20} color="var(--role-primary)" /> Catálogo de Oficios Disponibles (RF-77)
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  12 categorías técnicas y asistenciales habilitadas en OficioYa Bogotá
                </span>
              </div>
              <button onClick={() => setShowCatalogModal(false)} style={{ color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              {CATEGORIES.map(cat => {
                const count = workers.filter(w => w.trade === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      onChangeTradeCategory(cat.id);
                      setShowCatalogModal(false);
                    }}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: '16px',
                      padding: '16px',
                      cursor: 'pointer',
                      background: 'var(--color-surface)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--role-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px' }}>
                        <span style={{ color: 'var(--role-primary)' }}>{cat.icon}</span>
                        {cat.label}
                      </div>
                      <span className="badge badge-verified" style={{ fontSize: '11px' }}>
                        {count} {count === 1 ? 'experto' : 'expertos'}
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                      {cat.description}
                    </p>

                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                      <strong>Tareas habituales:</strong> {cat.sampleTasks.slice(0, 3).join(', ')}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '8px', fontSize: '12px' }}>
                      <span style={{ fontWeight: 700 }}>Tarifa ref.: ${cat.avgRate.toLocaleString()} COP/h</span>
                      <span style={{ color: 'var(--role-primary)', fontWeight: 700 }}>Explorar &rarr;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
