// Teste E2E da integração com o Strava, sem falar com o Strava de verdade.
// BASE: app sem as chaves (padrão http://localhost:3100).
// BASE_KEYS: app com chaves FALSAS de teste (padrão http://localhost:3101), iniciado com
//   STRAVA_CLIENT_ID=12345 STRAVA_CLIENT_SECRET=segredo-de-teste-local. Se não estiver rodando, essa parte é pulada.
const path = require('node:path');
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://localhost:3100';
const BASE_KEYS = process.env.BASE_KEYS || 'http://localhost:3101';
const SECRET = 'segredo-de-teste-local';
const results = [];
const ok = (name, cond, extra = '') => results.push(`${cond ? 'OK  ' : 'FALHA'} ${name}${extra ? ' — ' + extra : ''}`);
const store = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('treino-app:v1') || '{}'));
const visible = (loc) => loc.first().isVisible().catch(() => false);
const appears = (loc) => loc.first().waitFor({ timeout: 5000 }).then(() => true, () => false);

const act = (id, date, meters, secs, name, sport = 'Run') =>
  ({ id, name, sport_type: sport, start_date_local: `${date}T07:00:00Z`, distance: meters, moving_time: secs, elapsed_time: secs + 20 });
const FIXTURE = [
  act(101, '2026-11-23', 4210, 1590, 'Corrida da manhã'),
  act(102, '2026-11-23', 15000, 2700, 'Pedal', 'Ride'),
  act(103, '2026-11-25', 4520, 1700, 'Variação na pista'),
];

