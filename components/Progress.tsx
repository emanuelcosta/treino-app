'use client';
import { useState } from 'react';
import { dayRatio, goodDaysCount, heatLevel, lastDays, mondayOffset, streak as streakOf } from '@/lib/domain/progress';
import { dateKey, parseBackup, planCtx } from '@/lib/domain/store';
import { useStore } from '@/lib/useStore';
import RunProgress from './RunProgress';

const HEAD = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function Progress() {
  const { store, ready, update, reset } = useStore();
  const [msg, setMsg] = useState('');
  if (!ready) return <div className="muted">Carregando…</div>;

  const days = lastDays(new Date(), 28);
  const pctOf = (k: string) => dayRatio(store, k);
  const lead = mondayOffset(days[0].date);
  const good = goodDaysCount(store, days);
  const streak = streakOf(store, days);
  const level = heatLevel;

  return (
    <>
      <h1>Progresso</h1>
      <RunProgress ctx={planCtx(store, dateKey(new Date()))} />
      <h2 className="secthead">Exercícios do dia</h2>
      <div className="stats">
        <div className="card stat"><b>{good}</b><span className="small muted">dias com 80% ou mais dos exercícios, nos últimos 28</span></div>
        <div className="card stat"><b>{streak}</b><span className="small muted">dias seguidos</span></div>
      </div>
      <section className="card">
        <h2>Últimas 4 semanas</h2>
        <div className="heat" role="img" aria-label="Mapa de dias treinados nas últimas quatro semanas">
          {HEAD.map((h) => (<span key={h} className="hh">{h}</span>))}
          {Array.from({ length: lead }).map((_, i) => (<span key={`e${i}`} />))}
          {days.map((d) => (
            <span key={d.key} className={`cell l${level(pctOf(d.key))}`} title={`${d.date.toLocaleDateString('pt-BR')}: ${Math.round(pctOf(d.key) * 100)}%`}>
              {d.date.getDate()}
            </span>
          ))}
        </div>
        <p className="muted small">Cor mais forte = mais exercícios obrigatórios do dia concluídos (itens opcionais e a corrida não entram nesta conta).</p>
      </section>
      <section className="card">
        <h2>Backup</h2>
        <p className="muted small">Seus dados ficam só na memória deste navegador (sem nuvem). Se limpar os dados do site ou trocar de aparelho, eles somem. Exporte um backup de vez em quando.</p>
        <div className="row">
          <button className="btn" onClick={() => {
            const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `treino-backup-${dateKey(new Date())}.json`;
            a.click(); URL.revokeObjectURL(a.href);
            setMsg('Backup exportado.');
          }}>Exportar backup</button>
          <label className="btn">
            Importar backup
            <input type="file" accept="application/json,.json" hidden aria-label="Importar backup" onChange={async (e) => {
              const f = e.target.files?.[0]; e.target.value = '';
              if (!f) return;
              try {
                const data = parseBackup(JSON.parse(await f.text()));
                update(() => data);
                setMsg('Backup importado.');
              } catch { setMsg('Arquivo inválido. Use um backup exportado por este app.'); }
            }} />
          </label>
        </div>
        {msg && <p className="small" role="status">{msg}</p>}
      </section>
      <section className="card">
        <h2>Dados</h2>
        <p className="muted small">Apague o histórico, as anotações e seus treinos personalizados deste navegador.</p>
        <button className="danger" onClick={() => { if (window.confirm('Apagar todo o histórico e as anotações?')) reset(); }}>Apagar meus dados</button>
      </section>
    </>
  );
}
