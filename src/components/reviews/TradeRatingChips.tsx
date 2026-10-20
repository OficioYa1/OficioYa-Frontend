import React from 'react';
import { Star } from 'lucide-react';
import type { TradeCategory, TradeReputation } from '../../types';
import { TRADE_LABELS } from '../../utils/workerProfile';
import './TradeRatingChips.css';

interface TradeRatingChipsProps {
  ratingByTrade?: Record<string, TradeReputation>;
  primaryTrade?: TradeCategory;
  compact?: boolean;
  className?: string;
}

export const TradeRatingChips: React.FC<TradeRatingChipsProps> = ({
  ratingByTrade,
  primaryTrade,
  compact = false,
  className = ''
}) => {
  if (!ratingByTrade || Object.keys(ratingByTrade).length === 0) {
    return null;
  }

  const entries = Object.entries(ratingByTrade);

  // Ordenar para mostrar el oficio principal primero si coincide
  const sorted = [...entries].sort(([tradeA], [tradeB]) => {
    if (tradeA === primaryTrade) return -1;
    if (tradeB === primaryTrade) return 1;
    return 0;
  });

  return (
    <div className={`trade-rating-chips ${compact ? 'trade-rating-chips--compact' : ''} ${className}`} aria-label="Calificación desagregada por oficio">
      {sorted.map(([trade, rep]) => {
        const label = TRADE_LABELS[trade as TradeCategory] || trade;
        const ratingNum = typeof rep?.rating === 'number' && !isNaN(rep.rating) ? rep.rating : 0;
        const reviewCount = typeof rep?.reviewCount === 'number' ? rep.reviewCount : 0;
        const completedJobs = typeof rep?.completedJobs === 'number' ? rep.completedJobs : 0;
        const hasReviews = reviewCount > 0;

        return (
          <span
            key={trade}
            className={`trade-rating-chip ${trade === primaryTrade ? 'trade-rating-chip--primary' : ''}`}
            title={`${label}: ${hasReviews ? `${ratingNum.toFixed(1)} estrellas en ${reviewCount} reseñas (${completedJobs} trabajos)` : 'Aún sin reseñas verificadas'}`}
          >
            <span className="trade-rating-chip__name">{label}</span>
            <span className="trade-rating-chip__score">
              <Star size={11} fill="var(--color-star)" color="var(--stroke-ink)" aria-hidden="true" />
              <strong>{hasReviews ? ratingNum.toFixed(1) : '—'}</strong>
            </span>
            {hasReviews && (
              <span className="trade-rating-chip__count">
                ({reviewCount})
              </span>
            )}
            {!compact && completedJobs > 0 && (
              <span className="trade-rating-chip__jobs">
                · {completedJobs} trab.
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};
