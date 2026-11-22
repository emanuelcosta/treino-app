'use client';
import { useEffect, useState } from 'react';
import { exerciseList, type Exercise, type Item } from '@/lib/data';
import { parseSetsInput } from '@/lib/domain/prescription';
import CustomExerciseForm from './CustomExerciseForm';

type Tab = 'lib' | 'new' | 'free';

export default function ExercisePicker({ custom, onAdd, onClose }: {
  custom: Record<string, Exercise>;
  onAdd: (item: Item, newEx?: Exercise) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('lib');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Exercise | null>(null);
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10 repetições');
  const [title, setTitle] = useState('');
  const [fdetail, setFdetail] = useState('');

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const all = [...Object.values(custom), ...exerciseList].filter((e) => norm(e.name).includes(norm(q)));

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Adicionar exercício" onClick={(e) => e.stopPropagation()}>
        <div className="modalhead">
          <h2>Adicionar ao treino</h2>
          <button className="btn" onClick={onClose}>Fechar</button>
        </div>
        <div className="chips" role="tablist">
          {([['lib', 'Da biblioteca'], ['new', 'Criar exercício'], ['free', 'Item livre']] as [Tab, string][]).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'chip sel' : 'chip'} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === 'lib' && !sel && (
          <>
            <input className="search" type="search" placeholder="Buscar exercício" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar exercício" />
            <ul className="pick">
              {all.map((e) => (
                <li key={e.id}><button onClick={() => { setSel(e); setSets('3'); setReps('10 repetições'); }}><b>{e.name}</b><span className="muted small">{e.group}{e.custom ? ' · Meu' : ''}</span></button></li>
              ))}
            </ul>
          </>
        )}
        {tab === 'lib' && sel && (
          <div className="form">
            <p><b>{sel.name}</b></p>
            <div className="setfields">
              <label>Número de séries<input inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="3" /></label>
              <label>Em cada série<input value={reps} onChange={(e) => setReps(e.target.value)} placeholder="12 repetições ou 30 s" /></label>
            </div>
            <div className="row">
              <button className="btn" onClick={() => setSel(null)}>Voltar</button>
              <button className="btn primary" onClick={() => onAdd({ ex: sel.id, sets: parseSetsInput(sets), reps: reps.trim() || undefined, detail: '' })}>Adicionar</button>
            </div>
          </div>
        )}
        {tab === 'new' && <CustomExerciseForm withDetail onCreate={(ex, d) => onAdd({ ex: ex.id, ...d, detail: '' }, ex)} />}
        {tab === 'free' && (
          <form className="form" onSubmit={(e) => { e.preventDefault(); if (title.trim()) onAdd({ title: title.trim(), detail: fdetail.trim() }); }}>
            <label>Título<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Caminhada leve" /></label>
            <label>Detalhe<input value={fdetail} onChange={(e) => setFdetail(e.target.value)} placeholder="Ex.: 30 min" /></label>
            <button className="btn primary" type="submit">Adicionar</button>
          </form>
        )}
      </div>
    </div>
  );
}
