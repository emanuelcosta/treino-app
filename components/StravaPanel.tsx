'use client';
// Conexão com o Strava na tela Semana: conectar, buscar as corridas da semana e confirmar cada sugestão.
import { useEffect, useState } from 'react';
import { km } from '@/lib/data';
import { shortDate } from '@/lib/domain/dates';
import { formatDuration, paceLabel, paceOf, type PlanCtx, type Workout } from '@/lib/domain/runPlan';
import { suggestMatches, weekRange, type StravaRun, type Suggestion } from '@/lib/domain/strava';
import type { useStrava } from '@/lib/useStrava';

const MESSAGES: Record<string, string> = {
  conectado: 'Strava conectado.',
  cancelado: 'Conexão com o Strava cancelada.',
  'sem-permissao': 'Para importar, autorize a leitura das suas atividades no Strava.',
  'nao-configurado': 'A integração com o Strava ainda não foi configurada no servidor.',
  erro: 'Não foi possível concluir a conexão com o Strava. Tente de novo.',
};

export const runLine = (r: StravaRun) => `${km(r.km)} km em ${formatDuration(r.seconds)} · ${paceLabel(paceOf(r.km, r.seconds))}`;

export default function StravaPanel({ strava, ctx, cal, onApply }: {
  strava: ReturnType<typeof useStrava>; ctx: PlanCtx; cal: number;
  onApply: (w: Workout, run: StravaRun) => boolean;
}) {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [runs, setRuns] = useState<StravaRun[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('strava');
    if (p && MESSAGES[p]) setMsg(MESSAGES[p]);
  }, []);
  useEffect(() => { setRuns(null); setError(''); }, [cal]);

  const search = async () => {
    setBusy(true); setError('');
    try {
      const { after, before } = weekRange(ctx, cal);
      setRuns(await strava.loadRuns(after, before));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao buscar no Strava.');
    } finally { setBusy(false); }
  };

  const suggestions: Suggestion[] = runs ? suggestMatches(ctx, cal, runs) : [];

  return (
    <section className="card" id="strava">
      <h2>Strava</h2>
      {msg && <p className="small" role="status">{msg}</p>}
      {strava.loading && <p className="muted small">Verificando conexão…</p>}
      {!strava.loading && !strava.configured && (
        <p className="muted small">A integração ainda não está ativa: falta cadastrar as chaves do app do Strava no servidor (veja docs/STRAVA.md no projeto). O resto do app funciona normalmente.</p>
      )}
      {!strava.loading && strava.configured && !strava.connected && (
        <>
          <p className="small">Conecte para importar distância e tempo das suas corridas gravadas no Strava. Você confirma cada importação.</p>
          <a className="btn strava" href="/api/strava/login">Conectar com Strava</a>
        </>
      )}
      {!strava.loading && strava.connected && (
        <>
          <p className="small">Conectado{strava.athlete ? ` como ${strava.athlete}` : ''}. Só leitura das suas atividades.</p>
          <div className="row">
            <button className="btn" onClick={search} disabled={busy}>{busy ? 'Buscando…' : 'Buscar corridas desta semana'}</button>
            <button className="link" onClick={() => { if (window.confirm('Desconectar do Strava? Os registros já importados continuam salvos.')) void strava.disconnect(); }}>Desconectar</button>
          </div>
          {error && <p className="err" role="alert">{error}</p>}
          {runs && suggestions.length === 0 && !error && (
            <p className="muted small">Nenhuma corrida nova do Strava nos dias dos treinos pendentes desta semana ({runs.length} corrida{runs.length === 1 ? '' : 's'} encontrada{runs.length === 1 ? '' : 's'} no período).</p>
          )}
          {suggestions.length > 0 && (
            <ul className="suggest">
              {suggestions.map(({ workout: w, run }) => (
                <li key={w.id}>
                  <div><b>{shortDate(run.date)} · {w.title}</b><span className="small">Strava: “{run.name}”, {runLine(run)}</span></div>
                  <button className="btn primary" onClick={() => { if (!onApply(w, run)) setError('Essa atividade já está em outro treino.'); }}>Usar</button>
                </li>
              ))}
            </ul>
          )}
          <p className="muted small">Powered by Strava. Usa o tempo em movimento. Confira antes de usar: corridas em dias diferentes do programado não são ligadas sozinhas.</p>
        </>
      )}
    </section>
  );
}
