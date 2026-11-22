'use client';
// Janela do cronômetro de um exercício (alongamento, prancha...). Ao terminar, marca o item como feito.
import { useEffect, useMemo } from 'react';
import type { Item } from '@/lib/data';
import type { CuePrefs } from '@/lib/cues';
import { prescription } from '@/lib/domain/prescription';
import { buildHoldSegments } from '@/lib/domain/timer';
import SequenceTimer from './SequenceTimer';

export default function HoldTimerModal({ item, name, prefs, onPrefs, onDone, onClose }: {
  item: Item; name: string; prefs: CuePrefs;
  onPrefs: (p: Partial<CuePrefs>) => void; onDone: () => void; onClose: () => void;
}) {
  const segments = useMemo(() => buildHoldSegments(item), [item]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={`Cronômetro: ${name}`} onClick={(e) => e.stopPropagation()}>
        <div className="modalhead">
          <h2>{name}</h2>
          <button className="btn" onClick={onClose}>Fechar</button>
        </div>
        <p className="muted small">{prescription(item)}{item.detail ? ` · ${item.detail}` : ''}. O app conta para você: 5 s para se posicionar e bipes nos 3 últimos segundos.</p>
        <SequenceTimer segments={segments} prefs={prefs} onPrefs={onPrefs} onDone={onDone} />
      </div>
    </div>
  );
}
