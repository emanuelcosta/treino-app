'use client';
import { useState } from 'react';
import { GROUPS, parseYoutubeId, type Exercise, type Group, type Item } from '@/lib/data';
import { parseSetsInput } from '@/lib/domain/prescription';

export default function CustomExerciseForm({ onCreate, withDetail = false }: { onCreate: (ex: Exercise, series: Pick<Item, 'sets' | 'reps'>) => void; withDetail?: boolean }) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState<Group>('Força');
  const [steps, setSteps] = useState('');
  const [tip, setTip] = useState('');
  const [url, setUrl] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10 repetições');
  const [err, setErr] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErr('Dê um nome ao exercício.'); return; }
    let videos: Exercise['videos'] = [];
    if (url.trim()) {
      const id = parseYoutubeId(url);
      if (!id) { setErr('Não entendi o link do YouTube. Cole o endereço completo do vídeo.'); return; }
      videos = [{ id, title: 'Vídeo do exercício' }];
    }
    const lines = steps.split('\n').map((s) => s.trim()).filter(Boolean);
    const ex: Exercise = {
      id: `c-${Date.now().toString(36)}`, name: name.trim(), group, muscles: 'Exercício próprio',
      how: lines.join(' ') || 'Sem instruções ainda.', steps: lines.length ? lines : undefined,
      mistake: tip.trim() || undefined, videos, query: `${name.trim()} como fazer`, custom: true,
    };
    onCreate(ex, { sets: parseSetsInput(sets), reps: reps.trim() || undefined });
    setName(''); setSteps(''); setTip(''); setUrl(''); setErr('');
  };

  return (
    <form className="form" onSubmit={submit}>
      <label>Nome do exercício<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Agachamento búlgaro" /></label>
      <label>Grupo
        <select value={group} onChange={(e) => setGroup(e.target.value as Group)}>{GROUPS.map((g) => (<option key={g}>{g}</option>))}</select>
      </label>
      <label>Passo a passo (um por linha)
        <textarea rows={4} value={steps} onChange={(e) => setSteps(e.target.value)} placeholder={'Fique em pé com os pés afastados.\nDesça devagar.\nSuba empurrando o chão.'} />
      </label>
      <label>Cuidado (opcional)<input value={tip} onChange={(e) => setTip(e.target.value)} placeholder="Ex.: não deixe o joelho cair para dentro" /></label>
      <label>Link de vídeo do YouTube (opcional)<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." inputMode="url" /></label>
      {withDetail && (
        <div className="setfields">
          <label>Número de séries<input inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="3" /></label>
          <label>Em cada série<input value={reps} onChange={(e) => setReps(e.target.value)} placeholder="12 repetições ou 30 s" /></label>
        </div>
      )}
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn primary" type="submit">{withDetail ? 'Criar e adicionar ao treino' : 'Criar exercício'}</button>
    </form>
  );
}
