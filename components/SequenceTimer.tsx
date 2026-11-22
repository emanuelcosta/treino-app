'use client';
// Mostra e controla uma sequência de tempo (cronômetro de exercício ou intervalos de corrida).
import { useEffect } from 'react';
import { clock, duration, type Segment } from '@/lib/domain/timer';
import type { CuePrefs } from '@/lib/cues';
import { useSequenceTimer } from '@/lib/useSequenceTimer';

const KIND_CLASS: Record<Segment['kind'], string> = {
  prep: 'k-prep', hold: 'k-hold', switch: 'k-switch', rest: 'k-rest', warm: 'k-easy', work: 'k-work', easy: 'k-easy', long: 'k-rest', cool: 'k-easy',
};

export default function SequenceTimer({ segments, prefs, onPrefs, onDone, doneSay, autoStart = false, big = false, showTotal = false }: {
  segments: Segment[];
  prefs: CuePrefs;
  onPrefs?: (p: Partial<CuePrefs>) => void;
  onDone?: () => void;
  /** frase falada ao terminar (padrão: "Concluído") */
  doneSay?: string;
  autoStart?: boolean;
  big?: boolean;
  showTotal?: boolean;
}) {
  const t = useSequenceTimer(segments, prefs, onDone, doneSay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (autoStart) t.start(); }, []);
  const seg = t.segment;
  if (!seg) return null;
  const done = t.status === 'done';

  return (
    <div className={`seqtimer ${big ? 'big' : ''} ${done ? 'k-done' : KIND_CLASS[seg.kind]}`} role="timer" aria-live="off">
      <div className="st-head">
        <span className="st-label">{done ? 'Concluído' : seg.label}</span>
        {!done && seg.info && <span className="st-info">{seg.info}</span>}
      </div>
      <div className="st-clock" aria-label={done ? 'Concluído' : `${Math.ceil(t.remaining)} segundos restantes`}>
        {done ? '✓' : clock(t.remaining)}
      </div>
      <div className="st-bar" aria-hidden="true"><div style={{ width: `${Math.round((done ? 1 : t.segProgress) * 100)}%` }} /></div>
      {!done && (
        <p className="st-next">
          {t.status === 'idle' && t.index === 0 ? `Toque em Iniciar. Total: ${duration(Math.round(t.totalLeft))}` : t.next ? <>Depois: <b>{t.next.label}</b> ({duration(t.next.seconds)})</> : 'Última etapa'}
          {showTotal && t.status !== 'idle' && <span className="st-total"> · Falta {clock(t.totalLeft)} no total</span>}
        </p>
      )}
      <div className="st-controls">
        {done ? (
          <button className="btn" onClick={t.reset}>Recomeçar</button>
        ) : (
          <>
            <button className="btn" onClick={() => t.adjust(-5)} aria-label="Menos 5 segundos" disabled={t.status === 'idle'}>−5 s</button>
            <button className="btn primary st-main" onClick={t.toggle}>
              {t.status === 'running' ? 'Pausar' : t.status === 'paused' ? 'Continuar' : 'Iniciar'}
            </button>
            <button className="btn" onClick={() => t.adjust(5)} aria-label="Mais 5 segundos" disabled={t.status === 'idle'}>+5 s</button>
            <button className="btn" onClick={t.skip}>Pular etapa</button>
          </>
        )}
      </div>
      {onPrefs && (
        <div className="st-prefs" role="group" aria-label="Avisos">
          <label><input type="checkbox" checked={prefs.sound} onChange={(e) => onPrefs({ sound: e.target.checked })} /> Som</label>
          <label><input type="checkbox" checked={prefs.voice} onChange={(e) => onPrefs({ voice: e.target.checked })} /> Voz</label>
          <label><input type="checkbox" checked={prefs.vibrate} onChange={(e) => onPrefs({ vibrate: e.target.checked })} /> Vibrar</label>
        </div>
      )}
    </div>
  );
}
