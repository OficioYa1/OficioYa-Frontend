# Oficio Ya — Manual de Identidad, Producto y Diseño

Bienvenido al manual de identidad, diseño y experiencia de usuario de **Oficio Ya**. Este documento no es un README técnico genérico; es la guía definitiva para entender qué es el proyecto, por qué fue diseñado de esta manera y cuáles son las reglas que garantizan su coherencia visual y conceptual durante su evolución.

---

## 1. Identidad de Oficio Ya

### ¿Qué es Oficio Ya?
Oficio Ya es una plataforma digital de **directorio inteligente y reputación verificada** enfocada en oficios técnicos y asistenciales. 

### El Problema
Encontrar a un buen plomero, electricista o cerrajero en el momento de una emergencia suele depender del "boca a boca" informal o de directorios desactualizados. Existe desconfianza en quién entra a tu casa y falta de garantías sobre la calidad del trabajo.

### La Solución
Oficio Ya conecta directamente a personas que necesitan solucionar un problema en su hogar o negocio, con profesionales verificados y evaluados que se encuentran cerca (geolocalizados). 

### Ecosistema de Dos Caras
Oficio Ya no son dos aplicaciones separadas. Es un único ecosistema fluido con dos modos de interacción:
- **El Contratante:** Persona que tiene un problema (ej. una fuga de agua) y busca a un profesional local de forma rápida y confiable.
- **El Profesional:** Persona que ofrece su talento (ej. plomería), encuentra oportunidades, construye una reputación digital y puede recibir recomendaciones de otros colegas.

---

## 2. Eslogan Oficial

El eslogan oficial y permanente de la marca es:

> **"El talento de tu zona a un click de distancia"**

### Significado
- **"El talento"**: Representa las habilidades, experiencia y oficios de las personas que forman parte de Oficio Ya.
- **"de tu zona"**: Representa la cercanía, la comunidad local y la posibilidad de encontrar profesionales próximos al usuario.
- **"a un click de distancia"**: Representa rapidez, accesibilidad y facilidad para conectar.

### Implementación Visual (TrueFocus)
En la pantalla principal, el eslogan utiliza visualmente el componente **`TrueFocus`**. Este componente aplica una sutil animación progresiva que enfoca las palabras de la frase mientras las demás mantienen un leve desenfoque. 
*Regla de uso:* La animación **debe ser sutil, elegante y nunca comprometer la legibilidad** de la frase. Funciona como un pequeño detalle de identidad, reduciendo mentalmente la distancia entre quien necesita ayuda y quien puede ofrecerla, y nunca debe usarse en títulos secundarios o textos de interfaz genéricos.

---

## 3. Personalidad de Marca

Oficio Ya se define como una marca:
✅ **Cercana y humana**
✅ **Práctica y rápida**
✅ **Confiable y local**
✅ **Moderna y accesible**

**Lo que Oficio Ya NO ES y NO DEBE TRANSMITIR:**
❌ Una plataforma corporativa fría.
❌ Un "dashboard" empresarial.
❌ Un marketplace genérico de productos.
❌ Una aplicación excesivamente tecnológica o robótica.
❌ Una interfaz saturada.

La tecnología debe estar **completamente al servicio** de las personas y los oficios.

---

## 4. Many — La Mascota de Oficio Ya

**Many** es el castor mascota de la plataforma. 

### ¿Por qué un castor?
El castor es el ingeniero de la naturaleza: constructor nato, trabajador, resolutivo, familiar y comunitario. Encarna y representa la esencia del mundo de los oficios, la reparación y el esfuerzo constante.

### Uso y Reglas
Many es el elemento humano e interactivo de la interfaz. No es una decoración estática permanente.
- **Cuándo usarlo:** Flujos de onboarding, ayudas en pantalla, estados vacíos (empty states), mensajes de confirmación de éxito, recomendaciones y comunicaciones oficiales de marca.
- **Cuándo NO usarlo:** Como un elemento decorativo que distraiga la lectura del directorio o sature procesos críticos que requieren atención inmediata.

