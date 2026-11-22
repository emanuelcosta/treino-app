'use client';
// Executa uma sequência de etapas (Segment[]) com contagem regressiva precisa.
// Usa o relógio (Date.now) e não "contar ticks": se a tela apagar e voltar, o tempo continua certo.
import { useCallback, useEffect, useRef, useState } from 'react';
import { cueChange, cueCount, cueDone, unlockAudio, type CuePrefs } from './cues';
import { spoken, type Segment } from './domain/timer';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'done';

/** Frase dita ao entrar numa etapa. */
const sayFor = (s: Segment) => (s.kind === 'prep' ? undefined : `${s.label.replace(':', ',')}, ${spoken(s.seconds)}`);

export function useSequenceTimer(segments: Segment[], prefs: CuePrefs, onDone?: () => void, doneSay?: string) {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [now, setNow] = useState(() => Date.now());
  const endAt = useRef(0);
  const paused = useRef((segments[0]?.seconds ?? 0) * 1000);
  const lastSec = useRef(-1);
  const idx = useRef(0);
  const live = useRef({ segments, prefs, onDone, doneSay });
  live.current = { segments, prefs, onDone, doneSay };

  const remainingMs = status === 'running' ? Math.max(0, endAt.current - now) : status === 'done' ? 0 : paused.current;

  const step = useCallback(() => {
    const t = Date.now();
    const { segments: segs, prefs: p } = live.current;
    let rem = endAt.current - t;
    let i = idx.current;
    let changed = false;
    while (rem <= 0) {
      i += 1;
      if (i >= segs.length) {
        idx.current = segs.length - 1;
        setIndex(segs.length - 1);
        setStatus('done');
        cueDone(p, live.current.doneSay);
        live.current.onDone?.();
        return;
      }
      endAt.current += segs[i].seconds * 1000;
      rem = endAt.current - t;
      changed = true;
    }
    if (changed) {
      idx.current = i;
      setIndex(i);
      lastSec.current = -1;
      cueChange(p, sayFor(segs[i]));
    } else {
      const sec = Math.ceil(rem / 1000);
      if (sec !== lastSec.current) {
        lastSec.current = sec;
        if (sec <= 3 && sec >= 1 && segs[i].seconds > 3) cueCount(p);
      }
    }
    setNow(t);
  }, []);

  useEffect(() => {
    if (status !== 'running') return;
    const id = window.setInterval(step, 200);
    const vis = () => { if (document.visibilityState === 'visible') step(); };
    document.addEventListener('visibilitychange', vis);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', vis); };
  }, [status, step]);

  // mantém a tela acesa enquanto conta (quando o aparelho permite)
  useEffect(() => {
    if (status !== 'running') return;
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, [status]);

  const start = () => {
    unlockAudio();
    if (status === 'done') { reset(); }
    const ms = status === 'done' ? (segments[0]?.seconds ?? 0) * 1000 : paused.current;
    endAt.current = Date.now() + ms;
    lastSec.current = -1;
    setNow(Date.now());
    setStatus('running');
    if (status === 'idle' && segments[0]?.kind !== 'prep') cueChange(prefs, sayFor(segments[0]));
  };
  const pause = () => {
    if (status !== 'running') return;
    paused.current = Math.max(0, endAt.current - Date.now());
    setStatus('paused');
  };
  const toggle = () => (status === 'running' ? pause() : start());
  /** Soma ou tira segundos da etapa atual. */
  const adjust = (deltaSec: number) => {
    if (status === 'running') endAt.current = Math.max(Date.now() + 1000, endAt.current + deltaSec * 1000);
    else if (status !== 'done') paused.current = Math.max(1000, paused.current + deltaSec * 1000);
    setNow(Date.now());
  };
  /** Pula para a próxima etapa. */
  const skip = () => {
    if (status === 'done') return;
    const next = idx.current + 1;
    if (next >= segments.length) {
      endAt.current = Date.now();
      if (status !== 'running') { setStatus('running'); }
      window.setTimeout(step, 0);
      return;
    }
    idx.current = next;
    setIndex(next);
    lastSec.current = -1;
    if (status === 'running') { endAt.current = Date.now() + segments[next].seconds * 1000; cueChange(prefs, sayFor(segments[next])); }
    else paused.current = segments[next].seconds * 1000;
    setNow(Date.now());
  };
  function reset() {
    idx.current = 0;
    setIndex(0);
    paused.current = (segments[0]?.seconds ?? 0) * 1000;
    lastSec.current = -1;
    setStatus('idle');
  }

  const seg = segments[index];
  const segTotal = (seg?.seconds ?? 0) * 1000;
  const elapsedBefore = segments.slice(0, index).reduce((t, s) => t + s.seconds * 1000, 0);
  const totalMs = segments.reduce((t, s) => t + s.seconds * 1000, 0);
  return {
    index, segment: seg, next: segments[index + 1], status,
    remaining: remainingMs / 1000,
    segProgress: segTotal ? 1 - remainingMs / segTotal : 1,
    totalLeft: Math.max(0, (totalMs - elapsedBefore - (segTotal - remainingMs)) / 1000),
    totalProgress: totalMs ? (elapsedBefore + segTotal - remainingMs) / totalMs : 1,
    start, pause, toggle, adjust, skip, reset,
  };
}
