// Testes da integração com o Strava (sem rede): sessão criptografada, conversão, sugestões e duplicidade.
const test = require('node:test');
const assert = require('node:assert/strict');
const B = '../../.test-build/lib';
const { seal, unseal } = require(`${B}/strava/seal.js`);
const sv = require(`${B}/domain/strava.js`);
const rp = require(`${B}/domain/runPlan.js`);
const st = require(`${B}/domain/store.js`);

const START = '2026-11-23';
const settings = () => ({ ...rp.defaultRunSettings(new Date(2026, 10, 23)), startDate: START });
const act = (id, date, meters, secs, sport = 'Run', name = 'Corrida') =>
  ({ id, name, sport_type: sport, start_date_local: `${date}T07:00:00Z`, distance: meters, moving_time: secs, elapsed_time: secs + 30 });

test('sessão: criptografa, lê de volta e recusa alteração ou outra chave', () => {
  const s = { access: 'a', refresh: 'r', expiresAt: 123, athlete: { id: 1, firstname: 'Ana' } };
  const token = seal(s, 'segredo-1');
  assert.ok(!token.includes('Ana'), 'conteúdo não fica legível');
  assert.deepEqual(unseal(token, 'segredo-1'), s);
  assert.equal(unseal(token, 'outro-segredo'), null);
  const tampered = token.slice(0, -2) + (token.endsWith('A') ? 'B' : 'A') + token.slice(-1);
  assert.equal(unseal(tampered, 'segredo-1'), null);
  assert.equal(unseal('', 'segredo-1'), null);
  assert.equal(unseal(undefined, 'segredo-1'), null);
  assert.notEqual(seal(s, 'segredo-1'), token, 'cada selo usa um IV novo');
});

test('conversão: só corridas, com data local, km e tempo em movimento', () => {
  assert.deepEqual(sv.toStravaRun(act(10, '2026-11-23', 4210, 1590, 'Run', 'Treino')),
    { id: 10, name: 'Treino', date: '2026-11-23', km: 4.21, seconds: 1590, elapsed: 1620, sport: 'Run' });
  assert.equal(sv.toStravaRun(act(11, '2026-11-23', 20000, 3600, 'Ride')), null, 'pedal não entra');
  assert.ok(sv.toStravaRun(act(12, '2026-11-23', 5000, 1800, 'TrailRun')));
  assert.equal(sv.toStravaRun(act(13, '2026-11-23', 0, 1800)), null);
  assert.equal(sv.toStravaRun({}), null);
});

test('sugestões: corrida do mesmo dia, distância mais parecida, sem repetir atividade', () => {
  const s = settings();
  const runs = [
    act(1, '2026-11-23', 8000, 2900), act(2, '2026-11-23', 4100, 1560), // segunda: leve de 4 km -> escolhe a de 4,1
    act(3, '2026-11-25', 4300, 1600),                                    // quarta: variação
    act(4, '2026-11-24', 3000, 1100),                                    // terça: dia de força, sem treino de corrida
  ].map(sv.toStravaRun);
  const ctx = { s, logs: {}, today: '2026-11-26' };
  const sug = sv.suggestMatches(ctx, 0, runs);
  assert.deepEqual(sug.map((x) => [x.workout.slot, x.run.id]), [['easy', 2], ['tempo', 3]]);
  // treino já concluído não recebe sugestão; atividade já usada não é sugerida de novo
  const w = sug[0].workout;
  const logs = rp.upsertLog({}, w, { status: 'concluido', km: 4.1, stravaId: 2, source: 'strava' });
  const sug2 = sv.suggestMatches({ s, logs, today: '2026-11-26' }, 0, runs);
  assert.deepEqual(sug2.map((x) => x.workout.slot), ['tempo']);
  assert.ok(sv.usedStravaIds(logs).has(2));
});

test('importar: preenche o registro e não deixa a mesma atividade em dois treinos', () => {
  let s = { ...st.emptyStore, run: settings() };
  const ws = rp.workoutsOfWeek(st.planCtx(s, '2026-11-26'), 0);
  const easy = ws.find((w) => w.slot === 'easy');
  const tempo = ws.find((w) => w.slot === 'tempo');
  const run = sv.toStravaRun(act(99, '2026-11-23', 4210, 1590, 'Run', 'Manhã'));
  const s1 = st.importStravaRun(s, easy, run, '2026-11-26');
  const l = s1.runLogs[easy.id];
  assert.deepEqual([l.status, l.km, l.seconds, l.source, l.stravaId, l.notes], ['concluido', 4.21, 1590, 'strava', 99, 'Strava: Manhã']);
  assert.equal(st.importStravaRun(s1, tempo, run, '2026-11-26'), null, 'mesma atividade em outro treino: recusa');
  assert.ok(st.importStravaRun(s1, easy, run, '2026-11-26'), 'reimportar no mesmo treino é permitido (atualiza)');
  // salvar manualmente com o id de outra atividade já usada: o id é descartado
  const s2 = st.saveRunLog(s1, tempo, { status: 'concluido', km: 4, stravaId: 99, source: 'strava' }, '2026-11-26');
  assert.equal(s2.runLogs[tempo.id].stravaId, undefined);
  assert.equal(s2.runLogs[tempo.id].source, 'manual');
  // voltar para "não realizado" tira a ligação com o Strava
  const s3 = st.saveRunLog(s1, easy, { status: 'nao_realizado' }, '2026-11-26');
  assert.equal(s3.runLogs[easy.id].stravaId, undefined);
});

test('intervalos de busca: semana com folga e um dia', () => {
  const s = settings();
  const r = sv.weekRange({ s, logs: {}, today: START }, 0);
  assert.equal((r.before - r.after) / 86400, 10);
  const d = sv.dayRange('2026-11-23');
  assert.equal(d.before - d.after, 86401);
});