---

## 5. El Logo

El logotipo de Oficio Ya está construido para transmitir cercanía, reconocimiento inmediato y accesibilidad.

- **Construcción y Proporciones:** Está compuesto por el Símbolo (el rostro de Many) ubicado a la izquierda y el Wordmark (el nombre "OficioYa") a la derecha. El tamaño del símbolo define el alto del wordmark para lograr balance visual.
- **Wordmark:** Las palabras "Oficio" y "Ya" se escriben juntas, resaltando la letra "Y" en mayúscula y aplicando el color amarillo de marca (`#FFC72C`) a la partícula "Ya".
- **Colores:** Se apoya en una transición cálida y enérgica en su texto (deformación visual permitida en landing) o en azul corporativo/negro para interfaces formales.
- **Reglas de seguridad:** Siempre debe mantener un espacio de respiro equivalente al tamaño del ojo de Many.
- **Usos incorrectos:** Prohibido deformar el logo, cambiar la posición relativa del castor respecto a la tipografía, o aplicar sombras pesadas que ensucien su lectura.

---

## 6. Inspiración del Logo

El diseño y conceptualización del logo y la marca de Oficio Ya tomó inspiración de referentes internacionales que dominan el diseño de productos amigables.

Una inspiración clave visual fue **Duolingo**. 
- *Por qué:* Por su uso magistral de una mascota como elemento central de reconocimiento visual y su capacidad de dotar al personaje de una personalidad amigable que representa plenamente los valores de la marca.

> **IMPORTANTE:** Duolingo se menciona estricta y únicamente como un referente e inspiración de diseño (UI/Branding). Oficio Ya **no** tiene ninguna relación, asociación, aprobación, patrocinio ni afiliación con Duolingo Inc.

---

## 7. Inspiración de la App

Para pensar la experiencia y arquitectura de Oficio Ya, se utilizaron dos referencias conceptuales fundamentales:

### LinkedIn
- **Inspiración:** Se tomó la visión de la conexión humana profesional, la estructura de perfiles con experiencia detallada y el énfasis absoluto en la **reputación y la validación de habilidades (skills)**. Oficio Ya adapta este nivel de seriedad y confianza, pero aterrizado al mundo de los oficios y servicios técnicos locales.

### inDrive
- **Inspiración:** Se tomó la lógica operativa de la "proximidad", la velocidad del servicio bajo demanda (on-demand), la conexión directa sin intermediarios opacos y la agilidad de publicar una solicitud rápida para que el mercado local responda.

---

## 8. Sistema Visual

Oficio Ya utiliza un sistema de *Design Tokens* extraídos de `index.css`:

| Elemento | Variable en código | Uso Principal |
| :--- | :--- | :--- |
| **Amarillo / Naranja** | `--brand-yellow` / `--brand-amber` | Acentos de marca, color de Many, insignias de "Más Cercano" |
| **Azul (Contratante)** | `--role-primary: #1E3A8A` | Navegación, acciones principales y botones del rol cliente |
| **Naranja (Profesional)** | `--role-primary: #EA580C` | Alertas, dashboard y flujos del rol trabajador |
| **Verde** | `--color-success: #10B981` | Disponibilidad (Disponible Ahora), status positivos |
| **Fondos** | `--color-bg: #F8FAFC` | Superficie base de la aplicación (modo claro) |
| **Gris Secundario** | `--color-text-muted` | Textos secundarios, descripciones, iconos pasivos |

- **Radios:** Redondeados amplios (`14px`, `20px`, `28px`, `9999px`) para un diseño limpio, moderno (soft-ui).
- **Sombras:** Ligeras (`--shadow-md`, `--shadow-lg`) para crear elevación sin opacar el contenido.

---

## 9. Tipografía

Oficio Ya utiliza un sistema dual optimizado para proyectar la sensación de ser: **moderna + clara + accesible + profesional.**

