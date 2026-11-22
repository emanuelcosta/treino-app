'use client';
// Botão flutuante de descanso nos dias de força (fora do treino guiado).
import { useState } from 'react';
import type { CuePrefs } from '@/lib/cues';
import { restSegments } from '@/lib/domain/timer';
import SequenceTimer from './SequenceTimer';

const OPTIONS = [45, 60, 90, 120];

export default function RestTimer({ prefs }: { prefs: CuePrefs }) {
  const [open, setOpen] = useState(false);
  const [run, setRun] = useState<{ seconds: number; n: number } | null>(null);

  return (
    <div className="timer">
      {open && (
        <div className="timerpanel" role="dialog" aria-label="Cronômetro de descanso">
          <div className="restopts" role="group" aria-label="Tempo de descanso">
            {OPTIONS.map((s) => (
              <button key={s} className={run?.seconds === s ? 'chip sel' : 'chip'} onClick={() => setRun({ seconds: s, n: (run?.n ?? 0) + 1 })}>{s} s</button>
            ))}
          </div>
          {run && <SequenceTimer key={run.n} autoStart prefs={prefs} doneSay="Descanso acabou" segments={restSegments(run.seconds, 'Descanso')} />}
        </div>
      )}
      <button className="fab" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'Fechar' : 'Descanso'}</button>
    </div>
  );
}
