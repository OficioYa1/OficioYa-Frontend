/**
 * Rutas de recursos públicos respetando el `base` de Vite (GitHub Pages sirve
 * la app bajo /oficioya-frontend/, así que las rutas absolutas /assets/... fallan).
 */
export const assetUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const BRAND_ASSETS = {
  logo: assetUrl('assets/mascot/logo.webp'),
  icono: assetUrl('assets/mascot/icono.webp'),
  manyWave: assetUrl('assets/mascot/many-wave.webp'),
  manyElectricista: assetUrl('assets/mascot/many-electricista.webp'),
  manyPlomero: assetUrl('assets/mascot/many-plomero.webp'),
} as const;
