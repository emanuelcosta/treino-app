'use client';
import { useEffect, useMemo, useState } from 'react';
import { unlockAudio, type CuePrefs } from '@/lib/cues';
import type { GuidedEntry } from '@/lib/domain/guided';
import { prescription, setsCount } from '@/lib/domain/prescription';
import { buildHoldSegments, restSegments } from '@/lib/domain/timer';
import SequenceTimer from './SequenceTimer';
import ExerciseDetail from './ExerciseDetail';

type Rest = { seconds: number; then: 'next' | 'set' };

export default function GuidedMode({ entries, onDone, onClose, prefs, onPrefs }: {
  entries: GuidedEntry[]; onDone: (key: string) => void; onClose: () => void;
  prefs: CuePrefs; onPrefs: (p: Partial<CuePrefs>) => void;
}) {
  const [i, setI] = useState(0);
  const [set, setSet] = useState(1); // série atual (fora do circuito)
  const [rest, setRest] = useState<Rest | null>(null);
  const total = entries.length;
  const e = entries[i];
  const circuit = e?.round !== undefined;
  const timed = !!e?.item.hold;
  // com cronômetro, o próprio cronômetro conta as séries
  const nSets = e && !circuit && !timed ? setsCount(e.item) : 1;
  const holdSegs = useMemo(() => (e?.item.hold ? buildHoldSegments(e.item, circuit ? [e.round!] : undefined) : []), [e, circuit]);

  const go = (to: number) => { setRest(null); setSet(1); setI(Math.max(0, to)); };
  const next = () => go(i + 1);

  useEffect(() => {
    const h = (ev: KeyboardEvent) => { if (ev.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  function endRest() {
    if (!rest) return;
    if (rest.then === 'set') { setRest(null); setSet((s) => s + 1); } else next();
  }

  // Concluir a série atual (fora do circuito) ou o passo inteiro.
  const finishStep = () => {
    unlockAudio();
    if (e.last) onDone(e.key);
    if (e.rest && i + 1 < total) setRest({ seconds: e.rest, then: 'next' }); else next();
  };
  const finishSet = () => {
    unlockAudio();
    if (set < nSets) {
      if (e.item.rest) setRest({ seconds: e.item.rest, then: 'set' }); else setSet((s) => s + 1);
    } else finishStep();
  };

  const name = (en: GuidedEntry) => en.item.title ?? en.ex?.name ?? '';
  const nextLabel = () => {
    if (rest?.then === 'set') return `${name(e)}: série ${set + 1} de ${nSets}`;
    const n = entries[i + 1];
    if (!n) return '';
    return n.round !== undefined ? `${name(n)} (rodada ${n.round} de ${n.rounds})` : name(n);
  };
  const presc = e ? prescription(e.item) : '';

  return (
    <div className="guided" role="dialog" aria-modal="true" aria-label="Treino guiado">
      <div className="ghead">
        <button className="btn" onClick={onClose}>Sair</button>
        {i < total && <span className="small">Passo {i + 1} de {total}</span>}
      </div>
      <div className="bar"><div style={{ width: `${Math.round((Math.min(i, total) / total) * 100)}%` }} /></div>

      {i >= total && (
        <div className="gbody center">
          <h1>Treino concluído</h1>
          <p className="muted">Bom trabalho. Hidrate-se, coma algo com proteína e descanse.</p>
          <button className="btn primary" onClick={onClose}>Fechar</button>
        </div>
      )}

      {i < total && rest && (
        <div className="gbody center">
          <SequenceTimer key={`r${i}-${set}`} autoStart prefs={prefs} onDone={endRest} doneSay={nextLabel()}
            segments={restSegments(rest.seconds, rest.then === 'next' && e.round !== undefined && entries[i + 1]?.round !== e.round ? `Fim da rodada ${e.round}. Descanse e respire` : 'Descanse e respire', `Próximo: ${nextLabel()}`)} />
          <button className="btn primary" onClick={endRest}>Pular descanso</button>
        </div>
      )}

      {i < total && !rest && (
        <div className="gbody">
          <p className="muted small">{e.section}{circuit ? ` · Rodada ${e.round} de ${e.rounds}` : ''}</p>
          <h1>{name(e)}</h1>
          {presc && (
            <div className="series" aria-label="Séries">
              <div><span className="small muted">Séries</span><b>{circuit ? `${e.round} de ${setsCount(e.item)}` : nSets > 1 ? `${set} de ${nSets}` : String(e.item.sets ?? 1)}</b></div>
              {e.item.reps && <div><span className="small muted">Em cada série</span><b>{e.item.reps}</b></div>}
            </div>
          )}
          {circuit && <p className="small muted">Faça 1 série agora e passe para o próximo exercício. Total: {presc}.</p>}
          {!circuit && presc && <p className="small muted">Total: {presc}.</p>}
          {e.item.detail && <p className="gdetail">{e.item.detail}</p>}
          {nSets > 1 && !circuit && (
            <ol className="setdots" aria-label={`Série ${set} de ${nSets}`}>
              {Array.from({ length: nSets }).map((_, k) => (<li key={k} className={k + 1 < set ? 'done' : k + 1 === set ? 'cur' : ''}>{k + 1}</li>))}
            </ol>
          )}
          {timed && <SequenceTimer key={i} segments={holdSegs} prefs={prefs} onPrefs={onPrefs} onDone={finishStep} />}
          {e.ex ? <ExerciseDetail ex={e.ex} compact /> : <p className="muted">Item livre: siga a instrução acima.</p>}
        </div>
      )}

      {i < total && !rest && (
        <div className="gfoot">
          <button className="btn" onClick={() => go(i - 1)} disabled={i === 0}>Voltar</button>
          <button className="btn" onClick={next}>Pular</button>
          {nSets > 1 && !circuit
            ? <button className="btn primary" onClick={finishSet}>{set < nSets ? `Concluir série ${set}` : 'Concluir última série'}</button>
            : <button className="btn primary" onClick={finishStep}>{circuit ? `Concluir série ${e.round}` : 'Concluir'}</button>}
        </div>
      )}
    </div>
  );
}
