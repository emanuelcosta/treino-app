// Plano de corrida de 10 km (8 semanas): configuração, calendário, treinos, registros, resumos e orientações.
// Funções puras (sem React, sem localStorage). Ver docs/AUDITORIA.md para as decisões de treino.
import { DAY_NAMES, PLAN_ID, PLAN_LENGTH, PLAN_WEEKS, runInfo, type DayRole, type StrengthPref } from '../data';
import { addDays, dateKey, daysBetween, isDateKey, mondayOf } from './dates';
import { clock } from './timer';

// ---------------- Configuração ----------------
export type RunSlot = 'easy' | 'tempo' | 'long' | 'regen';
export const SLOT_LABEL: Record<RunSlot, string> = { easy: 'Corrida leve', tempo: 'Corrida com variação', long: 'Longão', regen: 'Trote leve curto' };

/** Dia da semana (0 = domingo) de cada treino. */
export type RunDays = { easy: number; tempo: number; long: number; regen: number; strength: [number, number] };

/** Como começa cada semana do calendário: avança no plano, repete a semana anterior ou fica em pausa. */
export type WeekDecision = 'next' | 'repeat' | 'pause';

export type RunSettings = {
  /** o usuário já revisou a configuração */
  confirmed: boolean;
  /** segunda-feira da semana 1 (AAAA-MM-DD) */
  startDate: string;
  days: RunDays;
  /** 3 = só as 3 corridas; 4 = + regenerativo opcional */
  availableDays: 3 | 4;
  strengthPref: StrengthPref;
  /** distância habitual (km) */
  currentKm: number;
  /** melhor tempo recente nos 5 km, em segundos */
  best5k: number;
  goalKm: number;
  /** faixa do ritmo leve, em segundos por km (orientativo) */
  easyPace: [number, number];
  /** decisão de cada semana do calendário ("0", "1"...). Sem decisão = sugestão do app. */
  decisions: Record<string, WeekDecision>;
};

/** Padrão: corridas na segunda, quarta e sexta (longão) e trote leve curto no domingo; fortalecimento na terça e na quinta.
 * Sábado livre (fim de semana com menos tempo). */
export const DEFAULT_DAYS: RunDays = { easy: 1, tempo: 3, long: 5, regen: 0, strength: [2, 4] };

export function defaultRunSettings(today = new Date()): RunSettings {
  return {
    confirmed: false, startDate: mondayOf(dateKey(today)), days: { ...DEFAULT_DAYS, strength: [...DEFAULT_DAYS.strength] },
    availableDays: 4, strengthPref: 'corrida', currentKm: 5, best5k: 27 * 60 + 30, goalKm: 10, easyPace: [380, 420], decisions: {},
  };
}

const dowOk = (v: unknown, def: number) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 6 ? (v as number) : def);
const numOk = (v: unknown, def: number, min: number, max: number) => {
  const n = Number(v);
  return v !== null && v !== '' && Number.isFinite(n) && n >= min && n <= max ? n : def;
};

/** Completa e corrige configurações salvas (inclusive de versões antigas, sem esse campo). Nunca lança erro. */
export function sanitizeRunSettings(raw: unknown, today = new Date()): RunSettings {
  const d = defaultRunSettings(today);
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<RunSettings>;
  // Enquanto o usuário não salvar a configuração, os dias seguem o padrão atual do app.
  const days = (r.confirmed === true && r.days && typeof r.days === 'object' ? r.days : {}) as Partial<RunDays>;
  const strength = Array.isArray(days.strength) ? days.strength : d.days.strength;
  const pace = Array.isArray(r.easyPace) ? r.easyPace : d.easyPace;
  const p0 = numOk(pace[0], d.easyPace[0], 180, 900), p1 = numOk(pace[1], d.easyPace[1], 180, 900);
  const decisions: Record<string, WeekDecision> = {};
  if (r.decisions && typeof r.decisions === 'object') {
    for (const [k, v] of Object.entries(r.decisions)) {
      if (/^\d{1,3}$/.test(k) && (v === 'next' || v === 'repeat' || v === 'pause')) decisions[k] = v;
    }
  }
  return {
    confirmed: r.confirmed === true,
    startDate: isDateKey(r.startDate) ? mondayOf(r.startDate) : d.startDate,
    days: {
      easy: dowOk(days.easy, d.days.easy), tempo: dowOk(days.tempo, d.days.tempo), long: dowOk(days.long, d.days.long),
      regen: dowOk(days.regen, d.days.regen), strength: [dowOk(strength[0], d.days.strength[0]), dowOk(strength[1], d.days.strength[1])],
    },
    availableDays: r.availableDays === 3 ? 3 : 4,
    strengthPref: r.strengthPref === 'calistenia' || r.strengthPref === 'nenhum' ? r.strengthPref : 'corrida',
    currentKm: numOk(r.currentKm, d.currentKm, 0, 100),
    best5k: numOk(r.best5k, d.best5k, 600, 3 * 3600),
    goalKm: numOk(r.goalKm, d.goalKm, 1, 100),
    easyPace: [Math.min(p0, p1), Math.max(p0, p1)],
    decisions,
  };
}

