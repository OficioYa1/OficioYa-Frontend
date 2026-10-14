// Datos semilla de trabajadores, servicios, chats y tickets en Bogotá D.C.

import type { Worker, ServiceRequest, Conversation, ChatMessage, ComplaintTicket } from '../types';

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'w-1',
    name: 'Mateo Gómez',
    initials: 'MG',
    avatarColor: '#2563EB',
    trade: 'electricidad',
    tradeLabel: 'Electricista Certificado SENA',
    secondaryTrades: ['computacion'],
    rating: 4.9,
    reviewCount: 38,
    completedJobsCount: 42,
    verified: true,
    available: true,
    hourlyRate: 45000,
    responseTime: '< 15 min',
    bio: 'Técnico electricista SENA con 8 años de experiencia. Reparación de cortocircuitos, cableado residencial, tableros de breakers e iluminación LED.',
    phone: '+57 312 458 9012',
    location: {
      lat: 4.6780,
      lng: -74.0470,
      zoneName: 'Chapinero / Chicó',
      address: 'Calle 93 # 13-25'
    },
    gallery: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop'
    ],
    schedule: [
      { day: 'Lunes a Viernes', slots: ['08:00 - 12:00', '14:00 - 18:00'] },
      { day: 'Sábados', slots: ['09:00 - 14:00'] }
    ],
    // RF-09, RF-66, RF-67: Equipos, marcas, especies, especializaciones
    equipment: ['Multímetro digital Fluke', 'Ponchadora hidráulica', 'Detector de tensión sin contacto', 'Taladro percutor DeWalt'],
    brands: ['Schneider Electric', 'Legrand', 'Bticino', 'Philips', 'Centelsa'],
    specializations: ['Tableros trifásicos', 'Cableado estructurado', 'Automatización domótica', 'Protección contra sobretensiones'],
    // RF-56, RF-71, RF-74: Reputación diferenciada por oficio
    ratingByTrade: {
      electricidad: { rating: 4.9, reviewCount: 32, completedJobs: 36 },
      computacion: { rating: 4.8, reviewCount: 6, completedJobs: 6 }
    },
    // RF-60: Métodos de pago
    acceptedPaymentMethods: ['efectivo', 'nequi', 'daviplata', 'bre_b'],
    // RF-68, RF-69: Referidos
    referrals: {
      code: 'MGOMEZ-2026',
      count: 4,
      distinctTradesCount: 3,
      isCommunityReferrer: true,
      referredList: [
        { name: 'Carlos Restrepo', trade: 'Plomería', status: 'verificado' },
        { name: 'Elena Jaramillo', trade: 'Pintura', status: 'verificado' },
        { name: 'Andrés Henao', trade: 'Cerrajería', status: 'verificado' }
      ]
    },
    // RF-41, RF-42, RF-43: Verificación de identidad
    identityVerification: {
      status: 'verified',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '1.020.845.XXX',
      submittedAt: '2026-01-15'
    },
    services: [
      {
        id: 's-1',
        trade: 'electricidad',
        tradeLabel: 'Mantenimiento de redes y tableros',
        hourlyRate: 45000,
        experienceYears: 8,
        coverageZones: ['Chapinero', 'Chicó', 'Usaquén', 'Cedritos'],
        bio: 'Instalación y revisión técnica completa.',
        phone: '+57 312 458 9012',
        specializations: ['Tableros trifásicos', 'Cableado estructurado'],
        equipment: ['Multímetro digital Fluke', 'Ponchadora hidráulica'],
        brands: ['Schneider Electric', 'Legrand']
      }
    ],
    reviews: [
      {
        id: 'r-1',
        author: 'Juliana Arango',
        rating: 5,
        date: 'Hace 3 días',
        comment: 'Llegó en 20 minutos a mi apartamento en Chicó y solucionó un corto en la caja principal. Muy profesional y cobro justo.',
        verifiedWork: true,
        tradeCategory: 'electricidad'
      },
      {
        id: 'r-2',
        author: 'Sebastián Cano',
        rating: 5,
        date: 'Hace 1 semana',
        comment: 'Excelente atención. Me explicó claramente el problema y dejó todo impecable.',
        verifiedWork: true,
        tradeCategory: 'electricidad'
      }
    ]
  },
  {
    id: 'w-2',
    name: 'Carlos Restrepo',
    initials: 'CR',
    avatarColor: '#0D9488',
    trade: 'plomeria',
    tradeLabel: 'Plomería & Redes Hidráulicas',
    secondaryTrades: ['albanileria'],
    rating: 4.8,
    reviewCount: 52,
    completedJobsCount: 58,
    verified: true,
    available: true,
    hourlyRate: 40000,
    responseTime: '< 25 min',
    bio: 'Especialista en detección de fugas no visibles con geófono, destape de cañerías, grifería, motobombas y calentadores.',
    phone: '+57 301 776 5432',
    location: {
      lat: 4.6920,
      lng: -74.0320,
      zoneName: 'Usaquén / Santa Bárbara',
      address: 'Carrera 7 # 116-40'
    },
    gallery: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542013936693-884638332954?w=500&auto=format&fit=crop'
    ],
    schedule: [
      { day: 'Lunes a Domingo', slots: ['07:00 - 19:00 (Urgencias 24/7)'] }
    ],
    equipment: ['Geófono acústico electro-fugas', 'Sonda eléctrica Ridgid K-45', 'Termofusora para polipropileno'],
    brands: ['Grival', 'Corona', 'Pavco', 'Gerfor', 'Vainsa'],
    specializations: ['Detección de goteras ocultas', 'Destape de bajantes', 'Instalación de griferías monomando'],
    ratingByTrade: {
      plomeria: { rating: 4.8, reviewCount: 46, completedJobs: 51 },
      albanileria: { rating: 4.7, reviewCount: 6, completedJobs: 7 }
    },
    acceptedPaymentMethods: ['efectivo', 'nequi', 'daviplata', 'bre_b'],
    referrals: {
      code: 'CREST-2026',
      count: 2,
      distinctTradesCount: 2,
      isCommunityReferrer: false,
      referredList: [
        { name: 'Mateo Gómez', trade: 'Electricidad', status: 'verificado' },
        { name: 'Luis Fernando Ortiz', trade: 'Electrodomésticos', status: 'verificado' }
      ]
    },
    identityVerification: {
      status: 'verified',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '71.390.XXX',
      submittedAt: '2026-02-10'
    },
    services: [
      {
        id: 's-2',
        trade: 'plomeria',
        tradeLabel: 'Destapes y fugas de agua',
        hourlyRate: 40000,
        experienceYears: 12,
        coverageZones: ['Usaquén', 'Santa Bárbara', 'Cedritos', 'Chapinero'],
        bio: 'Atención de emergencias y mantenimiento preventivo.',
        phone: '+57 301 776 5432',
        specializations: ['Detección de fugas no visibles', 'Destapes'],
        equipment: ['Geófono acústico', 'Sonda eléctrica'],
        brands: ['Grival', 'Pavco']
      }
    ],
    reviews: [
      {
        id: 'r-3',
        author: 'Guillermo Duque',
        rating: 5,
        date: 'Hace 4 días',
        comment: 'Destapó el sifón de la cocina sin romper nada y con herramienta moderna. Recomendadísimo.',
        verifiedWork: true,
        tradeCategory: 'plomeria'
      }
    ]
  },
  {
    id: 'w-3',
    name: 'Elena Jaramillo',
    initials: 'EJ',
    avatarColor: '#E11D48',
    trade: 'pintura',
    tradeLabel: 'Pintura y Acabados de Interiores',
    secondaryTrades: ['hogar'],
    rating: 5.0,
    reviewCount: 29,
    completedJobsCount: 34,
    verified: true,
    available: true,
    hourlyRate: 35000,
    responseTime: '< 30 min',
    bio: 'Pintura arquitectónica, estuco veneciano, impermeabilización de terrazas y diseño de muros decorativos.',
    phone: '+57 318 632 1190',
    location: {
      lat: 4.6450,
      lng: -74.0750,
      zoneName: 'Teusaquillo / Galerías',
      address: 'Calle 53 # 24-12'
    },
    gallery: [
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&auto=format&fit=crop'
    ],
    schedule: [
      { day: 'Lunes a Sábado', slots: ['08:00 - 17:00'] }
    ],
    equipment: ['Pistola Airless Wagner', 'Lijadora orbital con aspiración', 'Andamio certificado'],
    brands: ['Pintuco', 'Tito Pabón', 'Corona', 'Sika'],
    specializations: ['Estuco veneciano', 'Impermeabilización de fachadas', 'Pintura antimanchas'],
    ratingByTrade: {
      pintura: { rating: 5.0, reviewCount: 29, completedJobs: 34 }
    },
    acceptedPaymentMethods: ['efectivo', 'nequi', 'daviplata'],
    referrals: {
      code: 'EJARA-2026',
      count: 3,
      distinctTradesCount: 3,
      isCommunityReferrer: true,
      referredList: [
        { name: 'Claudia Muñoz', trade: 'Aseo', status: 'verificado' },
        { name: 'Javier Cañas', trade: 'Albañilería', status: 'verificado' },
        { name: 'Mateo Gómez', trade: 'Electricidad', status: 'verificado' }
      ]
    },
    identityVerification: {
      status: 'verified',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '52.410.XXX',
      submittedAt: '2026-01-20'
    },
    services: [
      {
        id: 's-3',
        trade: 'pintura',
        tradeLabel: 'Pintura interior y estuco',
        hourlyRate: 35000,
        experienceYears: 6,
        coverageZones: ['Teusaquillo', 'Galerías', 'Chapinero', 'Salitre'],
        bio: 'Pintura limpia, cuidado de muebles y acabados finos.',
        phone: '+57 318 632 1190'
      }
    ],
    reviews: [
      {
        id: 'r-4',
        author: 'Patricia Osorio',
        rating: 5,
        date: 'Hace 2 semanas',
        comment: 'Dejó mi sala y comedor como nuevos. Muy cuidadosa con el piso de madera.',
        verifiedWork: true,
        tradeCategory: 'pintura'
      }
    ]
  },
  {
    id: 'w-4',
    name: 'Andrés Henao',
    initials: 'AH',
    avatarColor: '#D97706',
    trade: 'cerrajeria',
    tradeLabel: 'Cerrajería de Seguridad 24H',
    secondaryTrades: [],
    rating: 4.7,
    reviewCount: 64,
    completedJobsCount: 78,
    verified: true,
    available: true,
    hourlyRate: 50000,
    responseTime: '< 10 min',
    bio: 'Apertura de cerraduras residenciales, comerciales y de vehículos. Llaves con chip, cantoneras eléctricas y cerraduras biométricas.',
    phone: '+57 310 980 4321',
    location: {
      lat: 4.7210,
      lng: -74.0350,
      zoneName: 'Cedritos / Usaquén',
      address: 'Calle 140 # 11-30'
    },
    gallery: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&auto=format&fit=crop'
    ],
    schedule: [
      { day: 'Todos los días', slots: ['24 Horas'] }
    ],
    equipment: ['Ganzúas tubulares y multipunto', 'Duplicadora electrónica láser', 'Extractor de bombines'],
    brands: ['Yale', 'Schlage', 'Medeco', 'Mul-T-Lock', 'Defiant'],
    specializations: ['Apertura sin daños', 'Instalación cerraduras inteligentes', 'Cerrajería automotriz'],
    ratingByTrade: {
      cerrajeria: { rating: 4.7, reviewCount: 64, completedJobs: 78 }
    },
    acceptedPaymentMethods: ['efectivo', 'nequi', 'daviplata', 'bre_b'],
    referrals: {
      code: 'AHENAO-2026',
      count: 1,
      distinctTradesCount: 1,
      isCommunityReferrer: false,
      referredList: [
        { name: 'Mateo Gómez', trade: 'Electricidad', status: 'verificado' }
      ]
    },
    identityVerification: {
      status: 'verified',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '80.124.XXX',
      submittedAt: '2025-11-10'
    },
    services: [
      {
        id: 's-4',
        trade: 'cerrajeria',
        tradeLabel: 'Aperturas de emergencia y chapas de alta seguridad',
        hourlyRate: 50000,
        experienceYears: 10,
        coverageZones: ['Cedritos', 'Usaquén', 'Suba', 'Chicó'],
        bio: 'Respuesta inmediata en moto con ganzúas profesionales.',
        phone: '+57 310 980 4321'
      }
    ],
    reviews: [
      {
        id: 'r-5',
        author: 'Mauricio Villa',
        rating: 5,
        date: 'Ayer',
        comment: 'Se me quedaron las llaves adentro a las 11 PM y en 15 minutos me abrió la puerta sin dañar la chapa.',
        verifiedWork: true,
        tradeCategory: 'cerrajeria'
      }
    ]
  },
  {
    id: 'w-5',
    name: 'Luis Fernando Ortiz',
    initials: 'LO',
    avatarColor: '#0284C7',
    trade: 'electrodomesticos',
    tradeLabel: 'Técnico de Lavadoras y Neveras',
    secondaryTrades: ['electricidad'],
    rating: 4.6,
    reviewCount: 41,
    completedJobsCount: 46,
    verified: true,
    available: false,
    hourlyRate: 48000,
    responseTime: '< 45 min',
    bio: 'Reparación de lavadoras Haceb, Samsung, Whirlpool y LG. Carga de gas refrigerante, termostatos y cambio de transmisiones a domicilio.',
    phone: '+57 314 554 9901',
    location: {
      lat: 4.7100,
      lng: -74.0720,
      zoneName: 'Suba / Niza',
      address: 'Avenida Suba # 127D-45'
    },
    gallery: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop'
    ],
    schedule: [
      { day: 'Lunes a Viernes', slots: ['08:00 - 18:00'] }
    ],
    equipment: ['Manómetro digital refrigeración', 'Bomba de vacío Robinair', 'Detector de fugas de gas freón'],
    brands: ['Haceb', 'Whirlpool', 'Samsung', 'LG', 'Mabe', 'Challenger'],
    specializations: ['Carga de gas R134a/R600a', 'Sustitución de tarjeta inversora', 'Rodamientos y bombas de desagüe'],
    ratingByTrade: {
      electrodomesticos: { rating: 4.6, reviewCount: 41, completedJobs: 46 }
    },
    acceptedPaymentMethods: ['efectivo', 'nequi', 'daviplata'],
    identityVerification: {
      status: 'verified',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '79.654.XXX',
      submittedAt: '2026-02-01'
    },
    services: [
      {
        id: 's-5',
        trade: 'electrodomesticos',
        tradeLabel: 'Diagnóstico y cambio de repuestos originales',
        hourlyRate: 48000,
        experienceYears: 15,
        coverageZones: ['Suba', 'Niza', 'Colina Campestre', 'Pontevedra'],
        bio: 'Garantía por escrito de 3 meses en repuestos.',
        phone: '+57 314 554 9901'
      }
    ],
    reviews: [
      {
        id: 'r-6',
        author: 'Adriana Maya',
        rating: 4,
        date: 'Hace 3 semanas',
        comment: 'Solucionó la fuga de agua de la lavadora Whirlpool. Muy formal.',
        verifiedWork: true,
        tradeCategory: 'electrodomesticos'
      }
    ]
  },
  {
    id: 'w-6',
    name: 'Sofía Rendón',
    initials: 'SR',
    avatarColor: '#7C3AED',
    trade: 'computacion',
    tradeLabel: 'Soporte Técnico y Redes Wi-Fi',
    secondaryTrades: [],
    rating: 4.9,
    reviewCount: 22,
    completedJobsCount: 25,
    verified: true,
    available: true,
    hourlyRate: 40000,
    responseTime: '< 20 min',
    bio: 'Mantenimiento preventivo y correctivo de PC/Mac. Optimización de señal Wi-Fi Mesh, eliminación de virus y configuración de impresoras.',
    phone: '+57 305 441 8723',
    location: {
      lat: 4.6560,
      lng: -74.0580,
      zoneName: 'Quinta Camacho / Chapinero',
      address: 'Calle 70 # 10-30'
    },
    gallery: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop'
    ],
    schedule: [
      { day: 'Lunes a Sábado', slots: ['09:00 - 19:00'] }
    ],
    equipment: ['Tester de cable RJ45', 'Unidades SSD clonadoras', 'Kit de destornilladores de precisión iFixit'],
    brands: ['Apple', 'Dell', 'Lenovo', 'HP', 'TP-Link', 'Ubiquiti'],
    specializations: ['Instalación Wi-Fi Mesh', 'Recuperación de datos', 'Repotenciación de portátiles'],
    ratingByTrade: {
      computacion: { rating: 4.9, reviewCount: 22, completedJobs: 25 }
    },
    acceptedPaymentMethods: ['efectivo', 'nequi', 'daviplata', 'bre_b'],
    identityVerification: {
      status: 'verified',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '1.032.411.XXX',
      submittedAt: '2026-03-01'
    },
    services: [
      {
        id: 's-6',
        trade: 'computacion',
        tradeLabel: 'Configuración redes y mantenimiento PC',
        hourlyRate: 40000,
        experienceYears: 5,
        coverageZones: ['Chapinero', 'Rosales', 'Chicó'],
        bio: 'Atención presencial o remota rápida.',
        phone: '+57 305 441 8723'
      }
    ],
    reviews: [
      {
        id: 'r-7',
        author: 'Daniel Echeverri',
        rating: 5,
        date: 'Hace 5 días',
        comment: 'Mejoró la cobertura del Wi-Fi en mi casa para el teletrabajo. Muy pila.',
        verifiedWork: true,
        tradeCategory: 'computacion'
      }
    ]
  },
  {
    id: 'w-7',
    name: 'Javier Cañas',
    initials: 'JC',
    avatarColor: '#B45309',
    trade: 'albanileria',
    tradeLabel: 'Albañilería & Remodelaciones',
    secondaryTrades: ['pintura'],
    rating: 4.8,
    reviewCount: 31,
    completedJobsCount: 39,
    verified: true,
    available: true,
    hourlyRate: 38000,
    responseTime: '< 40 min',
    bio: 'Enchapes de baños y cocinas, drywall, resanes, mampostería y cambio de pisos cerámicos.',
    phone: '+57 311 889 0234',
    location: {
      lat: 4.6000,
      lng: -74.0720,
      zoneName: 'La Candelaria / Centro',
      address: 'Carrera 4 # 11-25'
    },
    gallery: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop'
    ],
    schedule: [
      { day: 'Lunes a Viernes', slots: ['07:30 - 17:30'] }
    ],
    equipment: ['Cortadora de baldosas Rubi', 'Nivel láser 360 autonivelante', 'Mezcladora de mortero'],
    brands: ['Corona', 'Argos', 'Tigre', 'Gyplac', 'Pegaucho'],
    specializations: ['Enchapes de porcelanato', 'Muros en drywall y cielo raso', 'Impermeabilización de sobrecimientos'],
    ratingByTrade: {
      albanileria: { rating: 4.8, reviewCount: 31, completedJobs: 39 }
    },
    acceptedPaymentMethods: ['efectivo', 'nequi', 'daviplata'],
    identityVerification: {
      status: 'verified',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '79.231.XXX',
      submittedAt: '2026-02-15'
    },
    services: [
      {
        id: 's-7',
        trade: 'albanileria',
        tradeLabel: 'Enchape cerámico y drywall',
        hourlyRate: 38000,
        experienceYears: 14,
        coverageZones: ['Centro', 'La Candelaria', 'Santa Fe', 'Chapinero'],
        bio: 'Presupuestos claros y cumplimiento de fechas.',
        phone: '+57 311 889 0234'
      }
    ],
    reviews: [
      {
        id: 'r-8',
        author: 'María Cristina Gómez',
        rating: 5,
        date: 'Hace 1 mes',
        comment: 'Hizo el cambio de baldosas del baño y quedó impecable.',
        verifiedWork: true,
        tradeCategory: 'albanileria'
      }
    ]
  },
  {
    id: 'w-8',
    name: 'Claudia Muñoz',
    initials: 'CM',
    avatarColor: '#059669',
    trade: 'aseo',
    tradeLabel: 'Aseo Profundo & Desinfección',
    secondaryTrades: ['hogar'],
    rating: 4.9,
    reviewCount: 47,
    completedJobsCount: 55,
    verified: true,
    available: true,
    hourlyRate: 32000,
    responseTime: '< 30 min',
    bio: 'Limpieza profunda de mudanzas, lavado de muebles y tapetes con vapor, aseo general por horas y oficinas.',
    phone: '+57 316 220 9184',
    location: {
      lat: 4.6620,
      lng: -74.1080,
      zoneName: 'Ciudad Salitre / Modelia',
      address: 'Avenida Esperanza # 75-30'
    },
    gallery: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop'
    ],
    schedule: [
      { day: 'Lunes a Sábado', slots: ['07:00 - 16:00'] }
    ],
    equipment: ['Vaporizador Kärcher SC3', 'Aspiradora de inyección-extracción', 'Pulidora de pisos industriales'],
    brands: ['Kärcher', '3M', 'Ecolab', 'Bissell'],
    specializations: ['Lavado de sofás y colchones', 'Aseo pos-obra', 'Desinfección de cocinas industriales'],
    ratingByTrade: {
      aseo: { rating: 4.9, reviewCount: 47, completedJobs: 55 }
    },
    acceptedPaymentMethods: ['efectivo', 'nequi', 'daviplata'],
    identityVerification: {
      status: 'verified',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '52.789.XXX',
      submittedAt: '2026-01-10'
    },
    services: [
      {
        id: 's-8',
        trade: 'aseo',
        tradeLabel: 'Aseo por días y desinfección a vapor',
        hourlyRate: 32000,
        experienceYears: 7,
        coverageZones: ['Ciudad Salitre', 'Modelia', 'Fontibón', 'Teusaquillo'],
        bio: 'Puntualidad, discreción e insumos ecológicos.',
        phone: '+57 316 220 9184'
      }
    ],
    reviews: [
      {
        id: 'r-9',
        author: 'Felipe Correa',
        rating: 5,
        date: 'Hace 6 días',
        comment: 'Excelente servicio para la entrega de un apartamento en arriendo. Los dueños quedaron felices.',
        verifiedWork: true,
        tradeCategory: 'aseo'
      }
    ]
  },
  {
    id: 'w-9',
    name: 'Juan Camilo Vélez',
    initials: 'JV',
    avatarColor: '#16A34A',
    trade: 'jardineria',
    tradeLabel: 'Jardinería & Mantenimiento Verde',
    secondaryTrades: [],
    rating: 4.7,
    reviewCount: 19,
    completedJobsCount: 22,
    verified: true,
    available: false,
    hourlyRate: 30000,
    responseTime: '< 1 hora',
    bio: 'Poda de árboles ornamentales, corte de césped con guadaña propia, abonos orgánicos, control de plagas y diseño de jardineras.',
    phone: '+57 302 994 3821',
    location: {
      lat: 4.7550,
      lng: -74.0320,
      zoneName: 'Guaymaral / Torca',
      address: 'Autopista Norte # 205-50'
    },
    gallery: [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop'
    ],
    schedule: [
      { day: 'Lunes a Viernes', slots: ['07:00 - 15:00'] }
    ],
    equipment: ['Guadañadora Stihl FS 250', 'Tijeras telescópicas de podar Fiskars', 'Fumigadora de espalda'],
    brands: ['Stihl', 'Husqvarna', 'Truper', 'Fiskars'],
    specializations: ['Poda de setos y cercas vivas', 'Paisajismo en terrazas', 'Control orgánico de cochinilla'],
    ratingByTrade: {
      jardineria: { rating: 4.7, reviewCount: 19, completedJobs: 22 }
    },
    acceptedPaymentMethods: ['efectivo', 'nequi', 'daviplata'],
    identityVerification: {
      status: 'verified',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '1.018.990.XXX',
      submittedAt: '2026-02-28'
    },
    services: [
      {
        id: 's-9',
        trade: 'jardineria',
        tradeLabel: 'Mantenimiento de zonas verdes y jardines',
        hourlyRate: 30000,
        experienceYears: 9,
        coverageZones: ['Suba', 'Usaquén', 'Bogotá Norte', 'Chía'],
        bio: 'Herramienta a gasolina propia y recolección de ramas.',
        phone: '+57 302 994 3821'
      }
    ],
    reviews: [
      {
        id: 'r-10',
        author: 'Amalia Gil',
        rating: 5,
        date: 'Hace 1 mes',
        comment: 'Arregló el jardín del antejardín con plantas muy bonitas.',
        verifiedWork: true,
        tradeCategory: 'jardineria'
      }
    ]
  },
  {
    id: 'w-10',
    name: 'Marcela Posada',
    initials: 'MP',
    avatarColor: '#EC4899',
    trade: 'mascotas',
    tradeLabel: 'Peluquería Canina & Cuidado de Mascotas',
    secondaryTrades: [],
    rating: 5.0,
    reviewCount: 35,
    completedJobsCount: 40,
    verified: true,
    available: true,
    hourlyRate: 35000,
    responseTime: '< 20 min',
    bio: 'Baño y corte canino/felino a domicilio. Paseos estructurados de perros, guardería de día y administración de medicamentos.',
    phone: '+57 319 772 4019',
    location: {
      lat: 4.6480,
      lng: -74.0620,
      zoneName: 'Chapinero Alto / Hippies',
      address: 'Carrera 7 # 60-25'
    },
    gallery: [
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&auto=format&fit=crop'
    ],
    schedule: [
      { day: 'Lunes a Domingo', slots: ['08:00 - 18:00'] }
    ],
    equipment: ['Secador expulsador canino de alta velocidad', 'Mesa de peluquería portátil plegable', 'Tijeras japonesas curvadas y de esculpir'],
    brands: ['Oster', 'Andis', 'Bio-Groom', 'Wahl'],
    species: ['Perros (todas las razas)', 'Gatos', 'Conejos'],
    specializations: ['Cortes específicos de raza (Schnauzer, Poodle)', 'Deslanado profundo en razas de doble manto', 'Manejo de mascotas nerviosas o seniles'],
    ratingByTrade: {
      mascotas: { rating: 5.0, reviewCount: 35, completedJobs: 40 }
    },
    acceptedPaymentMethods: ['efectivo', 'nequi', 'daviplata'],
    identityVerification: {
      status: 'verified',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '1.026.540.XXX',
      submittedAt: '2026-03-05'
    },
    services: [
      {
        id: 's-10',
        trade: 'mascotas',
        tradeLabel: 'Grooming a domicilio y paseos',
        hourlyRate: 35000,
        experienceYears: 4,
        coverageZones: ['Chapinero', 'Rosales', 'Teusaquillo', 'Usaquén'],
        bio: 'Trato cariñoso, sin jaulas y con agua tibia.',
        phone: '+57 319 772 4019',
        species: ['Perros', 'Gatos']
      }
    ],
    reviews: [
      {
        id: 'r-11',
        author: 'Esteban Montoya',
        rating: 5,
        date: 'Hace 3 días',
        comment: 'Bañó a mi Golden Retriever con paciencia y quedó oliendo riquísimo. La llamaré siempre.',
        verifiedWork: true,
        tradeCategory: 'mascotas'
      }
    ]
  },
  // RF-39: Trabajador pausado automáticamente por bajas calificaciones (< 3.0 en últimas 5)
  {
    id: 'w-11',
    name: 'Rodrigo Barrientos',
    initials: 'RB',
    avatarColor: '#64748B',
    trade: 'pintura',
    tradeLabel: 'Pintor de Obras Rápidas',
    secondaryTrades: [],
    rating: 2.6,
    reviewCount: 9,
    completedJobsCount: 11,
    verified: false,
    available: false,
    isPaused: true,
    pauseReason: 'Suspendido automáticamente: Calificación promedio menor a 3.0 estrellas en sus últimas 5 reseñas (RF-39)',
    hourlyRate: 28000,
    responseTime: '> 2 horas',
    bio: 'Pintura de apartamentos y rejas en el sur de Bogotá.',
    phone: '+57 315 889 0012',
    location: {
      lat: 4.5900,
      lng: -74.1100,
      zoneName: 'Antonio Nariño / Restrepo',
      address: 'Calle 18 Sur # 22-10'
    },
    gallery: [
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&auto=format&fit=crop'
    ],
    schedule: [
      { day: 'Lunes a Viernes', slots: ['08:00 - 16:00'] }
    ],
    equipment: ['Rodillo básico', 'Brochas de cerda'],
    brands: ['Pintuco'],
    specializations: ['Pintura en vinilo'],
    ratingByTrade: {
      pintura: { rating: 2.6, reviewCount: 9, completedJobs: 11 }
    },
    acceptedPaymentMethods: ['efectivo'],
    services: [
      {
        id: 's-11',
        trade: 'pintura',
        tradeLabel: 'Pintura económica',
        hourlyRate: 28000,
        experienceYears: 2,
        coverageZones: ['Antonio Nariño', 'Restrepo'],
        bio: 'Pintura básica.',
        phone: '+57 315 889 0012'
      }
    ],
    reviews: [
      {
        id: 'r-12',
        author: 'Camilo Torres',
        rating: 2,
        date: 'Hace 2 días',
        comment: 'Llegó 3 horas tarde y manchó los marcos de las puertas sin limpiar.',
        verifiedWork: true,
        tradeCategory: 'pintura'
      },
      {
        id: 'r-13',
        author: 'Valeria R.',
        rating: 2,
        date: 'Hace 5 días',
        comment: 'No trajo suficientes plásticos de protección.',
        verifiedWork: true,
        tradeCategory: 'pintura'
      }
    ]
  }
];

