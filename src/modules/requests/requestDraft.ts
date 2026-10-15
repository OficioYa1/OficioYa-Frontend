/**
 * Borrador de la descripción escrita en el buscador del inicio. Se guarda en
 * sessionStorage para que SendRequestModal lo use como texto inicial.
 */
const KEY = 'oy-request-draft';

export function saveRequestDraft(text: string) {
  try {
    sessionStorage.setItem(KEY, text);
  } catch {
    /* sin almacenamiento: el modal arranca vacío */
  }
}

export function readRequestDraft(): string {
  try {
    return sessionStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function clearRequestDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nada que limpiar */
  }
}