/** Problemas na escolha dos dias (cada dia com um papel só). Vazio = tudo certo. */
export function validateSettings(s: RunSettings): string[] {
  const errors: string[] = [];
  const used = new Map<number, string>();
  const take = (dow: number, label: string) => {
    if (used.has(dow)) errors.push(`${DAY_NAMES[dow]} está em "${used.get(dow)}" e em "${label}". Escolha dias diferentes.`);
    else used.set(dow, label);
  };
  take(s.days.easy, 'Corrida leve');
  take(s.days.tempo, 'Corrida com variação');
  take(s.days.long, 'Longão');
  if (s.availableDays === 4) take(s.days.regen, 'Trote leve curto');
  if (s.strengthPref !== 'nenhum') { take(s.days.strength[0], 'Fortalecimento 1'); take(s.days.strength[1], 'Fortalecimento 2'); }
  return errors;
}

/** Avisos de recuperação (não impedem salvar). */
export function scheduleWarnings(s: RunSettings): string[] {
  const out: string[] = [];
  const next = (dow: number) => (dow + 1) % 7;
  const runs: [number, string][] = [[s.days.easy, 'corrida leve'], [s.days.tempo, 'corrida com variação'], [s.days.long, 'longão']];
  for (const [a, la] of runs) for (const [b, lb] of runs) if (next(a) === b) out.push(`A ${la} e a ${lb} ficaram em dias seguidos: tente deixar um dia entre elas.`);
  if (s.strengthPref !== 'nenhum') {
    for (const st of s.days.strength) {
      if (next(st) === s.days.long) out.push('Fortalecimento na véspera do longão: prefira outro dia para chegar descansado.');
      if (next(st) === s.days.tempo) out.push('Fortalecimento na véspera do treino moderado: prefira outro dia.');
    }
  }
  return [...new Set(out)];
}

export const paceText = (s: RunSettings) => `${clock(s.easyPace[0])}–${clock(s.easyPace[1])} min/km`;

export function roleOf(s: RunSettings, dow: number): DayRole {
  if (dow === s.days.easy) return 'easy';
  if (dow === s.days.tempo) return 'tempo';
  if (dow === s.days.long) return 'long';
  if (s.availableDays === 4 && dow === s.days.regen) return 'regen';
  if (s.strengthPref !== 'nenhum' && dow === s.days.strength[0]) return 'strength1';
  if (s.strengthPref !== 'nenhum' && dow === s.days.strength[1]) return 'strength2';
  return 'rest';
}

// ---------------- Registros ----------------
export type RunStatus = 'pendente' | 'concluido' | 'adiado' | 'nao_realizado';
export const STATUS_LABEL: Record<RunStatus, string> = { pendente: 'Pendente', concluido: 'Concluído', adiado: 'Adiado', nao_realizado: 'Não realizado' };
export type Discomfort = 'nenhum' | 'leve' | 'forte';

