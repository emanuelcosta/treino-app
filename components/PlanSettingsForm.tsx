'use client';
// Configuração do plano de 10 km: dias, início, ritmos e fortalecimento.
import { useState } from 'react';
import { DAY_NAMES, type StrengthPref } from '@/lib/data';
import { mondayOf, shortDate } from '@/lib/domain/dates';
import { formatDuration, parseDuration, scheduleWarnings, validateSettings, type RunSettings } from '@/lib/domain/runPlan';

const ORDER = [1, 2, 3, 4, 5, 6, 0];

function DaySelect({ label, value, onChange }: { label: string; value: number; onChange: (d: number) => void }) {
  return (
    <label>{label}
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {ORDER.map((d) => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}
      </select>
    </label>
  );
}

export default function PlanSettingsForm({ settings, hasLogs, onSave }: { settings: RunSettings; hasLogs: boolean; onSave: (s: RunSettings) => void }) {
  const [s, setS] = useState<RunSettings>(settings);
  const [best, setBest] = useState(formatDuration(settings.best5k));
  const [p0, setP0] = useState(formatDuration(settings.easyPace[0]));
  const [p1, setP1] = useState(formatDuration(settings.easyPace[1]));
  const [msg, setMsg] = useState('');
  const set = (patch: Partial<RunSettings>) => { setS((x) => ({ ...x, ...patch })); setMsg(''); };
  const setDays = (patch: Partial<RunSettings['days']>) => set({ days: { ...s.days, ...patch } });

  const errors = validateSettings(s);
  const parsed = { best: parseDuration(best), p0: parseDuration(p0), p1: parseDuration(p1) };
  const fieldErrors = [
    parsed.best === null ? 'Melhor tempo nos 5 km: use minutos:segundos (ex.: 27:30).' : '',
    parsed.p0 === null || parsed.p1 === null ? 'Ritmo leve: use minutos:segundos por km (ex.: 6:20 e 7:00).' : '',
  ].filter(Boolean);
  const warnings = scheduleWarnings(s);

  const save = () => {
    if (errors.length || fieldErrors.length) { setMsg('Corrija os itens destacados.'); return; }
    onSave({ ...s, best5k: parsed.best!, easyPace: [parsed.p0!, parsed.p1!], confirmed: true });
    setMsg('Plano salvo.');
  };

  return (
    <div className="form planform">
      <fieldset>
        <legend>Dias de corrida</legend>
        <div className="grid2">
          <DaySelect label="Corrida leve" value={s.days.easy} onChange={(d) => setDays({ easy: d })} />
          <DaySelect label="Corrida com variação" value={s.days.tempo} onChange={(d) => setDays({ tempo: d })} />
          <DaySelect label="Longão" value={s.days.long} onChange={(d) => setDays({ long: d })} />
          <label>Dias por semana
            <select value={s.availableDays} onChange={(e) => set({ availableDays: Number(e.target.value) === 3 ? 3 : 4 })}>
              <option value={3}>3 (só as corridas)</option>
              <option value={4}>4 (+ regenerativo opcional)</option>
            </select>
          </label>
          {s.availableDays === 4 && <DaySelect label="Regenerativo (opcional)" value={s.days.regen} onChange={(d) => setDays({ regen: d })} />}
        </div>
        <p className="small muted">Trocar os dias não muda as distâncias do plano.</p>
      </fieldset>

      <fieldset>
        <legend>Fortalecimento</legend>
        <label>Tipo
          <select value={s.strengthPref} onChange={(e) => set({ strengthPref: e.target.value as StrengthPref })}>
            <option value="corrida">Para corrida (2x por semana, curto)</option>
            <option value="calistenia">Calistenia completa A e B (mais volume, inclui parte superior)</option>
            <option value="nenhum">Sem fortalecimento</option>
          </select>
        </label>
        {s.strengthPref !== 'nenhum' && (
          <div className="grid2">
            <DaySelect label="Sessão 1" value={s.days.strength[0]} onChange={(d) => setDays({ strength: [d, s.days.strength[1]] })} />
            <DaySelect label="Sessão 2" value={s.days.strength[1]} onChange={(d) => setDays({ strength: [s.days.strength[0], d] })} />
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend>Você hoje</legend>
        <div className="grid2">
          <label>Distância habitual (km)<input inputMode="decimal" value={String(s.currentKm).replace('.', ',')} onChange={(e) => set({ currentKm: Number(e.target.value.replace(',', '.')) || 0 })} /></label>
          <label>Melhor tempo recente nos 5 km<input inputMode="numeric" value={best} onChange={(e) => { setBest(e.target.value); setMsg(''); }} placeholder="27:30" /></label>
          <label>Objetivo (km)<input inputMode="decimal" value={String(s.goalKm).replace('.', ',')} onChange={(e) => set({ goalKm: Number(e.target.value.replace(',', '.')) || 10 })} /></label>
        </div>
        <p className="small muted">Ritmo leve orientativo (min/km). Ajuste conforme você evolui; o que manda é conseguir conversar.</p>
        <div className="grid2">
          <label>De<input inputMode="numeric" value={p0} onChange={(e) => { setP0(e.target.value); setMsg(''); }} placeholder="6:20" aria-label="Ritmo leve mais rápido" /></label>
          <label>Até<input inputMode="numeric" value={p1} onChange={(e) => { setP1(e.target.value); setMsg(''); }} placeholder="7:00" aria-label="Ritmo leve mais lento" /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Início</legend>
        <label>Semana 1 começa em
          <input type="date" value={s.startDate} disabled={hasLogs} onChange={(e) => e.target.value && set({ startDate: mondayOf(e.target.value) })} aria-label="Data de início do plano" />
        </label>
        <p className="small muted">{hasLogs ? 'Já há treinos registrados: a data de início fica fixa para não embaralhar o histórico.' : `O plano começa na segunda-feira da semana escolhida (${shortDate(s.startDate)}).`}</p>
      </fieldset>

      {[...errors, ...fieldErrors].length > 0 && <ul className="err" role="alert">{[...errors, ...fieldErrors].map((e) => <li key={e}>{e}</li>)}</ul>}
      {warnings.length > 0 && <ul className="tips">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>}
      <div className="row">
        <button className="btn primary" onClick={save}>Salvar plano</button>
        {msg && <span className="small" role="status">{msg}</span>}
      </div>
    </div>
  );
}
