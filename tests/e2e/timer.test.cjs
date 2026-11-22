// Teste E2E (Playwright + Chrome instalado). Rode com o app em produção local: npm run build && npm start -- -p 3100
// Testa cronômetro dos exercícios e intervalos com relógio controlado (sem esperar de verdade).
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://localhost:3100';
const results = [];
const ok = (name, cond, extra = '') => results.push(`${cond ? 'OK  ' : 'FALHA'} ${name}${extra ? ' — ' + extra : ''}`);
const store = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('treino-app:v1') || '{}'));

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('dialog', (d) => d.accept());
  await page.clock.install({ time: new Date('2026-11-24T08:00:00') }); // terça
  const DATE = '2026-11-24';
  const run = (ms) => page.clock.runFor(ms);

  await page.goto(BASE + '/');
  await page.getByRole('button', { name: 'Entendi' }).click();

  // botões de cronômetro nos itens com tempo
  ok('botão cronômetro na prancha', await page.getByRole('button', { name: 'Cronômetro de Prancha: 30 s' }).isVisible());
  ok('botão cronômetro com lados', await page.getByRole('button', { name: /Cronômetro de Alongamento de peitoral: 30 s cada lado/ }).isVisible());
  ok('sem cronômetro em exercício de repetições', !(await page.getByRole('button', { name: /Cronômetro de Agachamento/ }).count()));

  // ---- prancha: 3 séries de 30 s, 10 s de descanso ----
  await page.getByRole('button', { name: 'Cronômetro de Prancha: 30 s' }).click();
  const dlg = page.getByRole('dialog', { name: 'Cronômetro: Prancha' });
  const label = () => dlg.locator('.st-label').innerText();
  const clk = () => dlg.locator('.st-clock').innerText();
  ok('abre em "Prepare-se" 0:05', (await label()) === 'Prepare-se' && (await clk()) === '0:05');
  await dlg.getByRole('button', { name: 'Iniciar' }).click();
  await run(5100);
  ok('após 5 s: série 1 de 3 com 0:30', (await label()) === 'Série 1 de 3' && (await clk()) === '0:30', `${await label()} ${await clk()}`);
  await run(15000);
  ok('conta certo: 0:15 depois de 15 s', (await clk()) === '0:15', await clk());
  await dlg.getByRole('button', { name: 'Mais 5 segundos' }).click();
  ok('+5 s soma no tempo', (await clk()) === '0:20', await clk());
  await run(20000);
  ok('descanso de 10 s entre séries', (await label()) === 'Descanso' && (await clk()) === '0:10', `${await label()} ${await clk()}`);
  await dlg.getByRole('button', { name: 'Pausar' }).click();
  await run(8000);
  ok('pausa congela o tempo', (await clk()) === '0:10', await clk());
  await dlg.getByRole('button', { name: 'Continuar' }).click();
  await run(10100);
  ok('série 2 de 3 começa sozinha', (await label()) === 'Série 2 de 3', await label());
  await dlg.getByRole('button', { name: 'Pular etapa' }).click();
  ok('pular etapa vai para descanso', (await label()) === 'Descanso');
  await run(10100 + 30100);
  ok('termina sozinho', (await dlg.locator('.st-clock').innerText()) === '✓' && (await label()) === 'Concluído');
  await dlg.getByRole('button', { name: 'Fechar' }).click();
  let s = await store(page);
  ok('prancha marcada como feita ao terminar', !!(s.done[DATE] || {})['noite:0']);

  // ---- alongamento de peitoral: cada lado ----
  await page.getByRole('button', { name: /Cronômetro de Alongamento de peitoral/ }).click();
  const d2 = page.getByRole('dialog', { name: 'Cronômetro: Alongamento de peitoral' });
  await d2.getByRole('button', { name: 'Iniciar' }).click();
  await run(5100);
  ok('lado direito 0:30', (await d2.locator('.st-label').innerText()) === 'Lado direito' && (await d2.locator('.st-clock').innerText()) === '0:30');
  await run(30100);
  ok('troque de lado (5 s)', (await d2.locator('.st-label').innerText()) === 'Troque de lado' && (await d2.locator('.st-clock').innerText()) === '0:05');
  await run(5100);
  ok('lado esquerdo', (await d2.locator('.st-label').innerText()) === 'Lado esquerdo');
  await run(30100);
  ok('alongamento concluído', (await d2.locator('.st-label').innerText()) === 'Concluído');
  await d2.getByRole('button', { name: 'Fechar' }).click();

  // ---- editar segundos ----
  await page.getByRole('button', { name: 'Editar treino' }).click();
  await page.getByLabel('Segundos do cronômetro de Recuo de queixo').fill('15');
  await page.getByRole('button', { name: 'Concluir edição' }).click();
  ok('editar: cronômetro de 15 s no recuo de queixo', await page.getByRole('button', { name: 'Cronômetro de Recuo de queixo: 15 s' }).isVisible());
  await page.getByRole('button', { name: 'Restaurar padrão' }).click();

  // ---- guiado com cronômetro ----
  await page.getByRole('button', { name: 'Iniciar treino guiado' }).click();
  const g = page.getByRole('dialog', { name: 'Treino guiado' });
  for (let k = 0; k < 60 && !(/Alongamento do flexor/.test(await g.locator('h1').innerText())); k++) await g.getByRole('button', { name: 'Pular', exact: true }).click();
  ok('guiado mostra cronômetro no alongamento', await g.locator('.seqtimer').isVisible());
  await g.locator('.seqtimer').getByRole('button', { name: 'Iniciar' }).click();
  await run(5100 + 30100 + 5100 + 30100 + 300);
  const h1 = await g.locator('h1').innerText();
  ok('guiado avança sozinho ao terminar o tempo', !/Alongamento do flexor/.test(h1), h1);
  await g.getByRole('button', { name: 'Sair' }).click();
  s = await store(page);
  ok('guiado marcou o alongamento', Object.entries(s.done[DATE] || {}).length >= 3);

  // ---- link de intervalos só em dia de corrida ----
  ok('terça (corrida) com botão de pomodoro', await page.getByRole('link', { name: /Abrir pomodoro/ }).isVisible());
  await page.getByRole('tab', { name: /^Segunda/ }).click();
  ok('segunda (força) sem botão de pomodoro', !(await page.getByRole('link', { name: /Abrir pomodoro/ }).count()));

  // ---- intervalos ----
  await page.getByRole('navigation').getByRole('link', { name: 'Pomodoro' }).click();
  await page.waitForURL(BASE + '/pomodoro');
  ok('aba Pomodoro abre', /Pomodoro/.test(await page.locator('h1').innerText()));
  ok('aviso dos exames', await page.getByText('Sem esforço máximo até fazer os exames').isVisible());
  ok('padrão: 5 min corrida, pausa curta 1:30, longa 3:00', (await page.getByLabel('Bloco principal (ex.: correr): minutos').inputValue()) === '5'
    && (await page.getByLabel('Pausa curta: minutos').inputValue()) === '1' && (await page.getByLabel('Pausa curta: segundos').inputValue()) === '30'
    && (await page.getByLabel('Pausa longa: minutos').inputValue()) === '3' && (await page.getByLabel('Pausa longa a cada quantos blocos').inputValue()) === '4');
  ok('padrão: 6 blocos = 39 min', await page.getByText('Total: 39 min').isVisible());
  const plan = await page.locator('ol.ivplan li').allInnerTexts();
  ok('pausa longa depois do 4º bloco', /Pausa longa/.test(plan[7]) && /3:00/.test(plan[7]) && /Pausa curta/.test(plan[1]) && /1:30/.test(plan[1]), plan[7]);
  ok('sem pausa depois do último bloco', /Corrida leve/.test(plan[plan.length - 1]));
  await page.getByLabel('Pausa curta: segundos').fill('0');
  ok('mudar pausa curta para 1:00 = 37 min', await page.getByText('Total: 37 min').isVisible());
  await page.getByLabel('Pausa longa a cada quantos blocos').fill('0');
  ok('sem pausa longa = 35 min', await page.getByText('Total: 35 min').isVisible());
  await page.getByRole('button', { name: /Pomodoro padrão/ }).click();
  await page.getByRole('button', { name: 'Iniciar pomodoro' }).click();
  const pd = page.getByRole('dialog', { name: 'Pomodoro em andamento' });
  await pd.getByRole('button', { name: 'Iniciar' }).click();
  await run(5100);
  ok('pomodoro: corrida 5:00, bloco 1 de 6', (await pd.locator('.st-label').innerText()) === 'Corrida leve' && (await pd.locator('.st-clock').innerText()) === '5:00' && (await pd.locator('.st-info').innerText()) === 'Bloco 1 de 6');
  await run(300100);
  ok('pomodoro: pausa curta 1:30', (await pd.locator('.st-label').innerText()) === 'Pausa curta: caminhada' && (await pd.locator('.st-clock').innerText()) === '1:30');
  for (let k = 0; k < 6; k++) await pd.getByRole('button', { name: 'Pular etapa' }).click();
  ok('pomodoro: pausa longa 3:00 depois do 4º bloco', (await pd.locator('.st-label').innerText()) === 'Pausa longa: caminhada' && (await pd.locator('.st-clock').innerText()) === '3:00', await pd.locator('.st-label').innerText());
  await pd.getByRole('button', { name: 'Encerrar' }).click();
  await page.getByRole('button', { name: /Caminhada com ritmo/ }).click();
  ok('modelo caminhada com ritmo = 29 min', await page.getByText('Total: 29 min').isVisible());
  await page.getByLabel('Quantos blocos de esforço').fill('2');
  ok('2 repetições = 11 min', await page.getByText('Total: 11 min').isVisible());
  await page.getByLabel('Bloco principal (ex.: correr): segundos').fill('30');
  ok('bloco 1 com 2 min 30 s = 12 min', await page.getByText('Total: 12 min').isVisible());
  await page.getByRole('button', { name: 'Iniciar pomodoro' }).click();
  const iv = page.getByRole('dialog', { name: 'Pomodoro em andamento' });
  await iv.getByRole('button', { name: 'Iniciar' }).click();
  await run(5100);
  ok('aquecimento 3:00', (await iv.locator('.st-label').innerText()) === 'Aquecimento: caminhada' && (await iv.locator('.st-clock').innerText()) === '3:00');
  await run(180100);
  ok('bloco 1 (caminhada rápida 2:30, bloco 1 de 2)', (await iv.locator('.st-label').innerText()) === 'Caminhada rápida' && (await iv.locator('.st-clock').innerText()) === '2:30' && (await iv.locator('.st-info').innerText()) === 'Bloco 1 de 2');
  ok('cor do bloco forte', (await iv.locator('.seqtimer').getAttribute('class')).includes('k-work'));
  await run(150100);
  ok('troca para caminhada leve 1:00', (await iv.locator('.st-label').innerText()) === 'Caminhada leve' && (await iv.locator('.st-clock').innerText()) === '1:00');
  ok('mostra total restante', /Falta/.test(await iv.locator('.st-next').innerText()));
  s = await store(page);
  ok('configuração salva', s.intervals && s.intervals.reps === 2 && s.intervals.work.seconds === 150);
  await iv.locator('.st-prefs').getByLabel('Voz').uncheck();
  s = await store(page);
  ok('desligar voz salva preferência', s.prefs && s.prefs.voice === false);
  await iv.getByRole('button', { name: 'Encerrar' }).click();
  ok('encerrar fecha', !(await iv.count()));

  const w = await page.evaluate(() => document.documentElement.scrollWidth);
  ok('sem overflow em 390 px (pomodoro)', w <= 390, `${w}px`);
  const real = errors.filter((e) => !/youtube|ytimg|Failed to load resource|net::/i.test(e));
  ok('sem erros de console', real.length === 0, real.slice(0, 3).join(' | '));
  const fails = results.filter((r) => r.startsWith('FALHA')).length;
  console.log(results.join('\n'));
  console.log(`\n${results.length - fails} OK, ${fails} falhas`);
  process.exitCode = fails ? 1 : 0;
  await browser.close();
})().catch((e) => { console.log(results.join('\n')); console.error('ERRO', e.message); process.exit(1); });
