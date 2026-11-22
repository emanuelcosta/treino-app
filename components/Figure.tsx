// Desenha uma pose (lib/illustrations) como SVG. Cores vêm do CSS (.fig ...), então funciona no tema claro e escuro.
import { useId } from 'react';
import { cw, FLOOR, L, solve } from '@/lib/illustrations/solve';
import type { Arrow, LimbKey, Pose, Prop, Pt } from '@/lib/illustrations/types';

const pt = (p: Pt) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

function PropShape({ p }: { p: Prop }) {
  switch (p.t) {
    case 'box': return <rect className="prop" x={p.x} y={p.y} width={p.w} height={p.h} rx={2} />;
    case 'wall': return <rect className="prop wall" x={p.x} y={0} width={400} height={FLOOR + 200} transform="translate(0 -200)" />;
    case 'panel': return <rect className="prop wall" x={40} y={4} width={140} height={FLOOR - 4} rx={3} />;
    case 'post': return <rect className="prop" x={p.x} y={-200} width={7} height={FLOOR + 200} />;
    case 'bar': return (<g className="prop-line"><line x1={p.x1} y1={p.y} x2={p.x2} y2={p.y} strokeWidth={4} /><line x1={p.x1} y1={0} x2={p.x1} y2={p.y} /><line x1={p.x2} y1={0} x2={p.x2} y2={p.y} /></g>);
    case 'table': return (<g><rect className="prop" x={p.x1} y={p.y} width={p.x2 - p.x1} height={5} /><rect className="prop" x={p.x1 + 4} y={p.y + 5} width={4} height={FLOOR - p.y - 5} /><rect className="prop" x={p.x2 - 8} y={p.y + 5} width={4} height={FLOOR - p.y - 5} /></g>);
    case 'chair': return (
      <g className="prop-line">
        <line x1={p.x} y1={p.seat} x2={p.x + p.w} y2={p.seat} strokeWidth={4} />
        <line x1={p.x} y1={p.seat} x2={p.x} y2={p.back} strokeWidth={4} />
        <line x1={p.x + 3} y1={p.seat} x2={p.x + 3} y2={FLOOR} /><line x1={p.x + p.w - 3} y1={p.seat} x2={p.x + p.w - 3} y2={FLOOR} />
      </g>);
    case 'mat': return <rect className="prop mat" x={p.x} y={p.y} width={p.w} height={p.h} rx={6} />;
    case 'towel': return <rect className="prop towel" x={p.x - 9} y={p.y} width={18} height={4} rx={2} />;
    case 'line': return <line className="guide" x1={p.from[0]} y1={p.from[1]} x2={p.to[0]} y2={p.to[1]} />;
  }
}

function ArrowShape({ a, marker }: { a: Arrow; marker: string }) {
  if ('c' in a) {
    const [cx, cy] = a.c; const rx = a.r, ry = a.ry ?? a.r;
    // arco de ~300° com ponta
    const t0 = -0.4, t1 = t0 + 5.3; // ~300°, no sentido horário
    const s: Pt = [cx + rx * Math.cos(t0), cy + ry * Math.sin(t0)];
    const e: Pt = [cx + rx * Math.cos(t1), cy + ry * Math.sin(t1)];
    return (<g><path className="arrow" d={`M${pt(s)} A${rx},${ry} 0 1 1 ${pt(e)}`} markerEnd={`url(#${marker})`} />{a.label && <text className="alabel" x={cx} y={cy - ry - 4} textAnchor="middle">{a.label}</text>}</g>);
  }
  const [x1, y1] = a.from, [x2, y2] = a.to;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const c: Pt = [(x1 + x2) / 2 + (-(y2 - y1) / len) * (a.bend ?? 0), (y1 + y2) / 2 + ((x2 - x1) / len) * (a.bend ?? 0)];
  return (<g><path className="arrow" d={`M${pt(a.from)} Q${pt(c)} ${pt(a.to)}`} markerEnd={`url(#${marker})`} />{a.label && <text className="alabel" x={c[0] + 6} y={c[1]}>{a.label}</text>}</g>);
}

