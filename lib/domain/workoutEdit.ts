// Edição do treino de um dia da semana. Sempre imutável: devolve um Store novo.
import type { Exercise, Item, Section } from '../data';
import { currentSections } from './day';
import { addCustomExercise, type Store } from './store';

function editSections(s: Store, dow: number, fn: (secs: Section[]) => Section[]): Store {
  return { ...s, overrides: { ...s.overrides, [String(dow)]: fn(currentSections(s, dow)) } };
}

const editSection = (s: Store, dow: number, si: number, fn: (sec: Section) => Section): Store =>
  editSections(s, dow, (secs) => secs.map((sec, i) => (i === si ? fn(sec) : sec)));

export const patchItem = (s: Store, dow: number, si: number, ii: number, patch: Partial<Item>): Store =>
  editSection(s, dow, si, (sec) => ({ ...sec, items: sec.items.map((it, i) => (i === ii ? { ...it, ...patch } : it)) }));

export const moveItem = (s: Store, dow: number, si: number, ii: number, dir: -1 | 1): Store =>
  editSection(s, dow, si, (sec) => {
    const j = ii + dir;
    if (j < 0 || j >= sec.items.length) return sec;
    const items = [...sec.items];
    [items[ii], items[j]] = [items[j], items[ii]];
    return { ...sec, items };
  });

export const removeItem = (s: Store, dow: number, si: number, ii: number): Store =>
  editSection(s, dow, si, (sec) => ({ ...sec, items: sec.items.filter((_, i) => i !== ii) }));

/** Adiciona um item à seção. Se vier um exercício novo (criado pelo usuário), salva na biblioteca também. */
export function addItem(s: Store, dow: number, si: number, item: Item, newEx?: Exercise, uid = `n${Date.now().toString(36)}`): Store {
  const withEx = newEx ? addCustomExercise(s, newEx) : s;
  return editSection(withEx, dow, si, (sec) => ({ ...sec, items: [...sec.items, { ...item, uid }] }));
}

/** Volta o dia ao treino padrão. */
export function restoreDay(s: Store, dow: number): Store {
  const overrides = { ...s.overrides };
  delete overrides[String(dow)];
  return { ...s, overrides };
}
