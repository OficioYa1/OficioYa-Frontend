// Utilidades criptográficas con Web Crypto API (HS256) para JWT y fortaleza de contraseñas

const JWT_SECRET = 'oficioya-super-secure-secret-key-2026-dosw-crypto';

// Conversión a Base64Url
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Obtener CryptoKey para HMAC-SHA256
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign', 'verify']
  );
}

// Firmar JWT con HS256
export async function signJWT(payload: Record<string, unknown>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const enc = new TextEncoder();

  const encodedHeader = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(
    enc.encode(
      JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 días
      })
    )
  );

  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const key = await getCryptoKey();
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
  const encodedSignature = base64UrlEncode(new Uint8Array(signature));

  return `${dataToSign}.${encodedSignature}`;
}

// Verificar JWT con HS256 y extraer el payload
export async function verifyJWT<T = Record<string, unknown>>(token: string): Promise<T | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const dataToVerify = `${headerB64}.${payloadB64}`;
    const enc = new TextEncoder();
    const signature = base64UrlDecode(signatureB64);
    const key = await getCryptoKey();

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature as unknown as BufferSource,
      enc.encode(dataToVerify)
    );

    if (!isValid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadJson);

    // Validar expiración si existe
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload as T;
  } catch {
    return null;
  }
}

// Indicador de fortaleza de contraseña en 5 niveles (1: Muy Débil -> 5: Muy Fuerte)
export interface PasswordStrength {
  score: number; // 1 a 5
  label: string;
  color: string;
  feedback: string;
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: 'Vacía', color: 'var(--color-text-muted)', feedback: 'Ingresa una contraseña segura' };
  }

  let points = 0;
  if (password.length >= 6) points += 1;
  if (password.length >= 10) points += 1;
  if (/[A-Z]/.test(password)) points += 1;
  if (/[0-9]/.test(password)) points += 1;
  if (/[^A-Za-z0-9]/.test(password)) points += 1;

  switch (points) {
    case 1:
      return { score: 1, label: 'Muy débil', color: '#EF4444', feedback: 'Usa al menos 8 caracteres con letras y números' };
    case 2:
      return { score: 2, label: 'Débil', color: '#F97316', feedback: 'Agrega mayúsculas y números' };
    case 3:
      return { score: 3, label: 'Regular', color: '#FBBF24', feedback: 'Combina caracteres especiales (#, $, !)' };
    case 4:
      return { score: 4, label: 'Fuerte', color: '#3B82F6', feedback: '¡Excelente combinación de seguridad!' };
    case 5:
    default:
      return { score: 5, label: 'Muy fuerte', color: '#10B981', feedback: 'Contraseña blindada y altamente segura' };
  }
}
