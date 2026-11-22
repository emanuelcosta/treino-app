// Edição do treino de um dia. Vale para todos os dias com o mesmo papel (ex.: todas as corridas leves).
// Sempre imutável: devolve um Store novo. A seção da corrida não é editável (vem do plano).
import type { Exercise, Item, Section } from '../data';
import { resolveDayPlan } from './day';
import { addCustomExercise, type Store } from './store';

function editSections(s: Store, date: string, today: string, fn: (secs: Section[]) => Section[]): Store {
  const r = resolveDayPlan(s, date, today);
  return { ...s, overrides: { ...s.overrides, [r.key]: fn(r.plan.sections) } };
}

const editSection = (s: Store, date: string, today: string, si: number, fn: (sec: Section) => Section): Store =>
  editSections(s, date, today, (secs) => secs.map((sec, i) => (i === si && sec.id !== 'corrida' ? fn(sec) : sec)));

export const patchItem = (s: Store, date: string, today: string, si: number, ii: number, patch: Partial<Item>): Store =>
  editSection(s, date, today, si, (sec) => ({ ...sec, items: sec.items.map((it, i) => (i === ii ? { ...it, ...patch } : it)) }));

export const moveItem = (s: Store, date: string, today: string, si: number, ii: number, dir: -1 | 1): Store =>
  editSection(s, date, today, si, (sec) => {
    const j = ii + dir;
    if (j < 0 || j >= sec.items.length) return sec;
    const items = [...sec.items];
    [items[ii], items[j]] = [items[j], items[ii]];
    return { ...sec, items };
  });

export const removeItem = (s: Store, date: string, today: string, si: number, ii: number): Store =>
  editSection(s, date, today, si, (sec) => ({ ...sec, items: sec.items.filter((_, i) => i !== ii) }));

/** Adiciona um item à seção. Se vier um exercício novo (criado pelo usuário), salva na biblioteca também. */
export function addItem(s: Store, date: string, today: string, si: number, item: Item, newEx?: Exercise, uid = `n${Date.now().toString(36)}`): Store {
  const withEx = newEx ? addCustomExercise(s, newEx) : s;
  return editSection(withEx, date, today, si, (sec) => ({ ...sec, items: [...sec.items, { ...item, uid }] }));
}

/** Volta este tipo de dia ao treino padrão. */
export function restoreDay(s: Store, date: string, today: string): Store {
  const { key } = resolveDayPlan(s, date, today);
  const overrides = { ...s.overrides };
  delete overrides[key];
  return { ...s, overrides };
}
