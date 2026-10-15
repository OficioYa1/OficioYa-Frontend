import './LiquidBackground.css';

/**
 * Fondo líquido de la marca: cuatro manchas difuminadas con los colores del
 * manual (Azul Marino, Ámbar, Amarillo Canario, Esmeralda) que derivan muy
 * despacio. Solo CSS: no bloquea el arranque y se detiene con movimiento
 * reducido. Las superficies translúcidas encima se leen como vidrio esmerilado.
 */
export const LiquidBackground = () => (
  <div className="liquid-bg" aria-hidden="true">
    <span className="liquid-bg__blob liquid-bg__blob--a" />
    <span className="liquid-bg__blob liquid-bg__blob--b" />
    <span className="liquid-bg__blob liquid-bg__blob--c" />
    <span className="liquid-bg__blob liquid-bg__blob--d" />
    <span className="liquid-bg__grain" />
  </div>
);
