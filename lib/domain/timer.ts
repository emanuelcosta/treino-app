// Sequências de tempo: cronômetro dos exercícios (segurar X s, trocar de lado, descansar)
// e pomodoro de corrida/caminhada. Funções puras.
import type { Item } from '../data';
import { setsCount } from './prescription';

export type SegKind = 'prep' | 'hold' | 'switch' | 'rest' | 'warm' | 'work' | 'easy' | 'long' | 'cool';
export type Segment = { kind: SegKind; label: string; seconds: number; info?: string };

export const PREP_SECONDS = 5;
export const SWITCH_SECONDS = 5;
export const DEFAULT_REST = 15;

export const totalSeconds = (segs: Segment[]) => segs.reduce((t, s) => t + s.seconds, 0);

/** 75 -> "1:15"; 30 -> "0:30" */
export function clock(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** 30 -> "30 s"; 120 -> "2 min"; 90 -> "1 min 30 s" */
export function duration(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  if (!m) return `${s} s`;
  return s ? `${m} min ${s} s` : `${m} min`;
}

/** Para a voz: 90 -> "1 minuto e 30 segundos" */
export function spoken(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  const mm = m === 1 ? '1 minuto' : `${m} minutos`;
  const ss = s === 1 ? '1 segundo' : `${s} segundos`;
  if (!m) return ss;
  return s ? `${mm} e ${ss}` : mm;
}

const sideWord = (item: Item) => (/perna/i.test(item.reps ?? '') ? 'perna' : 'lado');
const sideName = (word: string, side: number) =>
  word === 'perna' ? (side === 1 ? 'Perna direita' : 'Perna esquerda') : side === 1 ? 'Lado direito' : 'Lado esquerdo';

/** Texto curto do cronômetro: "30 s", "30 s cada perna". */
export function holdLabel(item: Item): string {
  if (!item.hold) return '';
  return item.sides === 2 ? `${duration(item.hold)} cada ${sideWord(item)}` : duration(item.hold);
}

/**
 * Sequência do cronômetro de um exercício.
 * only: quais séries contar (no circuito, uma por rodada). Padrão: todas.
 */
export function buildHoldSegments(item: Item, only?: number[]): Segment[] {
  if (!item.hold) return [];
  const n = setsCount(item);
  const series = only ?? Array.from({ length: n }, (_, i) => i + 1);
  const sides = item.sides ?? 1;
  const word = sideWord(item);
  const out: Segment[] = [{ kind: 'prep', label: 'Prepare-se', seconds: PREP_SECONDS, info: 'Entre na posição' }];
  series.forEach((s, si) => {
    for (let side = 1; side <= sides; side++) {
      out.push(sides > 1
        ? { kind: 'hold', label: sideName(word, side), info: `Série ${s} de ${n}`, seconds: item.hold! }
        : { kind: 'hold', label: `Série ${s} de ${n}`, seconds: item.hold! });
      if (side < sides) out.push({ kind: 'switch', label: `Troque de ${word}`, seconds: SWITCH_SECONDS });
    }
    if (si < series.length - 1) out.push({ kind: 'rest', label: 'Descanso', seconds: item.rest ?? DEFAULT_REST, info: `Depois: série ${series[si + 1]} de ${n}` });
  });
  return out;
}

/** Um descanso avulso (entre exercícios de força, no guiado ou no botão Descanso). */
export const restSegments = (seconds: number, label = 'Descanse e respire', info?: string): Segment[] =>
  [{ kind: 'rest', label, seconds, info }];

// ---------------- Pomodoro de corrida/caminhada ----------------
// Blocos de esforço (ex.: correr 5 min) separados por pausas curtas; a cada N blocos, uma pausa longa.
export type Block = { label: string; seconds: number };
export type IntervalConfig = {
  warm: number; cool: number;
  /** quantos blocos de esforço */
  reps: number;
  work: Block;
  /** pausa curta entre os blocos */
  easy: Block;
  /** pausa longa a cada `longEvery` blocos (0 = nunca) */
  long: Block;
  longEvery: number;
};

export type IntervalPreset = { id: string; name: string; note: string; cfg: IntervalConfig };
const walkShort = (seconds: number): Block => ({ label: 'Pausa curta: caminhada', seconds });
const walkLong = (seconds: number): Block => ({ label: 'Pausa longa: caminhada', seconds });

export const INTERVAL_PRESETS: IntervalPreset[] = [
  { id: 'pomodoro', name: 'Pomodoro padrão', note: 'Corra 5 min e caminhe 1 min 30 s. A cada 4 blocos, pausa longa de 3 min.',
    cfg: { warm: 0, cool: 0, reps: 6, work: { label: 'Corrida leve', seconds: 300 }, easy: walkShort(90), long: walkLong(180), longEvery: 4 } },
  { id: 'caminhada-trote', name: 'Caminhada + trote', note: 'Para começar: 3 min de trote e 1 min de caminhada, com aquecimento e desaquecimento.',
    cfg: { warm: 300, cool: 300, reps: 6, work: { label: 'Trote leve', seconds: 180 }, easy: walkShort(60), long: walkLong(180), longEvery: 0 } },
  { id: 'trote-variado', name: 'Trote com variação', note: 'Trote leve e 1 min um pouco mais rápido (ainda conseguindo falar frases curtas).',
    cfg: { warm: 300, cool: 300, reps: 6, work: { label: 'Um pouco mais rápido', seconds: 60 }, easy: { label: 'Trote leve', seconds: 240 }, long: walkLong(180), longEvery: 0 } },
  { id: 'caminhada-ritmo', name: 'Caminhada com ritmo', note: 'Dia leve ou recuperação: caminhada rápida e caminhada leve.',
    cfg: { warm: 180, cool: 180, reps: 8, work: { label: 'Caminhada rápida', seconds: 120 }, easy: { label: 'Caminhada leve', seconds: 60 }, long: walkLong(180), longEvery: 0 } },
];
export const DEFAULT_INTERVALS = INTERVAL_PRESETS[0].cfg;

export function buildIntervalSegments(cfg: IntervalConfig): Segment[] {
  const out: Segment[] = [{ kind: 'prep', label: 'Prepare-se', seconds: PREP_SECONDS, info: 'Comece quando zerar' }];
  if (cfg.warm > 0) out.push({ kind: 'warm', label: 'Aquecimento: caminhada', seconds: cfg.warm });
  for (let r = 1; r <= cfg.reps; r++) {
    const info = `Bloco ${r} de ${cfg.reps}`;
    if (cfg.work.seconds > 0) out.push({ kind: 'work', label: cfg.work.label || 'Esforço', seconds: cfg.work.seconds, info });
    if (r === cfg.reps) break; // sem pausa depois do último bloco
    const isLong = cfg.longEvery > 0 && r % cfg.longEvery === 0 && cfg.long.seconds > 0;
    const pause = isLong ? cfg.long : cfg.easy;
    if (pause.seconds > 0) out.push({ kind: isLong ? 'long' : 'easy', label: pause.label || (isLong ? 'Pausa longa' : 'Pausa curta'), seconds: pause.seconds, info });
  }
  if (cfg.cool > 0) out.push({ kind: 'cool', label: 'Desaquecimento: caminhada', seconds: cfg.cool });
  return out;
}

/** Garante números válidos vindos do formulário (e completa configurações antigas). */
export function sanitizeIntervals(c: Partial<IntervalConfig>): IntervalConfig {
  const d = DEFAULT_INTERVALS;
  const n = (v: unknown, max: number) => Math.min(max, Math.max(0, Math.round(Number(v) || 0)));
  const block = (b: Partial<Block> | undefined, def: Block): Block =>
    ({ label: String(b?.label ?? def.label).slice(0, 40), seconds: n(b?.seconds ?? def.seconds, 3600) });
  return {
    warm: n(c.warm ?? d.warm, 3600), cool: n(c.cool ?? d.cool, 3600), reps: Math.max(1, n(c.reps ?? d.reps, 50)),
    work: block(c.work, d.work), easy: block(c.easy, d.easy), long: block(c.long, d.long),
    longEvery: n(c.longEvery ?? d.longEvery, 50),
  };
}