export type RunLog = {
  id: string; planId: string; cal: number; planWeek: number; slot: RunSlot;
  /** data programada originalmente */
  scheduled: string;
  plannedKm: number;
  status: RunStatus;
  /** nova data, quando adiado */
  movedTo?: string;
  /** realizado */
  km?: number;
  seconds?: number;
  /** percepção de esforço, 1 a 10 */
  rpe?: number;
  discomfort?: Discomfort;
  notes?: string;
  updatedAt: string;
};
export type RunLogs = Record<string, RunLog>;

/** Lê registros salvos descartando só entradas inválidas (as válidas ficam intactas). */
export function sanitizeRunLogs(raw: unknown): RunLogs {
  const out: RunLogs = {};
  if (!raw || typeof raw !== 'object') return out;
  const statuses: RunStatus[] = ['pendente', 'concluido', 'adiado', 'nao_realizado'];
  const slots: RunSlot[] = ['easy', 'tempo', 'long', 'regen'];
  for (const [k, v] of Object.entries(raw as Record<string, Partial<RunLog>>)) {
    if (!v || typeof v !== 'object' || v.id !== k || !statuses.includes(v.status as RunStatus) || !slots.includes(v.slot as RunSlot)) continue;
    out[k] = v as RunLog;
  }
  return out;
}

// ---------------- Calendário ----------------
export type PlanCtx = { s: RunSettings; logs: RunLogs; today: string };
export const weekStartOf = (s: RunSettings, cal: number) => addDays(s.startDate, cal * 7);
export const calOf = (s: RunSettings, date: string) => Math.floor(daysBetween(s.startDate, date) / 7);
export const dateOfDow = (s: RunSettings, cal: number, dow: number) => addDays(weekStartOf(s, cal), (dow + 6) % 7);
const MAX_CAL = 60;

type Line = { week: number | null; decision: WeekDecision; auto: boolean };

/**
 * Semana do plano de cada semana do calendário (0..upTo).
 * Sem decisão salva: a semana atual e as passadas seguem a sugestão (repetir se a anterior ficou incompleta);
 * as futuras aparecem como "avançar" só para mostrar a projeção.
 */
function timeline(ctx: PlanCtx, upTo: number): Line[] {
  const { s, logs } = ctx;
  const cur = calOf(s, ctx.today);
  const out: Line[] = [];
  let last = 0;
  for (let c = 0; c <= Math.min(upTo, MAX_CAL); c++) {
    let decision = s.decisions[String(c)];
    const auto = decision === undefined;
    if (auto) {
      const prev = out[c - 1];
      decision = c === 0 || c > cur || !prev || prev.week === null ? 'next'
        : incomplete(summaryFor(s, logs, c - 1, prev.week)) ? 'repeat' : 'next';
    }
    let week: number | null;
    if (decision === 'pause') week = null;
    else {
      const w = decision === 'repeat' ? Math.max(last, 1) : last + 1;
      week = w <= PLAN_LENGTH ? w : null;
    }
    if (week !== null) last = week;
    out.push({ week, decision: decision!, auto });
  }
  return out;
}

export function planWeekAt(ctx: PlanCtx, cal: number): number | null {
  if (cal < 0) return null;
  return timeline(ctx, cal)[cal]?.week ?? null;
}

export function decisionAt(ctx: PlanCtx, cal: number): { decision: WeekDecision; auto: boolean } {
  const l = cal >= 0 ? timeline(ctx, cal)[cal] : undefined;
  return l ? { decision: l.decision, auto: l.auto } : { decision: 'next', auto: true };
}

/** Quantas semanas do calendário o plano ocupa (até a semana 8, contando repetições e pausas). */
export function planSpan(ctx: PlanCtx): number {
  const cur = Math.max(0, calOf(ctx.s, ctx.today));
  const tl = timeline(ctx, MAX_CAL);
  let lastActive = 0;
  tl.forEach((l, c) => { if (l.week !== null) lastActive = c; });
  return Math.max(lastActive + 1, Math.min(cur + 1, MAX_CAL));
}

export type Phase = 'antes' | 'plano' | 'pausa' | 'depois';
export function positionOf(ctx: PlanCtx, date: string): { cal: number; week: number; phase: Phase } {
  const cal = calOf(ctx.s, date);
  if (cal < 0) return { cal, week: 1, phase: 'antes' };
  const tl = timeline(ctx, cal);
  const l = tl[cal];
  if (l && l.week !== null) return { cal, week: l.week, phase: 'plano' };
  const lastWeek = [...tl].reverse().find((x) => x.week !== null)?.week ?? 1;
  return l?.decision === 'pause' ? { cal, week: lastWeek, phase: 'pausa' } : { cal, week: PLAN_LENGTH, phase: 'depois' };
}