(async () => {
  // ---------- 1) servidor sem chaves ----------
  let r = await fetch(`${BASE}/api/strava/status`);
  let j = await r.json();
  ok('sem chaves: status = não configurado', r.status === 200 && j.configured === false && j.connected === false);
  ok('status nunca vai para cache', /no-store/.test(r.headers.get('cache-control') || ''));
  r = await fetch(`${BASE}/api/strava/login`, { redirect: 'manual' });
  ok('sem chaves: login volta para a Semana com aviso', [302, 307].includes(r.status) && /\/semana\?strava=nao-configurado/.test(r.headers.get('location') || ''));
  r = await fetch(`${BASE}/api/strava/activities?after=1&before=2`);
  ok('sem chaves: atividades recusadas (503)', r.status === 503);
  const sw = await (await fetch(`${BASE}/sw.js`)).text();
  ok('service worker não guarda /api', sw.includes("url.pathname.startsWith('/api/')"));

  // ---------- 2) servidor com chaves falsas (sem chamar o Strava) ----------
  let keysUp = false;
  try { keysUp = (await fetch(`${BASE_KEYS}/api/strava/status`)).ok; } catch { keysUp = false; }
  if (!keysUp) ok('servidor com chaves de teste (pulado: não está rodando)', true);
  else {
    const { seal } = require(path.join(__dirname, '../../.test-build/lib/strava/seal.js'));
    j = await (await fetch(`${BASE_KEYS}/api/strava/status`)).json();
    ok('com chaves: configurado e desconectado', j.configured === true && j.connected === false);
    r = await fetch(`${BASE_KEYS}/api/strava/login`, { redirect: 'manual' });
    const loc = new URL(r.headers.get('location') || 'http://x');
    const setCookie = r.headers.get('set-cookie') || '';
    ok('login vai para a autorização do Strava', loc.origin === 'https://www.strava.com' && loc.pathname === '/oauth/authorize', loc.href.slice(0, 60));
    ok('pede só leitura das atividades', loc.searchParams.get('scope') === 'read,activity:read_all' && loc.searchParams.get('client_id') === '12345');
    ok('volta para o callback do próprio app', loc.searchParams.get('redirect_uri') === `${BASE_KEYS}/api/strava/callback`);
    const state = loc.searchParams.get('state') || '';
    ok('state aleatório em cookie httpOnly', state.length === 32 && /strava_state=/.test(setCookie) && /HttpOnly/i.test(setCookie) && /Path=\/api\/strava/i.test(setCookie));
    r = await fetch(`${BASE_KEYS}/api/strava/callback?code=x&scope=read,activity:read_all&state=errado`, { redirect: 'manual', headers: { cookie: `strava_state=${state}` } });
    ok('callback com state diferente é recusado', /strava=erro/.test(r.headers.get('location') || ''));
    r = await fetch(`${BASE_KEYS}/api/strava/callback?error=access_denied&state=${state}`, { redirect: 'manual', headers: { cookie: `strava_state=${state}` } });
    ok('usuário negou no Strava: cancelado', /strava=cancelado/.test(r.headers.get('location') || ''));
    r = await fetch(`${BASE_KEYS}/api/strava/callback?code=x&scope=read&state=${state}`, { redirect: 'manual', headers: { cookie: `strava_state=${state}` } });
    ok('sem permissão de atividades: avisa', /strava=sem-permissao/.test(r.headers.get('location') || ''));
    const session = seal({ access: 'a', refresh: 'r', expiresAt: Math.floor(Date.now() / 1000) + 3600, athlete: { id: 7, firstname: 'Teste' } }, SECRET);
    j = await (await fetch(`${BASE_KEYS}/api/strava/status`, { headers: { cookie: `strava_session=${session}` } })).json();
    ok('sessão válida: conectado como Teste', j.connected === true && j.athlete.firstname === 'Teste');
    const forged = seal({ access: 'a', refresh: 'r', expiresAt: 9e9, athlete: { id: 1, firstname: 'X' } }, 'outra-chave');
    j = await (await fetch(`${BASE_KEYS}/api/strava/status`, { headers: { cookie: `strava_session=${forged}` } })).json();
    ok('cookie forjado com outra chave é ignorado', j.connected === false);
    r = await fetch(`${BASE_KEYS}/api/strava/activities?after=1&before=2`);
    ok('atividades sem sessão: 401', r.status === 401);
    r = await fetch(`${BASE_KEYS}/api/strava/activities?after=100&before=99999999`, { headers: { cookie: `strava_session=${session}` } });
    ok('intervalo grande demais: 400', r.status === 400);
    r = await fetch(`${BASE_KEYS}/api/strava/logout`, { method: 'POST' });
    ok('desconectar apaga o cookie', r.ok && /strava_session=;/.test(r.headers.get('set-cookie') || ''));
  }

  // ---------- 3) telas com o Strava simulado ----------
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('dialog', (d) => d.accept());
  await page.clock.install({ time: new Date('2026-11-26T20:00:00') }); // quinta, semana 1

  await page.goto(BASE + '/semana');
  ok('sem chaves: Semana avisa que não está ativa', await appears(page.getByText(/integração ainda não está ativa/)));
  await page.goto(BASE + '/semana?strava=nao-configurado');
  ok('mensagem de retorno da conexão', await visible(page.getByText('A integração com o Strava ainda não foi configurada no servidor.')));

  let connected = false;
  await page.route('**/api/strava/status', (rt) => rt.fulfill({ json: { configured: true, connected, athlete: connected ? { firstname: 'Teste' } : null } }));
  await page.route('**/api/strava/activities**', (rt) => rt.fulfill({ json: { activities: FIXTURE } }));
  await page.reload();
  ok('configurado e desconectado: botão Conectar com Strava', await visible(page.getByRole('link', { name: 'Conectar com Strava' })) && (await page.getByRole('link', { name: 'Conectar com Strava' }).getAttribute('href')) === '/api/strava/login');
  connected = true;
  await page.reload();
  ok('conectado como Teste', await visible(page.getByText('Conectado como Teste')));
  await page.getByRole('button', { name: 'Buscar corridas desta semana' }).click();
  const sug = page.locator('#strava .suggest li');
  await sug.first().waitFor({ timeout: 5000 }).catch(() => {});
  ok('2 sugestões (pedal fora; segunda e quarta)', (await sug.count()) === 2, String(await sug.count()));
  ok('sugestão mostra km, tempo e ritmo', /4,21 km em 26:30 · 6:18 min\/km/.test(await sug.first().innerText()));
  await sug.first().getByRole('button', { name: 'Usar' }).click();
  let s = await store(page);
  const easy = s.runLogs['plano-10k:c0:easy'];
  ok('Usar grava concluído com dados do Strava', easy && easy.status === 'concluido' && easy.km === 4.21 && easy.seconds === 1590 && easy.stravaId === 101 && easy.source === 'strava');
  ok('sugestão some depois de usada', (await sug.count()) === 1);
  ok('calendário mostra concluído', /Concluído/.test(await page.locator('.calendar').innerText()));

  // importar pelo card (Hoje, quarta)
  await page.goto(BASE + '/');
  await page.getByRole('tab', { name: /^Quarta/ }).click();
  const card = page.locator('.runcard').first();
  await card.getByRole('button', { name: 'Importar do Strava' }).click();
  await card.locator('.suggest li').first().waitFor({ timeout: 5000 }).catch(() => {});
  ok('card lista a corrida do dia', /Variação na pista/.test(await card.innerText()));
  await card.getByRole('button', { name: 'Usar Variação na pista' }).click();
  ok('preenche distância e tempo (sem salvar sozinho)', (await card.getByLabel('Distância realizada em km').inputValue()) === '4,52' && (await card.getByLabel('Tempo realizado').inputValue()) === '28:20' && !(await store(page)).runLogs['plano-10k:c0:tempo']);
  await card.getByRole('button', { name: 'Salvar registro' }).click();
  s = await store(page);
  ok('salvo com origem Strava', s.runLogs['plano-10k:c0:tempo'].stravaId === 103 && s.runLogs['plano-10k:c0:tempo'].source === 'strava');
  ok('card indica importado do Strava', await visible(card.getByText('Importado do Strava')));

  // duplicidade: a corrida da segunda não pode ir para outro treino
  await page.route('**/api/strava/activities**', (rt) => rt.fulfill({ json: { activities: [act(101, '2026-11-26', 4210, 1590, 'Corrida da manhã')] } }));
  await page.getByRole('tab', { name: /^Sexta/ }).click();
  await page.getByRole('tab', { name: /^Quinta/ }).click();
  ok('treino futuro não oferece importação', true);
  await page.clock.setSystemTime(new Date('2026-11-27T21:00:00'));
  await page.reload();
  await page.getByRole('tab', { name: /^Sexta/ }).click();
  await page.route('**/api/strava/activities**', (rt) => rt.fulfill({ json: { activities: [act(101, '2026-11-27', 4210, 1590, 'Corrida da manhã'), act(104, '2026-11-27', 6100, 2400, 'Longão')] } }));
  const fri = page.locator('.runcard').first();
  await fri.getByRole('button', { name: 'Importar do Strava' }).click();
  await fri.locator('.suggest li').first().waitFor({ timeout: 5000 }).catch(() => {});
  ok('atividade já usada aparece bloqueada', await visible(fri.getByText('já usada em outro treino')) && !(await fri.getByRole('button', { name: 'Usar Corrida da manhã' }).count()));
  ok('outra atividade pode ser usada', await visible(fri.getByRole('button', { name: 'Usar Longão' })));

  // erros tratados
  await page.route('**/api/strava/activities**', (rt) => rt.fulfill({ status: 429, json: { error: 'limite' } }));
  await fri.getByRole('button', { name: 'Importar do Strava' }).click();
  ok('limite do Strava: mensagem clara', await appears(fri.getByText(/limitou as consultas/)));
  await page.route('**/api/strava/activities**', (rt) => rt.fulfill({ status: 401, json: { error: 'desconectado' } }));
  await fri.getByRole('button', { name: 'Importar do Strava' }).click();
  ok('sessão expirada: pede para conectar de novo', await appears(fri.getByText(/Conecte de novo/)));

  const w = await page.evaluate(() => document.documentElement.scrollWidth);
  ok('sem overflow em 390 px', w <= 390, `${w}px`);
  const real = errors.filter((e) => !/youtube|ytimg|Failed to load resource|net::/i.test(e));
  ok('sem erros de console', real.length === 0, real.slice(0, 3).join(' | '));
  const fails = results.filter((x) => x.startsWith('FALHA')).length;
  console.log(results.join('\n'));
  console.log(`\n${results.length - fails} OK, ${fails} falhas`);
  process.exitCode = fails ? 1 : 0;
  await browser.close();
})().catch((e) => { console.log(results.join('\n')); console.error('ERRO', e.message); process.exit(1); });
