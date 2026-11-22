'use client';
// ViewModel da tela "Hoje": estado da tela + dados prontos para exibir + ações.
// A tela (components/Today.tsx) só desenha e chama estas ações; as regras ficam em lib/domain.
import { useMemo, useState } from 'react';
import type { Exercise, Item } from '../data';
import { addDays, dateKey, dowOf, mondayOf } from '../domain/dates';
import { dayProgress, itemKeys, markItem, resolveDayPlan, setDayDone, setNote, toggleItem } from '../domain/day';
import { buildGuidedEntries, type GuidedEntry } from '../domain/guided';
import { calOf, decisionAt, planWeekAt, weekHasLogs, workoutsOn, type LogInput, type WeekDecision, type Workout } from '../domain/runPlan';
import { findEx, markExamDone, markHelpSeen, planCtx, saveRunLog, setPrefs, setWeekDecision, type TimerPrefs } from '../domain/store';
import { addItem, moveItem, patchItem, removeItem, restoreDay } from '../domain/workoutEdit';
import { useStore } from '../useStore';

export function useTodayViewModel() {
  const { store, ready, update } = useStore();
  const [now] = useState(() => new Date());
  const today = dateKey(now);
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(mondayOf(today), i)), [today]);
  const [date, setDate] = useState(today);
  const [editing, setEditing] = useState(false);
  const [guided, setGuided] = useState<GuidedEntry[] | null>(null);
  const [pickerSection, setPickerSection] = useState<number | null>(null);
  const [timerAt, setTimerAt] = useState<{ si: number; ii: number } | null>(null);

  // ---- dados derivados ----
  const ctx = planCtx(store, today);
  const day = resolveDayPlan(store, date, today);
  const { plan, customized } = day;
  const isToday = date === today;
  const keys = itemKeys(plan);
  const done = store.done[date] ?? {};
  const notes = store.notes[date] ?? {};
  const progress = dayProgress(store, date, keys);
  const runs = workoutsOn(ctx, date);
  const todayPos = date === today ? day : resolveDayPlan(store, today, today);
  const dateLabel = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  // No dia de hoje, o guiado pula o que já foi feito; nos outros dias mostra tudo (prévia).
  const guidedEntries = buildGuidedEntries(plan, (uid) => !done[uid] || !isToday, (id) => findEx(store, id));

  // Semana nova sem decisão: o usuário confirma se avança, repete ou pausa (nada muda sozinho).
  const todayCal = calOf(store.run, today);
  const cur = decisionAt(ctx, todayCal);
  const needsDecision = todayCal >= 1 && cur.auto && !weekHasLogs(store.runLogs, todayCal) && todayPos.phase !== 'depois';
  const prevWeek = todayCal >= 1 ? planWeekAt(ctx, todayCal - 1) : null;

  const timerItem = timerAt ? plan.sections[timerAt.si]?.items[timerAt.ii] : undefined;
  const isDone = (uid: string) => !!done[uid];
  const noteOf = (uid: string) => notes[uid] ?? '';
  const exerciseOf = (id?: string) => findEx(store, id);

  // ---- ações ----
  const selectDate = (d: string) => { setDate(d); setEditing(false); };
  const toggle = (uid: string) => update((s) => toggleItem(s, date, uid, keys));
  const markGuidedDone = (uid: string) => { if (isToday && keys.includes(uid)) update((s) => markItem(s, date, uid, keys)); };
  const toggleDayDone = () => update((s) => setDayDone(s, date, keys, !progress.dayDone));
  const writeNote = (uid: string, value: string) => update((s) => setNote(s, date, uid, value));
  const changePrefs = (p: Partial<TimerPrefs>) => update((s) => setPrefs(s, p));
  const saveRun = (w: Workout, input: LogInput) => update((s) => saveRunLog(s, w, input, today));
  const decideWeek = (d: WeekDecision) => update((s) => setWeekDecision(s, todayCal, d));

  const edit = {
    patch: (si: number, ii: number, p: Partial<Item>) => update((s) => patchItem(s, date, today, si, ii, p)),
    move: (si: number, ii: number, dir: -1 | 1) => update((s) => moveItem(s, date, today, si, ii, dir)),
    remove: (si: number, ii: number) => update((s) => removeItem(s, date, today, si, ii)),
    add: (si: number, item: Item, newEx?: Exercise) => { update((s) => addItem(s, date, today, si, item, newEx)); setPickerSection(null); },
    restore: () => {
      if (window.confirm('Voltar este tipo de dia ao treino padrão? Suas mudanças nele serão perdidas.')) update((s) => restoreDay(s, date, today));
    },
  };

  return {
    ready,
    // estado da tela
    today, date, dow: dowOf(date), weekDates, isToday, editing, guided, pickerSection, dateLabel,
    // dados
    examDone: store.examDone, seenHelp: store.seenHelp, customExercises: store.custom, settings: store.run, runLogs: store.runLogs,
    plan, customized, progress, guidedEntries, role: day.role, week: day.week, phase: day.phase,
    todayWeek: todayPos.week, todayPhase: todayPos.phase, needsDecision, suggestion: cur.decision, prevWeek,
    runs, isDone, noteOf, exerciseOf, timerItem, prefs: store.prefs,
    // ações
    selectDate, toggleEditing: () => setEditing((e) => !e),
    dismissWelcome: () => update(markHelpSeen),
    confirmExams: () => update(markExamDone),
    toggle, toggleDayDone, writeNote, markGuidedDone, saveRun, decideWeek,
    startGuided: () => setGuided(guidedEntries), closeGuided: () => setGuided(null),
    openPicker: (si: number) => setPickerSection(si), closePicker: () => setPickerSection(null),
    openTimer: (si: number, ii: number) => setTimerAt({ si, ii }), closeTimer: () => setTimerAt(null),
    changePrefs,
    edit,
  };
}
