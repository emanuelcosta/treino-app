// Regras do dia de treino: qual plano vale, marcar itens, marcar o dia inteiro, anotações.
import { getDayPlan, type DayPlan, type Section } from '../data';
import type { Store } from './store';

/** Plano do dia: o padrão da semana atual, ou a versão editada pelo usuário. */
export function resolveDayPlan(s: Store, dow: number): { plan: DayPlan; customized: boolean } {
  const base = getDayPlan(dow, s.week);
  const custom = s.overrides[String(dow)];
  return custom ? { plan: { ...base, sections: custom }, customized: true } : { plan: base, customized: false };
}

/** Seções atuais do dia (base para editar). */
export const currentSections = (s: Store, dow: number): Section[] => s.overrides[String(dow)] ?? getDayPlan(dow, s.week).sections;

export const itemKeys = (plan: DayPlan): string[] => plan.sections.flatMap((sec) => sec.items.map((it) => it.uid!));

export type DayProgress = { doneCount: number; total: number; pct: number; dayDone: boolean };
export function dayProgress(s: Store, date: string, keys: string[]): DayProgress {
  const done = s.done[date] ?? {};
  const doneCount = keys.filter((k) => done[k]).length;
  const total = keys.length;
  return { doneCount, total, pct: total ? Math.round((doneCount / total) * 100) : 0, dayDone: total > 0 && doneCount === total };
}

export function toggleItem(s: Store, date: string, key: string, total: number): Store {
  const d = { ...(s.done[date] ?? {}) };
  if (d[key]) delete d[key]; else d[key] = true;
  return { ...s, done: { ...s.done, [date]: d }, totals: { ...s.totals, [date]: total } };
}

export const markItem = (s: Store, date: string, key: string, total: number): Store =>
  ({ ...s, done: { ...s.done, [date]: { ...(s.done[date] ?? {}), [key]: true } }, totals: { ...s.totals, [date]: total } });

/** "Marcar dia como feito" (todos os itens) ou "Desmarcar dia" (nenhum). */
export function setDayDone(s: Store, date: string, keys: string[], value: boolean): Store {
  const d: Record<string, boolean> = {};
  if (value) keys.forEach((k) => { d[k] = true; });
  return { ...s, done: { ...s.done, [date]: d }, totals: { ...s.totals, [date]: keys.length } };
}

export const setNote = (s: Store, date: string, key: string, value: string): Store =>
  ({ ...s, notes: { ...s.notes, [date]: { ...(s.notes[date] ?? {}), [key]: value } } });
