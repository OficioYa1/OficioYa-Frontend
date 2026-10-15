// Formulario de contacto de la landing (mock).
// La implementación real solo debe cumplir `ContactService` (POST /contact);
// este adaptador simula la latencia y guarda los mensajes en localStorage.

export type ContactKind = 'cliente' | 'profesional';

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  kind: ContactKind;
  message: string;
}

export interface ContactMessage extends ContactMessageInput {
  id: string;
  createdAt: string;
}

export interface ContactService {
  send(input: ContactMessageInput): Promise<ContactMessage>;
}

export class ContactSendError extends Error {
  constructor() {
    super('contact-send-failed');
    this.name = 'ContactSendError';
  }
}

const STORAGE_KEY = 'oy-contact-messages';
const LATENCY_MS = 1100;
/** Escribir esta marca en el mensaje simula una caída de red (para probar el estado de error). */
export const SIMULATED_FAILURE_MARK = '#error';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const readAll = (): ContactMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as ContactMessage[]) : [];
  } catch {
    return [];
  }
};

export const mockContactService: ContactService = {
  async send(input) {
    await wait(LATENCY_MS);
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (offline || input.message.toLowerCase().includes(SIMULATED_FAILURE_MARK)) {
      throw new ContactSendError();
    }
    const saved: ContactMessage = {
      ...input,
      phone: input.phone?.trim() || undefined,
      id: `msg-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...readAll(), saved]));
    } catch {
      throw new ContactSendError();
    }
    return saved;
  },
};

export const contactService: ContactService = mockContactService;
