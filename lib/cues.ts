'use client';
// Avisos dos cronômetros: bipes (Web Audio), vibração e voz (pt-BR). Tudo opcional e tolerante a falhas.
let ctx: AudioContext | null = null;

/** Precisa ser chamado num toque do usuário (ex.: botão Iniciar) para o navegador liberar o som. */
export function unlockAudio() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    void ctx.resume();
  } catch {}
}

function tone(freq: number, ms: number, at = 0, vol = 0.25) {
  if (!ctx) return;
  try {
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + ms / 1000 + 0.02);
  } catch {}
}

export type CuePrefs = { sound: boolean; voice: boolean; vibrate: boolean };

/** 3, 2, 1... */
export function cueCount(p: CuePrefs) {
  if (p.sound) tone(880, 110);
  if (p.vibrate) try { navigator.vibrate?.(60); } catch {}
}

/** Mudou de etapa. */
export function cueChange(p: CuePrefs, say?: string) {
  if (p.sound) { tone(660, 160); tone(990, 260, 0.18); }
  if (p.vibrate) try { navigator.vibrate?.([220, 90, 220]); } catch {}
  if (p.voice && say) speak(say);
}

/** Terminou tudo. */
export function cueDone(p: CuePrefs, say = 'Concluído') {
  if (p.sound) { tone(660, 150); tone(880, 150, 0.17); tone(1175, 380, 0.34); }
  if (p.vibrate) try { navigator.vibrate?.([300, 120, 300, 120, 500]); } catch {}
  if (p.voice) speak(say);
}

export function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    const v = synth.getVoices().find((x) => x.lang?.toLowerCase().startsWith('pt'));
    if (v) u.voice = v;
    synth.speak(u);
  } catch {}
}
