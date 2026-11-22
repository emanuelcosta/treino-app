// Corridas vindas do Strava: conversão e sugestões de ligação com os treinos do plano.
// Nada é aplicado sozinho: o usuário confirma cada sugestão. Uma atividade só pode ir para um treino.
import { addDays, parseDate } from './dates';
import { effectiveDate, weekStartOf, workoutsOfWeek, type PlanCtx, type RunLogs, type Workout } from './runPlan';

export type StravaRun = {
  id: number; name: string;
  /** data local (AAAA-MM-DD) */
  date: string;
  km: number;
  /** tempo em movimento */
  seconds: number;
  elapsed: number;
  sport: string;
};

const RUN_SPORTS = ['Run', 'TrailRun', 'VirtualRun'];

/** Converte a atividade do Strava; ignora o que não é corrida ou está incompleto. */
export function toStravaRun(a: unknown): StravaRun | null {
  const x = (a ?? {}) as Record<string, unknown>;
  const sport = String(x.sport_type ?? '');
  const date = String(x.start_date_local ?? '').slice(0, 10);
  const km = Math.round((Number(x.distance) / 1000) * 100) / 100;
  const seconds = Math.round(Number(x.moving_time));
  if (!RUN_SPORTS.includes(sport) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !(km > 0) || !(seconds > 0)) return null;
  return { id: Number(x.id), name: String(x.name ?? 'Corrida').slice(0, 80), date, km, seconds, elapsed: Math.round(Number(x.elapsed_time)) || seconds, sport };
}

/** Atividades do Strava já usadas em algum registro (para não importar duas vezes). */
export function usedStravaIds(logs: RunLogs, exceptLogId?: string): Set<number> {
  const out = new Set<number>();
  for (const l of Object.values(logs)) if (l.stravaId && l.id !== exceptLogId) out.add(l.stravaId);
  return out;
}

/** Intervalo de busca de uma semana do plano (com 1 dia de folga de cada lado), em segundos desde 1970. */
export function weekRange(ctx: PlanCtx, cal: number): { after: number; before: number } {
  const start = weekStartOf(ctx.s, cal);
  return { after: Math.floor(parseDate(addDays(start, -1)).getTime() / 1000), before: Math.floor(parseDate(addDays(start, 9)).getTime() / 1000) };
}

/** Intervalo de um dia (para importar no card do treino). */
export function dayRange(date: string): { after: number; before: number } {
  return { after: Math.floor(parseDate(date).getTime() / 1000) - 1, before: Math.floor(parseDate(addDays(date, 1)).getTime() / 1000) };
}

export type Suggestion = { workout: Workout; run: StravaRun };

/**
 * Para cada treino da semana ainda não concluído, sugere a corrida do Strava do mesmo dia
 * (a de distância mais parecida com a planejada). Não repete atividades já usadas.
 */
export function suggestMatches(ctx: PlanCtx, cal: number, runs: StravaRun[]): Suggestion[] {
  const used = usedStravaIds(ctx.logs);
  const taken = new Set<number>();
  const out: Suggestion[] = [];
  const ws = workoutsOfWeek(ctx, cal).sort((a, b) => Number(a.optional) - Number(b.optional));
  for (const w of ws) {
    if (ctx.logs[w.id]?.status === 'concluido') continue;
    const date = effectiveDate(w, ctx.logs);
    const candidates = runs.filter((r) => r.date === date && !used.has(r.id) && !taken.has(r.id));
    if (!candidates.length) continue;
    const best = candidates.reduce((a, b) => (Math.abs(b.km - w.plannedKm) < Math.abs(a.km - w.plannedKm) ? b : a));
    taken.add(best.id);
    out.push({ workout: w, run: best });
  }
  return out.sort((a, b) => a.workout.scheduled.localeCompare(b.workout.scheduled));
}
