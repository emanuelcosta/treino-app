// Cálculos da aba Progresso.
import { dateKey, type Store } from './store';

/** Dia "bom" = pelo menos 80% dos itens feitos. */
export const GOOD_DAY = 0.8;

export function dayRatio(s: Store, key: string): number {
  const st = s.dayStats[key];
  if (st) return st.total ? Math.min(1, st.done / st.total) : 0;
  // dias registrados antes da v1.5 (sem dayStats)
  const total = s.totals[key] ?? 0;
  if (!total) return 0;
  return Math.min(1, Object.keys(s.done[key] ?? {}).length / total);
}

export type CalendarDay = { key: string; date: Date };
export function lastDays(today: Date, count = 28): CalendarDay[] {
  const days: CalendarDay[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    days.push({ key: dateKey(d), date: d });
  }
  return days;
}

export const goodDaysCount = (s: Store, days: CalendarDay[]): number => days.filter((d) => dayRatio(s, d.key) >= GOOD_DAY).length;

/** Dias seguidos com 80% ou mais. Hoje ainda incompleto não quebra a sequência. */
export function streak(s: Store, days: CalendarDay[]): number {
  let n = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (dayRatio(s, days[i].key) >= GOOD_DAY) n++;
    else if (i === days.length - 1) continue;
    else break;
  }
  return n;
}

/** Intensidade da cor no mapa (0 a 3). */
export const heatLevel = (p: number): number => (p === 0 ? 0 : p < 0.5 ? 1 : p < GOOD_DAY ? 2 : 3);

/** Colunas vazias antes do 1º dia para o calendário começar na segunda. */
export const mondayOffset = (d: Date): number => (d.getDay() + 6) % 7;
