// Integração com o Strava (só no servidor). Usa apenas leitura de atividades do próprio usuário.
// Variáveis de ambiente (Vercel): STRAVA_CLIENT_ID e STRAVA_CLIENT_SECRET. Ver docs/STRAVA.md.
import type { NextRequest, NextResponse } from 'next/server';
import { seal, unseal } from './seal';

export const SESSION_COOKIE = 'strava_session';
export const STATE_COOKIE = 'strava_state';
const COOKIE_PATH = '/api/strava';
const API = 'https://www.strava.com';
/** leitura de todas as atividades do próprio atleta (inclusive as privadas) */
export const SCOPE = 'read,activity:read_all';

export type StravaConfig = { id: string; secret: string };
export type Session = { access: string; refresh: string; expiresAt: number; athlete: { id: number; firstname: string } };

export class StravaError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function stravaConfig(): StravaConfig | null {
  const id = process.env.STRAVA_CLIENT_ID?.trim();
  const secret = process.env.STRAVA_CLIENT_SECRET?.trim();
  return id && secret && /^\d+$/.test(id) ? { id, secret } : null;
}

const secure = (req: NextRequest) => req.nextUrl.protocol === 'https:';
const cookieBase = (req: NextRequest) => ({ httpOnly: true, secure: secure(req), sameSite: 'lax' as const, path: COOKIE_PATH });

export const readSession = (req: NextRequest, cfg: StravaConfig) => unseal<Session>(req.cookies.get(SESSION_COOKIE)?.value, cfg.secret);

export function writeSession(res: NextResponse, req: NextRequest, cfg: StravaConfig, s: Session) {
  res.cookies.set(SESSION_COOKIE, seal(s, cfg.secret), { ...cookieBase(req), maxAge: 60 * 60 * 24 * 180 });
}
export function clearSession(res: NextResponse, req: NextRequest) {
  res.cookies.set(SESSION_COOKIE, '', { ...cookieBase(req), maxAge: 0 });
}
export function writeState(res: NextResponse, req: NextRequest, state: string) {
  res.cookies.set(STATE_COOKIE, state, { ...cookieBase(req), maxAge: 600 });
}
export function clearState(res: NextResponse, req: NextRequest) {
  res.cookies.set(STATE_COOKIE, '', { ...cookieBase(req), maxAge: 0 });
}

export const redirectUri = (req: NextRequest) => `${req.nextUrl.origin}/api/strava/callback`;

export function authorizeUrl(req: NextRequest, cfg: StravaConfig, state: string): string {
  const u = new URL(`${API}/oauth/authorize`);
  u.searchParams.set('client_id', cfg.id);
  u.searchParams.set('redirect_uri', redirectUri(req));
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('approval_prompt', 'auto');
  u.searchParams.set('scope', SCOPE);
  u.searchParams.set('state', state);
  return u.toString();
}

type TokenResponse = { access_token: string; refresh_token: string; expires_at: number; athlete?: { id: number; firstname?: string } };

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const r = await fetch(`${API}/oauth/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body), cache: 'no-store',
  });
  if (!r.ok) throw new StravaError(r.status === 429 ? 429 : 401, `token ${r.status}`);
  return (await r.json()) as TokenResponse;
}

export async function exchangeCode(cfg: StravaConfig, code: string): Promise<Session> {
  const t = await tokenRequest({ client_id: cfg.id, client_secret: cfg.secret, code, grant_type: 'authorization_code' });
  return { access: t.access_token, refresh: t.refresh_token, expiresAt: t.expires_at, athlete: { id: t.athlete?.id ?? 0, firstname: (t.athlete?.firstname ?? '').slice(0, 40) } };
}

/** Renova o token se faltar menos de 5 min para expirar (o do Strava dura 6 h). */
export async function freshSession(cfg: StravaConfig, s: Session): Promise<{ session: Session; changed: boolean }> {
  if (s.expiresAt - 300 > Date.now() / 1000) return { session: s, changed: false };
  const t = await tokenRequest({ client_id: cfg.id, client_secret: cfg.secret, refresh_token: s.refresh, grant_type: 'refresh_token' });
  return { session: { ...s, access: t.access_token, refresh: t.refresh_token, expiresAt: t.expires_at }, changed: true };
}

/** Campos mínimos de cada atividade (nada de mapa, frequência cardíaca ou dados de outras pessoas). */
export type ActivityLite = { id: number; name: string; sport_type: string; start_date_local: string; distance: number; moving_time: number; elapsed_time: number };

export async function listActivities(s: Session, after: number, before: number): Promise<ActivityLite[]> {
  const u = new URL(`${API}/api/v3/athlete/activities`);
  u.searchParams.set('after', String(after));
  u.searchParams.set('before', String(before));
  u.searchParams.set('per_page', '100');
  const r = await fetch(u, { headers: { Authorization: `Bearer ${s.access}` }, cache: 'no-store' });
  if (r.status === 401) throw new StravaError(401, 'desconectado');
  if (r.status === 429) throw new StravaError(429, 'limite');
  if (!r.ok) throw new StravaError(502, `atividades ${r.status}`);
  const list = (await r.json()) as Record<string, unknown>[];
  return list.map((a) => ({
    id: Number(a.id), name: String(a.name ?? '').slice(0, 80), sport_type: String(a.sport_type ?? a.type ?? ''),
    start_date_local: String(a.start_date_local ?? ''), distance: Number(a.distance) || 0,
    moving_time: Number(a.moving_time) || 0, elapsed_time: Number(a.elapsed_time) || 0,
  }));
}

/** Revoga o acesso no Strava (melhor esforço). */
export async function deauthorize(s: Session) {
  try {
    await fetch(`${API}/oauth/deauthorize`, { method: 'POST', headers: { Authorization: `Bearer ${s.access}` }, cache: 'no-store' });
  } catch { /* sem internet ou Strava fora: o cookie é apagado de qualquer jeito */ }
}
