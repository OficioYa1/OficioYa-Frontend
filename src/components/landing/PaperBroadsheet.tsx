import React from 'react';
import { motion } from 'framer-motion';
import { BRAND_ASSETS } from '../../utils/assets';
import { DoodleScribble } from '../ui/DoodleScribble';
import { ArrowUpRight, Award, MapPin } from 'lucide-react';
import { playChime } from '../../utils/audioChimes';
import './PaperBroadsheet.css';

export interface PaperBroadsheetProps {
  onExplore?: () => void;
}

const CLASSIFIEDS = [
  {
    num: 'AVISO Nº 01',
    trade: 'Plomería & Emergencias',
    quote: '«Reparo fugas en tuberías de cobre y PVC sin romper baldosas. Atiendo 24 horas en Usaquén y Chapinero.»',
    worker: 'Don Carlos Mendoza',
    zone: 'Cedritos · Bogotá',
    rating: '4.9 ★'
  },
  {
    num: 'AVISO Nº 02',
    trade: 'Electricidad Residencial',
    quote: '«Cableados certificados RETIE, arreglo de cajas de tacos y cortocircuitos. Tarifa clara antes de salir.»',
    worker: 'Jorge Gómez',
    zone: 'Chapinero · Bogotá',
    rating: '4.8 ★'
  },
  {
    num: 'AVISO Nº 03',
    trade: 'Aseo & Desinfección a Vapor',
    quote: '«Limpieza profunda de entrega de apartamento, tapetes y colchones como nuevos. Garantía comunitaria.»',
    worker: 'Claudia Gil',
    zone: 'Modelia · Bogotá',
    rating: '5.0 ★'
  },
  {
    num: 'AVISO Nº 04',
    trade: 'Cerrajería de Seguridad',
    quote: '«Apertura de cerraduras de seguridad y candados sin dañar la puerta. Servicio exprés en menos de 15 min.»',
    worker: 'Marcos Peña',
    zone: 'Suba · Bogotá',
    rating: '4.9 ★'
  }
];

/**
 * PaperBroadsheet inspirado en el famoso "Paper Portfolio" de Niccolò Miranda (niccolomiranda.com).
 * Rinde homenaje a los periódicos tradicionales y sus avisos clasificados donde históricamente
 * se anunciaban los artesanos y oficios, ahora elevados a una experiencia digital contemporánea.
 */
export const PaperBroadsheet: React.FC<PaperBroadsheetProps> = ({ onExplore }) => {
  const handleCtaClick = () => {
    playChime();
    onExplore?.();
  };

  return (
    <section className="niccolo-paper-section" aria-label="Edición Impresa de Clasificados OficioYa">
      <div className="niccolo-paper-wrap">
        
        {/* Doble filete superior de periódico */}
        <div className="niccolo-masthead-rule" />

        {/* Dateline de metadatos de edición */}
        <div className="niccolo-dateline">
          <span>BOGOTÁ D.C., COLOMBIA</span>
          <span>EDICIÓN ESPECIAL Nº 24 · AÑO 2026</span>
          <span>DISTRIBUCIÓN DIGITAL GRATUITA</span>
          <span>DIRECTORIO HIPERLOCAL</span>
        </div>

        {/* Doble filete inferior de cabecera */}
        <div className="niccolo-masthead-rule niccolo-masthead-rule--bottom" />

        {/* Gran titular periodístico con dibujo Doodle */}
        <h2 className="niccolo-paper-title">
          La Voz de los Oficios de Barrio
        </h2>

        {/* Disposición broadsheet en 3 columnas */}
        <div className="niccolo-broadsheet-grid">
          
          {/* Columna editorial 1: Noticia principal con Letra Capitular (Drop Cap) */}
          <div className="niccolo-lead-col">
            <div>
              <div className="niccolo-lead-kicker">EDITORIAL · DIGNIDAD LABORAL</div>
              <p className="niccolo-dropcap-p">
                Durante décadas, encontrar un buen plomero o electricista en Bogotá dependía de un papelito en la nevera o de grupos de WhatsApp desorganizados. OficioYa dignifica este saber milenario conectándolo con geolocalización hiperlocal y reputación comunitaria verificada entre vecinos reales.
              </p>
              <p style={{ margin: 0, opacity: 0.85, fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Sin intermediarios ni empresas que se queden con el 20% del sudor del trabajador. Trato directo, precio pactado y pago seguro.
              </p>
            </div>

            {/* Sello postal dentado oficial Many */}
            <div className="niccolo-stamp-wrap">
              <div className="niccolo-postage-stamp">
                <img
                  src={BRAND_ASSETS.manyWave}
                  alt="Sello de Many"
                  className="niccolo-postage-stamp__img"
                />
                <span className="niccolo-postage-stamp__value">OFICIOYA $0</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Sello de Garantía Comunitaria
                </strong>
                <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>
                  Certificado bajo estándares de DOSW · Bogotá D.C.
                </span>
              </div>
            </div>
          </div>

          {/* Columna 2: Avisos clasificados 1 y 2 */}
          <div className="niccolo-classifieds-col">
            {[CLASSIFIEDS[0], CLASSIFIEDS[1]].map((item) => (
              <motion.div
                key={item.num}
                className="niccolo-classified-card"
                whileHover={{ y: -4 }}
                onClick={onExplore}
                data-cursor-text="Ver aviso"
              >
                <div className="niccolo-classified-header">
                  <h3 className="niccolo-classified-trade">{item.trade}</h3>
                  <span className="niccolo-classified-num">{item.num}</span>
                </div>
                <p className="niccolo-classified-quote">{item.quote}</p>
                <div className="niccolo-classified-footer">
                  <span>{item.worker}</span>
                  <span>{item.rating}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Columna 3: Avisos clasificados 3 y 4 */}
          <div className="niccolo-classifieds-col">
            {[CLASSIFIEDS[2], CLASSIFIEDS[3]].map((item) => (
              <motion.div
                key={item.num}
                className="niccolo-classified-card"
                whileHover={{ y: -4 }}
                onClick={onExplore}
                data-cursor-text="Ver aviso"
              >
                <div className="niccolo-classified-header">
                  <h3 className="niccolo-classified-trade">{item.trade}</h3>
                  <span className="niccolo-classified-num">{item.num}</span>
                </div>
                <p className="niccolo-classified-quote">{item.quote}</p>
                <div className="niccolo-classified-footer">
                  <span>{item.worker}</span>
                  <span>{item.rating}</span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Pie de periódico con Doodle interactivo */}
        <div className="niccolo-paper-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> 20 Localidades</span>
            <span>·</span>
            <span><Award size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Perfiles Verificados</span>
          </div>

          <div className="niccolo-doodle-cta" onClick={handleCtaClick} data-cursor-text="Iniciar Sesion">
            <span>Consultar los</span>
            <DoodleScribble type="ellipse">
              <span>Clasificados</span>
            </DoodleScribble>
            <ArrowUpRight size={22} />
          </div>
        </div>

      </div>
    </section>
  );
};
