// Criptografa a sessão do Strava para guardar num cookie httpOnly (sem banco de dados).
// AES-256-GCM com chave derivada (HKDF) do STRAVA_CLIENT_SECRET: só o servidor consegue ler ou alterar.
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';

const keyFrom = (secret: string) =>
  Buffer.from(hkdfSync('sha256', Buffer.from(secret, 'utf8'), Buffer.from('treino-app'), Buffer.from('strava-cookie-v1'), 32));

export function seal(data: unknown, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyFrom(secret), iv);
  const ct = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ct]).toString('base64url');
}

/** Devolve null se o valor foi alterado, veio de outra chave ou está corrompido. */
export function unseal<T>(token: string | undefined, secret: string): T | null {
  if (!token) return null;
  try {
    const buf = Buffer.from(token, 'base64url');
    if (buf.length < 29) return null;
    const decipher = createDecipheriv('aes-256-gcm', keyFrom(secret), buf.subarray(0, 12));
    decipher.setAuthTag(buf.subarray(12, 28));
    const pt = Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8');
    return JSON.parse(pt) as T;
  } catch {
    return null;
  }
}
