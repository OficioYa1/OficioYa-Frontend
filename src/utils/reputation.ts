// Reputación digital (OFY-10, OFY-34..37, OFY-39, OFY-45, OFY-46, OFY-53, OFY-56)
// Funciones puras: reciben entidades y devuelven copias nuevas, listas para guardar en `oy-workers` / `oy-services`.

import type { Review, ServiceRequest, TradeCategory, TradeReputation, Worker } from '../types';

/** Mínimo de reseñas recientes que se evalúan para la pausa automática (OFY-39). */
export const PAUSE_WINDOW = 5;
/** Promedio por debajo del cual el perfil se pausa automáticamente (OFY-39). */
export const PAUSE_THRESHOLD = 3;

const round2 = (n: number) => Math.round(n * 100) / 100;

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((acc, v) => acc + v, 0) / values.length;

/** Promedio incremental: el valor sembrado cuenta con su peso (reviewCount). */
const addToAverage = (current: number, count: number, value: number) =>
  round2((current * count + value) / (count + 1));

const emptyTradeRep = (): TradeReputation => ({ rating: 0, reviewCount: 0, completedJobs: 0 });

/**
 * Agrega una reseña verificada al trabajador y recalcula rating, reviewCount y ratingByTrade.
 * Aplica la regla de pausa automática si el promedio de las últimas 5 reseñas es menor a 3.0.
 */
export const applyReview = (worker: Worker, review: Review): Worker => {
  const trade: TradeCategory = review.tradeCategory ?? worker.trade;
  const reviews = [review, ...worker.reviews];
  const prevTrade = worker.ratingByTrade?.[trade] ?? emptyTradeRep();

  const ratingByTrade: Record<string, TradeReputation> = {
    ...(worker.ratingByTrade ?? {}),
    [trade]: {
      ...prevTrade,
      rating: addToAverage(prevTrade.rating, prevTrade.reviewCount, review.rating),
      reviewCount: prevTrade.reviewCount + 1
    }
  };

  const next: Worker = {
    ...worker,
    reviews,
    rating: addToAverage(worker.rating, worker.reviewCount, review.rating),
    reviewCount: worker.reviewCount + 1,
    ratingByTrade
  };

  const recent = reviews.slice(0, PAUSE_WINDOW).map(r => r.rating);
  const recentAvg = average(recent);
  if (recent.length >= PAUSE_WINDOW && recentAvg < PAUSE_THRESHOLD) {
    return {
      ...next,
      isPaused: true,
      available: false,
      pauseReason: `Promedio de ${recentAvg.toFixed(1)} estrellas en sus últimas ${PAUSE_WINDOW} reseñas (mínimo ${PAUSE_THRESHOLD.toFixed(1)}). Se bloquearon nuevas solicitudes hasta revisión.`
    };
  }
  return next;
};

/** Suma un trabajo finalizado al contador general y al del oficio (OFY-08, OFY-71). */
export const applyCompletion = (worker: Worker, trade?: TradeCategory): Worker => {
  const key = trade ?? worker.trade;
  const prevTrade = worker.ratingByTrade?.[key] ?? emptyTradeRep();
  return {
    ...worker,
    completedJobsCount: worker.completedJobsCount + 1,
    ratingByTrade: {
      ...(worker.ratingByTrade ?? {}),
      [key]: { ...prevTrade, completedJobs: prevTrade.completedJobs + 1 }
    }
  };
};

/** Fecha de cierre de un servicio (la real si existe; si no, la fecha agendada). */
const closedAt = (s: ServiceRequest) => new Date(s.completedAt ?? s.date);

const isSameMonth = (d: Date, ref: Date) =>
  d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();

/** Servicios finalizados de un trabajador en el mes de `ref`. */
export const completedThisMonth = (services: ServiceRequest[], workerId: string, ref = new Date()) =>
  services.filter(
    s => s.workerId === workerId && s.status === 'finalizado' && isSameMonth(closedAt(s), ref)
  );

/** Ingresos del mes: suma de los montos de los servicios finalizados (OFY-45). */
export const monthlyIncome = (services: ServiceRequest[], workerId: string, ref = new Date()) =>
  completedThisMonth(services, workerId, ref).reduce((acc, s) => acc + s.amount, 0);

/** Servicios más solicitados del mes por categoría (OFY-46). */
export const topRequested = (
  services: ServiceRequest[],
  workerId: string,
  labelFor: (s: ServiceRequest) => string,
  ref = new Date()
): { label: string; count: number }[] => {
  const counts = completedThisMonth(services, workerId, ref).reduce<Record<string, number>>((acc, s) => {
    const label = labelFor(s);
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
};

export interface ClientReputation {
  rating: number;
  reviewCount: number;
  completedServicesCount: number;
  registeredSince: string;
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/** Reputación del contratante a partir de las calificaciones que le dieron los trabajadores (OFY-35, OFY-53). */
export const computeClientReputation = (services: ServiceRequest[], clientId: string): ClientReputation => {
  const own = services.filter(s => s.clientId === clientId);
  const ratings = own
    .map(s => s.clientRatingByWorker)
    .filter((r): r is number => typeof r === 'number');
  const firstMs = own.reduce((min, s) => {
    const t = new Date(s.createdAt).getTime();
    return Number.isNaN(t) ? min : Math.min(min, t);
  }, Date.now());
  const first = new Date(firstMs);
  return {
    rating: round2(average(ratings)),
    reviewCount: ratings.length,
    completedServicesCount: own.filter(s => s.status === 'finalizado').length,
    registeredSince: `${MONTHS[first.getMonth()]} ${first.getFullYear()}`
  };
};
