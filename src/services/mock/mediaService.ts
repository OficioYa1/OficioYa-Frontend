// Adaptador de medios (Cloudinary simulado) · OFY-59
// La implementación real solo debe cumplir `MediaService` y subir el archivo a
// Cloudinary (upload preset sin firma); este mock lo convierte en data URL local.

export interface UploadedMedia {
  /** URL pública de la imagen (aquí, un data URL). */
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes: number;
  format: string;
}

export interface UploadOptions {
  /** Carpeta lógica en Cloudinary, p. ej. "avatars" o "portfolio". */
  folder?: string;
  /** Lado máximo en píxeles; la imagen se reduce para no llenar el almacenamiento. */
  maxSide?: number;
}

export interface MediaService {
  uploadImage(file: File, options?: UploadOptions): Promise<UploadedMedia>;
}

/** Error con mensaje listo para mostrar al usuario. */
export class MediaUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MediaUploadError';
  }
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const LATENCY_MS = 900;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Valida tipo y peso; devuelve el mensaje de error o null si el archivo sirve. */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Ese archivo no es una imagen. Elige una foto JPG, PNG o WebP.';
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Ese formato no lo admitimos. Usa una foto JPG, PNG, WebP o GIF.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1).replace('.', ',');
    return `La foto pesa ${mb} MB y el máximo es 5 MB. Prueba con una más liviana.`;
  }
  return null;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new MediaUploadError('No pudimos leer la foto. Intenta con otra imagen.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new MediaUploadError('La imagen parece dañada. Intenta con otra foto.'));
    img.src = src;
  });
}

/** Reduce la imagen a `maxSide` px (JPEG) para que quepa en localStorage. */
async function downscale(dataUrl: string, maxSide: number, keepType: string) {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  if (scale === 1 || keepType === 'image/gif') return { url: dataUrl, width, height };

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { url: dataUrl, width, height };
  ctx.drawImage(img, 0, 0, width, height);
  return { url: canvas.toDataURL('image/jpeg', 0.85), width, height };
}

export const mockCloudinaryService: MediaService = {
  async uploadImage(file, options = {}) {
    const problem = validateImageFile(file);
    if (problem) throw new MediaUploadError(problem);

    const [raw] = await Promise.all([readAsDataUrl(file), wait(LATENCY_MS)]);
    const { url, width, height } = await downscale(raw, options.maxSide ?? 512, file.type);
    const folder = options.folder ?? 'oficioya';

    return {
      url,
      publicId: `${folder}/${Date.now().toString(36)}`,
      width,
      height,
      bytes: Math.round((url.length * 3) / 4),
      format: url.slice(5, url.indexOf(';')).replace('image/', '')
    };
  }
};

export const mediaService: MediaService = mockCloudinaryService;
