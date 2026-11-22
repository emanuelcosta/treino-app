'use client';
// Progresso do plano de 10 km. Planejado (azul) x realizado (laranja). Realizado = só o que foi registrado.
import { useState } from 'react';
import { km } from '@/lib/data';
import { shortDate } from '@/lib/domain/dates';
import { allSummaries, formatDuration, paceLabel, totals, type PlanCtx, type WeekSummary } from '@/lib/domain/runPlan';
import { clock } from '@/lib/domain/timer';

const W = 340, H = 170, PAD = { l: 34, r: 8, t: 10, b: 26 };
const label = (s: WeekSummary) => (s.week === null ? 'P' : `S${s.week}`);
const sub = (s: WeekSummary) => (s.decision === 'repeat' && s.week !== null ? 'rep.' : shortDate(s.start));

function niceMax(v: number) {
  if (v <= 0) return 1;
  const step = v <= 5 ? 1 : v <= 12 ? 2 : v <= 30 ? 5 : 10;
  return Math.ceil(v / step) * step;
}

function Axis({ max, fmt }: { max: number; fmt: (v: number) => string }) {
  const ticks = [0, max / 2, max];
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  return (
    <g className="ch-axis">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} />
          <text x={PAD.l - 4} y={y(t) + 3} textAnchor="end">{fmt(t)}</text>
        </g>
      ))}
    </g>
  );
}

function Legend({ items }: { items: { cls: string; text: string; dashed?: boolean }[] }) {
  return (
    <div className="ch-legend">
      {items.map((i) => <span key={i.text}><i className={`${i.cls}${i.dashed ? ' dashed' : ''}`} aria-hidden="true" />{i.text}</span>)}
    </div>
  );
}

/** Colunas lado a lado: planejado x realizado por semana. */
function KmChart({ data }: { data: WeekSummary[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => Math.max(d.plannedKm, d.doneKm))));
  const slot = (W - PAD.l - PAD.r) / data.length;
  const bw = Math.min(12, (slot - 8) / 2);
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  const base = H - PAD.b;
  const bar = (x: number, v: number, cls: string) => {
    if (v <= 0) return null;
    const top = y(v), h = base - top, r = Math.min(4, h);
    return <path className={cls} d={`M${x},${base} V${top + r} q0,-${r} ${r},-${r} h${bw - 2 * r} q${r},0 ${r},${r} V${base} Z`} />;
  };
  const h = hover !== null ? data[hover] : null;
  return (
    <div className="ch-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Quilômetros por semana: planejado e realizado">
        <Axis max={max} fmt={(v) => `${v}`} />
        {data.map((d, i) => {
          const x0 = PAD.l + i * slot + (slot - 2 * bw - 2) / 2;
          return (
            <g key={d.cal} tabIndex={0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
              aria-label={`${label(d)}: planejado ${km(d.plannedKm)} km, realizado ${km(d.doneKm)} km`}>
              <rect x={PAD.l + i * slot} y={PAD.t} width={slot} height={H - PAD.t - PAD.b} className={hover === i ? 'ch-hit on' : 'ch-hit'} />
              {bar(x0, d.plannedKm, 's1')}
              {bar(x0 + bw + 2, d.doneKm, 's2')}
              <text className="ch-x" x={PAD.l + i * slot + slot / 2} y={H - 12} textAnchor="middle">{label(d)}</text>
              <text className="ch-x sub" x={PAD.l + i * slot + slot / 2} y={H - 2} textAnchor="middle">{sub(d)}</text>
            </g>
          );
        })}
        <line className="ch-base" x1={PAD.l} x2={W - PAD.r} y1={base} y2={base} />
      </svg>
      {h && (
        <div className="ch-tip" style={{ left: `${((PAD.l + (hover! + 0.5) * slot) / W) * 100}%` }} role="status">
          <b>{label(h)}{h.decision === 'repeat' ? ' (repetição)' : ''}</b>
          <span><i className="s1" />Planejado {km(h.plannedKm)} km</span>
          <span><i className="s2" />Realizado {km(h.doneKm)} km</span>
        </div>
      )}
    </div>
  );
}