/** Explica a sugestão do app para a semana (quando ela é repetir). */
export function suggestRepeatLabel(ctx: PlanCtx, cal: number): string | null {
  const d = decisionAt(ctx, cal);
  return cal >= 1 && d.auto && d.decision === 'repeat'
    ? 'A semana anterior ficou incompleta (menos de 2 corridas ou sem longão), por isso a sugestão é repetir. Você pode escolher avançar.'
    : null;
}

/** A decisão de uma semana só pode mudar enquanto ela não tiver registros (o histórico não muda). */
export const weekHasLogs = (logs: RunLogs, cal: number) => Object.values(logs).some((l) => l.cal === cal);

/** Fixa as decisões até a semana `cal` (chamado ao registrar um treino). */
export function freezeDecisions(ctx: PlanCtx, cal: number): Record<string, WeekDecision> {
  const tl = timeline(ctx, cal);
  const out = { ...ctx.s.decisions };
  tl.forEach((l, c) => { if (out[String(c)] === undefined) out[String(c)] = l.decision; });
  return out;
}

// ---------------- Treinos ----------------
export type Workout = {
  id: string; planId: string; cal: number; planWeek: number; slot: RunSlot;
  /** data programada (AAAA-MM-DD) */
  scheduled: string;
  plannedKm: number; title: string; intensity: string; objective: string; warmup: string;
  /** duração estimada pelo ritmo leve configurado [mín, máx] em segundos, quando calculável */
  estimate: [number, number] | null;
  optional: boolean;
};

/** Id estável: plano + semana do calendário + tipo. Não muda ao trocar os dias da semana. */
export const workoutId = (cal: number, slot: RunSlot) => `${PLAN_ID}:c${cal}:${slot}`;

export function workoutsOfWeek(ctx: PlanCtx, cal: number): Workout[] {
  const week = planWeekAt(ctx, cal);
  if (week === null) return [];
  const { s } = ctx;
  const w = PLAN_WEEKS[week - 1];
  const slots: RunSlot[] = s.availableDays === 4 ? ['easy', 'tempo', 'long', 'regen'] : ['easy', 'tempo', 'long'];
  return slots.map((slot): Workout => {
    const info = runInfo(slot, w, paceText(s));
    return {
      id: workoutId(cal, slot), planId: PLAN_ID, cal, planWeek: week, slot, scheduled: dateOfDow(s, cal, s.days[slot]),
      plannedKm: info.km, title: info.title, intensity: info.intensity, objective: info.objective, warmup: info.warmup,
      estimate: info.km > 0 ? [Math.round(info.km * s.easyPace[0]), Math.round(info.km * s.easyPace[1])] : null,
      optional: slot === 'regen',
    };
  }).sort((a, b) => a.scheduled.localeCompare(b.scheduled));
}

export const effectiveDate = (w: Workout, logs: RunLogs) => logs[w.id]?.movedTo ?? w.scheduled;
export const statusOf = (w: Workout, logs: RunLogs): RunStatus => logs[w.id]?.status ?? 'pendente';

/** Treinos da data: os programados para ela, os que foram adiados para outro dia e os que vieram adiados de outro dia. */
export function workoutsOn(ctx: PlanCtx, date: string): { here: Workout[]; movedAway: Workout[]; movedIn: Workout[] } {
  const cal = calOf(ctx.s, date);
  const all = [cal - 1, cal, cal + 1].filter((c) => c >= 0).flatMap((c) => workoutsOfWeek(ctx, c));
  const eff = (w: Workout) => effectiveDate(w, ctx.logs);
  return {
    here: all.filter((w) => w.scheduled === date && eff(w) === date),
    movedAway: all.filter((w) => w.scheduled === date && eff(w) !== date),
    movedIn: all.filter((w) => w.scheduled !== date && eff(w) === date),
  };
}

