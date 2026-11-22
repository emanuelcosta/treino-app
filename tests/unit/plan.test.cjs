// Testes das regras do plano de 10 km (lib/domain). Rodar: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const B = '../../.test-build/lib';
const data = require(`${B}/data.js`);
const rp = require(`${B}/domain/runPlan.js`);
const st = require(`${B}/domain/store.js`);
const day = require(`${B}/domain/day.js`);
const prog = require(`${B}/domain/progress.js`);
const dates = require(`${B}/domain/dates.js`);

const START = '2026-11-23'; // segunda
const settings = (patch = {}) => ({ ...rp.defaultRunSettings(new Date(2026, 10, 23)), startDate: START, ...patch });
const ctx = (s, logs = {}, today = START) => ({ s, logs, today });
const byslot = (ws) => Object.fromEntries(ws.map((w) => [w.slot, w]));

// 1. Geração das oito semanas
test('gera as 8 semanas do plano com as distâncias da tabela', () => {
  const s = settings();
  const expected = [
    [4, 4, 6], [4, 4.5, 7], [4.5, 5, 7], [4, 4, 6], [5, 5, 8], [5, 5, 8.5], [4, 5, 9], [3, 3, 10],
  ];
  assert.equal(data.PLAN_WEEKS.length, 8);
  for (let c = 0; c < 8; c++) {
    const ws = byslot(rp.workoutsOfWeek(ctx(s), c));
    assert.equal(ws.easy.planWeek, c + 1);
    assert.deepEqual([ws.easy.plannedKm, ws.tempo.plannedKm, ws.long.plannedKm], expected[c], `semana ${c + 1}`);
    assert.equal(ws.regen.optional, true);
  }
  assert.deepEqual(rp.workoutsOfWeek(ctx(s), 8), [], 'depois da semana 8 não há treinos');
  assert.equal(data.tempoTitle(data.PLAN_WEEKS[0].tempo), '4 km leve + 4 acelerações de 20 s');
  assert.equal(data.tempoTitle(data.PLAN_WEEKS[1].tempo), '4,5 km com 3 × 2 min moderados');
  assert.equal(data.tempoTitle(data.PLAN_WEEKS[7].tempo), '3 km muito leve');
});

test('dias padrão: segunda leve, quarta variação, sexta longão, domingo trote leve; força terça e quinta; sábado livre', () => {
  const s = settings();
  const ws = byslot(rp.workoutsOfWeek(ctx(s), 0));
  assert.equal(ws.easy.scheduled, '2026-11-23');
  assert.equal(ws.tempo.scheduled, '2026-11-25');
  assert.equal(ws.long.scheduled, '2026-11-27');
  assert.equal(ws.regen.scheduled, '2026-11-29');
  assert.equal(rp.roleOf(s, 2), 'strength1');
  assert.equal(rp.roleOf(s, 4), 'strength2');
  assert.equal(rp.roleOf(s, 6), 'rest');
  assert.deepEqual(rp.validateSettings(s), []);
});

test('dias configuráveis: trocar os dias não muda a carga e dias repetidos são recusados', () => {
  const s = settings({ days: { easy: 3, tempo: 5, long: 6, regen: 0, strength: [1, 2] } });
  const plannedA = rp.weekSummary(ctx(settings()), 0).plannedKm;
  const plannedB = rp.weekSummary(ctx(s), 0).plannedKm;
  assert.equal(plannedA, 14);
  assert.equal(plannedB, 14);
  assert.equal(byslot(rp.workoutsOfWeek(ctx(s), 0)).easy.scheduled, '2026-11-25');
  const bad = settings({ days: { easy: 2, tempo: 2, long: 0, regen: 6, strength: [1, 5] } });
  assert.ok(rp.validateSettings(bad).length > 0);
});

// 2. Quilometragem (só o registrado)
test('quilometragem: conta só treinos concluídos com distância registrada', () => {
  const s = settings();
  const ws = byslot(rp.workoutsOfWeek(ctx(s), 0));
  let logs = {};
  logs = rp.upsertLog(logs, ws.easy, { status: 'concluido', km: 4.2, seconds: 1590 });
  logs = rp.upsertLog(logs, ws.tempo, { status: 'nao_realizado' });
  logs = rp.upsertLog(logs, ws.regen, { status: 'concluido', km: 3 });
  const sum = rp.weekSummary(ctx(s, logs, '2026-11-27'), 0);
  assert.equal(sum.plannedKm, 14, 'regenerativo não entra no planejado');
  assert.equal(sum.doneKm, 4.2, 'regenerativo e não realizado não entram no realizado');
  assert.equal(sum.runsDone, 1);
  assert.equal(sum.runsMissed, 1);
  assert.equal(sum.longDone, null);
  const t = rp.totals(ctx(s, logs, '2026-11-27'));
  assert.equal(t.km, 4.2);
  assert.equal(t.longest, 4.2);
  assert.equal(Math.round(t.goalProgress * 100), 42);
});

