# Plan Maestro de Implementación Frontend — OficioYa

## 1. Sistema de Diseño e Identidad Visual
* **Tokens de Color:**
  * Primario Constructor / Energía: `#FFC72C` (Amarillo Mostaza Oficio) / `#F59E0B` (Ámbar)
  * Primario Seguridad / Confianza: `#1E3A8A` (Azul Cobalto) / `#0F172A` (Slate Noche)
  * Pelaje & Calidez de Marca: `#8B4513` / `#D97706` (Marrón Castor)
  * Éxito / "Disponible Ya": `#10B981` (Verde Esmeralda pulsante)
  * Reputación / Estrellas: `#FBBF24` (Dorado Cálido)
  * Neutros de Fondo y Tarjetas: `#F8FAFC` (Superficie) / `#FFFFFF` (Elevación)
* **Tipografía:** *Outfit* o *Plus Jakarta Sans* para una apariencia moderna, tecnológica y amigable.
* **Mascota Dinámica ("El Castor"):**
  * Componente flotante y contextual `<MascotAvatar state={...} trade={...} />`.
  * Expresiones reactivas: *Saludando con pulgar arriba*, *Buscando con lupa*, *Celebrando contratación*, *Guiñando el ojo al pasar el mouse por un botón de acción*, *Cambiando de herramienta según el oficio seleccionado*.

---

## 2. Módulos y Páginas del Frontend

### Módulo 0: Landing Page Oficial de OficioYa (Nueva)
* **Hero Interactivo:** Titular de impacto, logo 2.0, mascota animada y llamado a la acción dual (*"Encontrar profesional"* o *"Ofrecer mis servicios"*).
* **Showcase Dinámico de Oficios:** Selector donde al cambiar de oficio (plomero, electricista, etc.) el castor cambia de atuendo y herramientas en tiempo real.
* **Sección "Cómo funciona":** Paso a paso ilustrado con micro-animaciones (1. Busca en tu barrio -> 2. Mira la reputación del castor -> 3. Contrata y califica).
* **Beneficios para Trabajadores y Clientes:** Respaldo de reputación, geolocalización y cero barreras.

### Módulo 1: Directorio Inteligente & Home (Vista Contratante)
* **Hero Section con Buscador Predictivo:** Búsqueda rápida por oficio ("Plomero", "Electricista", "Pintora") y por ubicación/barrio.
* **Selector Rápido de Categorías:** 12 oficios clave según `logosOficios.png`.
* **Filtros Hiperlocales:** Por distancia (km), disponibilidad inmediata (*Toggle: "¿Lo necesitas YA?"*), tarifa y calificación.
* **Visualizador de Mapa Interactivo:** Trabajadores cercanos con pines de oficio y estado en tiempo real.
* **Mascota Asistente Flotante ("Basty"):** Guía reactivo con 6 expresiones faciales (Alegre, Guiño, Pensativo, Concentrado, Entusiasta, Sorprendido).

### Módulo 2: Perfil Detallado & Solicitud de Servicio
* **Perfil del Trabajador:** Portafolio de trabajos, insignias de validación de identidad y reseñas verificadas.
* **Modal de Solicitud de Servicio:** Formulario con pasos interactivos donde el castor se pone en pose concentrada y celebra al enviar.

### Módulo 3: Portal del Trabajador Independiente
* **Interruptor "Disponible Ya":** Con pulso de estado y animación entusiasta del castor.
* **Bandeja de Solicitudes:** Gestión en vivo (Aceptar, Rechazar, En Camino).

### Módulo 4: Panel de Administrador
* **Validación de Identidades:** Aprobación de documentos y perfiles.

---

## 3. Fases de Implementación Actualizadas

* **Fase 1: Inicialización & Design System**
  * Crear la app con Vite + React 19 + TypeScript.
  * Configurar variables CSS (Amarillo `#FFC72C`, Azul `#1E3A8A`, Pizarra, Verde esmeralda).
  * Organizar los assets en `public/assets/mascot/` (Logo 2.0, electricista, plomero, expresiones).

* **Fase 2: Motor de la Mascota Interactiva (`MascotCompanion`)**
  * Componente reutilizable con soporte de expresiones faciales y cambio de oficio.
  * Efectos de hover, sonido/micro-feedback visual y burbujas de diálogo dinámicas.

* **Fase 3: Landing Page Completa**
  * Hero interactivo, carrusel de oficios reactivo, beneficios y navegación a la App.

* **Fase 4: Directorio Inteligente & Mapa Mock**
  * Búsqueda en tiempo real, filtros hiperlocales, pines en mapa interactivo.

* **Fase 5: Flujo de Contratación & Portales (Trabajador y Admin)**
  * Modal de solicitud, toggle de disponibilidad y panel de gestión.

* **Fase 6: Pulido, Micro-animaciones y Calidad DOSW**
  * Optimización de rendimiento, transiciones y revisión de contraste accesible.

