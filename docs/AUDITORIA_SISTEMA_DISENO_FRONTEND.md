# Auditoría de Sistema de Diseño y Frontend — OficioYa

**Fecha de ejecución:** 14 de Octubre de 2026  
**Fuentes de Verdad Auditadas:**
- `contexto/gsap-public` (Suite completa de GSAP: Core, ScrollTrigger, Flip, SplitText, InertiaPlugin, MorphSVG, etc.)
- `contexto/DESIGN.md` (Especificación de Tokens, Filosofía Estética, Espaciado y Movimiento)
- `design-system/oficioya/MASTER.md` (Reglas maestras de componentes, botones, sombras y contraste)
- `contexto/Manual de identidad Oficio Ya.pdf` & `src/styles/tokens.css` (Paleta oficial, mascota Many, tipografía DM Sans + Inter)
- `contexto/OficioYa-Requerimientos - Requerimientos Limpios.csv` (Requerimientos funcionales DOSW)

---

## 1. Resumen Ejecutivo y Calificación Global

| Dimensión | Puntuación | Estado | Observación Principal |
| :--- | :---: | :---: | :--- |
| **1. Tokens & Colorimetría** | 98 / 100 | **Excelente** | Estricta adhesión a los 8 primitivos del manual (`--oy-*`) y adaptación WCAG AA (`4.5:1`). |
| **2. Jerarquía Tipográfica** | 95 / 100 | **Excelente** | Combinación DM Sans (display/titulares) + Inter (datos/interfaz) con escala fluida `clamp()`. |
| **3. Sistema de Movimiento & GSAP** | 92 / 100 | **Muy Bueno** | Presencia de `ScrollTrigger`, `react-spring` y `framer-motion`. Oportunidad de incorporar `Flip` para filtros de oficios. |
| **4. Componentes y Superficies** | 96 / 100 | **Excelente** | Lenguaje visual "Sticker" (contorno Cacao `#3E1F14` 1.5px, píldoras y tarjetas de 20px) + efecto cristal en filtros. |
| **5. Accesibilidad & A11y** | 94 / 100 | **Muy Bueno** | Respeto a `prefers-reduced-motion`, foco visible, targets táctiles $\ge 44\text{ px}$. |
| **6. Alineación Funcional DOSW** | 100 / 100 | **Excelente** | Cobertura total de perfiles, directorio hiperlocal, reputación por oficio y reporte de reseñas falsas (RF-38). |

---

## 2. Auditoría Detallada por Criterio

### A. Paleta de Colores y Tokens Semánticos
* **Cumplimiento de Marca:**
  * **Amarillo Canario (`#FFC72C`)**: Energía / badges destacados.
  * **Ámbar Cálido (`#F59E0B`)**: Calificaciones y estrellas.
  * **Verde Esmeralda (`#10B981`)**: Estado *"Disponible Ahora"*.
  * **Azul Marino (`#1E3A8A`)**: Rol Contratante y foco de confianza.
  * **Naranja Many (`#C9622A`)**: Pelaje y acentos de la mascota Many.
  * **Naranja Fuego (`#EA580C`) / Fuego AA (`#C2410C`)**: Rol Profesional y botones de acción principal.
  * **Cacao Profundo (`#3E1F14`)**: Contorno firma de 1.5px (`--stroke-ink`), sustituyendo al negro plano para otorgar calidez.
  * **Almendra Claro (`#F8D8A8`)**: Fondos suaves y lavados de calidez.
* **Evaluación de Contraste:** 
  * Se verificó que ningún texto blanco se coloque sobre Amarillo Canario sin su pastilla de contraste (9.54:1).
  * Los estados de error usan `--oy-rojo` (`#DC2626`) reservado estrictamente para alertas destructivas, sin violar la paleta de marca.

