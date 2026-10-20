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

  // Oficios de Many
  manyElectricista: assetUrl('assets/mascot/many-electricista.jpg'),
  manyPlomero: assetUrl('assets/mascot/many-plomero.jpg'),
  manyCarpintero: assetUrl('assets/mascot/many-carpintero.jpg'),
  manyCerrajero: assetUrl('assets/mascot/many-cerrajero.jpg'),
  manyPintura: assetUrl('assets/mascot/many-pintura.jpg'),
  manyElectrodomesticos: assetUrl('assets/mascot/many-electrodomesticos.jpg'),
  manyJardinero: assetUrl('assets/mascot/many-jardinero.jpg'),
  manyTecnologia: assetUrl('assets/mascot/many-tecnologia.jpg'),
  manyModista: assetUrl('assets/mascot/many-modista.jpg'),
  manyHogar: assetUrl('assets/mascot/many-hogar.jpg'),
  manyMascotas: assetUrl('assets/mascot/many-mascotas.jpg'),
  manyAseo: assetUrl('assets/mascot/many-aseo.jpg'),
  manyAlbanileria: assetUrl('assets/mascot/many-albanileria.jpg'),
  manyClases: assetUrl('assets/mascot/many-clases.jpg'),
  manyCable: assetUrl('assets/mascot/many-cable.jpg'),
  manyLlave: assetUrl('assets/mascot/many-llave.jpg'),
  manyLupa: assetUrl('assets/mascot/many-lupa.jpg'),

  // Flujos clave y estados reactivos
  manyExito: assetUrl('assets/mascot/many-exito.jpg'),
  manyDisponible: assetUrl('assets/mascot/many-disponible.jpg'),
  manyEscudo: assetUrl('assets/mascot/many-escudo.jpg'),
  manySoporte: assetUrl('assets/mascot/many-soporte.jpg'),
  manyCierre: assetUrl('assets/mascot/many-cierre.jpg'),
} as const;