export type LogInput = Partial<Pick<RunLog, 'status' | 'movedTo' | 'km' | 'seconds' | 'rpe' | 'discomfort' | 'notes'>>;

/** Cria ou atualiza o registro de um treino. Um registro por treino (mesmo id): nunca duplica. */
export function upsertLog(logs: RunLogs, w: Workout, input: LogInput, now = new Date()): RunLogs {
  const prev = logs[w.id];
  const next: RunLog = {
    ...prev, ...input,
    status: input.status ?? prev?.status ?? 'pendente',
    id: w.id, planId: w.planId, cal: w.cal, planWeek: prev?.planWeek ?? w.planWeek, slot: w.slot,
    scheduled: prev?.scheduled ?? w.scheduled, plannedKm: prev?.plannedKm ?? w.plannedKm, updatedAt: now.toISOString(),
  };
  if (next.movedTo !== undefined && (!isDateKey(next.movedTo) || next.movedTo === next.scheduled)) delete next.movedTo;
  if (next.km !== undefined && !(next.km > 0)) delete next.km;
  if (next.seconds !== undefined && !(next.seconds > 0)) delete next.seconds;
  if (next.rpe !== undefined && !(Number.isInteger(next.rpe) && next.rpe >= 1 && next.rpe <= 10)) delete next.rpe;
  if (next.notes !== undefined) next.notes = next.notes.slice(0, 1000);
  return { ...logs, [w.id]: next };
}

/** "4,2" ou "4.2" -> 4.2 (vazio ou inválido -> null) */
export function parseKm(v: string): number | null {
  if (!v.trim()) return null;
  const n = Number(v.trim().replace(',', '.'));
  return Number.isFinite(n) && n > 0 && n < 200 ? Math.round(n * 100) / 100 : null;
}

/** "26:30", "1:05:20" ou "26" (minutos) -> segundos (vazio ou inválido -> null) */
export function parseDuration(v: string): number | null {
  const parts = v.trim().split(':');
  if (!parts[0] || parts.some((p) => !/^\d+$/.test(p.trim()))) return null;
  const n = parts.map((p) => Number(p.trim()));
  let sec: number;
  if (n.length === 1) sec = n[0] * 60;
  else if (n.length === 2) { if (n[1] > 59) return null; sec = n[0] * 60 + n[1]; }
  else if (n.length === 3) { if (n[1] > 59 || n[2] > 59) return null; sec = n[0] * 3600 + n[1] * 60 + n[2]; }
  else return null;
  return sec > 0 && sec < 24 * 3600 ? sec : null;
}

