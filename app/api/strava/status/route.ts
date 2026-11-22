// Diz se a integração está configurada e se este navegador está conectado (sem chamar o Strava).
import { NextResponse, type NextRequest } from 'next/server';
import { readSession, stravaConfig } from '@/lib/strava/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(req: NextRequest) {
  const cfg = stravaConfig();
  const s = cfg ? readSession(req, cfg) : null;
  return NextResponse.json(
    { configured: !!cfg, connected: !!s, athlete: s ? { firstname: s.athlete.firstname } : null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
