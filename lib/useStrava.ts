'use client';
// Estado da conexão com o Strava e busca de corridas (pelas rotas /api/strava do próprio app).
import { useCallback, useEffect, useState } from 'react';
import { toStravaRun, type StravaRun } from './domain/strava';

export type StravaStatus = { loading: boolean; configured: boolean; connected: boolean; athlete: string | null };

export function useStrava() {
  const [status, setStatus] = useState<StravaStatus>({ loading: true, configured: false, connected: false, athlete: null });

  useEffect(() => {
    let alive = true;
    fetch('/api/strava/status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => { if (alive) setStatus({ loading: false, configured: !!d.configured, connected: !!d.connected, athlete: d.athlete?.firstname ?? null }); })
      .catch(() => { if (alive) setStatus({ loading: false, configured: false, connected: false, athlete: null }); });
    return () => { alive = false; };
  }, []);

  /** Corridas no intervalo (segundos desde 1970). Lança erro com mensagem pronta para mostrar. */
  const loadRuns = useCallback(async (after: number, before: number): Promise<StravaRun[]> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('Sem internet: o Strava só pode ser consultado on-line.');
    let r: Response;
    try {
      r = await fetch(`/api/strava/activities?after=${after}&before=${before}`, { cache: 'no-store' });
    } catch {
      throw new Error('Não foi possível falar com o servidor agora. Tente de novo.');
    }
    if (r.status === 401) {
      setStatus((s) => ({ ...s, connected: false, athlete: null }));
      throw new Error('A conexão com o Strava expirou ou foi revogada. Conecte de novo.');
    }
    if (r.status === 429) throw new Error('O Strava limitou as consultas por alguns minutos. Tente daqui a 15 minutos.');
    if (!r.ok) throw new Error('O Strava não respondeu agora. Tente de novo mais tarde.');
    const d = (await r.json()) as { activities?: unknown[] };
    return (d.activities ?? []).map(toStravaRun).filter((x): x is StravaRun => x !== null);
  }, []);

  const disconnect = useCallback(async () => {
    try { await fetch('/api/strava/logout', { method: 'POST' }); } catch { /* o cookie expira sozinho */ }
    setStatus((s) => ({ ...s, connected: false, athlete: null }));
  }, []);

  return { ...status, loadRuns, disconnect };
}