export default function Figure({ pose, title, box }: { pose: Pose; title: string; box?: [number, number, number, number] }) {
  const s = solve(pose);
  const marker = `ah${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const front = pose.view === 'front';
  const hl = new Set<LimbKey>(pose.hl ?? []);
  const cls = (k: LimbKey, i: 0 | 1) => `limb ${hl.has(k) ? 'hl' : front || i === 0 ? 'near' : 'far'}`;

  const arm = (i: 0 | 1) => (
    <g className={cls(i === 0 ? 'arm0' : 'arm1', i)} key={`a${i}`}>
      <polyline points={[s.shoulders[i], s.elbows[i], s.hands[i]].map(pt).join(' ')} />
      {s.fingers[i] && <line className="fingers" x1={s.hands[i][0]} y1={s.hands[i][1]} x2={s.fingers[i]![0]} y2={s.fingers[i]![1]} />}
    </g>
  );
  const leg = (i: 0 | 1) => (
    <g className={cls(i === 0 ? 'leg0' : 'leg1', i)} key={`l${i}`}>
      <polyline points={[s.hips[i], s.knees[i], s.ankles[i], s.toes[i]].map(pt).join(' ')} />
    </g>
  );

  // rosto: olho(s) virados para a frente do boneco
  const fwd = cw([-s.neckDir[0], -s.neckDir[1]]); // perpendicular ao pescoço
  const face = pose.face === false ? null : front
    ? (<g className="eye"><circle cx={s.head[0] - 3.5} cy={s.head[1] - 1} r={1.5} /><circle cx={s.head[0] + 3.5} cy={s.head[1] - 1} r={1.5} /></g>)
    : (<circle className="eye" cx={s.head[0] - fwd[0] * 5 + s.neckDir[0] * 1.5} cy={s.head[1] - fwd[1] * 5 + s.neckDir[1] * 1.5} r={1.6} />);

  const body = (
    <g className="limb near torso">
      {front
        ? <path d={`M${pt(s.shoulders[0])} L${pt(s.shoulders[1])} M${pt(s.shoulder)} Q${pt(s.ctrl)} ${pt(s.hip)} M${pt(s.hips[0])} L${pt(s.hips[1])}`} />
        : <path d={`M${pt(s.shoulder)} Q${pt(s.ctrl)} ${pt(s.hip)}`} />}
      <line x1={s.shoulder[0]} y1={s.shoulder[1]} x2={s.shoulder[0] + s.neckDir[0] * L.neck} y2={s.shoulder[1] + s.neckDir[1] * L.neck} />
      <circle className="head" cx={s.head[0]} cy={s.head[1]} r={L.head} />
    </g>
  );

  return (
    <svg className="fig" viewBox={(box ?? [0, 0, 220, 180]).map((n) => n.toFixed(1)).join(' ')} role="img" aria-label={title}>
      <defs>
        <marker id={marker} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="arrowhead" />
        </marker>
      </defs>
      {(pose.props ?? []).filter((p) => p.t !== 'line').map((p, i) => <PropShape key={i} p={p} />)}
      {pose.floor !== false && <line className="floor" x1={-200} y1={FLOOR} x2={420} y2={FLOOR} />}
      {!front && leg(1)}
      {!front && arm(1)}
      {front && leg(0)}{front && leg(1)}
      {body}
      {face}
      {!front && leg(0)}
      {front ? <>{arm(0)}{arm(1)}</> : arm(0)}
      {(pose.props ?? []).filter((p) => p.t === 'line').map((p, i) => <PropShape key={`g${i}`} p={p} />)}
      {(pose.arrows ?? []).map((a, i) => <ArrowShape key={i} a={a} marker={marker} />)}
    </svg>
  );
}