/** Linhas: longão planejado x maior corrida realizada; ou só o realizado (ritmo). */
function LineChart({ data, series, fmt, aria, maxOverride }: {
  data: WeekSummary[];
  series: { cls: string; name: string; value: (d: WeekSummary) => number | null; dashed?: boolean }[];
  fmt: (v: number) => string; aria: string; maxOverride?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const vals = data.flatMap((d) => series.map((s) => s.value(d) ?? 0));
  const max = maxOverride ?? niceMax(Math.max(...vals));
  const slot = (W - PAD.l - PAD.r) / data.length;
  const x = (i: number) => PAD.l + i * slot + slot / 2;
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  const h = hover !== null ? data[hover] : null;
  return (
    <div className="ch-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={aria}>
        <Axis max={max} fmt={fmt} />
        {series.map((s) => {
          const pts = data.map((d, i) => [i, s.value(d)] as const).filter(([, v]) => v !== null && v > 0) as [number, number][];
          return (
            <g key={s.name}>
              {pts.length > 1 && <polyline className={`ln ${s.cls}${s.dashed ? ' dashed' : ''}`} points={pts.map(([i, v]) => `${x(i)},${y(v)}`).join(' ')} />}
              {pts.map(([i, v]) => <circle key={i} className={`dot ${s.cls}`} cx={x(i)} cy={y(v)} r={hover === i ? 5 : 4} />)}
            </g>
          );
        })}
        {data.map((d, i) => (
          <g key={d.cal} tabIndex={0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
            aria-label={`${label(d)}: ${series.map((s) => `${s.name} ${s.value(d) ? fmt(s.value(d)!) : 'sem registro'}`).join(', ')}`}>
            <rect x={PAD.l + i * slot} y={PAD.t} width={slot} height={H - PAD.t - PAD.b} className={hover === i ? 'ch-hit on' : 'ch-hit'} />
            <text className="ch-x" x={x(i)} y={H - 12} textAnchor="middle">{label(d)}</text>
            <text className="ch-x sub" x={x(i)} y={H - 2} textAnchor="middle">{sub(d)}</text>
          </g>
        ))}
        <line className="ch-base" x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} />
      </svg>
      {h && (
        <div className="ch-tip" style={{ left: `${(x(hover!) / W) * 100}%` }} role="status">
          <b>{label(h)}</b>
          {series.map((s) => <span key={s.name}><i className={s.cls} />{s.name}: {s.value(h) ? fmt(s.value(h)!) : 'sem registro'}</span>)}
        </div>
      )}
    </div>
  );
}

export default function RunProgress({ ctx }: { ctx: PlanCtx }) {
  const weeks = allSummaries(ctx);
  const t = totals(ctx);
  const has = t.runs > 0;
  const paced = weeks.filter((w) => w.pace);

  return (
    <>
      <section className="card">
        <h2>Corrida: rumo aos {km(ctx.s.goalKm)} km</h2>
        <div className="goalbar" aria-label={`Maior corrida registrada: ${km(t.longest)} de ${km(ctx.s.goalKm)} km`}>
          <div className="bar"><div style={{ width: `${Math.round(t.goalProgress * 100)}%` }} /></div>
          <span className="small"><b>{km(t.longest)} km</b> de {km(ctx.s.goalKm)} km (maior corrida registrada)</span>
        </div>
        {!has && <p className="muted small">Nenhuma corrida registrada ainda. Registre no Hoje ou na Semana (distância, tempo e esforço). Os gráficos mostram o planejado em azul e o realizado em laranja.</p>}
        <div className="stats stats4">
          <div className="card stat"><b>{t.runs}</b><span className="small muted">corridas concluídas</span></div>
          <div className="card stat"><b>{km(t.km)}</b><span className="small muted">km realizados</span></div>
          <div className="card stat"><b>{t.seconds ? formatDuration(t.seconds) : '—'}</b><span className="small muted">tempo de corrida</span></div>
          <div className="card stat"><b>{t.pace ? clock(t.pace) : '—'}</b><span className="small muted">ritmo médio (min/km)</span></div>
        </div>
        <p className="muted small">Ritmo médio: só corridas com distância e tempo registrados. Não é indicador de saúde.</p>
      </section>

      <section className="card">
        <h2>Quilômetros por semana</h2>
        <Legend items={[{ cls: 's1', text: 'Planejado' }, { cls: 's2', text: 'Realizado' }]} />
        <KmChart data={weeks} />
      </section>

      <section className="card">
        <h2>Longões e maior corrida da semana</h2>
        <Legend items={[{ cls: 's1', text: 'Longão planejado', dashed: true }, { cls: 's2', text: 'Maior corrida realizada' }]} />
        <LineChart data={weeks} aria="Longão planejado e maior corrida realizada por semana" fmt={(v) => `${km(v)}`}
          series={[
            { cls: 's1', name: 'Longão planejado', value: (d) => d.longPlanned || null, dashed: true },
            { cls: 's2', name: 'Maior corrida', value: (d) => d.maxKm },
          ]} />
      </section>

      <section className="card">
        <h2>Ritmo médio por semana</h2>
        {paced.length === 0
          ? <p className="muted small">Aparece quando você registrar distância e tempo de pelo menos uma corrida.</p>
          : <>
              <p className="muted small">Realizado, em min/km (menor = mais rápido). Varia com calor, subida e cansaço: compare com cuidado.</p>
              <LineChart data={weeks} aria="Ritmo médio realizado por semana" fmt={(v) => clock(v)}
                maxOverride={Math.ceil(Math.max(...paced.map((w) => w.pace!)) / 60 + 1) * 60}
                series={[{ cls: 's2', name: 'Ritmo', value: (d) => d.pace }]} />
            </>}
      </section>

      <section className="card">
        <h2>Consistência semanal</h2>
        <div className="tablewrap">
          <table className="runtable">
            <thead><tr><th>Semana</th><th>Corridas</th><th>Km (realizado / planejado)</th><th>Longão</th><th>Tempo</th><th>Ritmo</th></tr></thead>
            <tbody>
              {weeks.map((w) => (
                <tr key={w.cal}>
                  <td>{w.week === null ? 'Pausa' : `S${w.week}`}{w.decision === 'repeat' && w.week !== null ? ' (rep.)' : ''} <span className="muted small">{shortDate(w.start)}</span></td>
                  <td>{w.runsPlanned ? `${w.runsDone}/${w.runsPlanned}` : '—'}</td>
                  <td>{w.runsPlanned ? `${km(w.doneKm)} / ${km(w.plannedKm)}` : '—'}</td>
                  <td>{w.longDone ? `${km(w.longDone)} km` : w.longPlanned ? `— (${km(w.longPlanned)})` : '—'}</td>
                  <td>{w.seconds ? formatDuration(w.seconds) : '—'}</td>
                  <td>{paceLabel(w.pace)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
