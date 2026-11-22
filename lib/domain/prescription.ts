// Séries e quantidade por série de um item do treino.
import type { Item } from '../data';

/** Quantas séries contar no modo guiado ('3 a 4' conta 4; você pode concluir antes). */
export function setsCount(item: Item): number {
  if (typeof item.sets === 'number') return Math.max(1, Math.floor(item.sets));
  const nums = String(item.sets ?? '').match(/\d+/g)?.map(Number) ?? [];
  return nums.length ? Math.max(...nums) : 1;
}

const seriesWord = (sets: number | string) => (String(sets).trim() === '1' ? 'série' : 'séries');

/** Texto pronto: "3 séries de 12 a 15 repetições". Vazio se o item não tem séries definidas. */
export function prescription(item: Item): string {
  const hasSets = item.sets !== undefined && String(item.sets).trim() !== '';
  const reps = item.reps?.trim();
  if (hasSets && reps) return `${item.sets} ${seriesWord(item.sets!)} de ${reps}`;
  if (hasSets) return `${item.sets} ${seriesWord(item.sets!)}`;
  return reps ?? '';
}

/** Lê o campo "Séries" digitado na edição: número quando der, texto ('3 a 4') quando não, vazio = sem séries. */
export function parseSetsInput(v: string): number | string | undefined {
  const t = v.trim();
  if (!t) return undefined;
  return /^\d+$/.test(t) ? Number(t) : t;
}
