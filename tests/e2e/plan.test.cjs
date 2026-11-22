// Teste E2E do plano de 10 km (Playwright + Chrome instalado). App rodando em BASE (padrão: http://localhost:3100).
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://localhost:3100';
const results = [];
const ok = (name, cond, extra = '') => results.push(`${cond ? 'OK  ' : 'FALHA'} ${name}${extra ? ' — ' + extra : ''}`);
const store = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('treino-app:v1') || '{}'));
const visible = (loc) => loc.first().isVisible().catch(() => false);

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('dialog', (d) => d.accept());
  await page.clock.install({ time: new Date('2026-11-24T10:00:00') }); // terça, semana 1

  // ---------- Hoje: treino do dia ----------
  await page.goto(BASE + '/');
  ok('pílula da semana: semana 1 de 8', await visible(page.getByRole('link', { name: 'Plano de 10 km · semana 1 de 8' })));
  ok('cartão de configuração inicial', await visible(page.getByText('Seu plano de 10 km em 8 semanas')));
  const card = page.locator('.runcard').first();
  ok('terça: corrida leve de 4 km', (await card.locator('.runtitle').innerText()) === 'Corrida leve: 4 km');
  ok('mostra distância, duração estimada, intensidade e objetivo',
    /4 km/.test(await card.innerText()) && /25–28 min/.test(await card.innerText()) && /6:20–7:00 min\/km/.test(await card.innerText()) && /base aeróbica/.test(await card.innerText()));
  ok('status inicial pendente', (await card.locator('.badge').innerText()) === 'Pendente');
  ok('corrida não tem caixa de marcar (sem conclusão automática)', (await page.locator('section.card', { has: page.getByRole('heading', { name: 'Corrida leve' }) }).locator('button.check').count()) === 0);

  // marcar o dia não registra a corrida
  await page.getByRole('button', { name: 'Entendi' }).click();
  await page.getByRole('button', { name: 'Marcar dia como feito' }).click();
  let s = await store(page);
  ok('"Marcar dia como feito" não conclui a corrida', Object.keys(s.runLogs || {}).length === 0 && (await card.locator('.badge').innerText()) === 'Pendente');
  await page.getByRole('button', { name: 'Desmarcar dia' }).click();

  // registrar
  await card.getByRole('radio', { name: 'Concluído' }).click();
  ok('distância sugerida = planejada (editável)', (await card.getByLabel('Distância realizada em km').inputValue()) === '4');
  await card.getByLabel('Distância realizada em km').fill('4,2');
  await card.getByLabel('Tempo realizado').fill('26:30');
  ok('ritmo calculado na hora', /6:19 min\/km/.test(await card.innerText()));
  await card.getByLabel('Percepção de esforço de 1 a 10').selectOption('5');
  await card.getByLabel('Observações').fill('Tranquilo');
  await card.getByRole('button', { name: 'Salvar registro' }).click();
  ok('registro salvo', await visible(card.getByText('Registro salvo.')));
  ok('status concluído', (await card.locator('.badge').innerText()) === 'Concluído');
  await page.reload();
  const card2 = page.locator('.runcard').first();
  ok('persiste após recarregar', (await card2.locator('.badge').innerText()) === 'Concluído' && /4,2 km em 26:30 · 6:19 min\/km · esforço 5\/10/.test(await card2.innerText()));
  s = await store(page);
  const ids = Object.keys(s.runLogs);
  ok('um registro com id estável', ids.length === 1 && ids[0] === 'plano-10k:c0:easy', ids.join(','));
  // salvar de novo não duplica
  await card2.getByLabel('Distância realizada em km').fill('4,3');
  await card2.getByRole('button', { name: 'Salvar registro' }).click();
  s = await store(page);
  ok('salvar de novo atualiza, não duplica', Object.keys(s.runLogs).length === 1 && s.runLogs['plano-10k:c0:easy'].km === 4.3);
  // orientação de segurança
  await card2.getByLabel('Percepção de esforço de 1 a 10').selectOption('9');
  await card2.getByRole('button', { name: 'Salvar registro' }).click();
  ok('esforço 9 em corrida leve gera orientação', await visible(card2.getByText(/vá mais devagar/)));
  await card2.getByLabel('Desconforto ou dor').selectOption('forte');
  await card2.getByRole('button', { name: 'Salvar registro' }).click();
  ok('dor forte orienta interromper', await visible(card2.getByText(/interrompa os treinos de corrida/)));
  await card2.getByLabel('Desconforto ou dor').selectOption('nenhum');
  await card2.getByLabel('Percepção de esforço de 1 a 10').selectOption('5');
  await card2.getByRole('button', { name: 'Salvar registro' }).click();

  // ---------- quinta: futuro + adiar ----------
  await page.getByRole('tab', { name: /^Quinta/ }).click();
  const thu = page.locator('.runcard').first();
  ok('quinta semana 1: 4 km + 4 acelerações', (await thu.locator('.runtitle').innerText()) === 'Corrida: 4 km leve + 4 acelerações de 20 s');
  ok('acelerações com cronômetro de 20 s', await visible(page.getByRole('button', { name: /Cronômetro de 4 acelerações de 20 s/ })));
  await thu.getByRole('radio', { name: 'Concluído' }).click();
  await thu.getByRole('button', { name: 'Salvar registro' }).click();
  ok('não deixa concluir treino futuro', await visible(thu.getByText('Esse treino ainda não chegou')));
  await thu.getByRole('radio', { name: 'Adiado' }).click();
  await thu.getByLabel('Nova data do treino').fill('2026-11-27');
  await thu.getByRole('button', { name: 'Salvar registro' }).click();
  ok('adiado para sexta', (await thu.locator('.badge').innerText()) === 'Adiado' && /→/.test(await thu.innerText()));
  await page.getByRole('tab', { name: /^Sexta/ }).click();
  ok('sexta mostra o treino remarcado', await visible(page.getByRole('heading', { name: 'Treino remarcado para este dia' })) && /4 acelerações/.test(await page.locator('.runcard').first().innerText()));
  s = await store(page);
  ok('adiar não duplica (2 registros: terça e quinta)', Object.keys(s.runLogs).length === 2);

  // ---------- Semana ----------
  await page.goto(BASE + '/semana');
  ok('semana atual: semana 1 de 8', await visible(page.getByText('Semana 1 de 8')));
  ok('km da semana: 4,3 de 14 km', /4,3\s*de 14 km/.test(await page.locator('.weeksum').innerText()));
  ok('corridas concluídas 1 de 3', /Corridas concluídas: 1 de 3/.test(await page.locator('.weeksum').innerText()));
  const calItems = await page.locator('.calendar > li').count();
  ok('calendário com 7 dias', calItems === 7);
  ok('descanso aparece na quarta', /Quarta[\s\S]*Descanso/.test(await page.locator('.calendar').innerText()));
  ok('tabela de 8 semanas', (await page.locator('table tbody tr').count()) === 8);
  await page.getByRole('button', { name: 'Próxima semana' }).click();
  ok('navegar: próxima semana', await visible(page.getByText('Semana 2 de 8')) && /4,5 km com 3 × 2 min moderados/.test(await page.locator('.calendar').innerText()));
  await page.getByRole('button', { name: 'Semana anterior' }).click();

  // configurar dias: carga igual; conflito recusado
  const form = page.locator('#configurar');
  await form.getByLabel('Corrida leve').selectOption({ label: 'Quarta' });
  await form.getByRole('button', { name: 'Salvar plano' }).click();
  ok('salva dias novos', await visible(form.getByText('Plano salvo.')));
  ok('carga igual após trocar o dia (14 km)', /de 14 km/.test(await page.locator('.weeksum').innerText()));
  ok('corrida leve agora na quarta', /Quarta[\s\S]*Corrida leve: 4 km/.test(await page.locator('.calendar').innerText()));
  await form.getByLabel('Corrida com variação').selectOption({ label: 'Quarta' });
  await form.getByRole('button', { name: 'Salvar plano' }).click();
  ok('recusa dois treinos no mesmo dia', await visible(form.getByText(/Escolha dias diferentes/)));
  await form.getByLabel('Corrida com variação').selectOption({ label: 'Quinta' });
  await form.getByLabel('Corrida leve').selectOption({ label: 'Terça' });
  await form.getByRole('button', { name: 'Salvar plano' }).click();
  s = await store(page);
  ok('configuração confirmada e salva', s.run.confirmed === true && s.run.days.easy === 2);
  ok('data de início fixa com registros', await page.getByLabel('Data de início do plano').isDisabled());

  // ---------- semana nova: o usuário decide ----------
  await page.clock.setSystemTime(new Date('2026-12-01T10:00:00'));
  await page.goto(BASE + '/');
  ok('semana nova pede decisão (sugere repetir: semana 1 incompleta)', await visible(page.getByText(/A semana 1 ficou incompleta/)) && await visible(page.getByRole('button', { name: 'Repetir a semana 1' })));
  await page.getByRole('button', { name: 'Avançar para a semana 2' }).click();
  ok('avançou para a semana 2 por decisão do usuário', await visible(page.getByRole('link', { name: /semana 2 de 8/ })));
  ok('terça da semana 2: 4 km leve', (await page.locator('.runcard').first().locator('.runtitle').innerText()) === 'Corrida leve: 4 km');
  await page.goto(BASE + '/semana');
  await page.getByLabel('Decisão da semana').selectOption('repeat');
  ok('repetir: semana 1 de novo', await visible(page.getByText('Semana 1 de 8 (repetição)')));
  ok('repetir não duplica treinos (4 por semana)', (await page.locator('.calrun').count()) === 4);
  await page.getByLabel('Decisão da semana').selectOption('next');
  await page.getByRole('button', { name: 'Semana anterior' }).click();
  ok('semana passada mantém os registros', /4,3\s*de 14 km/.test(await page.locator('.weeksum').innerText()));
  ok('semana com registros: decisão travada', await page.getByLabel('Decisão da semana').isDisabled());

  // ---------- Progresso ----------
  await page.goto(BASE + '/progresso');
  const stats = await page.locator('.stats4').innerText();
  ok('progresso: 1 corrida, 4,3 km, ritmo calculado', /1\s*corridas concluídas/.test(stats) && /4,3\s*km realizados/.test(stats) && /6:10/.test(stats), stats.replace(/\n/g, ' '));
  ok('rumo aos 10 km: maior corrida 4,3', /4,3 km de 10 km/.test(await page.locator('.goalbar').innerText()));
  ok('gráfico de km com planejado e realizado', (await page.locator('svg.chart path.s1').count()) >= 8 && (await page.locator('svg.chart path.s2').count()) === 1);
  ok('legenda planejado/realizado', await visible(page.locator('.ch-legend').getByText('Planejado')) && await visible(page.locator('.ch-legend').getByText('Realizado')));
  const row1 = await page.locator('table.runtable tbody tr').first().innerText();
  ok('tabela: semana 1 com 1/3 e 4,3 / 14', /1\/3/.test(row1) && /4,3 \/ 14/.test(row1), row1.replace(/\s+/g, ' '));
  await page.locator('svg.chart g[tabindex="0"]').first().hover();
  ok('dica ao passar o mouse', await visible(page.locator('.ch-tip')));

  // ---------- Exercícios e Pomodoro ----------
  await page.goto(BASE + '/exercicios');
  ok('fortalecimento para corrida listado', /Ponte de glúteo: 2 x 12[\s\S]*Agachamento livre: 2 x 10[\s\S]*Elevação de panturrilha: 2 x 15[\s\S]*Bird dog: 2 x 8 por lado/.test(await page.locator('.runstrength').innerText()));
  await page.goto(BASE + '/pomodoro');
  ok('pomodoro com modelo de pausas no trabalho', await visible(page.getByRole('button', { name: /Pausas no trabalho/ })));

  // ---------- celular: sem rolagem lateral ----------
  for (const p of ['/', '/semana', '/progresso']) {
    await page.goto(BASE + p);
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    if (w > 390) ok(`sem overflow em ${p}`, false, `${w}px`);
  }
  ok('sem overflow horizontal em 390 px', true);

  // ---------- dados antigos (v1.4) ----------
  const c2 = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const p2 = await c2.newPage();
  p2.on('pageerror', (e) => errors.push(String(e)));
  await p2.clock.install({ time: new Date('2026-11-24T10:00:00') });
  await p2.goto(BASE + '/');
  const legacy = {
    week: 3, done: { '2026-11-20': { 'aquec:0': true, 'aquec:1': true } }, notes: { '2026-11-20': { 'treino:0': '12 reps' } },
    totals: { '2026-11-20': 10 }, examDone: false, overrides: { 2: [{ id: 'aquec', title: 'Antigo', items: [] }] }, custom: {}, seenHelp: true,
    intervals: { warm: 0, cool: 0, reps: 2, work: { label: 'Velho', seconds: 60 }, easy: { label: 'Pausa', seconds: 30 } }, prefs: { sound: false, voice: true, vibrate: true },
  };
  await p2.evaluate((d) => localStorage.setItem('treino-app:v1', JSON.stringify(d)), legacy);
  await p2.reload();
  ok('dados antigos: app abre normalmente', /Hoje/.test(await p2.locator('h1').innerText()));
  await p2.locator('button.check').first().click();
  const after = await p2.evaluate(() => JSON.parse(localStorage.getItem('treino-app:v1')));
  ok('dados antigos preservados após salvar', after.week === 3 && after.done['2026-11-20']['aquec:0'] === true && after.notes['2026-11-20']['treino:0'] === '12 reps' && !!after.overrides['2'] && after.prefs.sound === false);
  ok('pomodoro antigo completado (pausa longa)', after.intervals.work.label === 'Velho' && after.intervals.long && after.intervals.long.seconds > 0);
  ok('campos novos criados', !!after.run && typeof after.runLogs === 'object');
  await p2.goto(BASE + '/progresso');
  ok('progresso com dado antigo', (await p2.locator('.heat .cell').count()) === 28);
  await c2.close();

  const real = errors.filter((e) => !/youtube|ytimg|Failed to load resource|net::/i.test(e));
  ok('sem erros de console', real.length === 0, real.slice(0, 3).join(' | '));
  const fails = results.filter((r) => r.startsWith('FALHA')).length;
  console.log(results.join('\n'));
  console.log(`\n${results.length - fails} OK, ${fails} falhas`);
  process.exitCode = fails ? 1 : 0;
  await browser.close();
})().catch((e) => { console.log(results.join('\n')); console.error('ERRO', e.message); process.exit(1); });
