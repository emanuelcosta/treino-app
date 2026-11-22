'use client';
// ViewModel da tela "Hoje": estado da tela + dados prontos para exibir + ações.
// A tela (components/Today.tsx) só desenha e chama estas ações; as regras ficam em lib/domain.
import { useState } from 'react';
import type { Exercise, Item } from '../data';
import { dayProgress, itemKeys, markItem, resolveDayPlan, setDayDone, setNote, toggleItem } from '../domain/day';
import { buildGuidedEntries, type GuidedEntry } from '../domain/guided';
import { dateKey, findEx, markExamDone, markHelpSeen, setPrefs, setWeek, type TimerPrefs } from '../domain/store';
import { addItem, moveItem, patchItem, removeItem, restoreDay } from '../domain/workoutEdit';
import { useStore } from '../useStore';

export function useTodayViewModel() {
  const { store, ready, update } = useStore();
  const [today] = useState(() => new Date());
  const todayDow = today.getDay();
  const [dow, setDow] = useState(todayDow);
  const [editing, setEditing] = useState(false);
  const [guided, setGuided] = useState<GuidedEntry[] | null>(null);
  const [pickerSection, setPickerSection] = useState<number | null>(null);
  const [timerAt, setTimerAt] = useState<{ si: number; ii: number } | null>(null);

  // ---- dados derivados ----
  const { plan, customized } = resolveDayPlan(store, dow);
  const date = dateKey(today);
  const isToday = dow === todayDow;
  const keys = itemKeys(plan);
  const done = store.done[date] ?? {};
  const notes = store.notes[date] ?? {};
  const progress = dayProgress(store, date, keys);
  const customizedDays = new Set(Object.keys(store.overrides).map(Number));
  const dateLabel = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  // No dia de hoje, o guiado pula o que já foi feito; nos outros dias mostra tudo (prévia).
  const guidedEntries = buildGuidedEntries(plan, (uid) => !done[uid] || !isToday, (id) => findEx(store, id));

  const isDone = (uid: string) => !!done[uid];
  const noteOf = (uid: string) => notes[uid] ?? '';
  const exerciseOf = (id?: string) => findEx(store, id);
  const timerItem = timerAt ? plan.sections[timerAt.si]?.items[timerAt.ii] : undefined;

  // ---- ações ----
  const selectDay = (d: number) => { setDow(d); setEditing(false); };
  const toggle = (uid: string) => update((s) => toggleItem(s, date, uid, keys.length));
  const markGuidedDone = (uid: string) => { if (isToday) update((s) => markItem(s, date, uid, keys.length)); };
  const toggleDayDone = () => update((s) => setDayDone(s, date, keys, !progress.dayDone));
  const writeNote = (uid: string, value: string) => update((s) => setNote(s, date, uid, value));
  const changePrefs = (p: Partial<TimerPrefs>) => update((s) => setPrefs(s, p));

  const edit = {
    patch: (si: number, ii: number, p: Partial<Item>) => update((s) => patchItem(s, dow, si, ii, p)),
    move: (si: number, ii: number, dir: -1 | 1) => update((s) => moveItem(s, dow, si, ii, dir)),
    remove: (si: number, ii: number) => update((s) => removeItem(s, dow, si, ii)),
    add: (si: number, item: Item, newEx?: Exercise) => { update((s) => addItem(s, dow, si, item, newEx)); setPickerSection(null); },
    restore: () => {
      if (window.confirm('Voltar este dia ao treino padrão? Suas mudanças neste dia serão perdidas.')) update((s) => restoreDay(s, dow));
    },
  };

  return {
    ready,
    // estado da tela
    dow, todayDow, isToday, editing, guided, pickerSection, dateLabel,
    // dados
    week: store.week, examDone: store.examDone, seenHelp: store.seenHelp, customExercises: store.custom,
    plan, customized, customizedDays, progress, guidedEntries,
    isDone, noteOf, exerciseOf, timerItem, prefs: store.prefs,
    // ações
    selectDay, toggleEditing: () => setEditing((e) => !e),
    changeWeek: (w: number) => update((s) => setWeek(s, w)),
    dismissWelcome: () => update(markHelpSeen),
    confirmExams: () => update(markExamDone),
    toggle, toggleDayDone, writeNote, markGuidedDone,
    startGuided: () => setGuided(guidedEntries), closeGuided: () => setGuided(null),
    openPicker: (si: number) => setPickerSection(si), closePicker: () => setPickerSection(null),
    openTimer: (si: number, ii: number) => setTimerAt({ si, ii }), closeTimer: () => setTimerAt(null),
    changePrefs,
    edit,
  };
}