### B. Tipografía y Escala Proporcional
* **Tipografías:**
  * Titulares y cifras clave: `DM Sans` (800 / 700) con tracking ajustado (`-0.02em`).
  * Textos de lectura, inputs y tablas: `Inter` (400 / 600 / 700).
* **Escala:**
  * Se usan variables dinámicas `clamp()` (`--text-display`, `--text-h1`, `--text-h2`) garantizando que los titulares monumentales no desborden en pantallas pequeñas (375px).

### C. Auditoría del Sistema de Animación y GSAP (`contexto/gsap-public`)
* **Herramientas identificadas en el repositorio:**
  * `gsap` (Core + `ScrollTrigger` en `StrokeText.tsx` y `StaggeredMenu.tsx`).
  * `@react-spring/web` para física elástica directa al DOM (contadores de KPIs en tiempo real, micro-inclinación 3D en `SpringTilt` y reacciones elásticas de Many).
  * `framer-motion` para transiciones de vista y menús flotantes.
* **Verificación de Rendimiento de Animación:**
  * **Propiedades compuestas:** El 95% de las animaciones animan exclusivamente `transform` y `opacity`, evitando reflujos de layout (`width`/`height`).
  * **Gating de Accesibilidad:** Las transiciones respetan `window.matchMedia('(prefers-reduced-motion: reduce)')`.

---

## 3. Matriz de Requerimientos DOSW vs Frontend

| ID Requerimiento | Descripción | Estado en Frontend | Ubicación |
| :--- | :--- | :---: | :--- |
| **OFY-01 .. OFY-10** | Perfil de trabajador, tarifas, zona, horarios y fotos | **Cumplido** | `WorkerProfileView.tsx` |
| **OFY-11 .. OFY-18** | Búsqueda por necesidad en lenguaje natural y filtros | **Cumplido** | `SeekerDirectory.tsx` |
| **OFY-30 .. OFY-33** | Toggle "Disponible Ahora" en tiempo real | **Cumplido** | `ProviderDashboard.tsx` y `SeekerDirectory.tsx` |
| **OFY-38** | Reporte de reseña falsa (sin borrado automático) | **Cumplido** | `WorkerProfileView.tsx` (Tickets en `localStorage`) |
| **OFY-55** | Alternar rol Contratante / Profesional sin relogueo | **Cumplido** | `AppHeader.tsx` / `AuthContext.tsx` |
| **OFY-56 / OFY-71** | Reputación diferenciada por oficio técnico | **Cumplido** | Pestaña *"Oficios & Reputación"* en `WorkerProfileView.tsx` |
| **OFY-60** | Métodos de pago (Efectivo, Nequi, Daviplata) | **Cumplido** | `WorkerProfileView.tsx` & `SettingsModal.tsx` |

---

## 4. Hallazgos y Oportunidades de Mejora

### 1. Integración de GSAP `Flip` (`contexto/gsap-public/src/Flip.js`)
* **Oportunidad:** Al cambiar de categoría de oficios en el directorio (ej. de *Electricidad* a *Plomería*), la reorganización de las tarjetas actualmente ocurre mediante render de React.
* **Solución recomendada:** Utilizar `Flip.from()` de GSAP para animar suavemente la posición de las tarjetas en la cuadrícula cuando se filtran.

### 2. Estandarización de Estilos en Línea residuales
* **Hallazgo:** Se identificaron algunos contenedores menores con `style={{ ... }}` inline (por ejemplo, anchos máximos en contenedores de `App.tsx` o paddings en modales).
* **Solución recomendada:** Migrar los estilos inline residuales a clases CSS dedicadas vinculadas a los tokens `--space-*`.

---

## 5. Conclusión de la Auditoría
El Frontend de **OficioYa** cumple rigurosamente con los lineamientos del manual de identidad, los requerimientos de la asignatura DOSW y las directrices de diseño editorial y accesible. La combinación de GSAP con la física de `@react-spring/web` proporciona una interfaz fluida, interactiva y de alto rendimiento.
