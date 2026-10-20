# Referencia de estilo · "Slush" adaptado a OficioYa

> Lenguaje visual: stickers recortados sobre papel pastel.
> **Regla de oro:** el Manual de Identidad de OficioYa manda en colores, logo y mascota.
> De Slush tomamos el *lenguaje* (formas, contornos, tipografía display, stickers, ritmo),
> nunca su paleta.

## 1. Cómo se aplica en OficioYa

| Slush | OficioYa (manual) | Dónde vive |
|---|---|---|
| Carbon `#000000` como contorno "recortado a mano" | **Cacao Profundo `#3E1F14`** (`--stroke-ink`). En oscuro, Almendra al 32 % | `src/styles/tokens.css` |
| Contornos de 1 px en todo lo interactivo | Contorno de **1.5 px** en tarjetas, botones, insignias e inputs | `src/styles/sticker.css` |
| Botones y nav en píldora (1600 px) | `--radius-pill: 999px` para botones, chips y pestañas | `sticker.css` |
| Tarjetas 20–40 px | `--radius-card: 20px`, `--radius-card-lg: 40px` | `tokens.css` |
| Sin sombras: la elevación es color + contorno | `.card`, `.btn` sin `box-shadow`; al pasar el cursor solo se levantan 2 px | `sticker.css` |
| CTA relleno negro | CTA relleno con el **color del rol** (Azul Marino / Naranja Fuego AA) + contorno Cacao. El negro no está en el manual | `sticker.css` |
| Botón fantasma blanco con contorno | Superficie blanca + contorno Cacao + texto Cacao/principal | `sticker.css` |
| Lateral 800, interlineado 0.75–0.80 | **DM Sans 800** (la display del manual), interlineado 0.82, tracking −0.04em | `.oy-display` |
| Aeonik Pro 500/700 con tracking 0.03em en etiquetas | **Inter** (texto del manual) 700 con `--tracking-label: 0.032em` en botones y etiquetas | `sticker.css` |
| Sky Wash `#dceeff` como fondo de hero | **Lavado Almendra** (`--color-warm-soft`) para el hero; lavados Azul Marino y Esmeralda para tarjetas acento | `tokens.css` |
| Paleta de 6 stickers (azul, menta, lavanda, ember, sunburst, violeta) | Stickers con los colores del manual: Amarillo Canario, Esmeralda, Naranja Fuego, Azul Marino, Almendra, Ámbar | `LandingSticker.css` |
| Marquesina negra con texto blanco | Marquesina **Cacao** con texto **Almendra** (11:1) que nombra los oficios | Landing |
| Cinta 3D azul detrás del texto | No se copia: el elemento firma de OficioYa es **Many** y el fondo animado MicroSlats | — |
| Sin degradados | Se quitaron los degradados del hero; el fondo animado sigue (lo pidió el equipo) | Landing |
| Verde menta no es estado de éxito | Aquí **Esmeralda sí es "Disponible"** porque así lo define el manual | — |

### Choques resueltos

1. **Negro vs. Cacao:** el manual no tiene negro; Cacao cumple el mismo papel de "línea recortada" y mantiene la calidez de la marca.
2. **CTA negro vs. color de rol:** el manual asigna Azul Marino (confianza) al contratante y Naranja Fuego al profesional; el CTA usa ese color con contorno Cacao.
3. **Azul eléctrico decorativo:** no existe en el manual. Su papel de "superficie de marca" lo toma el Amarillo Canario en stickers y el lavado Almendra en fondos.
4. **Texto amarillo:** nunca va como texto sobre fondo claro (1.3:1). El "Ya" del wordmark se muestra como sticker Amarillo con texto Cacao (9.5:1).
5. **Logo y Many:** no se deforman, rotan ni recortan (manual). Solo los stickers decorativos van rotados.
6. **Ancho de página:** se mantiene 1200 px en la app (densidad de datos); la landing usa bandas a sangre completa.
7. **Movimiento:** como en Slush, la marquesina es lo único que se mueve en la landing además de Many; se detiene con `prefers-reduced-motion`.

---

## 2. Referencia original (Slush — Style Reference)

> inflatable sticker universe on pastel paper

**Theme:** light

Source measurements are normalized; roles and recommendations are interpreted. Font summary lists are independent, not paired by position. HTML examples are reconstructions, not source components.

Slush runs on a sticker-book logic: pastel paper canvas, huge inflated 3D ribbons in electric blue, and a full rainbow of vivid sticker accents scattered like confetti. Display type is enormous and crushed (Lateral 800 at 200–640px, line-height 0.75–0.80) so the words become sculptural objects, not sentences. The six saturated brand colors function as a shared sticker palette — every color appears as a filled sticker, a card surface, or a decorative wash, never as a restrained accent. Components are rounded to the point of softness (20–40px on cards, pill-shaped on nav) and outlined in black for a hand-cut feel. The result reads less like a fintech landing page and more like a physical collage pinned to a pale wall.

### Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Carbon | `#000000` | `--color-carbon` | Primary text, card borders, filled CTA background, logo mark — creates the hand-cut sticker outline effect against pastel surfaces |
| Paper White | `#ffffff` | `--color-paper-white` | Page canvas, card surfaces, outlined button fills, text on dark fills |
| Sky Wash | `#dceeff` | `--color-sky-wash` | Hero section background, light blue pastel ground |
| Concrete Gray | `#cccccc` | `--color-concrete-gray` | Secondary section background, neutral interlude surface |
| Soft Mist | `#e9e9e9` | `--color-soft-mist` | Subtle button and surface tints, disabled states |
| Electric Blue | `#4da2ff` | `--color-electric-blue` | Dominant brand color — 3D ribbon sculptures, body backgrounds, card washes, the visual signature that anchors every screen |
| Mint Pop | `#55db9c` | `--color-mint-pop` | Green wash for highlight backgrounds, decorative bands, and soft emphasis behind content |
| Lavender | `#e9ccff` | `--color-lavender` | Soft accent wash for cards, tags, sticker fills — the gentlest color in the palette |
| Ember | `#fb4903` | `--color-ember` | Hot accent for sticker icons, badge fills, rocket body — warmest hit in the rainbow |
| Sunburst | `#ffd731` | `--color-sunburst` | Sticker coin fills, highlight accents, yellow sticker decorations — never used for text backgrounds |
| Voltage Violet | `#5c4ade` | `--color-voltage-violet` | Deep accent for wallet stickers, QR download cards, secondary CTAs — the anchor purple in the sticker set |

### Tokens — Typography

#### Lateral · `--font-lateral`
- **Substitute:** Druk, Bowlby One, Antonio
- **Weights:** 800
- **Sizes:** 70px, 110px, 160px, 200px, 281px, 640px
- **Line height:** 0.75–0.80
- **Letter spacing:** normal
- **Role:** Display headlines only — the wordmark 'SLUSH' and section banners like 'ALL THINGS SUI' sit at 200–640px with crushed 0.75–0.80 line-height so the letters stack into sculptural blocks. This is anti-convention display: no other site pairs an 800-weight display face with line-height under 0.85, and the effect makes text behave like a physical object that wraps behind 3D ribbons.

#### Aeonik Pro · `--font-aeonik-pro`
- **Substitute:** Inter, Satoshi, General Sans
- **Weights:** 500, 700
- **Sizes:** 12px, 13px, 14px, 15px, 16px, 24px, 30px, 64px
- **Line height:** 1.00–1.56
- **Letter spacing:** -0.010em body, 0.030em nav/buttons, 0.032em uppercase labels
- **OpenType features:** `"ss01" on, "tnum"`
- **Role:** All UI, body, nav, buttons, subheads. Weight 500 for body and metadata (12–16px), weight 700 for subheads and nav labels (24–30px), and a 64px 700-weight step for large supporting headlines. Tight letter-spacing (-0.010em) tightens the 14–16px body; slight opening (0.030–0.032em) on nav/button labels gives pill controls breathing room.

#### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| caption | 12px | 1.56 | -0.01px | `--text-caption` |
| body-lg | 15px | 1.39 | -0.01px | `--text-body-lg` |
| subheading | 24px | 1.2 | -0.01px | `--text-subheading` |
| heading-sm | 30px | 1.1 | -0.01px | `--text-heading-sm` |
| heading | 64px | 1 | -0.01px | `--text-heading` |
| display | 200px | 0.8 | 0px | `--text-display` |
| display-lg | 640px | 0.75 | 0px | `--text-display-lg` |

### Tokens — Spacing & Shapes

**Base unit:** 4px · **Density:** comfortable

Spacing scale: 4, 8, 12, 16, 20, 24, 28, 32, 40, 44, 48, 60, 80, 128, 180, 224 px (`--spacing-N`).

| Element | Radius |
|---------|--------|
| nav | 1600px |
| body | 30px |
| cards | 20px |
| pills | 1600px |
| buttons | 1600px |
| wallet-icon | 16px |
| cards-elevated | 40px |

**Layout:** page max-width 1440px · section gap 48px · card padding 24px · element gap 4–12px.

### Components

