// Calcula as articulações do boneco a partir da pose (cinemática direta e inversa de 2 segmentos).
import type { Limb, Pose, Pt } from './types';

export const FLOOR = 170;
export const L = { torso: 40, neck: 5, head: 9, upperArm: 25, forearm: 23, thigh: 34, shin: 34, shoulderW: 11, hipW: 7 };

const rad = (d: number) => (d * Math.PI) / 180;
export const dir = (deg: number): Pt => [Math.sin(rad(deg)), Math.cos(rad(deg))];
const add = (p: Pt, v: Pt, k = 1): Pt => [p[0] + v[0] * k, p[1] + v[1] * k];
/** gira 90° no sentido horário (na tela): para frente do rosto, ombros na vista de frente */
export const cw = (v: Pt): Pt => [-v[1], v[0]];

function ik(s: Pt, e: Pt, l1: number, l2: number, bend: number): [Pt, Pt] {
  let dx = e[0] - s[0], dy = e[1] - s[1];
  let d = Math.hypot(dx, dy) || 0.001;
  let end = e;
  const max = l1 + l2 - 0.01;
  if (d > max) { end = [s[0] + (dx / d) * max, s[1] + (dy / d) * max]; dx = end[0] - s[0]; dy = end[1] - s[1]; d = max; }
  d = Math.max(d, Math.abs(l1 - l2) + 0.01);
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = dx / d, uy = dy / d;
  return [[s[0] + ux * a - uy * h * bend, s[1] + uy * a + ux * h * bend], end];
}

function limb(start: Pt, spec: Limb, l1: number, l2: number, defBend: 1 | -1): [Pt, Pt] {
  if (Array.isArray(spec)) return ik(start, spec, l1, l2, defBend);
  if ('to' in spec) return ik(start, spec.to, l1, l2, spec.bend ?? defBend);
  const j = add(start, dir(spec.a[0]), l1);
  return [j, add(j, dir(spec.a[1]), l2)];
}

export type Solved = {
  hip: Pt; shoulder: Pt; ctrl: Pt; head: Pt; neckDir: Pt;
  shoulders: [Pt, Pt]; hips: [Pt, Pt];
  elbows: [Pt, Pt]; hands: [Pt, Pt]; knees: [Pt, Pt]; ankles: [Pt, Pt]; toes: [Pt, Pt];
  fingers: [Pt | null, Pt | null];
};

/** Área ocupada por todos os quadros de um exercício (para dar zoom igual em todos). */
export function fitBox(poses: Pose[], pad = 10): [number, number, number, number] {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  const take = (p: Pt, r = 0) => { x1 = Math.min(x1, p[0] - r); y1 = Math.min(y1, p[1] - r); x2 = Math.max(x2, p[0] + r); y2 = Math.max(y2, p[1] + r); };
  for (const pose of poses) {
    const s = solve(pose);
    take(s.head, L.head);
    [s.shoulder, s.hip, ...s.elbows, ...s.hands, ...s.knees, ...s.ankles, ...s.toes].forEach((q) => take(q, 4));
    s.fingers.forEach((f) => f && take(f, 3));
    for (const a of pose.arrows ?? []) {
      if ('c' in a) { take([a.c[0] - a.r, a.c[1] - (a.ry ?? a.r) - (a.label ? 14 : 0)]); take([a.c[0] + a.r, a.c[1] + (a.ry ?? a.r)]); }
      else { take(a.from, 4); take(a.to, 4); if (a.label) take([Math.max(a.from[0], a.to[0]) + 30, (a.from[1] + a.to[1]) / 2]); }
    }
    for (const pr of pose.props ?? []) {
      if (pr.t === 'box' || pr.t === 'mat') { take([pr.x, pr.y]); take([pr.x + pr.w, pr.y + pr.h]); }
      else if (pr.t === 'bar' || pr.t === 'table') { take([pr.x1, pr.y - 4]); take([pr.x2, pr.y]); }
      else if (pr.t === 'chair') { take([pr.x, pr.back]); take([pr.x + pr.w, pr.seat]); }
      else if (pr.t === 'wall' || pr.t === 'post') { take([pr.x - 2, y1]); take([pr.x + 12, y1]); }
      else if (pr.t === 'line') { take(pr.from); take(pr.to); }
      else if (pr.t === 'towel') take([pr.x, pr.y + 4]);
    }
    if (pose.floor !== false) take([x1, FLOOR + 2]);
  }
  x1 -= pad; y1 -= pad; x2 += pad; y2 += pad;
  // proporção entre 1,1 e 2,2 (nem muito alto, nem muito achatado)
  let w = x2 - x1, h = y2 - y1;
  const minW = h * 1.1, maxW = h * 2.2;
  if (w < minW) { x1 -= (minW - w) / 2; w = minW; }
  if (w > maxW) { const nh = w / 2.2; y1 -= nh - h; h = nh; }
  return [x1, y1, w, h];
}

export function solve(p: Pose): Solved {
  const front = p.view === 'front';
  const td = dir(p.torso);
  const shoulder = add(p.hip, td, L.torso);
  const mid: Pt = [(p.hip[0] + shoulder[0]) / 2, (p.hip[1] + shoulder[1]) / 2];
  const ctrl = add(mid, cw(td), p.curve ?? 0);
  const neckDir = dir(p.neck ?? p.torso);
  const head = add(shoulder, neckDir, L.neck + L.head);

  const side = cw(td);
  const shoulders: [Pt, Pt] = front ? [add(shoulder, side, -L.shoulderW), add(shoulder, side, L.shoulderW)] : [shoulder, shoulder];
  const hips: [Pt, Pt] = front ? [add(p.hip, side, -L.hipW), add(p.hip, side, L.hipW)] : [p.hip, p.hip];

  const a0 = limb(shoulders[0], p.arms[0], L.upperArm, L.forearm, 1);
  const a1 = limb(shoulders[1], p.arms[1], L.upperArm, L.forearm, 1);
  const l0 = limb(hips[0], p.legs[0], L.thigh, L.shin, -1);
  const l1 = limb(hips[1], p.legs[1], L.thigh, L.shin, -1);

  const defFoot = (i: number): Pt => (front ? [i === 0 ? -6 : 6, 3] : [10, 3]);
  const toes: [Pt, Pt] = [0, 1].map((i) => add(i === 0 ? l0[1] : l1[1], p.feet?.[i] ?? defFoot(i))) as [Pt, Pt];
  const hands: [Pt, Pt] = [a0[1], a1[1]];
  const fingers = [0, 1].map((i) => {
    const f = p.fingers?.[i];
    return f === null || f === undefined ? null : add(hands[i], dir(f), 9);
  }) as [Pt | null, Pt | null];

  return {
    hip: p.hip, shoulder, ctrl, head, neckDir, shoulders, hips,
    elbows: [a0[0], a1[0]], hands, knees: [l0[0], l1[0]], ankles: [l0[1], l1[1]], toes, fingers,
  };
}
