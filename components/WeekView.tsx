'use client';
import { useState } from 'react';
import { DAY_NAMES, DELOAD_WEEK, km, PLAN_LENGTH, PLAN_WEEKS, tempoTitle } from '@/lib/data';
import { addDays, dateKey, dowOf, shortDate } from '@/lib/domain/dates';
import { resolveDayPlan } from '@/lib/domain/day';
import {
  calOf, decisionAt, planSpan, STATUS_LABEL, suggestRepeatLabel, weekHasLogs, weekStartOf, weekSummary, workoutsOfWeek,
  type WeekDecision,
} from '@/lib/domain/runPlan';
import { importStravaRun, planCtx, saveRunLog, setRunSettings, setWeekDecision } from '@/lib/domain/store';
import { dayRange } from '@/lib/domain/strava';
import { useStrava } from '@/lib/useStrava';
import StravaPanel from './StravaPanel';
import { useStore } from '@/lib/useStore';
import PlanSettingsForm from './PlanSettingsForm';
import RunWorkoutCard from './RunWorkoutCard';

const DECISION_LABEL: Record<WeekDecision, string> = { next: 'Avançar no plano', repeat: 'Repetir a semana anterior', pause: 'Pausa (sem corrida do plano)' };

export default function WeekView() {
  const { store, ready, update } = useStore();
  const [today] = useState(() => dateKey(new Date()));
  const [cal, setCal] = useState<number | null>(null);
  const strava = useStrava();
  if (!ready) return <div className="muted">Carregando…</div>;

  const ctx = planCtx(store, today);
  const s = store.run;
  const span = planSpan(ctx);
  const curCal = Math.max(0, Math.min(calOf(s, today), span - 1));
  const c = cal ?? curCal;
  const sum = weekSummary(ctx, c);
  const dec = decisionAt(ctx, c);
  const locked = weekHasLogs(store.runLogs, c);
  const workouts = workoutsOfWeek(ctx, c);
  const start = weekStartOf(s, c);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const pct = sum.plannedKm ? Math.min(100, Math.round((sum.doneKm / sum.plannedKm) * 100)) : 0;
  const hasLogs = Object.keys(store.runLogs).length > 0;
  const weekTitle = sum.week === null ? (dec.decision === 'pause' ? 'Semana de pausa' : 'Fora do plano') : `Semana ${sum.week} de ${PLAN_LENGTH}`;
  const repeatOf = dec.decision === 'repeat' && sum.week !== null;
  const suggestion = suggestRepeatLabel(ctx, c);

  const decide = (d: WeekDecision | null) => update((st) => setWeekDecision(st, c, d));
  const importer = strava.connected
    ? { logs: store.runLogs, load: (d: string) => { const r = dayRange(d); return strava.loadRuns(r.after, r.before); } }
    : undefined;

  return (
    <>
      <h1>Semana</h1>

      <section className="card">
        <div className="weeknav">
          <button className="btn" onClick={() => setCal(Math.max(0, c - 1))} disabled={c <= 0} aria-label="Semana anterior">‹</button>
          <div className="weeknav-title">
            <b>{weekTitle}{repeatOf ? ' (repetição)' : ''}{sum.week === DELOAD_WEEK ? ' · descarga' : ''}</b>
            <span className="small muted">{shortDate(start)} a {shortDate(addDays(start, 6))}{c === calOf(s, today) ? ' · esta semana' : ''}</span>
          </div>
          <button className="btn" onClick={() => setCal(Math.min(span - 1, c + 1))} disabled={c >= span - 1} aria-label="Próxima semana">›</button>
        </div>

        {sum.runsPlanned > 0 && (
          <div className="weeksum">
            <div className="progress" aria-label={`Quilometragem da semana: ${km(sum.doneKm)} de ${km(sum.plannedKm)} km`}>
              <div className="bar"><div style={{ width: `${pct}%` }} /></div>
              <span className="small"><b>{km(sum.doneKm)}</b> de {km(sum.plannedKm)} km</span>
            </div>
            <p className="small">Corridas concluídas: <b>{sum.runsDone} de {sum.runsPlanned}</b>{sum.runsMissed ? ` · não realizadas: ${sum.runsMissed}` : ''} · Longão: {sum.longDone ? <b>{km(sum.longDone)} km</b> : 'pendente'} (planejado {km(sum.longPlanned)} km)</p>
          </div>
        )}

        <div className="decisionbox">
          <label>Como esta semana começa
            <select value={dec.auto ? '' : dec.decision} disabled={locked}
              onChange={(e) => decide(e.target.value ? (e.target.value as WeekDecision) : null)} aria-label="Decisão da semana">
              <option value="">Sugestão do app: {DECISION_LABEL[dec.decision].toLowerCase()}</option>
              <option value="next">{DECISION_LABEL.next}</option>
              {c > 0 && <option value="repeat">{DECISION_LABEL.repeat}</option>}
              <option value="pause">{DECISION_LABEL.pause}</option>
            </select>
          </label>
          <p className="small muted">{locked ? 'Esta semana já tem treinos registrados: a decisão ficou fixa para não mudar o histórico.' : 'Repetir ou pausar não duplica treinos: só muda qual semana do plano vale aqui. Nada aumenta para compensar.'}</p>
          {suggestion && <p className="small">{suggestion}</p>}
        </div>
      </section>

      <section className="card">
        <h2>Dias</h2>
        <ul className="calendar">
          {dates.map((d) => {
            const day = resolveDayPlan(store, d, today);
            const ws = workouts.filter((w) => w.scheduled === d);
            return (
              <li key={d} className={d === today ? 'is-today' : ''}>
                <div className="calday"><b>{DAY_NAMES[dowOf(d)]}</b><span className="small muted">{shortDate(d)}</span></div>
                <div className="calbody">
                  {ws.length === 0 && <span className={day.plan.kind === 'descanso' ? 'muted' : ''}>{day.plan.title}{day.plan.kind === 'descanso' ? '' : `: ${day.plan.subtitle}`}</span>}
                  {ws.map((w) => {
                    const log = store.runLogs[w.id];
                    return (
                      <div key={w.id} className="calrun">
                        <div className="calrun-head">
                          <span>{w.title}</span>
                          <span className={`badge b-${log?.status ?? 'pendente'}`}>{STATUS_LABEL[log?.status ?? 'pendente']}</span>
                        </div>
                        <RunWorkoutCard compact w={w} log={log} today={today} importer={importer} onSave={(input) => update((st) => saveRunLog(st, w, input, today))} />
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
        {workouts.length === 0 && <p className="muted small">Sem corridas do plano nesta semana.</p>}
      </section>

      <StravaPanel strava={strava} ctx={ctx} cal={c} onApply={(w, run) => {
        if (!importStravaRun(store, w, run, today)) return false; // atividade já usada em outro treino
        update((st) => importStravaRun(st, w, run, today) ?? st);
        return true;
      }} />

      <section className="card">
        <h2>Plano de 10 km em 8 semanas</h2>
        <p className="muted small">As distâncias incluem aquecimento e desaceleração. Leve = conseguindo conversar. Moderado = esforço 6 a 7 de 10, sem sprint, com 2 min de trote leve entre os blocos.</p>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Semana</th><th>{DAY_NAMES[s.days.easy]}</th><th>{DAY_NAMES[s.days.tempo]}</th><th>{DAY_NAMES[s.days.long]}</th></tr></thead>
            <tbody>
              {PLAN_WEEKS.map((w) => (
                <tr key={w.week} className={w.week === sum.week ? 'sel' : ''}>
                  <td>{w.week}{w.week === DELOAD_WEEK ? ' (descarga)' : w.week === PLAN_LENGTH ? ' (objetivo)' : ''}</td>
                  <td>{km(w.easy)} km leve</td>
                  <td>{tempoTitle(w.tempo)}</td>
                  <td>{km(w.long)} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" id="configurar">
        <h2>Configurar plano</h2>
        <PlanSettingsForm settings={s} hasLogs={hasLogs} onSave={(next) => update((st) => setRunSettings(st, next))} />
      </section>

      <section className="card">
        <h2>Regras do plano</h2>
        <ul className="bul">
          <li>Corra leve quase sempre: se não consegue falar frases inteiras, diminua.</li>
          <li>Perdeu um treino? Siga em frente, sem somar a distância em outro dia.</li>
          <li>Semana incompleta, cansaço acumulado ou dor que dura 2 a 3 dias: repita a semana em vez de avançar.</li>
          <li>Dor que muda a passada: pare de correr e procure um profissional de saúde.</li>
          <li>A semana 4 é de descarga e a 8 tem carga menor antes dos 10 km.</li>
          <li>Longão cansado demais: encurte, não pule. Hidrate-se.</li>
        </ul>
      </section>

      <section className="card">
        <h2>Ganhar força e massa</h2>
        <ul className="bul">
          <li>Escolha uma faixa (ex.: 8 a 12). Quando fizer as séries no topo com boa forma, passe para uma variação mais difícil (veja em Exercícios).</li>
          <li>Termine as séries com 1 a 3 repetições sobrando.</li>
          <li>Proteína: uma referência comum é 1,6 a 2 g por kg por dia, distribuída nas refeições.</li>
          <li>Durma de 7 a 9 horas e coma o suficiente para o gasto da corrida.</li>
        </ul>
      </section>

      <section className="card">
        <h2>Ajustes na mesa de trabalho</h2>
        <ul className="bul">
          <li>Topo do monitor na altura dos olhos, a um braço de distância.</li>
          <li>Pés apoiados, quadril um pouco acima dos joelhos, cotovelos a cerca de 90° e punhos retos.</li>
          <li>Se o apoio lombar da cadeira empurra você para a frente, teste ajustar a altura ou a profundidade dele, ou sentar um pouco mais para trás com um apoio menor. Use o que for mais confortável.</li>
          <li>Levante a cada 45 a 60 min por 1 a 2 min (o Pomodoro tem um modelo para isso). A melhor postura é a próxima: varie.</li>
          <li>Formigamento, dor que irradia para a perna ou dor persistente nas costas merecem avaliação de um profissional de saúde.</li>
        </ul>
      </section>

      <p className="muted small">Plano de orientação geral, não é prescrição individual. Não substitui avaliação de um médico ou de um profissional de educação física.</p>
    </>
  );
}