- **Pill Nav Button** — 1600px radius, 1px solid #000 border, #fff fill, Aeonik Pro 700 at 12–14px with 0.032em letter-spacing, 15px/12px padding, 4px gaps.
- **Filled CTA Button** — 40px radius, #000 background, #fff text, Aeonik Pro 700 at 13–14px, 10px/12px padding. Single highest-priority action per screen.
- **Outlined Ghost Button** — 1600px radius, 1px solid #000 border, #fff background, #000 text, Aeonik Pro 700 at 13–14px with 0.032em letter-spacing, 10px/12px padding.
- **Logo Mark** — circular black-outlined badge, 1px #000 border on #fff fill, top-left.
- **Plus Menu Button** — circular icon button, 1px #000 border, #fff fill, + glyph.
- **QR Download Card** — 20px radius, #5c4ade background, white QR panel + label panel with white 700 'DOWNLOAD'.
- **Sticker Decoration** — flat illustrated stickers with 1px #000 outline, 16–20px radius, one brand color fill, overlapping and rotated around display type, never grid-aligned.
- **Marquee Banner** — full-bleed #000 band at page top, #fff Aeonik Pro 700 uppercase 12–13px, 0.032em, repeating message.
- **Display Headline Block** — Lateral 800 at 200–640px, line-height 0.75–0.80, #000, always paired with a smaller tagline below.
- **Tagline Subhead** — Aeonik Pro 500 at 24–64px directly below the display block.
- **3D Ribbon Element** — grainy inflatable blue (#4da2ff) tube wrapping behind display text; brand symbol in every section.
- **Section Background Panel** — full-bleed bands alternating #dceeff, #ffffff, #cccccc; no border or shadow.

### Do's and Don'ts

**Do**
- Use Lateral 800 at 200–640px with line-height 0.75–0.80 for any display headline.
- Apply the six-color sticker palette as a shared set — multiple colors per screen.
- Set all interactive elements (nav, buttons, cards) to 1px solid #000 borders.
- Round nav, buttons and tags to pill shape and cards to 20–40px.
- Pair every display headline with a 3D ribbon or sticker cluster.
- Use 700 weight with 0.030–0.032em letter-spacing for nav, button and uppercase labels.
- Alternate section backgrounds to create scroll rhythm without dividers or shadows.

**Don't**
- No border-radius under 16px for cards or under pill for buttons/tags.
- No line-height above 0.85 on display text.
- Don't use the decorative blue as CTA fill or link color.
- No box-shadows on cards, buttons or surfaces.
- Don't use the mint green as a success state.
- Don't constrain the page under 1280px.
- No gradients anywhere.

### Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 1 | Sky Wash | `#dceeff` | Hero and primary section background |
| 2 | Paper White | `#ffffff` | Card surfaces, nav, outlined button fills |
| 3 | Concrete Gray | `#cccccc` | Secondary section interlude |
| 4 | Sticker Surfaces | `#e9ccff` | Accent card fills |

### Imagery, layout and motion

Dominated by 3D-rendered blue ribbons wrapping behind display text; flat 2D stickers (rocket, coin, checkmark, wallet) float around headlines with 1px black outlines. No photography. Full-bleed scroll layout: marquee + minimal top nav (logo left, pill nav center, filled CTA right), then full-viewport color bands with oversized display text, collage-like and asymmetric, 48px section gaps. Motion is restricted to the marquee and minimal hover transitions on buttons; ribbons and stickers are static.

### Similar brands

Rainbow.me · Phantom Wallet · Backpack Wallet · Magic Eden.

### Quick Start (CSS custom properties)

```css
:root {
  --color-carbon: #000000;
  --color-paper-white: #ffffff;
  --color-sky-wash: #dceeff;
  --color-concrete-gray: #cccccc;
  --color-soft-mist: #e9e9e9;
  --color-electric-blue: #4da2ff;
  --color-mint-pop: #55db9c;
  --color-lavender: #e9ccff;
  --color-ember: #fb4903;
  --color-sunburst: #ffd731;
  --color-voltage-violet: #5c4ade;

  --text-caption: 12px;    --leading-caption: 1.56;
  --text-body-lg: 15px;    --leading-body-lg: 1.39;
  --text-subheading: 24px; --leading-subheading: 1.2;
  --text-heading-sm: 30px; --leading-heading-sm: 1.1;
  --text-heading: 64px;    --leading-heading: 1;
  --text-display: 200px;   --leading-display: 0.8;
  --text-display-lg: 640px; --leading-display-lg: 0.75;

  --radius-nav: 1600px;
  --radius-body: 30px;
  --radius-cards: 20px;
  --radius-pills: 1600px;
  --radius-buttons: 1600px;
  --radius-wallet-icon: 16px;
  --radius-cards-elevated: 40px;
}
```

*(Se omitió el bloque `@theme` de Tailwind v4 del original: el proyecto no usa Tailwind.)*