// 3. Ritmo
test('ritmo e conversões de tempo/distância', () => {
  assert.equal(rp.parseDuration('26:30'), 1590);
  assert.equal(rp.parseDuration('1:05:20'), 3920);
  assert.equal(rp.parseDuration('26'), 1560);
  assert.equal(rp.parseDuration('26:75'), null);
  assert.equal(rp.parseDuration(''), null);
  assert.equal(rp.parseDuration('abc'), null);
  assert.equal(rp.parseKm('4,2'), 4.2);
  assert.equal(rp.parseKm('4.25'), 4.25);
  assert.equal(rp.parseKm('0'), null);
  assert.equal(rp.parseKm(''), null);
  assert.equal(rp.formatDuration(3920), '1:05:20');
  assert.equal(rp.formatDuration(1590), '26:30');
  assert.equal(rp.paceLabel(rp.paceOf(4.2, 1590)), '6:19 min/km');
  assert.equal(rp.paceLabel(rp.paceOf(5, 1500)), '5:00 min/km');
  assert.equal(rp.paceOf(4, undefined), null);
  assert.equal(rp.paceLabel(null), '—');
});

// 4. Conclusão e validação do registro
test('registro: guarda concluído com dados válidos e descarta inválidos', () => {
  const s = settings();
  const w = rp.workoutsOfWeek(ctx(s), 0)[0];
  const logs = rp.upsertLog({}, w, { status: 'concluido', km: 4, seconds: 1500, rpe: 11, notes: 'ok' });
  const l = logs[w.id];
  assert.equal(l.status, 'concluido');
  assert.equal(l.km, 4);
  assert.equal(l.rpe, undefined, 'esforço fora de 1-10 é descartado');
  assert.equal(l.planId, 'plano-10k');
  assert.equal(l.planWeek, 1);
  assert.equal(l.scheduled, w.scheduled);
});

