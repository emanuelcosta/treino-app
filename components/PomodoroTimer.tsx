'use client';
// Pomodoro de corrida/caminhada: blocos de esforço, pausas curtas e pausa longa a cada N blocos.
import { useEffect, useMemo, useState } from 'react';
import {
  buildIntervalSegments, clock, duration, INTERVAL_PRESETS, sanitizeIntervals, totalSeconds, type Block, type IntervalConfig,
} from '@/lib/domain/timer';
import { setIntervals, setPrefs, type TimerPrefs } from '@/lib/domain/store';
import { useStore } from '@/lib/useStore';
import SequenceTimer from './SequenceTimer';

const num = (v: string) => Math.max(0, parseInt(v, 10) || 0);

/** Campo de tempo em minutos + segundos. */
function TimeInputs({ label, value, onChange }: { label: string; value: number; onChange: (sec: number) => void }) {
  const m = Math.floor(value / 60), s = value % 60;
  return (
    <span className="timeinputs">
      <label><input type="number" min={0} max={60} inputMode="numeric" value={m} onChange={(e) => onChange(Math.min(60, num(e.target.value)) * 60 + s)} aria-label={`${label}: minutos`} /> min</label>
      <label><input type="number" min={0} max={59} step={5} inputMode="numeric" value={s} onChange={(e) => onChange(m * 60 + Math.min(59, num(e.target.value)))} aria-label={`${label}: segundos`} /> s</label>
    </span>
  );
}

/** Um bloco com nome e tempo (esforço, pausa curta, pausa longa). */
function BlockField({ title, block, onChange }: { title: string; block: Block; onChange: (b: Block) => void }) {
  return (
    <fieldset className="timefield">
      <legend>{title}</legend>
      <input className="note" value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })} aria-label={`Nome: ${title}`} />
      <TimeInputs label={title} value={block.seconds} onChange={(seconds) => onChange({ ...block, seconds })} />
    </fieldset>
  );
}

export default function PomodoroTimer() {
  const { store, ready, update } = useStore();
  const [cfg, setCfg] = useState<IntervalConfig | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => { if (ready && !cfg) setCfg(store.intervals); }, [ready, cfg, store.intervals]);
  const segments = useMemo(() => (cfg ? buildIntervalSegments(sanitizeIntervals(cfg)) : []), [cfg]);

  useEffect(() => {
    if (!running) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setRunning(false); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [running]);

  if (!ready || !cfg) return <div className="muted">Carregando…</div>;

  const set = (patch: Partial<IntervalConfig>) => setCfg((c) => ({ ...c!, ...patch }));
  const total = totalSeconds(segments.filter((x) => x.kind !== 'prep'));
  const start = () => { update((s) => setIntervals(s, cfg)); setRunning(true); };
  const onPrefs = (p: Partial<TimerPrefs>) => update((s) => setPrefs(s, p));

  return (
    <>
      <h1>Pomodoro</h1>
      <p className="muted">Para correr ou caminhar em blocos: o app avisa com som, voz e vibração quando é hora de correr, de fazer a pausa curta e a pausa longa. Pode deixar o celular no bolso.</p>

      <div className="notice">
        <p><b>Sem esforço máximo até fazer os exames</b> (eletrocardiograma e ecocardiograma). Corra em ritmo de conversa e caminhe nas pausas. Pare se sentir dor no peito, tontura ou falta de ar fora do normal.</p>
      </div>

      <section className="card">
        <h2>Modelos prontos</h2>
        <div className="presets">
          {INTERVAL_PRESETS.map((p) => (
            <button key={p.id} className="preset" onClick={() => setCfg(p.cfg)}>
              <b>{p.name}</b>
              <span className="small">{p.note}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Configure do seu jeito</h2>
        <div className="ivform">
          <BlockField title="Esforço (correr)" block={cfg.work} onChange={(work) => set({ work })} />
          <BlockField title="Pausa curta" block={cfg.easy} onChange={(easy) => set({ easy })} />
          <BlockField title="Pausa longa" block={cfg.long} onChange={(long) => set({ long })} />
          <fieldset className="timefield">
            <legend>Quantos blocos</legend>
            <label className="timeinputs"><input type="number" min={1} max={50} inputMode="numeric" value={cfg.reps} onChange={(e) => set({ reps: Math.max(1, num(e.target.value)) })} aria-label="Quantos blocos de esforço" /> blocos</label>
            <label className="timeinputs">Pausa longa a cada <input type="number" min={0} max={50} inputMode="numeric" value={cfg.longEvery} onChange={(e) => set({ longEvery: num(e.target.value) })} aria-label="Pausa longa a cada quantos blocos" /> blocos</label>
            <span className="small muted">0 = sem pausa longa</span>
          </fieldset>
          <fieldset className="timefield">
            <legend>Aquecimento (caminhada)</legend>
            <TimeInputs label="Aquecimento" value={cfg.warm} onChange={(warm) => set({ warm })} />
          </fieldset>
          <fieldset className="timefield">
            <legend>Desaquecimento (caminhada)</legend>
            <TimeInputs label="Desaquecimento" value={cfg.cool} onChange={(cool) => set({ cool })} />
          </fieldset>
        </div>
        <ol className="ivplan" aria-label="Sequência">
          {segments.filter((s) => s.kind !== 'prep').map((s, i) => (
            <li key={i} className={`k-${s.kind === 'work' ? 'work' : s.kind === 'long' ? 'long' : 'easy'}`}><span>{s.label}</span><b>{clock(s.seconds)}</b></li>
          ))}
        </ol>
        <p><b>Total: {duration(total)}</b></p>
        <button className="btn primary wide" onClick={start} disabled={total <= 5}>Iniciar pomodoro</button>
      </section>

      {running && (
        <div className="guided" role="dialog" aria-modal="true" aria-label="Pomodoro em andamento">
          <div className="ghead">
            <button className="btn" onClick={() => { if (window.confirm('Encerrar o pomodoro?')) setRunning(false); }}>Encerrar</button>
            <span className="small">Total {duration(total)}</span>
          </div>
          <div className="gbody">
            <SequenceTimer segments={segments} prefs={store.prefs} onPrefs={onPrefs} doneSay="Pomodoro concluído. Bom trabalho!" big showTotal />
            <p className="muted small">Dica: deixe a tela ligada e o volume alto. Se a tela apagar, o tempo continua certo, mas alguns celulares só tocam o aviso quando você volta para o app.</p>
          </div>
        </div>
      )}
    </>
  );
}
