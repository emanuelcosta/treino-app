// Roda todos os testes E2E em sequência. Antes: npm run build && npm start -- -p 3100
// Usa o Chrome instalado (playwright-core, sem baixar navegador). BASE muda o endereço testado.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const suites = ['func.test.cjs', 'timer.test.cjs', 'plan.test.cjs', 'strava.test.cjs', 'offline.test.cjs'];
let failed = 0;
for (const s of suites) {
  console.log(`\n=== ${s} ===`);
  const r = spawnSync(process.execPath, [path.join(__dirname, s)], { stdio: 'inherit', env: process.env });
  if (r.status !== 0) failed++;
}
console.log(failed ? `\n${failed} suíte(s) com falha` : '\nTodas as suítes passaram');
process.exitCode = failed ? 1 : 0;
