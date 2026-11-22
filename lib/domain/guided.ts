// Monta a sequência do treino guiado.
// - Circuito (seção de força): rodada 1 = 1 série de cada exercício; depois rodada 2, 3...
// - Demais itens: um passo por exercício; o guiado conta as séries dentro do passo.
import type { DayPlan, Exercise, Item } from '../data';
import { setsCount } from './prescription';

export const REST_BETWEEN_EXERCISES = 45;
export const REST_BETWEEN_ROUNDS = 90;

export type GuidedEntry = {
  key: string;
  section: string;
  item: Item;
  ex?: Exercise;
  /** descanso depois deste passo, em segundos (0 = sem descanso) */
  rest: number;
  /** só no circuito */
  round?: number;
  rounds?: number;
  /** último passo deste item: ao concluir, o item é marcado como feito */
  last: boolean;
};

export function buildGuidedEntries(plan: DayPlan, isPending: (uid: string) => boolean, findEx: (id?: string) => Exercise | undefined): GuidedEntry[] {
  const out: GuidedEntry[] = [];
  for (const sec of plan.sections) {
    const items = sec.items.filter((it) => isPending(it.uid!));
    if (!items.length) continue;

    if (!sec.log) {
      items.forEach((it) => out.push({ key: it.uid!, section: sec.title, item: it, ex: findEx(it.ex), rest: 0, last: true }));
      continue;
    }

    const rounds = Math.max(...items.map(setsCount));
    const circuit: GuidedEntry[] = [];
    for (let r = 1; r <= rounds; r++) {
      const inRound = items.filter((it) => setsCount(it) >= r);
      inRound.forEach((it, idx) => circuit.push({
        key: it.uid!, section: sec.title, item: it, ex: findEx(it.ex), round: r, rounds, last: r === setsCount(it),
        rest: idx === inRound.length - 1 ? REST_BETWEEN_ROUNDS : REST_BETWEEN_EXERCISES,
      }));
    }
    circuit[circuit.length - 1].rest = 0; // fim do circuito: segue direto
    out.push(...circuit);
  }
  return out;
}
