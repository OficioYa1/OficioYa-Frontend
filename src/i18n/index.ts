/*
  Diccionarios ES/EN. Cada área tiene su archivo (common, landing, app…) y se
  fusionan aquí. Las claves usan puntos: "nav.inicio", "landing.hero.title".
  El español es la fuente; si una clave falta en inglés se muestra en español.
*/
import { common } from './common';

export type Lang = 'es' | 'en';
export type Dictionary = Record<string, string>;
export interface DictionaryPair { es: Dictionary; en: Dictionary }

const parts: DictionaryPair[] = [common];

export const dictionaries: Record<Lang, Dictionary> = {
  es: Object.assign({}, ...parts.map(p => p.es)),
  en: Object.assign({}, ...parts.map(p => p.en)),
};
