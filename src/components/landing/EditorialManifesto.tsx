import React from 'react';
import { motion } from 'framer-motion';
import { BRAND_ASSETS } from '../../utils/assets';
import { ShieldCheck, Sparkles, MapPin, ArrowUpRight } from 'lucide-react';
import './EditorialManifesto.css';

export interface EditorialManifestoProps {
  onExplore?: () => void;
}

/**
 * EditorialManifesto inspirado en la sección "Roots in design" de danilodemarco.com
 * Estructura tipográfica monumental con micro-cápsulas de imagen interactivas
 * intercaladas dentro de la oración para generar ritmo, textura y dinamismo editorial.
 */
export const EditorialManifesto: React.FC<EditorialManifestoProps> = ({ onExplore }) => {
  return (
    <section className="danilo-manifesto" aria-label="Manifiesto de OficioYa">
      <div className="danilo-manifesto__wrap">
        
        {/* Kicker editorial */}
        <div className="danilo-manifesto__kicker">
          <span className="danilo-manifesto__kicker-dot" />
          <span>Manifiesto 01 · El trabajo independiente dignificado</span>
        </div>

        {/* Titular monumental con cápsulas inline */}
        <h2 className="danilo-manifesto__title">
          {/* Línea 1 */}
          <div className="danilo-manifesto__row">
            <span>El oficio</span>
            <span className="danilo-manifesto__accent">tradicional</span>
          </div>

          {/* Línea 2 con cápsula de Many artesano */}
          <div className="danilo-manifesto__row">
            <motion.span
              className="danilo-manifesto__capsule"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              data-cursor-text="Many"
              onClick={onExplore}
              title="Many, el castor artesano de OficioYa"
            >
              <img
                src={BRAND_ASSETS.manyWave}
                alt="Many el castor"
                className="danilo-manifesto__capsule-img"
              />
              <span className="danilo-manifesto__capsule-text">De tu barrio</span>
            </motion.span>
            <span>a tu puerta,</span>
          </div>

          {/* Línea 3 */}
          <div className="danilo-manifesto__row">
            <span>respaldado por</span>
          </div>

          {/* Línea 4 con cápsula de reputación verificada */}
          <div className="danilo-manifesto__row">
            <motion.span
              className="danilo-manifesto__capsule"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              data-cursor-text="4.9 ★"
              onClick={onExplore}
              title="Reputación verificada por vecinos"
            >
              <ShieldCheck size={20} color="var(--color-brand-primary, #E65100)" style={{ marginRight: '0.4rem' }} />
              <span className="danilo-manifesto__capsule-text">4.9 ★ Verificado</span>
            </motion.span>
            <span>reputación</span>
          </div>

          {/* Línea 5 */}
          <div className="danilo-manifesto__row">
            <span className="danilo-manifesto__accent">digital</span>
            <span>contemporánea.</span>
          </div>
        </h2>

        {/* Footer editorial con metadatos técnicos y botón magnético */}
        <div className="danilo-manifesto__footer">
          <div className="danilo-manifesto__meta">
            <span className="danilo-manifesto__meta-tag">
              <MapPin size={13} /> Bogotá D.C.
            </span>
            <span className="danilo-manifesto__meta-tag">
              <Sparkles size={13} /> 100% Trato Directo
            </span>
            <span className="danilo-manifesto__meta-tag">
              Cero Comisión
            </span>
          </div>

          {onExplore && (
            <motion.button
              type="button"
              className="btn btn-primary"
              onClick={onExplore}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                borderRadius: '9999px',
                padding: '0.75rem 1.75rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '3px 4px 0 var(--stroke-ink, #3E1F14)'
              }}
              data-cursor-text="Explorar"
            >
              <span>Conectar ahora</span>
              <ArrowUpRight size={18} />
            </motion.button>
          )}
        </div>

      </div>
    </section>
  );
};
