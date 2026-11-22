'use client';
import Link from 'next/link';
import { useState } from 'react';
import { DAY_NAMES, GROUPS, exerciseList, type Group } from '@/lib/data';
import { addCustomExercise, removeCustomExercise } from '@/lib/domain/store';
import { useStore } from '@/lib/useStore';
import CustomExerciseForm from './CustomExerciseForm';

const RUN_STRENGTH: [string, string, string, string][] = [
  ['ponte-gluteo', 'Ponte de glúteo', '2 x 12', 'Glúteos e posterior: estabilizam o quadril na passada.'],
  ['agachamento', 'Agachamento livre', '2 x 10', 'Quadríceps e glúteos: absorvem o impacto.'],
  ['panturrilha', 'Elevação de panturrilha', '2 x 15', 'Panturrilha e tendão de Aquiles: impulso e proteção.'],
  ['bird-dog', 'Bird dog', '2 x 8 por lado', 'Tronco estável sem sobrecarregar a lombar.'],
  ['prancha-lateral', 'Prancha lateral', '2 x 20 s por lado', 'Estabilidade lateral do tronco e do quadril.'],
];

export default function Library() {
  const { store, ready, update } = useStore();
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<Group | 'Todos'>('Todos');
  const [creating, setCreating] = useState(false);
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const all = [...Object.values(store.custom), ...exerciseList];
  const list = all.filter((e) => (group === 'Todos' || e.group === group) && norm(e.name + ' ' + e.muscles).includes(norm(q)));

  if (!ready) return <div className="muted">Carregando…</div>;

  return (
    <>
      <h1>Exercícios</h1>
      <p className="muted">Toque em um exercício para ver o passo a passo e assistir aos vídeos.</p>
      <section className="card runstrength">
        <h2>Fortalecimento para corrida</h2>
        <p className="small muted">
          {store.run.strengthPref === 'nenhum' ? 'Desligado na configuração do plano (tela Semana).'
            : `2 vezes por semana: ${DAY_NAMES[store.run.days.strength[0]].toLowerCase()} e ${DAY_NAMES[store.run.days.strength[1]].toLowerCase()}${store.run.strengthPref === 'calistenia' ? ' (você escolheu a calistenia completa A e B)' : ''}.`}
        </p>
        <ul className="bul">
          {RUN_STRENGTH.map(([id, name, presc, why]) => (
            <li key={id}><Link href={`/exercicios/${id}`}>{name}</Link>: {presc}. <span className="muted small">{why}</span></li>
          ))}
        </ul>
        <p className="small muted">60 s de descanso entre as séries. Movimento controlado e amplitude sem dor. Se algum exercício provocar ou piorar dor na lombar, pare e troque por uma versão mais fácil ou pule.</p>
      </section>
      <button className="btn" onClick={() => setCreating((c) => !c)}>{creating ? 'Fechar' : '+ Criar exercício'}</button>
      {creating && (
        <section className="card">
          <h2>Novo exercício</h2>
          <CustomExerciseForm onCreate={(ex) => { update((s) => addCustomExercise(s, ex)); setCreating(false); }} />
        </section>
      )}
      <input className="search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar exercício" aria-label="Buscar exercício" />
      <div className="chips" role="group" aria-label="Filtrar por grupo">
        {(['Todos', ...GROUPS] as const).map((g) => (
          <button key={g} className={group === g ? 'chip sel' : 'chip'} onClick={() => setGroup(g)} aria-pressed={group === g}>{g}</button>
        ))}
      </div>
      <ul className="lib">
        {list.map((e) => (
          <li key={e.id}>
            <Link href={`/exercicios/${e.id}`}>
              <span className="ln">{e.name}{e.custom && <span className="tag">meu</span>}</span>
              <span className="muted small">{e.group} · {e.muscles}</span>
              <span className="small vid">{e.videos.length > 0 ? `${e.videos.length} vídeo${e.videos.length > 1 ? 's' : ''}` : 'busca no YouTube'}</span>
            </Link>
            {e.custom && (
              <button className="link" onClick={() => { if (window.confirm(`Apagar "${e.name}"?`)) update((s) => removeCustomExercise(s, e.id)); }}>Apagar</button>
            )}
          </li>
        ))}
        {list.length === 0 && <li className="muted">Nenhum exercício encontrado.</li>}
      </ul>
    </>
  );
}
