// Geolocalización y cálculo de distancia Haversine

export interface Coordinates {
  lat: number;
  lng: number;
}

// Coordenadas oficiales de fallback: Chapinero / Parque de la 93, Bogotá D.C.
export const FALLBACK_LOCATION_BOGOTA: Coordinates = {
  lat: 4.6768,
  lng: -74.0482
};
export const FALLBACK_LOCATION_MEDELLIN = FALLBACK_LOCATION_BOGOTA; // retrocompatibilidad

// Cálculo de distancia mediante fórmula Haversine en kilómetros
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Radio de la Tierra en km

  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Redondeado a 1 decimal
}

// Formateador de distancia amigable
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Color y estado de la barra de proximidad:
// Verde < 2 km, Naranja < 5 km, Gris más lejos
export function getProximityStatus(km: number): {
  color: string;
  label: string;
  levelClass: 'prox-near' | 'prox-medium' | 'prox-far';
} {
  if (km < 2.0) {
    return { color: '#10B981', label: 'Muy cerca (< 2 km)', levelClass: 'prox-near' };
  } else if (km < 5.0) {
    return { color: '#F59E0B', label: 'Cerca (< 5 km)', levelClass: 'prox-medium' };
  } else {
    return { color: '#94A3B8', label: 'A más de 5 km', levelClass: 'prox-far' };
  }
}
