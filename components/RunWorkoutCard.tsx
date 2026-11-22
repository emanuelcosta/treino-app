'use client';
// Treino de corrida do plano + registro do que foi feito (nada é marcado sozinho).
import { useEffect, useState } from 'react';
import { km } from '@/lib/data';
import { addDays, parseDate, shortDate } from '@/lib/domain/dates';
import {
  formatDuration, guidance, paceLabel, paceOf, parseDuration, parseKm, STATUS_LABEL,
  type Discomfort, type LogInput, type RunLog, type RunLogs, type RunStatus, type Workout,
} from '@/lib/domain/runPlan';
import { usedStravaIds, type StravaRun } from '@/lib/domain/strava';

/** Busca as corridas do Strava de uma data (só quando conectado). */
export type StravaImporter = { load: (date: string) => Promise<StravaRun[]>; logs: RunLogs };

const weekday = (d: string) => parseDate(d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
const STATUSES: RunStatus[] = ['concluido', 'adiado', 'nao_realizado', 'pendente'];
const RPE_HINT: Record<number, string> = { 1: 'muito fácil', 3: 'leve', 5: 'moderado', 7: 'forte', 9: 'muito forte', 10: 'máximo' };

export default function RunWorkoutCard({ w, log, today, onSave, compact = false, importer }: {
  w: Workout; log?: RunLog; today: string; onSave: (input: LogInput) => void; compact?: boolean; importer?: StravaImporter;
}) {
  const status = log?.status ?? 'pendente';
  const [open, setOpen] = useState(!compact);
  const [st, setSt] = useState<RunStatus>(status);
  const [kmText, setKm] = useState(log?.km ? km(log.km) : '');
  const [time, setTime] = useState(log?.seconds ? formatDuration(log.seconds) : '');
  const [rpe, setRpe] = useState(log?.rpe ? String(log.rpe) : '');
  const [disc, setDisc] = useState<Discomfort>(log?.discomfort ?? 'nenhum');
  const [notes, setNotes] = useState(log?.notes ?? '');
  const [moved, setMoved] = useState(log?.movedTo ?? addDays(w.scheduled, 1));
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [picked, setPicked] = useState<StravaRun | null>(null);
  const [found, setFound] = useState<StravaRun[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [importErr, setImportErr] = useState('');

  // registro atualizado por fora (ex.: outra tela): reflete no formulário
  useEffect(() => { setSt(log?.status ?? 'pendente'); }, [log?.status]);

  const effective = log?.movedTo ?? w.scheduled;
  const future = effective > today;
  const kmVal = parseKm(kmText);
  const secVal = parseDuration(time);
  const livePace = paceOf(kmVal ?? undefined, secVal ?? undefined);

  const used = importer ? usedStravaIds(importer.logs, w.id) : new Set<number>();
  const searchStrava = async () => {
    if (!importer) return;
    setImporting(true); setImportErr(''); setFound(null);
    try { setFound(await importer.load(effective)); } catch (e) { setImportErr(e instanceof Error ? e.message : 'Falha ao buscar no Strava.'); }
    finally { setImporting(false); }
  };
  const useRun = (r: StravaRun) => {
    setPicked(r); setSt('concluido'); setKm(km(r.km)); setTime(formatDuration(r.seconds)); setFound(null); setSaved(false); setErrors([]);
    if (!notes) setNotes(`Strava: ${r.name}`);
  };

  const chooseStatus = (v: RunStatus) => {
    setSt(v); setSaved(false); setErrors([]);
    if (v === 'concluido' && !kmText && w.plannedKm) setKm(km(w.plannedKm)); // sugestão editável: só vale ao salvar
  };

  const save = () => {
    const errs: string[] = [];
    if (kmText.trim() && kmVal === null) errs.push('Distância inválida. Use números, ex.: 4,2');
    if (time.trim() && secVal === null) errs.push('Tempo inválido. Use minutos:segundos, ex.: 26:30 (ou 1:05:20)');
    if (st === 'concluido' && future) errs.push('Esse treino ainda não chegou: registre depois de correr.');
    if (st === 'adiado' && (moved <= w.scheduled || moved > addDays(w.scheduled, 7))) errs.push('Escolha uma nova data até 7 dias depois da data programada.');
    setErrors(errs);
    if (errs.length) return;
    const input: LogInput = {
      status: st,
      km: st === 'concluido' ? kmVal ?? undefined : undefined,
      seconds: st === 'concluido' ? secVal ?? undefined : undefined,
      rpe: st === 'concluido' && rpe ? Number(rpe) : undefined,
      discomfort: disc, notes: notes.trim() || undefined,
      movedTo: st === 'adiado' ? moved : st === 'concluido' ? log?.movedTo : undefined,
      ...(st === 'concluido' && (picked || log?.stravaId)
        ? { source: 'strava' as const, stravaId: picked?.id ?? log?.stravaId }
        : st === 'concluido' ? { source: 'manual' as const, stravaId: undefined } : {}),
    };
    onSave(input);
    setSaved(true);
  };

  const tips = guidance(log);

  return (
    <div className={`runcard s-${status}${compact ? ' compact' : ''}`}>
      {!compact && <div className="runhead">
        <div>
          <div className="runtitle">{w.title}</div>
          <div className="small muted">
            Semana {w.planWeek} do plano · {weekday(w.scheduled)}{log?.movedTo ? ` → ${weekday(log.movedTo)}` : ''}
          </div>
        </div>
        <span className={`badge b-${status}`}>{STATUS_LABEL[status]}</span>
      </div>}

      {!compact && <dl className="runfacts">
        {w.plannedKm > 0 && <div><dt>Planejado</dt><dd>{km(w.plannedKm)} km</dd></div>}
        {w.estimate && <div><dt>Duração estimada</dt><dd>{Math.round(w.estimate[0] / 60)}–{Math.round(w.estimate[1] / 60)} min</dd></div>}
        <div className="wide"><dt>Intensidade</dt><dd>{w.intensity}</dd></div>
        <div className="wide"><dt>Objetivo</dt><dd>{w.objective}</dd></div>
        <div className="wide"><dt>Aquecimento</dt><dd>{w.warmup}</dd></div>
      </dl>}
      {compact && log?.movedTo && <p className="small">Adiado para {weekday(log.movedTo)}.</p>}
      {log?.source === 'strava' && <p className="small muted">Importado do Strava</p>}
      {log?.km && <p className="small"><b>Realizado:</b> {km(log.km)} km{log.seconds ? ` em ${formatDuration(log.seconds)} · ${paceLabel(paceOf(log.km, log.seconds))}` : ''}{log.rpe ? ` · esforço ${log.rpe}/10` : ''}</p>}
      {!compact && <p className="small muted">Pare se sentir dor que mude a sua passada. O ritmo é só uma referência: calor, subidas e cansaço mudam o ritmo certo do dia.</p>}

      {tips.length > 0 && <ul className="tips" role="status">{tips.map((t) => <li key={t}>{t}</li>)}</ul>}

      {compact && <button className="link" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'Fechar registro' : 'Registrar'}</button>}
      {open && (
        <div className="runform">
          <div className="statusbtns" role="radiogroup" aria-label={`Status: ${w.title}`}>
            {STATUSES.map((v) => (
              <button key={v} role="radio" aria-checked={st === v} className={st === v ? 'chip sel' : 'chip'} onClick={() => chooseStatus(v)}>{STATUS_LABEL[v]}</button>
            ))}
          </div>
          {st === 'adiado' && (
            <label>Nova data<input type="date" value={moved} min={addDays(w.scheduled, 1)} max={addDays(w.scheduled, 7)} onChange={(e) => setMoved(e.target.value)} aria-label="Nova data do treino" /></label>
          )}
          {importer && !future && st !== 'adiado' && (
            <div className="stravaimport">
              <button className="btn strava-outline" onClick={searchStrava} disabled={importing}>{importing ? 'Buscando…' : 'Importar do Strava'}</button>
              {found && found.length === 0 && <p className="muted small">Nenhuma corrida no Strava em {shortDate(effective)}.</p>}
              {found && found.length > 0 && (
                <ul className="suggest" aria-label="Corridas do Strava neste dia">
                  {found.map((r) => (
                    <li key={r.id}>
                      <div><b>{r.name}</b><span className="small">{km(r.km)} km em {formatDuration(r.seconds)} · {paceLabel(paceOf(r.km, r.seconds))}</span></div>
                      {used.has(r.id) ? <span className="small muted">já usada em outro treino</span>
                        : <button className="btn" onClick={() => useRun(r)} aria-label={`Usar ${r.name}`}>Usar</button>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {importErr && <p className="err" role="alert">{importErr}</p>}
          {picked && st === 'concluido' && <p className="small">Dados do Strava: “{picked.name}”. Confira e toque em Salvar registro.</p>}
          {st === 'concluido' && (
            <>
              <div className="setfields">
                <label>Distância (km)<input inputMode="decimal" value={kmText} onChange={(e) => setKm(e.target.value)} placeholder={w.plannedKm ? km(w.plannedKm) : 'ex.: 4,2'} aria-label="Distância realizada em km" /></label>
                <label>Tempo (min:seg)<input inputMode="numeric" value={time} onChange={(e) => setTime(e.target.value)} placeholder="ex.: 26:30" aria-label="Tempo realizado" /></label>
              </div>
              <p className="small">Ritmo: <b>{paceLabel(livePace)}</b>{!livePace && <span className="muted"> (preencha distância e tempo)</span>}</p>
              <label>Esforço percebido (1 a 10)
                <select value={rpe} onChange={(e) => setRpe(e.target.value)} aria-label="Percepção de esforço de 1 a 10">
                  <option value="">Escolha</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}{RPE_HINT[n] ? ` – ${RPE_HINT[n]}` : ''}</option>)}
                </select>
              </label>
            </>
          )}
          <label>Desconforto ou dor
            <select value={disc} onChange={(e) => setDisc(e.target.value as Discomfort)} aria-label="Desconforto ou dor">
              <option value="nenhum">Nenhum</option>
              <option value="leve">Leve (não muda a passada)</option>
              <option value="forte">Forte ou muda a passada</option>
            </select>
          </label>
          <label>Observações<textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Como foi? Onde incomodou? (opcional)" aria-label="Observações" /></label>
          {errors.length > 0 && <ul className="err" role="alert">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
          <div className="row">
            <button className="btn primary" onClick={save}>Salvar registro</button>
            {saved && errors.length === 0 && <span className="small" role="status">Registro salvo{st === 'adiado' ? ` para ${shortDate(moved)}` : ''}.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
