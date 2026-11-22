// Desconecta: revoga o acesso no Strava (se possível) e apaga o cookie.
import { NextResponse, type NextRequest } from 'next/server';
import { clearSession, deauthorize, readSession, stravaConfig } from '@/lib/strava/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const cfg = stravaConfig();
  const s = cfg ? readSession(req, cfg) : null;
  if (s) await deauthorize(s);
  const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  clearSession(res, req);
  return res;
}
