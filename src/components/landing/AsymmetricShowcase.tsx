import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import './AsymmetricShowcase.css';

export interface AsymmetricShowcaseProps {
  onSelectWorker?: (name: string) => void;
}

interface ShowcaseItem {
  index: string;
  name: string;
  trade: string;
  zone: string;
  rating: number;
  image: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    index: '01.',
    name: 'Don Carlos Mendoza',
    trade: 'Plomería & Redes',
    zone: 'Cedritos · Bogotá',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80'
  },
  {
    index: '02.',
    name: 'Claudia Patricia Gil',
    trade: 'Aseo & Limpieza a Vapor',
    zone: 'Modelia · Bogotá',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80'
  },
  {
    index: '03.',
    name: 'Jorge Iván Gómez',
    trade: 'Electricidad e Iluminación',
    zone: 'Chapinero · Bogotá',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'
  },
  {
    index: '04.',
    name: 'Marcos Peña',
    trade: 'Cerrajería de Emergencia',
    zone: 'Suba · Bogotá',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80'
  },
  {
    index: '05.',
    name: 'Diana Marcela Morales',
    trade: 'Pintura y Estuco',
    zone: 'Usaquén · Bogotá',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'
  },
  {
    index: '06.',
    name: 'Robinson Cárdenas',
    trade: 'Línea Blanca y Neveras',
    zone: 'Engativá · Bogotá',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
  }
];

/**
 * AsymmetricShowcase inspirado en la composición bento y columnas escalonadas
 * de danilodemarco.com (secciones "I Love Designing Branding" y "Selected Work").
 */
export const AsymmetricShowcase: React.FC<AsymmetricShowcaseProps> = ({ onSelectWorker }) => {
  // Dividir en 3 columnas para renderizado asimétrico
  const col1 = [SHOWCASE_ITEMS[0], SHOWCASE_ITEMS[3]];
  const col2 = [SHOWCASE_ITEMS[1], SHOWCASE_ITEMS[4]];
  const col3 = [SHOWCASE_ITEMS[2], SHOWCASE_ITEMS[5]];

  return (
    <section className="danilo-showcase" aria-labelledby="danilo-showcase-title">
      <div className="danilo-showcase__wrap">
        
        {/* Cabecera editorial con tipografía contrastada */}
        <div className="danilo-showcase__header">
          <span className="danilo-showcase__kicker">Selección Editorial · Trabajo de Confianza</span>
          <h2 id="danilo-showcase-title" className="danilo-showcase__title">
            Talentos destacados del mes
          </h2>
          <p className="danilo-showcase__desc">
            Explora las historias de trabajo de quienes construyen, reparan y cuidan hogares en Bogotá todos los días con garantía y trato directo.
          </p>
        </div>

        {/* Grilla escalonada en 3 columnas con ritmos de desplazamiento diferentes */}
        <div className="danilo-showcase__grid">
          
          {/* Columna 1 */}
          <div className="danilo-showcase__col danilo-showcase__col--offset-1">
            {col1.map((item) => (
              <motion.article
                key={item.index}
                className="danilo-card"
                whileHover={{ y: -8 }}
                onClick={() => onSelectWorker?.(item.name)}
                data-cursor-text="Ver perfil"
              >
                <div className="danilo-card__header">
                  <span className="danilo-card__index">{item.index}</span>
                  <h3 className="danilo-card__title">{item.name}</h3>
                  <span className="danilo-card__rating">
                    <Star size={13} fill="currentColor" color="var(--stroke-ink)" />
                    {item.rating}
                  </span>
                </div>

                <div className="danilo-card__media">
                  <img
                    src={item.image}
                    alt={`${item.name} - ${item.trade}`}
                    className="danilo-card__img"
                    loading="lazy"
                  />
                </div>

                <div className="danilo-card__footer">
                  <span className="danilo-card__trade">{item.trade}</span>
                  <span className="danilo-card__zone">
                    <MapPin size={13} /> {item.zone}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Columna 2 (desplazada verticalmente) */}
          <div className="danilo-showcase__col danilo-showcase__col--offset-2">
            {col2.map((item) => (
              <motion.article
                key={item.index}
                className="danilo-card"
                whileHover={{ y: -8 }}
                onClick={() => onSelectWorker?.(item.name)}
                data-cursor-text="Ver perfil"
              >
                <div className="danilo-card__header">
                  <span className="danilo-card__index">{item.index}</span>
                  <h3 className="danilo-card__title">{item.name}</h3>
                  <span className="danilo-card__rating">
                    <Star size={13} fill="currentColor" color="var(--stroke-ink)" />
                    {item.rating}
                  </span>
                </div>

                <div className="danilo-card__media">
                  <img
                    src={item.image}
                    alt={`${item.name} - ${item.trade}`}
                    className="danilo-card__img"
                    loading="lazy"
                  />
                </div>

                <div className="danilo-card__footer">
                  <span className="danilo-card__trade">{item.trade}</span>
                  <span className="danilo-card__zone">
                    <MapPin size={13} /> {item.zone}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Columna 3 (con desplazamiento intermedio) */}
          <div className="danilo-showcase__col danilo-showcase__col--offset-3">
            {col3.map((item) => (
              <motion.article
                key={item.index}
                className="danilo-card"
                whileHover={{ y: -8 }}
                onClick={() => onSelectWorker?.(item.name)}
                data-cursor-text="Ver perfil"
              >
                <div className="danilo-card__header">
                  <span className="danilo-card__index">{item.index}</span>
                  <h3 className="danilo-card__title">{item.name}</h3>
                  <span className="danilo-card__rating">
                    <Star size={13} fill="currentColor" color="var(--stroke-ink)" />
                    {item.rating}
                  </span>
                </div>

                <div className="danilo-card__media">
                  <img
                    src={item.image}
                    alt={`${item.name} - ${item.trade}`}
                    className="danilo-card__img"
                    loading="lazy"
                  />
                </div>

                <div className="danilo-card__footer">
                  <span className="danilo-card__trade">{item.trade}</span>
                  <span className="danilo-card__zone">
                    <MapPin size={13} /> {item.zone}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
