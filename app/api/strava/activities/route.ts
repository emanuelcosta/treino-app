// Lista as atividades do próprio atleta num intervalo curto (máx. 62 dias). Renova o token se preciso.
import { NextResponse, type NextRequest } from 'next/server';
import { clearSession, freshSession, listActivities, readSession, StravaError, stravaConfig, writeSession } from '@/lib/strava/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(req: NextRequest) {
  const cfg = stravaConfig();
  if (!cfg) return json({ error: 'nao-configurado' }, 503);
  const session = readSession(req, cfg);
  if (!session) return json({ error: 'desconectado' }, 401);
  const after = Number(req.nextUrl.searchParams.get('after'));
  const before = Number(req.nextUrl.searchParams.get('before'));
  if (!Number.isInteger(after) || !Number.isInteger(before) || after <= 0 || before <= after || before - after > 62 * 86400) {
    return json({ error: 'intervalo-invalido' }, 400);
  }
  try {
    const { session: s, changed } = await freshSession(cfg, session);
    const activities = await listActivities(s, after, before);
    const res = json({ activities });
    if (changed) writeSession(res, req, cfg, s);
    return res;
  } catch (e) {
    const status = e instanceof StravaError ? e.status : 502;
    const res = json({ error: status === 401 ? 'desconectado' : status === 429 ? 'limite' : 'falha' }, status === 401 || status === 429 ? status : 502);
    if (status === 401) clearSession(res, req);
    return res;
  }
}