// 5. Persistência
test('persistência: o store sobrevive a salvar e carregar (JSON)', () => {
  let s = { ...st.emptyStore, run: settings() };
  const w = rp.workoutsOfWeek(st.planCtx(s, START), 0)[0];
  s = st.saveRunLog(s, w, { status: 'concluido', km: 4, seconds: 1560, rpe: 4 }, '2026-11-24');
  const back = st.hydrate(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(back.runLogs, s.runLogs);
  assert.deepEqual(back.run, s.run);
});

// 6. Reagendamento
test('adiar leva o treino para a nova data sem duplicar', () => {
  const s = settings();
  const tempo = byslot(rp.workoutsOfWeek(ctx(s), 0)).tempo; // quarta 25/11
  const logs = rp.upsertLog({}, tempo, { status: 'adiado', movedTo: '2026-11-26' });
  const thu = rp.workoutsOn(ctx(s, logs), '2026-11-25');
  const fri = rp.workoutsOn(ctx(s, logs), '2026-11-26');
  assert.equal(thu.here.length, 0);
  assert.equal(thu.movedAway.length, 1);
  assert.equal(fri.movedIn.length, 1);
  assert.equal(fri.movedIn[0].id, tempo.id);
  const again = rp.upsertLog(logs, tempo, { status: 'concluido', km: 4, movedTo: '2026-11-26' });
  assert.equal(Object.keys(again).length, 1, 'mesmo id: atualiza, não duplica');
  assert.equal(again[tempo.id].movedTo, '2026-11-26');
});

// 7. Repetição, pausa e sugestão (sem progressão automática só pelo calendário)
test('repetir e pausar semanas muda a semana do plano sem duplicar treinos', () => {
  const rep = settings({ decisions: { 1: 'repeat' } });
  assert.equal(rp.planWeekAt(ctx(rep), 0), 1);
  assert.equal(rp.planWeekAt(ctx(rep), 1), 1);
  assert.equal(rp.planWeekAt(ctx(rep), 2), 2);
  assert.equal(rp.planSpan(ctx(rep)), 9);
  const ids0 = rp.workoutsOfWeek(ctx(rep), 0).map((w) => w.id);
  const ids1 = rp.workoutsOfWeek(ctx(rep), 1).map((w) => w.id);
  assert.equal(new Set([...ids0, ...ids1]).size, ids0.length + ids1.length, 'ids únicos por semana do calendário');
  const pause = settings({ decisions: { 1: 'pause' } });
  assert.equal(rp.planWeekAt(ctx(pause), 1), null);
  assert.equal(rp.planWeekAt(ctx(pause), 2), 2);
  assert.equal(rp.workoutsOfWeek(ctx(pause), 1).length, 0);
});

test('semana anterior incompleta: a sugestão é repetir; completa: avançar', () => {
  const s = settings();
  const inWeek2 = '2026-12-01';
  assert.deepEqual(rp.decisionAt(ctx(s, {}, inWeek2), 1), { decision: 'repeat', auto: true });
  const ws = byslot(rp.workoutsOfWeek(ctx(s), 0));
  let logs = rp.upsertLog({}, ws.easy, { status: 'concluido', km: 4 });
  logs = rp.upsertLog(logs, ws.long, { status: 'concluido', km: 6 });
  assert.deepEqual(rp.decisionAt(ctx(s, logs, inWeek2), 1), { decision: 'next', auto: true });
  assert.equal(rp.planWeekAt(ctx(s, logs, inWeek2), 1), 2);
  // registrar fixa as decisões: o histórico não muda depois
  const frozen = rp.freezeDecisions(ctx(s, logs, inWeek2), 1);
  assert.equal(frozen['1'], 'next');
});

// 8. Navegação / posição no plano
test('posição no plano: antes, durante e depois', () => {
  const s = settings();
  assert.equal(rp.positionOf(ctx(s), '2026-11-20').phase, 'antes');
  const mid = rp.positionOf(ctx(s, {}, '2026-11-23'), '2026-12-10');
  assert.equal(mid.phase, 'plano');
  assert.equal(mid.cal, 2);
  assert.equal(rp.positionOf(ctx(s), '2027-03-01').phase, 'depois');
  assert.equal(dates.mondayOf('2026-11-29'), '2026-11-23');
  assert.equal(dates.daysBetween('2026-10-20', '2026-11-03'), 14, 'atravessa mudança de horário sem erro');
});

// 9. Compatibilidade com dados anteriores
test('dados da versão 1.4 carregam sem perda', () => {
  const legacy = {
    week: 3, done: { '2026-11-10': { 'aquec:0': true } }, notes: {}, totals: { '2026-11-10': 20 }, examDone: true,
    overrides: { 2: [{ id: 'aquec', title: 'X', items: [] }] }, custom: { 'c-1': { id: 'c-1', name: 'Meu', group: 'Força', muscles: '', how: '', videos: [], query: '', custom: true } },
    seenHelp: true, prefs: { voice: false },
  };
  const s = st.hydrate(legacy);
  assert.equal(s.week, 3);
  assert.deepEqual(s.done, legacy.done);
  assert.deepEqual(s.overrides, legacy.overrides, 'personalizações antigas guardadas');
  assert.equal(s.custom['c-1'].name, 'Meu');
  assert.equal(s.prefs.voice, false);
  assert.equal(s.prefs.sound, true);
  assert.deepEqual(s.runLogs, {});
  assert.equal(s.run.confirmed, false);
  assert.equal(prog.dayRatio(s, '2026-11-10'), 1 / 20, 'progresso antigo continua calculado');
  const back = st.parseBackup(JSON.parse(JSON.stringify(legacy)));
  assert.equal(back.week, 3);
  assert.throws(() => st.parseBackup([1, 2]));
});

test('registros inválidos são ignorados sem apagar os válidos', () => {
  const ok = { id: 'plano-10k:c0:easy', planId: 'plano-10k', cal: 0, planWeek: 1, slot: 'easy', scheduled: START, plannedKm: 4, status: 'concluido', updatedAt: '' };
  const logs = rp.sanitizeRunLogs({ [ok.id]: ok, lixo: { id: 'lixo', status: 'x' }, outro: null });
  assert.deepEqual(Object.keys(logs), [ok.id]);
  const s = rp.sanitizeRunSettings({ startDate: '2026-11-25', days: { easy: 9 }, easyPace: [450, 400], decisions: { 1: 'repeat', x: 'next', 2: 'pular' } });
  assert.equal(s.startDate, '2026-11-23', 'início vira segunda-feira');
  assert.equal(s.days.easy, 1, 'sem configuração salva: dias do padrão');
  const saved = rp.sanitizeRunSettings({ confirmed: true, days: { easy: 2, tempo: 4, long: 0, regen: 6, strength: [1, 5] } });
  assert.deepEqual([saved.days.easy, saved.days.long], [2, 0], 'configuração salva pelo usuário é mantida');
  const savedBad = rp.sanitizeRunSettings({ confirmed: true, days: { easy: 9 } });
  assert.equal(savedBad.days.easy, 1, 'dia inválido volta ao padrão');
  assert.deepEqual(s.easyPace, [400, 450], 'faixa de ritmo ordenada');
  assert.deepEqual(s.decisions, { 1: 'repeat' });
});

// 10. Prevenção de duplicidade
test('registrar duas vezes o mesmo treino não duplica', () => {
  const s = settings();
  const w = rp.workoutsOfWeek(ctx(s), 0)[0];
  let logs = rp.upsertLog({}, w, { status: 'concluido', km: 4 });
  logs = rp.upsertLog(logs, w, { status: 'concluido', km: 4.1 });
  assert.equal(Object.keys(logs).length, 1);
  assert.equal(logs[w.id].km, 4.1);
});

// Rotinas e dia
test('rotinas: corrida vem do plano, postura sem repetir o flexor, força para corrida com 2 séries', () => {
  const pace = '6:20–7:00 min/km';
  const easy = data.buildRoutine(2, 'easy', 1, 'corrida', pace);
  assert.equal(easy.sections.find((x) => x.id === 'corrida').items[0].title, 'Correr 4 km leve');
  assert.equal(easy.sections.find((x) => x.id === 'postura').items.some((i) => i.ex === 'along-flexor-quadril'), false);
  const rest = data.buildRoutine(3, 'rest', 1, 'corrida', pace);
  assert.equal(rest.sections.find((x) => x.id === 'postura').items.some((i) => i.ex === 'along-flexor-quadril'), true);
  const str = data.buildRoutine(1, 'strength1', 1, 'corrida', pace);
  const main = str.sections.find((x) => x.id === 'forca');
  assert.deepEqual(main.items.map((i) => [i.ex, i.sets]), [['ponte-gluteo', 2], ['agachamento', 2], ['panturrilha', 2], ['bird-dog', 2], ['prancha-lateral', 2]]);
  const warm = str.sections.find((x) => x.id === 'aquec').items.map((i) => i.ex);
  assert.equal(warm.includes('agachamento') || warm.includes('ponte-gluteo'), false, 'aquecimento não repete os exercícios principais');
  const cal4 = data.buildRoutine(1, 'strength1', 4, 'calistenia', pace);
  assert.equal(cal4.title, 'Calistenia A');
  assert.equal(cal4.sections.find((x) => x.id === 'treino').title, 'Treino: 2 rodadas');
  const tempo2 = data.buildRoutine(4, 'tempo', 2, 'corrida', pace);
  const blocks = tempo2.sections.find((x) => x.id === 'corrida').items[1];
  assert.deepEqual([blocks.sets, blocks.hold, blocks.rest], [3, 120, 120]);
});

test('dia personalizado mantém a corrida da semana (não congela distância)', () => {
  let s = { ...st.emptyStore, run: settings() };
  const tuesday1 = '2026-11-23', tuesday2 = '2026-11-30'; // segundas (corrida leve)
  const d1 = day.resolveDayPlan(s, tuesday1, tuesday1);
  s = { ...s, overrides: { [d1.key]: d1.plan.sections.map((x) => (x.id === 'aquec' ? { ...x, items: x.items.slice(1) } : x)) } };
  const logs = byslot(rp.workoutsOfWeek(st.planCtx(s, tuesday1), 0));
  s = { ...s, runLogs: rp.upsertLog(rp.upsertLog({}, logs.easy, { status: 'concluido', km: 4 }), logs.long, { status: 'concluido', km: 6 }) };
  const d2 = day.resolveDayPlan(s, tuesday2, tuesday2);
  assert.equal(d2.customized, true);
  assert.equal(d2.week, 2);
  assert.equal(d2.plan.sections.find((x) => x.id === 'corrida').items[0].title, 'Correr 4 km leve');
  assert.equal(d2.plan.sections.find((x) => x.id === 'aquec').items.length, d1.plan.sections.find((x) => x.id === 'aquec').items.length - 1);
});

test('progresso do dia ignora itens opcionais e a corrida', () => {
  const s = { ...st.emptyStore, run: settings() };
  const d = day.resolveDayPlan(s, '2026-11-29', '2026-11-29'); // domingo: trote leve curto (opcional)
  const keys = day.itemKeys(d.plan);
  assert.equal(keys.some((k) => k.startsWith('corrida:')), false);
  let s2 = day.setDayDone(s, '2026-11-29', keys, true);
  assert.equal(prog.dayRatio(s2, '2026-11-29'), 1);
  s2 = day.toggleItem(s2, '2026-11-29', keys[0], keys);
  assert.ok(prog.dayRatio(s2, '2026-11-29') < 1);
});

test('orientações de segurança a partir do registro', () => {
  const base = { id: 'x', planId: 'plano-10k', cal: 0, planWeek: 1, slot: 'easy', scheduled: START, plannedKm: 4, updatedAt: '' };
  assert.match(rp.guidance({ ...base, status: 'concluido', discomfort: 'forte' })[0], /interrompa/);
  assert.match(rp.guidance({ ...base, status: 'concluido', rpe: 9 })[0], /mais devagar/);
  assert.equal(rp.guidance({ ...base, status: 'concluido', rpe: 4 }).length, 0);
  assert.match(rp.guidance({ ...base, status: 'nao_realizado' })[0], /não some/);
});
