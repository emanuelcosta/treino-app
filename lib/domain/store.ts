// Modelo dos dados do usuário. Funções puras: sem React, sem localStorage.
import { exercises, type Exercise, type Section } from '../data';
import { DEFAULT_INTERVALS, sanitizeIntervals, type IntervalConfig } from './timer';

export type Store = {
  week: number;
  /** dia (AAAA-MM-DD) -> uid do item -> feito */
  done: Record<string, Record<string, boolean>>;
  /** dia -> uid do item -> anotação */
  notes: Record<string, Record<string, string>>;
  /** dia -> quantos itens o dia tinha quando foi marcado (base do % no Progresso) */
  totals: Record<string, number>;
  examDone: boolean;
  /** dia da semana (0 a 6) -> seções personalizadas */
  overrides: Record<string, Section[]>;
  /** exercícios criados pelo usuário */
  custom: Record<string, Exercise>;
  seenHelp: boolean;
  /** último treino intervalado configurado */
  intervals: IntervalConfig;
  /** avisos dos cronômetros */
  prefs: TimerPrefs;
};

export type TimerPrefs = { sound: boolean; voice: boolean; vibrate: boolean };
export const defaultPrefs: TimerPrefs = { sound: true, voice: true, vibrate: true };

export const emptyStore: Store = {
  week: 1, done: {}, notes: {}, totals: {}, examDone: false, overrides: {}, custom: {}, seenHelp: false,
  intervals: DEFAULT_INTERVALS, prefs: defaultPrefs,
};

export const setPrefs = (s: Store, p: Partial<TimerPrefs>): Store => ({ ...s, prefs: { ...defaultPrefs, ...s.prefs, ...p } });
export const setIntervals = (s: Store, cfg: IntervalConfig): Store => ({ ...s, intervals: sanitizeIntervals(cfg) });

export const WEEKS = [1, 2, 3, 4, 5] as const;
export const DELOAD_WEEK = 4;

export const findEx = (s: Store, id?: string): Exercise | undefined => (id ? s.custom[id] ?? exercises[id] : undefined);

export function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Junta dados salvos (possivelmente de uma versão antiga) com os valores padrão. */
export function hydrate(raw: unknown): Store {
  const r = (raw ?? {}) as Partial<Store>;
  return {
    ...emptyStore, ...r,
    prefs: { ...defaultPrefs, ...(r.prefs ?? {}) },
    intervals: r.intervals ? sanitizeIntervals({ ...DEFAULT_INTERVALS, ...r.intervals }) : DEFAULT_INTERVALS,
  };
}

/** Valida um backup importado. Lança erro se o arquivo não for deste app. */
export function parseBackup(data: unknown): Store {
  const d = data as Partial<Store> | null;
  if (typeof d !== 'object' || d === null || Array.isArray(d) || typeof d.done !== 'object') throw new Error('formato');
  return hydrate(d);
}

export const setWeek = (s: Store, week: number): Store => ({ ...s, week });
export const markExamDone = (s: Store): Store => ({ ...s, examDone: true });
export const markHelpSeen = (s: Store): Store => ({ ...s, seenHelp: true });

export const addCustomExercise = (s: Store, ex: Exercise): Store => ({ ...s, custom: { ...s.custom, [ex.id]: ex } });
export function removeCustomExercise(s: Store, id: string): Store {
  const custom = { ...s.custom };
  delete custom[id];
  return { ...s, custom };
}
