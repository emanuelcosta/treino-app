// Teste E2E (Playwright + Chrome instalado). Rode com o app em produção local: npm run build && npm start -- -p 3100
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
  // segunda-feira 23/11/2026: Calistenia A (força, com anotação e descanso)
  await page.clock.setFixedTime(new Date('2026-11-23T08:00:00'));
  const DATE = '2026-11-23';

  await page.goto(BASE + '/');
  // plano começando nesta semana, calistenia A/B nos dias de força (segunda e sexta)
  await page.evaluate(() => localStorage.setItem('treino-app:v1', JSON.stringify({ done: {}, run: { startDate: '2026-11-23', confirmed: true, strengthPref: 'calistenia' } })));
  await page.reload();
  ok('Hoje = Calistenia A', /Calistenia A/.test(await page.locator('h1').innerText()));
  ok('boas-vindas aparece', await page.getByText('Bem-vindo! Como funciona').isVisible());
  await page.getByRole('button', { name: 'Entendi' }).click();
  ok('boas-vindas some e grava', !(await page.getByText('Bem-vindo! Como funciona').isVisible()) && (await store(page)).seenHelp === true);
  ok('semana 1 = 3 rodadas', await page.getByRole('heading', { name: 'Treino: 3 rodadas' }).isVisible());
  ok('séries no item (circuito)', await page.getByText('3 séries de 12 a 15 repetições').first().isVisible());
  ok('séries no aquecimento', await page.getByText('1 série de 10 de cada movimento').first().isVisible());
  ok('prancha 3 séries + observação', await page.getByText('3 séries de 30 s').first().isVisible() && await page.getByText('10 s de descanso entre as séries').first().isVisible());

  // checklist
  const total = await page.locator('button.check').count();
  await page.locator('button.check').first().click();
  ok('marcar item', (await page.locator('button.check').first().getAttribute('aria-pressed')) === 'true');
  ok('progresso 1 de N', await page.getByText(`1 de ${total} exercícios ·`).isVisible(), `${total} itens`);
  await page.locator('button.check').first().click();
  ok('desmarcar item', (await page.locator('button.check').first().getAttribute('aria-pressed')) === 'false');
  await page.getByLabel('Anotação: Agachamento livre').first().fill('15 reps');
  let s = await store(page);
  ok('anotação gravada', Object.values(s.notes[DATE] || {}).includes('15 reps'));

  // marcar dia
  await page.getByRole('button', { name: 'Marcar dia como feito' }).click();
  ok('dia concluído', await page.getByText('Exercícios do dia concluídos ✓').isVisible());
  s = await store(page);
  ok('resumo do dia = itens que contam', s.dayStats[DATE].total === total && s.dayStats[DATE].done === total);
  await page.getByRole('button', { name: 'Desmarcar dia' }).click();
  ok('desmarcar dia', await page.getByText(`0 de ${total} exercícios ·`).isVisible());

  // persistência
  await page.locator('button.check').nth(2).click();
  await page.reload();
  ok('persiste após recarregar', (await page.locator('button.check').nth(2).getAttribute('aria-pressed')) === 'true');

  // semana 4
  const setRun = (run) => page.evaluate((r) => { const s = JSON.parse(localStorage.getItem('treino-app:v1')); s.run = { ...s.run, ...r }; localStorage.setItem('treino-app:v1', JSON.stringify(s)); }, run);
  await setRun({ startDate: '2026-11-02', decisions: { 1: 'next', 2: 'next', 3: 'next' } });
  await page.reload();
  ok('semana 4 = 2 rodadas', await page.getByRole('heading', { name: 'Treino: 2 rodadas' }).isVisible());
  ok('semana 4 = 2 séries no circuito', await page.getByText('2 séries de 12 a 15 repetições').first().isVisible());
  ok('semana 4 aparece como descarga', await page.getByText('semana 4 de 8 (descarga)').isVisible());
  await setRun({ startDate: '2026-11-23', decisions: {} });
  await page.reload();

  // edição
  await page.getByRole('button', { name: 'Editar treino' }).click();
  await page.getByLabel('Número de séries de Step-up (subida em degrau)').fill('4');
  await page.getByLabel('Quantidade por série de Step-up (subida em degrau)').fill('5 por perna');
  await page.getByRole('button', { name: 'Subir Step-up (subida em degrau)' }).click();
  await page.getByRole('button', { name: 'Remover Dead bug' }).click();
  const treino = page.locator('section.card', { has: page.getByRole('heading', { name: /Treino:/ }) });
  await treino.getByRole('button', { name: '+ Adicionar exercício' }).click();
  await page.getByRole('dialog').getByPlaceholder('Buscar exercício').fill('bird');
  await page.getByRole('dialog').getByRole('button', { name: /Bird dog/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Adicionar', exact: true }).click();
  await page.getByRole('button', { name: 'Concluir edição' }).click();
  const names = await treino.locator('.itemtitle').allInnerTexts();
  ok('edição: séries e quantidade alteradas', await treino.getByText('4 séries de 5 por perna').isVisible());
  ok('picker: bird dog com 3 séries de 10', (await treino.locator('.item').last().innerText()).includes('3 séries de 10 repetições'));
  ok('edição: subiu step-up', names[0].startsWith('Step-up'), names.slice(0, 2).join(', '));
  ok('edição: removeu dead bug', !names.some((n) => n.startsWith('Dead bug')));
  ok('edição: adicionou bird dog', names[names.length - 1].startsWith('Bird dog'));
  ok('aviso de treino personalizado', await page.getByText('Treino personalizado por você.').isVisible());

  // criar exercício próprio + item livre
  await page.getByRole('button', { name: 'Editar treino' }).click();
  await treino.getByRole('button', { name: '+ Adicionar exercício' }).click();
  await page.getByRole('dialog').getByRole('tab', { name: 'Item livre' }).click();
  await page.getByRole('dialog').getByPlaceholder('Ex.: Caminhada leve').fill('Pular corda');
  await page.getByRole('dialog').getByPlaceholder('Ex.: 30 min').fill('2 min');
  await page.getByRole('dialog').getByRole('button', { name: 'Adicionar' }).click();
  await page.getByRole('button', { name: 'Concluir edição' }).click();
  ok('item livre adicionado', await treino.getByText('Pular corda').isVisible());

  // restaurar
  await page.getByRole('button', { name: 'Restaurar padrão' }).click();
  const names2 = await treino.locator('.itemtitle').allInnerTexts();
  ok('restaurar padrão', names2[0].startsWith('Agachamento') && !(await page.getByText('Treino personalizado por você.').isVisible()));

  // outro dia = prévia
  await page.getByRole('tab', { name: /^Domingo/ }).click();
  ok('prévia de domingo (longão 6 km)', /Longão/.test(await page.locator('h1').innerText()) && await page.getByText('Prévia de domingo').isVisible() && await page.getByText('Longão: 6 km').first().isVisible());
  ok('prévia: check desabilitado', await page.locator('button.check').first().isDisabled());
  ok('aviso dos exames na corrida', await page.getByText('Antes de aumentar a carga').isVisible());
  await page.getByRole('tab', { name: /^Segunda/ }).click();

  // treino guiado
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('treino-app:v1')); s.done = {}; localStorage.setItem('treino-app:v1', JSON.stringify(s)); });
  await page.reload();
  await page.getByRole('button', { name: 'Iniciar treino guiado' }).click();
  const dlg = page.getByRole('dialog', { name: 'Treino guiado' });
  ok('guiado abre', await dlg.getByText(/^Passo 1 de \d+$/).isVisible());
  await dlg.getByRole('button', { name: 'Concluir' }).click(); // aquecimento 1 (sem descanso)
  await dlg.getByRole('button', { name: 'Pular', exact: true }).click();
  await dlg.getByRole('button', { name: 'Pular', exact: true }).click(); // agora no 1º exercício do treino
  ok('guiado: rodada 1 de 3', await dlg.getByText('Rodada 1 de 3').isVisible());
  ok('guiado: mostra séries e quantidade', (await dlg.locator('.series').innerText()).includes('1 de 3') && (await dlg.locator('.series').innerText()).includes('12 a 15 repetições'));
  await dlg.getByRole('button', { name: 'Concluir série 1' }).click();
  ok('descanso de 45 s entre exercícios (cronômetro novo)', (await dlg.locator('.st-label').innerText()) === 'Descanse e respire' && (await dlg.locator('.st-clock').innerText()) === '0:45');
  await dlg.getByRole('button', { name: 'Pular descanso' }).click();
  for (let k = 0; k < 6; k++) { await dlg.getByRole('button', { name: 'Concluir série 1' }).click(); await dlg.getByRole('button', { name: 'Pular descanso' }).click(); }
  ok('rodada 2 começa no agachamento', await dlg.getByText('Rodada 2 de 3').isVisible() && /Agachamento/.test(await dlg.locator('h1').innerText()));
  s = await store(page);
  ok('circuito só marca o item na última rodada', Object.keys(s.done[DATE] || {}).length === 1);
  await dlg.getByRole('button', { name: 'Sair' }).click();

  // marcha alta (fora do circuito, sem cronômetro): contador de séries
  await page.getByRole('tab', { name: /^Terça/ }).click();
  await page.getByRole('button', { name: 'Ver passo a passo' }).click();
  for (let k = 0; k < 40 && !(/Marcha alta/.test(await dlg.locator('h1').innerText())); k++) await dlg.getByRole('button', { name: 'Pular', exact: true }).click();
  ok('guiado: marcha alta série 1 de 2', await dlg.getByRole('button', { name: 'Concluir série 1' }).isVisible() && (await dlg.locator('.series').innerText()).includes('1 de 2'));
  await dlg.getByRole('button', { name: 'Concluir série 1' }).click();
  ok('vai para a série 2', await dlg.getByRole('button', { name: 'Concluir última série' }).isVisible());
  // prancha (com cronômetro): o guiado mostra o cronômetro em vez do contador
  for (let k = 0; k < 40 && !(/^Prancha$/.test(await dlg.locator('h1').innerText())); k++) await dlg.getByRole('button', { name: 'Pular', exact: true }).click();
  ok('guiado: prancha usa cronômetro', await dlg.locator('.seqtimer').isVisible() && (await dlg.locator('.seqtimer .st-label').innerText()) === 'Prepare-se');
  await dlg.getByRole('button', { name: 'Sair' }).click();

  // biblioteca: criar e apagar exercício próprio
  await page.goto(BASE + '/exercicios');
  await page.getByRole('button', { name: '+ Criar exercício' }).click();
  const form = page.locator('section.card form, section.card .form').first();
  const inputs = form.locator('input, textarea');
  await inputs.first().fill('Polichinelo teste');
  await form.locator('button[type="submit"], button.primary').first().click();
  ok('exercício próprio criado', await page.getByText('Polichinelo teste').isVisible());
  await page.locator('.lib li', { hasText: 'Polichinelo teste' }).getByRole('button', { name: 'Apagar' }).click();
  ok('exercício próprio apagado', !(await page.getByText('Polichinelo teste').isVisible()));

  await page.goto(BASE + '/exercicios/agachamento');
  ok('página do exercício', /Agachamento/.test(await page.locator('h1').innerText()));
  ok('ilustração passo a passo (3 quadros)', (await page.locator('ol.ill > li').count()) === 3 && await page.locator('ol.ill svg[role=img]').first().isVisible());
  ok('ilustração tem legenda numerada', (await page.locator('ol.ill li p').first().innerText()).startsWith('1'));
  await page.goto(BASE + '/exercicios/y-t-w');
  ok('Y-T-W com 3 quadros', (await page.locator('ol.ill > li').count()) === 3);

  // semana
  await page.goto(BASE + '/semana');
  ok('semana: plano de 8 semanas', await page.getByRole('heading', { name: 'Plano de 10 km em 8 semanas' }).isVisible() && await page.getByText('Semana 1 de 8').first().isVisible());

  // progresso + backup inválido
  await page.goto(BASE + '/progresso');
  ok('progresso: mapa', await page.locator('.heat .cell').count() === 28);
  await page.setInputFiles('input[type=file]', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('[1,2]') });
  ok('backup inválido recusado', await page.getByText('Arquivo inválido').waitFor({ timeout: 5000 }).then(() => true, () => false));
  const good = { ...(await store(page)), week: 3 };
  await page.setInputFiles('input[type=file]', { name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(good)) });
  ok('backup válido importado', await page.getByText('Backup importado.').waitFor({ timeout: 5000 }).then(() => true, () => false) && (await store(page)).week === 3);

  // overflow
  for (const p of ['/', '/semana', '/pomodoro', '/exercicios', '/progresso', '/ajuda']) {
    await page.goto(BASE + p);
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    if (w > 390) ok(`sem overflow em ${p}`, false, `${w}px`);
  }
  ok('sem overflow horizontal em 390 px', true);

  const real = errors.filter((e) => !/youtube|ytimg|Failed to load resource|net::/i.test(e));
  ok('sem erros de console', real.length === 0, real.slice(0, 3).join(' | '));
  const fails = results.filter((r) => r.startsWith('FALHA')).length;
  console.log(results.join('\n'));
  console.log(`\n${results.length - fails} OK, ${fails} falhas`);
  process.exitCode = fails ? 1 : 0;
  await browser.close();
})().catch((e) => { console.log(results.join('\n')); console.error('ERRO', e.message); process.exit(1); });
