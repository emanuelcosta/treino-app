// Teste E2E (Playwright + Chrome instalado). Rode com o app em produção local: npm run build && npm start -- -p 3100
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://localhost:3100';
const results = [];
const ok = (name, cond, extra = '') => results.push(`${cond ? 'OK  ' : 'FALHA'} ${name}${extra ? ' — ' + extra : ''}`);

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(BASE + '/');
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller !== null, null, { timeout: 15000 })
    .catch(() => page.reload().then(() => page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15000 })));
  ok('service worker controla a página', await page.evaluate(() => !!navigator.serviceWorker.controller));

  // espera o pré-cache das páginas de exercício
  let n = 0;
  for (let i = 0; i < 30; i++) {
    n = await page.evaluate(async () => (await (await caches.open((await caches.keys()).find((k) => k.startsWith('treino-pages-')) || 'x')).keys()).length);
    if (n >= 38) break;
    await page.waitForTimeout(1000);
  }
  const stat = await page.evaluate(async () => (await (await caches.open((await caches.keys()).find((k) => k.startsWith('treino-static-')) || 'x')).keys()).length);
  ok('páginas no cache', n >= 38, `${n} páginas, ${stat} arquivos estáticos`);

  // marca um item online
  if (await page.getByRole('button', { name: 'Entendi' }).count()) await page.getByRole('button', { name: 'Entendi' }).click();
  const firstCheck = page.locator('button.check').first();
  await firstCheck.click();
  ok('marcou item online', (await firstCheck.getAttribute('aria-pressed')) === 'true');

  // ---- sem internet ----
  await ctx.setOffline(true);
  await page.reload();
  ok('Hoje abre offline', await page.locator('h1').first().isVisible(), await page.locator('h1').first().innerText());
  ok('aviso de sem internet aparece', await page.locator('.offline').isVisible());
  ok('marcação persiste offline', (await page.locator('button.check').first().getAttribute('aria-pressed')) === 'true');
  await page.locator('button.check').nth(1).click();
  ok('marca item offline', (await page.locator('button.check').nth(1).getAttribute('aria-pressed')) === 'true');

  // navegação interna (links da barra)
  for (const [label, path] of [['Semana', '/semana'], ['Exercícios', '/exercicios'], ['Progresso', '/progresso']]) {
    await page.getByRole('navigation').getByRole('link', { name: label }).click();
    await page.waitForURL(BASE + path, { timeout: 10000 }).catch(() => {});
    await page.waitForLoadState('load');
    ok(`navega offline para ${path}`, page.url() === BASE + path && await page.locator('h1').first().isVisible().catch(() => false));
  }
  // página de exercício nunca visitada (veio do pré-cache)
  await page.goto(BASE + '/exercicios/ponte-gluteo').catch(() => {});
  const h1 = await page.locator('h1').first().innerText().catch(() => '');
  ok('exercício abre offline (pré-cache)', /ponte/i.test(h1), h1);
  await page.goto(BASE + '/ajuda').catch(() => {});
  ok('/ajuda offline com dica de uso sem internet', await page.getByText('Use sem internet').isVisible().catch(() => false));

  // volta a internet
  await ctx.setOffline(false);
  await page.goto(BASE + '/');
  ok('aviso some com internet', !(await page.locator('.offline').isVisible()));
  ok('2 itens marcados após voltar', (await page.locator('button.check[aria-pressed="true"]').count()) >= 2);

  const real = errors.filter((e) => !/youtube|ytimg|ERR_INTERNET_DISCONNECTED|Failed to load resource|Failed to fetch RSC|net::/i.test(e));
  ok('sem erros de console inesperados', real.length === 0, real.slice(0, 3).join(' | '));
  console.log(results.join('\n'));
  console.log('erros brutos:', errors.length);
  const fails = results.filter((r) => r.startsWith('FALHA')).length;
  console.log(`\n${results.length - fails} OK, ${fails} falhas`);
  process.exitCode = fails ? 1 : 0;
  await browser.close();
})().catch((e) => { console.log(results.join('\n')); console.error('ERRO', e); process.exit(1); });

