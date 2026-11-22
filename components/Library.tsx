'use client';
import Link from 'next/link';
import { useState } from 'react';
import { GROUPS, exerciseList, type Group } from '@/lib/data';
import { addCustomExercise, removeCustomExercise } from '@/lib/domain/store';
import { useStore } from '@/lib/useStore';
import CustomExerciseForm from './CustomExerciseForm';

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
