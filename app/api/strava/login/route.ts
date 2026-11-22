// Inicia a conexão: manda para a tela de autorização do Strava (com "state" contra CSRF).
import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { authorizeUrl, stravaConfig, writeState } from '@/lib/strava/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(req: NextRequest) {
  const cfg = stravaConfig();
  if (!cfg) return NextResponse.redirect(new URL('/semana?strava=nao-configurado#strava', req.url));
  const state = randomBytes(16).toString('hex');
  const res = NextResponse.redirect(authorizeUrl(req, cfg, state));
  writeState(res, req, state);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
