// Modelo dos dados do usuário. Funções puras: sem React, sem localStorage.
import { exercises, type Exercise, type Section } from '../data';
import { dateKey } from './dates';
import {
  defaultRunSettings, freezeDecisions, sanitizeRunLogs, sanitizeRunSettings, upsertLog,
  type LogInput, type PlanCtx, type RunLogs, type RunSettings, type WeekDecision, type Workout,
} from './runPlan';
import { DEFAULT_INTERVALS, sanitizeIntervals, type IntervalConfig } from './timer';

export { dateKey };

export type Store = {
  /** legado (plano antigo de 5 semanas com semana escolhida à mão). Mantido só para não perder dados antigos. */
  week: number;
  /** dia (AAAA-MM-DD) -> uid do item -> feito */
  done: Record<string, Record<string, boolean>>;
  /** dia -> uid do item -> anotação */
  notes: Record<string, Record<string, string>>;
  /** legado: quantos itens o dia tinha (usado só para dias sem `dayStats`) */
  totals: Record<string, number>;
  /** dia -> itens obrigatórios feitos / total (base do % no Progresso) */
  dayStats: Record<string, { done: number; total: number }>;
  examDone: boolean;
  /**
   * Treinos personalizados. Chave "r:<papel do dia>" (ex.: "r:easy", "r:strength1").
   * Chaves numéricas antigas ("0" a "6", do plano antigo) ficam guardadas, mas não são mais aplicadas.
   */
  overrides: Record<string, Section[]>;
  /** exercícios criados pelo usuário */
  custom: Record<string, Exercise>;
  seenHelp: boolean;
  /** último pomodoro configurado */
  intervals: IntervalConfig;
  /** avisos dos cronômetros */
  prefs: TimerPrefs;
  /** plano de 10 km: configuração */
  run: RunSettings;
  /** plano de 10 km: registros de cada treino (chave = id do treino) */
  runLogs: RunLogs;
};

export type TimerPrefs = { sound: boolean; voice: boolean; vibrate: boolean };
export const defaultPrefs: TimerPrefs = { sound: true, voice: true, vibrate: true };

export const emptyStore: Store = {
  week: 1, done: {}, notes: {}, totals: {}, dayStats: {}, examDone: false, overrides: {}, custom: {}, seenHelp: false,
  intervals: DEFAULT_INTERVALS, prefs: defaultPrefs, run: defaultRunSettings(), runLogs: {},
};

export const setPrefs = (s: Store, p: Partial<TimerPrefs>): Store => ({ ...s, prefs: { ...defaultPrefs, ...s.prefs, ...p } });
export const setIntervals = (s: Store, cfg: IntervalConfig): Store => ({ ...s, intervals: sanitizeIntervals(cfg) });

export const findEx = (s: Store, id?: string): Exercise | undefined => (id ? s.custom[id] ?? exercises[id] : undefined);

const obj = <T,>(v: unknown, def: T): T => (v && typeof v === 'object' && !Array.isArray(v) ? (v as T) : def);

/** Junta dados salvos (possivelmente de uma versão antiga) com os valores padrão. Não descarta dados válidos. */
export function hydrate(raw: unknown, today = new Date()): Store {
  const r = obj<Partial<Store>>(raw, {});
  return {
    ...emptyStore, ...r,
    done: obj(r.done, {}), notes: obj(r.notes, {}), totals: obj(r.totals, {}), dayStats: obj(r.dayStats, {}),
    overrides: obj(r.overrides, {}), custom: obj(r.custom, {}),
    prefs: { ...defaultPrefs, ...obj(r.prefs, {}) },
    intervals: r.intervals ? sanitizeIntervals({ ...DEFAULT_INTERVALS, ...r.intervals }) : DEFAULT_INTERVALS,
    run: sanitizeRunSettings(r.run, today),
    runLogs: sanitizeRunLogs(r.runLogs),
  };
}

/** Valida um backup importado. Lança erro se o arquivo não for deste app. */
export function parseBackup(data: unknown): Store {
  const d = data as Partial<Store> | null;
  if (typeof d !== 'object' || d === null || Array.isArray(d) || typeof d.done !== 'object') throw new Error('formato');
  return hydrate(d);
}

export const markExamDone = (s: Store): Store => ({ ...s, examDone: true });
export const markHelpSeen = (s: Store): Store => ({ ...s, seenHelp: true });

export const addCustomExercise = (s: Store, ex: Exercise): Store => ({ ...s, custom: { ...s.custom, [ex.id]: ex } });
export function removeCustomExercise(s: Store, id: string): Store {
  const custom = { ...s.custom };
  delete custom[id];
  return { ...s, custom };
}

// ---------------- Plano de 10 km ----------------
export const planCtx = (s: Store, today: string): PlanCtx => ({ s: s.run, logs: s.runLogs, today });

export const setRunSettings = (s: Store, run: RunSettings): Store => ({ ...s, run: sanitizeRunSettings({ ...run, decisions: s.run.decisions }) });

/** Registra o treino (sem duplicar) e fixa as decisões das semanas até ele, para o histórico não mudar depois. */
export function saveRunLog(s: Store, w: Workout, input: LogInput, today: string): Store {
  const decisions = freezeDecisions(planCtx(s, today), w.cal);
  return { ...s, run: { ...s.run, decisions }, runLogs: upsertLog(s.runLogs, w, input) };
}

export function setWeekDecision(s: Store, cal: number, decision: WeekDecision | null): Store {
  const decisions = { ...s.run.decisions };
  if (decision === null) delete decisions[String(cal)]; else decisions[String(cal)] = decision;
  return { ...s, run: { ...s.run, decisions } };
}