- **Títulos (Headings): `DM Sans`**. Utilizada en tamaños grandes (H1-H4) para aportar personalidad e impacto geométrico.
- **Cuerpo y UI: `Inter`**. Aplicada a párrafos, etiquetas, precios, navegación y botones. Inter garantiza neutralidad y legibilidad óptima en cualquier tamaño de pantalla.
- **Jerarquía:** El uso inteligente de pesos tipográficos (pesado para nombres de profesionales y precios, ligero para oficios) permite escanear perfiles rápidamente.

---

## 10. Iconografía

El sistema de iconos se basa íntegramente en la librería **Lucide React**.

**Reglas del sistema de iconos:**
- Todos los iconos deben ser vectoriales de línea constante (stroke).
- Deben tener un grosor uniforme que se sienta integrado a la tipografía `Inter`.
- Deben transmitir consistencia. Los iconos cambian de opacidad para demostrar estados activos/inactivos.
- **PROHIBIDO:** Usar emojis nativos de sistema operativo como sustitutos de la iconografía UI.

---

## 11. Fotografía y Profesionales

**Oficio Ya conecta personas, no productos.**
Las fotografías en la plataforma tienen un valor incalculable para generar confianza. 

- **Tratamiento:** Se priorizan formatos amplios o recortes orgánicos, no miniaturas cuadradas diminutas.
- **Composición:** Las fotografías deben mostrar rostros humanos, profesionales reales, o herramientas en acción; evitando fotos de archivo (stock) sin alma.
- **Relación UI:** La foto acompaña inmediatamente el nombre, superponiéndose con iconos de acento según la disponibilidad y el oficio, haciendo que el perfil se perciba humano y no como el catálogo de un supermercado.

---

## 12. Diseño de Perfiles

El sistema visual utilizado para los perfiles descarta la antigua y aburrida retícula de "tarjetas cerradas grandes" (cards genéricas). 

En cambio, Oficio Ya utiliza **composiciones editoriales más abiertas y continuas**, respetando una jerarquía de escaneo estricta:
**Fotografía → Nombre → Oficio → Reputación (Estrellas) → Distancia → Precio → Disponibilidad**

Se evita encerrar la información en cajas pesadas; en su lugar, se utilizan márgenes generosos, alineación a la izquierda y líneas divisorias extremadamente sutiles.

---

## 13. Modo Contratante

La experiencia del contratante gira bajo el principio rector: **“Tengo un problema y necesito resolverlo.”**

- **Búsqueda Protagonista:** Un campo de entrada hiper-visible para escribir qué se necesita.
- **Profesionales Cercanos:** Muestra a los expertos geolocalizados a su alrededor.
- **Fricción Cero:** Publicación de solicitudes sencilla, filtros rápidos de oficios, chat directo, acceso a reseñas y contratación mediante seguimiento instantáneo.

---

## 14. Modo Profesional

La experiencia del trabajador se basa en el principio rector: **“Hay personas que necesitan lo que yo sé hacer.”**

- **Oportunidades:** Un dashboard centrado en mostrar y notificar solicitudes de trabajo cercanas.
- **Disponibilidad Ágil:** Controles visuales muy claros para alternar entre "disponible" o "fuera de línea".
- **Identidad Diferenciada:** Uso del color naranja para orientar el esquema mental de "estoy en modo trabajo y listo para gestionar clientes, alertas y mensajes".

---

## 15. Sistema de Recomendaciones

Una característica revolucionaria y diferenciadora de Oficio Ya es la **red colaborativa de recomendaciones**.

**Caso de Uso:** 
Un carpintero encuentra una solicitud que requiere plomería cerca de su zona. En lugar de ignorarla por no ser su área, el carpintero puede utilizar la acción "Recomendar" para enviar una alerta interna a un colega plomero dentro de la misma plataforma.

**Flujo:**
*Solicitud creada → Profesional no especializado la ve → Recomienda a un colega → El colega recibe alerta → Cliente recibe un prospecto validado → Conexión.*