export const INITIAL_SERVICES: ServiceRequest[] = [
  {
    id: 'srv-101',
    workerId: 'w-1',
    workerName: 'Mateo Gómez',
    workerTrade: 'Electricista Certificado SENA',
    workerAvatarColor: '#2563EB',
    clientId: 'usr-default',
    clientName: 'Juan Pérez (Tú)',
    clientEmail: 'juan.perez@correo.com',
    date: '2026-10-02',
    time: '10:00 AM',
    address: 'Carrera 15 # 85-20, Chicó, Bogotá',
    coverageZone: 'Chapinero / Chicó',
    problemDescription: 'Falla intermitente en los interruptores del pasillo principal y parpadeo de luces en la cocina.',
    paymentMethod: 'bre_b',
    status: 'en_curso',
    urgency: 'urgente',
    budget: 90000,
    createdAt: '2026-09-29T14:30:00Z',
    amount: 90000,
    photos: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop'
    ],
    expiresAt: new Date(Date.now() + 25 * 60 * 1000).toISOString()
  },
  {
    id: 'srv-102',
    workerId: 'w-2',
    workerName: 'Carlos Restrepo',
    workerTrade: 'Plomería & Redes Hidráulicas',
    workerAvatarColor: '#0D9488',
    clientId: 'usr-default',
    clientName: 'Juan Pérez (Tú)',
    clientEmail: 'juan.perez@correo.com',
    date: '2026-09-25',
    time: '03:30 PM',
    address: 'Calle 122 # 15-40, Santa Bárbara, Bogotá',
    coverageZone: 'Usaquén / Santa Bárbara',
    problemDescription: 'Goteo continuo bajo el lavamanos del baño social.',
    paymentMethod: 'transferencia',
    status: 'finalizado',
    urgency: 'normal',
    budget: 60000,
    reviewDone: false,
    createdAt: '2026-09-25T11:00:00Z',
    amount: 60000,
    completionEvidence: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop'
    ]
  },
  {
    id: 'srv-103',
    workerId: 'w-4',
    workerName: 'Andrés Henao',
    workerTrade: 'Cerrajería de Seguridad 24H',
    workerAvatarColor: '#D97706',
    clientId: 'usr-default',
    clientName: 'Juan Pérez (Tú)',
    clientEmail: 'juan.perez@correo.com',
    date: '2026-09-20',
    time: '08:00 PM',
    address: 'Calle 140 # 11-30, Cedritos, Bogotá',
    coverageZone: 'Cedritos / Usaquén',
    problemDescription: 'Cambio de guarda de puerta blindada por pérdida de llaves.',
    paymentMethod: 'efectivo',
    status: 'cancelado',
    cancelReason: 'Se encontraron las llaves extraviadas antes de la visita.',
    cancelledBy: 'client',
    urgency: 'urgente',
    budget: 80000,
    createdAt: '2026-09-20T19:00:00Z',
    amount: 80000
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    workerId: 'w-1',
    workerName: 'Mateo Gómez',
    workerTrade: 'Electricista Certificado SENA',
    workerAvatarColor: '#2563EB',
    workerInitials: 'MG',
    unreadCount: 1,
    lastMessage: 'Voy saliendo con las herramientas hacia Chicó.',
    lastMessageTime: '10:14 AM'
  },
  {
    id: 'conv-2',
    workerId: 'w-2',
    workerName: 'Carlos Restrepo',
    workerTrade: 'Plomería & Redes Hidráulicas',
    workerAvatarColor: '#0D9488',
    workerInitials: 'CR',
    unreadCount: 0,
    lastMessage: 'Con gusto. Si necesitas otra revisión en Usaquén me escribes.',
    lastMessageTime: 'Ayer'
  }
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'm-1',
      conversationId: 'conv-1',
      senderId: 'usr-default',
      senderRole: 'seeker',
      text: 'Hola Mateo, ¿tienes disponibilidad para revisar un corto eléctrico hoy en Chicó?',
      timestamp: '10:05 AM',
      status: 'read'
    },
    {
      id: 'm-2',
      conversationId: 'conv-1',
      senderId: 'w-1',
      senderRole: 'provider',
      text: '¡Hola! Sí claro, estoy en Chapinero justo al lado. ¿En qué dirección exacta te encuentras?',
      timestamp: '10:08 AM',
      status: 'read'
    },
    {
      id: 'm-3',
      conversationId: 'conv-1',
      senderId: 'usr-default',
      senderRole: 'seeker',
      text: 'En la Carrera 15 # 85-20. Es un parpadeo en las luces.',
      timestamp: '10:10 AM',
      status: 'read'
    },
    {
      id: 'm-4',
      conversationId: 'conv-1',
      senderId: 'w-1',
      senderRole: 'provider',
      text: 'Voy saliendo con las herramientas hacia Chicó.',
      timestamp: '10:14 AM',
      status: 'delivered'
    }
  ],
  'conv-2': [
    {
      id: 'm-5',
      conversationId: 'conv-2',
      senderId: 'usr-default',
      senderRole: 'seeker',
      text: 'Carlos, muchas gracias por el destape, quedó perfecto.',
      timestamp: 'Ayer',
      status: 'read'
    },
    {
      id: 'm-6',
      conversationId: 'conv-2',
      senderId: 'w-2',
      senderRole: 'provider',
      text: 'Con gusto. Si necesitas otra revisión en Usaquén me escribes.',
      timestamp: 'Ayer',
      status: 'read'
    }
  ]
};

// Helper de persistencia en localStorage
export const getStoredData = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (_e) {
    return fallback;
  }
};

export const setStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_e) {
    // quota exceeded fallback
  }
};
