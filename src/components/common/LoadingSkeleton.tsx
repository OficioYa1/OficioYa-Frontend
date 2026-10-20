import React from 'react';
import { MascotAvatar } from '../mascot/MascotAvatar';
import './LoadingSkeleton.css';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '8px',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`oy-skeleton-item ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
      aria-hidden="true"
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="oy-skeleton-card" aria-busy="true" aria-label="Cargando profesional...">
      <div className="oy-skeleton-card__head">
        <SkeletonBox width="64px" height="64px" borderRadius="9999px" />
        <div className="oy-skeleton-card__info">
          <SkeletonBox width="60%" height="20px" borderRadius="6px" />
          <SkeletonBox width="40%" height="14px" borderRadius="6px" style={{ marginTop: '8px' }} />
        </div>
      </div>
      <div className="oy-skeleton-card__body">
        <SkeletonBox width="85%" height="12px" borderRadius="4px" />
        <SkeletonBox width="95%" height="12px" borderRadius="4px" style={{ marginTop: '6px' }} />
      </div>
      <div className="oy-skeleton-card__footer">
        <SkeletonBox width="30%" height="16px" borderRadius="6px" />
        <SkeletonBox width="80px" height="36px" borderRadius="9999px" />
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="oy-skeleton-grid" role="status" aria-label="Cargando directorio de profesionales">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export const LoadingScreen: React.FC<{ message?: string }> = ({
  message = 'Cargando datos del directorio...'
}) => {
  return (
    <div className="oy-loading-screen" role="status" aria-live="polite">
      <MascotAvatar size="lg" animate="bounce" forceImage="wave" />
      <p className="oy-loading-screen__message">{message}</p>
      <div className="oy-loading-screen__bar">
        <div className="oy-loading-screen__progress" />
      </div>
    </div>
  );
};