**Objetivo:** Oficio Ya busca crear un ecosistema solidario donde los trabajadores independientes no solamente compiten entre sí, sino que se nutren mutuamente referenciando clientes a colegas confiables.

---

## 16. Sistema de Mensajería

El contacto es el paso definitivo antes del servicio.
- **Panel Integrado:** La mensajería (conversaciones entre contratante y profesional) se maneja mediante paneles laterales rápidos o drawers flotantes, en lugar de forzar recargas completas de pantalla.
- **Prioridad Visual:** Se reduce texto innecesario y se apoyan los estados en iconografía (leído, enviado, unread badges con el conteo de mensajes).

---

## 17. Navegación

La filosofía de navegación es estricta: **menos texto constante, más reconocimiento visual rápido.**

- Se basa en menús superiores e inferiores con iconos universales.
- `Inicio`, `Buscar`, `Mensajes`, `Solicitudes` y `Perfil` deben ser siempre íconos Lucide.
- Los textos complementarios solo deben mostrarse para clarificar acciones secundarias complejas o cuando la pestaña de un menú bottom se encuentre activa.
- Cero emojis.

---

## 18. Microinteracciones y Animaciones

El movimiento existe en Oficio Ya, pero con un propósito. 

**Las animaciones deben:**
- Orientar al usuario en un flujo.
- Confirmar un éxito (ej. botones ripple, expansiones).
- Aportar personalidad e identidad (el componente `TrueFocus` en el eslogan o Many saludando sutilmente).
- Hacer sentir que la interfaz está viva.

**Las animaciones NUNCA deben:**
- Distraer la lectura de contenido crítico (precios, descripciones).
- Ralentizar la app.
- Saturar o sobreestimular con gradientes rebotando innecesariamente.

---

## 19. Diseño Responsive

Oficio Ya se diseña para funcionar impecablemente en cualquier tamaño.
- **Móvil:** Es la pantalla reina. Componentes interactivos como el menú selector de oficios (`OptionWheel`) permiten deslizar con el dedo en pantallas táctiles de manera lúdica y compacta.
- **Escritorio / Tablet:** Los elementos de un layout móvil no deben estirarse inútilmente. El directorio se reorganiza en grillas de varias columnas, y elementos como los chats y modales se fijan a la derecha sin bloquear el contenido central.

---

## 20. Principios UX Permanentes

Para mantener la calidad conceptual de la plataforma, memoriza estos principios:
1. **La persona antes que el componente.**
2. **El problema antes que la tecnología.**
3. **La cercanía debe ser visible en todo momento.**
4. **La disponibilidad debe entenderse inmediatamente.**
5. **Menos botones, mejores acciones.**
6. **Los iconos deben reducir ruido visual.**
7. **Las fotografías reales aportan confianza y humanidad.**
8. **El diseño debe sentirse hiper-local.**
9. **La interfaz debe ser rápida de entender (escaneable).**
10. **Cada elemento visual debe tener una función clara.**

---

## 21. Qué NO hacer (Reglas Negativas)

Si diseñas o desarrollas para Oficio Ya, **EVITA**:
- Dashboards genéricos y analíticas complejas que no sirven de nada a los usuarios base.
- El exceso de tarjetas blancas con borde y sombra (card overload).
- El exceso de botones secundarios (pills) que ahogan la pantalla.
- Crear interfaces completamente grises y tristes.
- El uso de emojis como reemplazo de verdaderos iconos SVG UI.
- Sombras negras pesadas de la web antigua.
- Añadir glassmorphism (transparencias blur) donde no se necesita, comprometiendo la lectura.
- Copiar visualmente elementos de otras plataformas solo porque están de moda, sin entender si resuelven un problema en Oficio Ya.

---

## 22. Principio Central de Diseño

> Oficio Ya no es solamente una aplicación de software para encontrar servicios. **Es una red local que conecta a personas que necesitan resolver algo con personas que saben cómo hacerlo.** 
> La tecnología facilita la conexión y acelera la búsqueda, pero **las personas y sus oficios son, y serán siempre, el centro absoluto de la experiencia.**