/** 1590 -> "26:30"; 3920 -> "1:05:20" */
export function formatDuration(sec: number): string {
  const t = Math.round(sec);
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

/** Ritmo em segundos por km (só com distância e tempo registrados). */
export const paceOf = (km?: number, seconds?: number) => (km && seconds ? seconds / km : null);
export const paceLabel = (secPerKm: number | null) => (secPerKm ? `${clock(secPerKm)} min/km` : '—');

// ---------------- Resumos (só com o que foi registrado) ----------------
export type WeekSummary = {
  cal: number; week: number | null; decision: WeekDecision; start: string;
  plannedKm: number; doneKm: number; runsPlanned: number; runsDone: number; runsMissed: number;
  longPlanned: number; longDone: number | null; maxKm: number | null; seconds: number; pace: number | null;
};

const isRun = (slot: RunSlot) => slot !== 'regen';
const isDone = (l?: RunLog) => l?.status === 'concluido';

function summaryFor(s: RunSettings, logs: RunLogs, cal: number, week: number | null): Omit<WeekSummary, 'decision'> {
  const ws = week === null ? [] : workoutsFor(s, cal, week).filter((w) => isRun(w.slot));
  const ls = ws.map((w) => logs[w.id]).filter(isDone) as RunLog[];
  const withKm = ls.filter((l) => l.km);
  const timed = ls.filter((l) => l.km && l.seconds);
  const kmTimed = timed.reduce((t, l) => t + l.km!, 0);
  const long = ws.find((w) => w.slot === 'long');
  const longLog = long ? logs[long.id] : undefined;
  return {
    cal, week, start: weekStartOf(s, cal),
    plannedKm: ws.reduce((t, w) => t + w.plannedKm, 0),
    doneKm: withKm.reduce((t, l) => t + l.km!, 0),
    runsPlanned: ws.length, runsDone: ls.length,
    runsMissed: ws.filter((w) => logs[w.id]?.status === 'nao_realizado').length,
    longPlanned: long?.plannedKm ?? 0,
    longDone: isDone(longLog) && longLog?.km ? longLog.km : null,
    maxKm: withKm.length ? Math.max(...withKm.map((l) => l.km!)) : null,
    seconds: ls.reduce((t, l) => t + (l.seconds ?? 0), 0),
    pace: kmTimed ? timed.reduce((t, l) => t + l.seconds!, 0) / kmTimed : null,
  };
}

/** Treinos de uma semana com a semana do plano já conhecida (sem recalcular a linha do tempo). */
function workoutsFor(s: RunSettings, cal: number, week: number) {
  const w = PLAN_WEEKS[week - 1];
  const slots: RunSlot[] = s.availableDays === 4 ? ['easy', 'tempo', 'long', 'regen'] : ['easy', 'tempo', 'long'];
  return slots.map((slot) => ({ id: workoutId(cal, slot), slot, plannedKm: runInfo(slot, w, '').km }));
}

/** Semana incompleta: menos de 2 corridas concluídas ou longão não feito. */
const incomplete = (x: Omit<WeekSummary, 'decision'>) => x.runsPlanned > 0 && (x.runsDone < 2 || x.longDone === null);

export function weekSummary(ctx: PlanCtx, cal: number): WeekSummary {
  const tl = timeline(ctx, cal);
  return { ...summaryFor(ctx.s, ctx.logs, cal, tl[cal]?.week ?? null), decision: tl[cal]?.decision ?? 'next' };
}

export function allSummaries(ctx: PlanCtx): WeekSummary[] {
  const span = planSpan(ctx);
  const tl = timeline(ctx, span - 1);
  return tl.map((l, c) => ({ ...summaryFor(ctx.s, ctx.logs, c, l.week), decision: l.decision }));
}

export function totals(ctx: PlanCtx) {
  const ls = Object.values(ctx.logs).filter((l) => l.planId === PLAN_ID && isRun(l.slot) && isDone(l));
  const withKm = ls.filter((l) => l.km);
  const timed = ls.filter((l) => l.km && l.seconds);
  const kmTimed = timed.reduce((t, l) => t + l.km!, 0);
  const longest = withKm.length ? Math.max(...withKm.map((l) => l.km!)) : 0;
  return {
    runs: ls.length,
    km: withKm.reduce((t, l) => t + l.km!, 0),
    seconds: ls.reduce((t, l) => t + (l.seconds ?? 0), 0),
    pace: kmTimed ? timed.reduce((t, l) => t + l.seconds!, 0) / kmTimed : null,
    longest,
    goalProgress: Math.min(1, longest / ctx.s.goalKm),
  };
}

// ---------------- Segurança ----------------
/** Orientações a partir do registro (não é avaliação médica). */
export function guidance(log: RunLog | undefined): string[] {
  if (!log) return [];
  const out: string[] = [];
  if (log.discomfort === 'forte') out.push('Dor forte ou que muda a sua passada: interrompa os treinos de corrida e procure um profissional de saúde. Não compense depois.');
  else if (log.discomfort === 'leve') out.push('Desconforto leve: observe. Se continuar por 2 a 3 dias ou piorar, repita a semana em vez de avançar.');
  if (log.rpe !== undefined && log.rpe >= 8 && log.slot !== 'tempo') out.push('Esforço alto para um treino leve: no próximo, vá mais devagar, conseguindo conversar. Se o cansaço continuar, repita a semana.');
  if (log.rpe !== undefined && log.rpe >= 9 && log.slot === 'tempo') out.push('Esforço acima do planejado (6 a 7 de 10): faça os blocos moderados mais devagar.');
  if (log.status === 'nao_realizado') out.push('Tudo bem. Siga o plano normalmente e não some essa distância em outro treino.');
  return out;
}
