// Volta do Strava: confere o "state", troca o código por tokens e guarda a sessão criptografada no cookie.
import { NextResponse, type NextRequest } from 'next/server';
import { clearState, exchangeCode, STATE_COOKIE, stravaConfig, writeSession } from '@/lib/strava/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const back = (req: NextRequest, status: string) => {
  const res = NextResponse.redirect(new URL(`/semana?strava=${status}#strava`, req.url));
  clearState(res, req);
  res.headers.set('Cache-Control', 'no-store');
  return res;
};

export async function GET(req: NextRequest) {
  const cfg = stravaConfig();
  if (!cfg) return back(req, 'nao-configurado');
  const p = req.nextUrl.searchParams;
  const state = p.get('state');
  if (!state || state !== req.cookies.get(STATE_COOKIE)?.value) return back(req, 'erro');
  if (p.get('error') || !p.get('code')) return back(req, 'cancelado');
  const scope = p.get('scope') ?? '';
  if (!scope.split(',').some((x) => x === 'activity:read_all' || x === 'activity:read')) return back(req, 'sem-permissao');
  try {
    const session = await exchangeCode(cfg, p.get('code')!);
    const res = back(req, 'conectado');
    writeSession(res, req, cfg, session);
    return res;
  } catch {
    return back(req, 'erro');
  }
}
