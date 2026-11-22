// Regras do dia de treino: qual rotina vale, marcar itens, marcar o dia inteiro, anotações.
import { buildRoutine, type DayPlan, type DayRole, type Item, type Section } from '../data';
import { dowOf } from './dates';
import { paceText, positionOf, roleOf, type Phase } from './runPlan';
import { planCtx, type Store } from './store';

export type ResolvedDay = { plan: DayPlan; customized: boolean; role: DayRole; week: number; phase: Phase; key: string };

/** Chave do treino personalizado: por papel do dia (corrida leve, longão, fortalecimento 1...). */
export const overrideKey = (role: DayRole) => `r:${role}`;

/** Rotina padrão da data (papel do dia + semana do plano). */
function baseOf(s: Store, date: string, today: string) {
  const dow = dowOf(date);
  const pos = positionOf(planCtx(s, today), date);
  const role = roleOf(s.run, dow);
  return { plan: buildRoutine(dow, role, pos.week, s.run.strengthPref, paceText(s.run)), role, pos };
}

/**
 * Rotina da data: o padrão, ou a versão editada pelo usuário.
 * A seção da corrida vem sempre do plano (a distância muda a cada semana, mesmo com o dia personalizado).
 */
export function resolveDayPlan(s: Store, date: string, today: string): ResolvedDay {
  const { plan: base, role, pos } = baseOf(s, date, today);
  const key = overrideKey(role);
  const custom = s.overrides[key];
  const result = { role, week: pos.week, phase: pos.phase, key };
  if (!custom) return { ...result, plan: base, customized: false };
  const run = base.sections.find((sec) => sec.id === 'corrida');
  let sections = custom.filter((sec) => sec.id !== 'corrida');
  if (run) {
    const at = base.sections.indexOf(run);
    sections = [...sections.slice(0, at), run, ...sections.slice(at)];
  }
  return { ...result, plan: { ...base, sections }, customized: true };
}

/** Seções atuais do dia (base para editar). */
export const currentSections = (s: Store, date: string, today: string): Section[] => resolveDayPlan(s, date, today).plan.sections;

/** Itens que contam no progresso do dia: os obrigatórios fora da corrida (a corrida tem registro próprio). */
export const countsForProgress = (sec: Section, it: Item) => sec.id !== 'corrida' && !it.optional;
export const itemKeys = (plan: DayPlan): string[] =>
  plan.sections.flatMap((sec) => sec.items.filter((it) => countsForProgress(sec, it)).map((it) => it.uid!));

export type DayProgress = { doneCount: number; total: number; pct: number; dayDone: boolean };
export function dayProgress(s: Store, date: string, keys: string[]): DayProgress {
  const done = s.done[date] ?? {};
  const doneCount = keys.filter((k) => done[k]).length;
  const total = keys.length;
  return { doneCount, total, pct: total ? Math.round((doneCount / total) * 100) : 0, dayDone: total > 0 && doneCount === total };
}

/** Atualiza o resumo do dia (feitos / total) usado no mapa do Progresso. */
function withStats(s: Store, date: string, keys: string[]): Store {
  const done = s.done[date] ?? {};
  return { ...s, dayStats: { ...s.dayStats, [date]: { done: keys.filter((k) => done[k]).length, total: keys.length } } };
}

export function toggleItem(s: Store, date: string, key: string, keys: string[]): Store {
  const d = { ...(s.done[date] ?? {}) };
  if (d[key]) delete d[key]; else d[key] = true;
  return withStats({ ...s, done: { ...s.done, [date]: d } }, date, keys);
}

export const markItem = (s: Store, date: string, key: string, keys: string[]): Store =>
  withStats({ ...s, done: { ...s.done, [date]: { ...(s.done[date] ?? {}), [key]: true } } }, date, keys);

/** "Marcar dia como feito" (itens que contam) ou "Desmarcar dia". Não mexe no registro da corrida. */
export function setDayDone(s: Store, date: string, keys: string[], value: boolean): Store {
  const d = { ...(s.done[date] ?? {}) };
  keys.forEach((k) => { if (value) d[k] = true; else delete d[k]; });
  return withStats({ ...s, done: { ...s.done, [date]: d } }, date, keys);
}

export const setNote = (s: Store, date: string, key: string, value: string): Store =>
  ({ ...s, notes: { ...s.notes, [date]: { ...(s.notes[date] ?? {}), [key]: value } } });
