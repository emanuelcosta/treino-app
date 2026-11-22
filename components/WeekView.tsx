'use client';
import { DAY_NAMES, getDayPlan, runPlan } from '@/lib/data';
import { DELOAD_WEEK, WEEKS, setWeek } from '@/lib/domain/store';
import { useStore } from '@/lib/useStore';

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function WeekView() {
  const { store, ready, update } = useStore();
  if (!ready) return <div className="muted">Carregando…</div>;

  return (
    <>
      <h1>Semana</h1>
      <label className="weeksel inline">
        <span>Semana do plano</span>
        <select value={store.week} onChange={(e) => update((s) => setWeek(s, Number(e.target.value)))}>
          {WEEKS.map((w) => (<option key={w} value={w}>{w}{w === DELOAD_WEEK ? ' (descarga)' : ''}</option>))}
        </select>
      </label>

      <section className="card">
        <h2>Plano de corrida</h2>
        <p className="muted small">Todos os treinos em ritmo de conversa (você consegue falar frases inteiras).</p>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Semana</th><th>Seg</th><th>Qua</th><th>Sex (longão)</th><th>Dom (leve)</th></tr></thead>
            <tbody>
              {runPlan.map((r) => (
                <tr key={r.week} className={r.week === store.week ? 'sel' : ''}>
                  <td>{r.week}{r.note ? ` (${r.note.split(' ').pop()})` : ''}</td>
                  <td>{r.seg} km</td><td>{r.qua} km</td><td>{r.sex} km</td><td>{r.dom} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Rotina da semana {store.week}</h2>
        <ul className="week">
          {ORDER.map((d) => {
            const p = getDayPlan(d, store.week);
            return (
              <li key={d}>
                <b>{DAY_NAMES[d]}</b>
                <span>{p.title}: {p.subtitle}</span>
              </li>
            );
          })}
        </ul>
        <p className="muted small">Todo dia: rotina de postura no trabalho e prancha antes de dormir.</p>
      </section>

      <section className="card">
        <h2>Regras do plano</h2>
        <ul className="bul">
          <li>Dor que passe de 2 a 3 dias: repita a semana anterior em vez de avançar.</li>
          <li>Aumente o volume em cerca de 10% por vez.</li>
          <li>Semana 4 é de descarga: a calistenia vai para 2 rodadas.</li>
          <li>Longão cansado demais: encurte, não pule.</li>
          <li>Pedalar leve no dia a dia ajuda na recuperação. Se o dia foi puxado, encurte o treino seguinte, principalmente antes do longão.</li>
        </ul>
      </section>

      <section className="card">
        <h2>Ganhar força e massa</h2>
        <ul className="bul">
          <li>Escolha uma faixa (ex.: 8 a 12). Quando fizer 3 séries no topo com boa forma, passe para uma variação mais difícil (veja em Exercícios).</li>
          <li>Termine as séries com 1 a 3 repetições sobrando.</li>
          <li>Proteína: uma referência comum é 1,6 a 2 g por kg por dia, distribuída nas refeições.</li>
          <li>Durma de 7 a 9 horas e coma o suficiente para o gasto da corrida.</li>
          <li>A cada 4 semanas, reavalie: se está fácil, suba a variação; se acumula cansaço, repita a semana.</li>
        </ul>
      </section>

      <section className="card">
        <h2>Ajustes na mesa de trabalho</h2>
        <ul className="bul">
          <li>Topo do monitor na altura dos olhos, a um braço de distância.</li>
          <li>Pés apoiados, quadril um pouco acima dos joelhos, cotovelos a cerca de 90° e punhos retos.</li>
          <li>Levante a cada 45 a 60 min por 1 a 2 min. A melhor postura é a próxima: varie.</li>
          <li>Formigamento nas mãos ou dor persistente no pescoço ou nas costas merecem avaliação de um profissional de saúde.</li>
        </ul>
      </section>

      <p className="muted small">Plano de orientação geral. Não substitui avaliação de um médico ou de um profissional de educação física.</p>
    </>
  );
}
