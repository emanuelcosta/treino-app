// Datas como texto AAAA-MM-DD no fuso local. Funções puras.

export function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export const isDateKey = (v: unknown): v is string =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && dateKey(parseDate(v)) === v;

export function addDays(key: string, n: number): string {
  const d = parseDate(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

/** Segunda-feira da semana da data. */
export const mondayOf = (key: string) => addDays(key, -((parseDate(key).getDay() + 6) % 7));

/** Dias entre duas datas (b - a), sem erro de horário de verão. */
export function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

export const dowOf = (key: string) => parseDate(key).getDay();

/** "24/11" */
export const shortDate = (key: string) => `${key.slice(8, 10)}/${key.slice(5, 7)}`;
