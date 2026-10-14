# Reglas de Agentes y Arquitectura Frontend — OficioYa

Proyecto: **OficioYa** — Plataforma de Directorio Inteligente y Reputación Digital para el Trabajo Informal  
Curso: **Desarrollo y Operaciones de Software (DOSW)** — Escuela Colombiana de Ingeniería Julio Garavito  
Rol del Sistema: **Frontend SPA Web Application**

---

## 1. Misión y Filosofía de Diseño
* **Objetivo:** Conectar trabajadores independientes de oficios técnicos y asistenciales con clientes locales de forma transparente, rápida y basada en reputación verificada.
* **Experiencia de Usuario (UI/UX):**
  * Estética de primer nivel: interfaz dinámica, limpia, moderna y accesible.
  * Mascota interactiva (**El Castor de OficioYa**): presente como asistente reactivo en flujos clave (cambio de oficio, disponibilidad, éxito de solicitudes, estados vacíos).
  * Micro-interacciones vivas: feedback visual en botones, transiciones suaves y estados claros (*Hover*, *Active*, *Focus*, *Loading*, *Success*, *Error*).
  * Responsividad total (*Mobile-First*): optimizada para smartphones (canal principal de los trabajadores) y escritorio.

---

## 2. Stack Tecnológico Base
* **Core:** React 19 + TypeScript (estricto) + Vite.
* **Estilos:** CSS Moderno modularizado / Design Tokens en variables CSS (`:root`), sin frameworks invasivos que limiten la expresividad visual.
* **Iconografía:** Lucide React (iconos semánticos consistentes).
* **Gestión de Estado:** React Context + Hooks especializados (aislamiento de responsabilidades).
* **Mapas & Geolocalización:** Abstracción para Mapbox GL JS (con fallback interactivo mockeado).
* **Multimedia:** Cloudinary adapter para carga de fotos de perfil y portafolios.

---

## 3. Principio de Arquitectura: "Mock-First" Decoupled
Dado que el Backend (Spring Boot + PostgreSQL en JPA/JDBC) se desarrolla en paralelo:
1. **Contratos e Interfaces Estrictas:** Toda entidad de negocio (`User`, `WorkerProfile`, `TradeService`, `ServiceRequest`, `Review`) debe estar tipada en `src/types/`.
2. **Capa de Servicios Desacoplada (`src/services/`):**
   * Toda interacción de datos pasa por una interfaz de servicio (`AuthService`, `WorkerService`, `RequestService`, `ReviewService`).
   * Las pantallas consumen hooks que leen de estos servicios.
   * La implementación actual usará **Mock Adapters** con simulación de latencia realista y persistencia local (`localStorage`), permitiendo que el 100% de los botones, formularios y filtros funcionen plenamente sin backend vivo.
   * La transición a la API REST real solo requerirá cambiar la URL base del cliente HTTP (`fetch`/`axios`).

---

## 4. Estructura de Carpetas Propuesta

```text
oficioya-frontend/
├── public/
│   ├── assets/
│   │   ├── mascot/          # Poses y expresiones del castor por oficio
│   │   └── icons/           # Iconos de categorías de oficios
├── src/
│   ├── assets/              # Imágenes vectoriales y recursos internos
│   ├── components/          # Componentes reutilizables
│   │   ├── common/          # Botones, Badges, Modales, Inputs, Tarjetas
│   │   ├── layout/          # Navbar, Footer, Sidebar, Contenedores
│   │   ├── mascot/          # Componente interactivo del Castor (con estados)
│   │   ├── map/             # Visualizador interactivo de mapa hiperlocal
│   │   └── reviews/         # Sistema de estrellas y comentarios verificados
│   ├── context/             # Estados globales (AuthContext, NotificationContext)
│   ├── hooks/               # Custom hooks (useGeolocation, useMascotReaction, etc.)
│   ├── modules/             # Vistas y flujos por rol
│   │   ├── home/            # Directorio inteligente, buscador y filtros
│   │   ├── client/          # Perfil de trabajador, solicitud de servicio, reseñas
│   │   ├── worker/          # Dashboard de disponibilidad, gestión de solicitudes
│   │   └── admin/           # Moderación y validación de identidades
│   ├── services/            # Clientes API y Mock Adapters
│   │   ├── mock/            # Datos semilla y almacenamiento simulado
│   │   └── api/             # Implementaciones HTTP REST (para integración DOSW)
│   ├── styles/              # Design tokens, variables CSS, animaciones globales
│   ├── types/               # Modelos de datos TypeScript
│   ├── utils/               # Formateadores (moneda COP, fechas, distancias)
│   ├── App.tsx              # Rutas y layout principal
│   └── main.tsx             # Punto de entrada
├── docs/                    # Documentación de arquitectura y guías de entrega
├── .gitignore
├── AGENTS.md                # Este documento de reglas
├── package.json
└── tsconfig.json
```

---

## 5. Directrices de Calidad para DOSW
* **Sin código muerto:** No dejar comentarios obsoletos ni `console.log` de depuración en commits de release.
* **Cero dependencias innecesarias:** Mantener el bundle ligero y el arranque instantáneo.
* **Accesibilidad (a11y):** Contraste WCAG AA, soporte para teclado y etiquetas semánticas.
* **Manejo de errores amigable:** Pantallas vacías (*Empty States*) y mensajes de error guiados por la mascota para una experiencia cercana y comprensible.
