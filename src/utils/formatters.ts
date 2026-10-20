/** Pesos colombianos sin decimales: 80000 → "$ 80.000" */
export const formatCOP = (value: number): string =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
