'use client';
import { useState } from 'react';
import Link from 'next/link';
import { DAY_NAMES, DAY_SHORT, DELOAD_WEEK, PLAN_LENGTH, type Exercise, type Item } from '@/lib/data';
import { parseDate, shortDate } from '@/lib/domain/dates';
import { parseSetsInput, prescription } from '@/lib/domain/prescription';
import { holdLabel } from '@/lib/domain/timer';
import type { Workout } from '@/lib/domain/runPlan';
import { useTodayViewModel } from '@/lib/viewmodels/useTodayViewModel';
import ExerciseDetail from './ExerciseDetail';
import ExercisePicker from './ExercisePicker';
import GuidedMode from './GuidedMode';
import HoldTimerModal from './HoldTimerModal';
import RestTimer from './RestTimer';
import RunWorkoutCard from './RunWorkoutCard';

function ItemRow(p: {
  item: Item; ex?: Exercise; checked: boolean; disabled: boolean; checkable: boolean; withLog: boolean; note: string;
  editing: boolean; first: boolean; last: boolean;
  onToggle: () => void; onNote: (v: string) => void; onPatch: (patch: Partial<Item>) => void;
  onMove: (dir: -1 | 1) => void; onRemove: () => void; onTimer: () => void;
}) {
  const { item, ex, checked, disabled, withLog, note, editing } = p;
  const [open, setOpen] = useState(false);
  const name = item.title ?? ex?.name ?? '';
  const presc = prescription(item);

  if (editing) {
    return (
      <li className="item editing">
        <div className="itembody">
          {ex ? <div className="itemtitle">{name}</div>
              : <input className="note" value={item.title ?? ''} onChange={(e) => p.onPatch({ title: e.target.value })} aria-label="Título" placeholder="Título" />}
          <div className="setfields">
            <label>Séries<input className="note" inputMode="numeric" value={item.sets === undefined ? '' : String(item.sets)} onChange={(e) => p.onPatch({ sets: parseSetsInput(e.target.value) })} aria-label={`Número de séries de ${name}`} placeholder="3" /></label>
            <label>Em cada série<input className="note" value={item.reps ?? ''} onChange={(e) => p.onPatch({ reps: e.target.value })} aria-label={`Quantidade por série de ${name}`} placeholder="12 repetições ou 30 s" /></label>
          </div>
          <div className="setfields">
            <label>Cronômetro (segundos)<input className="note" inputMode="numeric" value={item.hold ?? ''} onChange={(e) => { const v = parseInt(e.target.value, 10); p.onPatch({ hold: v > 0 ? Math.min(v, 3600) : undefined }); }} aria-label={`Segundos do cronômetro de ${name}`} placeholder="Ex.: 30 (vazio = sem cronômetro)" /></label>
            <label className="checkline"><input type="checkbox" checked={item.sides === 2} onChange={(e) => p.onPatch({ sides: e.target.checked ? 2 : undefined })} aria-label={`Contar cada lado de ${name}`} /> Contar cada lado</label>
          </div>
          <input className="note" value={item.detail} onChange={(e) => p.onPatch({ detail: e.target.value })} aria-label={`Observação de ${name}`} placeholder="Observação (opcional)" />
          <div className="editbtns">
            <button className="btn" onClick={() => p.onMove(-1)} disabled={p.first} aria-label={`Subir ${name}`}>↑ Subir</button>
            <button className="btn" onClick={() => p.onMove(1)} disabled={p.last} aria-label={`Descer ${name}`}>↓ Descer</button>
            <button className="btn danger" onClick={p.onRemove} aria-label={`Remover ${name}`}>Remover</button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={`item ${checked && p.checkable ? 'done' : ''}`}>
      {p.checkable ? (
        <button className="check" onClick={p.onToggle} disabled={disabled} aria-pressed={checked} aria-label={`${checked ? 'Desmarcar' : 'Marcar'}: ${name}`}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
        </button>
      ) : <span className="checkspace" aria-hidden="true" />}
      <div className="itembody">
        <div className="itemtitle">{name}{item.optional && <span className="tag">opcional</span>}{ex?.custom && <span className="tag">meu</span>}</div>
        {presc && <div className="itempresc">{presc}</div>}
        {item.detail && <div className="itemdetail">{item.detail}</div>}
        {item.hold ? (
          <button className="btn timerbtn" onClick={p.onTimer} aria-label={`Cronômetro de ${name}: ${holdLabel(item)}`}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 9v4l2.5 2M9 2h6M12 5a8 8 0 1 0 0 16a8 8 0 0 0 0-16" /></svg>
            Cronômetro · {holdLabel(item)}
          </button>
        ) : null}
        {ex && (
          <button className="link" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? 'Ocultar' : 'Como fazer + vídeo'}
          </button>
        )}
        {withLog && !disabled && (
          <input className="note" value={note} onChange={(e) => p.onNote(e.target.value)} placeholder="Anotar (repetições, variação)" aria-label={`Anotação: ${name}`} />
        )}
        {open && ex && <ExerciseDetail ex={ex} compact />}
      </div>
    </li>
  );
}

export default function Today() {
  const vm = useTodayViewModel();
  if (!vm.ready) return <div className="muted">Carregando…</div>;

  const { plan, isToday, editing, customized, progress } = vm;
  const dayLabel = plan.name.toLowerCase();
  const weekText = vm.todayPhase === 'antes' ? `Plano de 10 km começa em ${shortDate(vm.settings.startDate)}`
    : vm.todayPhase === 'depois' ? 'Plano de 10 km concluído'
    : vm.todayPhase === 'pausa' ? 'Plano de 10 km: semana de pausa'
    : `Plano de 10 km · semana ${vm.todayWeek} de ${PLAN_LENGTH}${vm.todayWeek === DELOAD_WEEK ? ' (descarga)' : ''}`;
  const runCard = (w: Workout) => <RunWorkoutCard key={w.id} w={w} log={vm.runLogs[w.id]} today={vm.today} onSave={(input) => vm.saveRun(w, input)} />;

  return (
    <>
      <header className="top">
        <div>
          <p className="muted small cap">{vm.dateLabel}</p>
          <h1>{isToday ? 'Hoje' : plan.name}: {plan.title}</h1>
          <p className="muted">{plan.subtitle}</p>
        </div>
        <div className="side">
          <Link href="/semana" className="weekpill">{weekText}</Link>
          <Link href="/ajuda" className="small">Como usar</Link>
        </div>
      </header>

      {!vm.settings.confirmed && (
        <div className="welcome">
          <h2>Seu plano de 10 km em 8 semanas</h2>
          <p>Corrida leve na terça, corrida com variação na quinta, longão no domingo e regenerativo opcional no sábado. Fortalecimento na segunda e na sexta. Começa em {shortDate(vm.settings.startDate)}.</p>
          <div className="row"><Link href="/semana#configurar" className="btn primary">Revisar dias e ritmos</Link></div>
        </div>
      )}

      {vm.needsDecision && vm.prevWeek !== null && (
        <div className="notice decision" role="region" aria-label="Confirmar semana">
          <p><b>Nova semana.</b> {vm.suggestion === 'repeat'
            ? `A semana ${vm.prevWeek} ficou incompleta (menos de 2 corridas ou sem longão). Sugestão: repetir a semana ${vm.prevWeek}.`
            : `Sugestão: avançar para a semana ${Math.min(vm.prevWeek + 1, PLAN_LENGTH)}.`} Você decide:</p>
          <div className="row">
            {vm.prevWeek < PLAN_LENGTH && <button className={vm.suggestion === 'next' ? 'btn primary' : 'btn'} onClick={() => vm.decideWeek('next')}>Avançar para a semana {vm.prevWeek + 1}</button>}
            <button className={vm.suggestion === 'repeat' ? 'btn primary' : 'btn'} onClick={() => vm.decideWeek('repeat')}>Repetir a semana {vm.prevWeek}</button>
            <button className="btn" onClick={() => vm.decideWeek('pause')}>Pausar esta semana</button>
          </div>
        </div>
      )}

      {!vm.seenHelp && (
        <div className="welcome">
          <h2>Bem-vindo! Como funciona</h2>
          <ol className="steps">
            <li>Veja o treino do dia. Use as abas Seg a Dom para espiar os outros dias.</li>
            <li>Toque em <b>Como fazer + vídeo</b> para aprender cada exercício passo a passo.</li>
            <li>Toque em <b>Iniciar treino guiado</b> para fazer um exercício de cada vez, com descanso automático.</li>
            <li>Marque o que fez e registre a corrida (distância, tempo e esforço). Quer mudar o treino? Toque em <b>Editar treino</b>.</li>
          </ol>
          <div className="row">
            <button className="btn primary" onClick={vm.dismissWelcome}>Entendi</button>
            <Link href="/ajuda" className="btn">Ver o guia completo</Link>
          </div>
        </div>
      )}

      <div className="days" role="tablist" aria-label="Dia da semana">
        {vm.weekDates.map((d) => {
          const dow = parseDate(d).getDay();
          return (
            <button key={d} role="tab" aria-selected={vm.date === d} aria-label={`${DAY_NAMES[dow]} ${shortDate(d)}`}
              className={`day ${vm.date === d ? 'sel' : ''} ${d === vm.today ? 'today' : ''}`} onClick={() => vm.selectDate(d)}>
              {DAY_SHORT[dow]}<span className="daynum">{d.slice(8, 10)}</span>
            </button>
          );
        })}
      </div>

      {!isToday && <p className="preview">Prévia de {dayLabel}, {shortDate(vm.date)}. Você marca os exercícios no próprio dia{vm.runs.here.length ? '; a corrida pode ser registrada depois' : ''}.</p>}
      {customized && <p className="preview">Treino personalizado por você. <button className="link" onClick={vm.edit.restore}>Restaurar padrão</button></p>}

      <div className="actions">
        <button className="btn primary" onClick={vm.startGuided} disabled={vm.guidedEntries.length === 0 || editing}>
          {isToday ? 'Iniciar treino guiado' : 'Ver passo a passo'}
        </button>
        <button className="btn" onClick={vm.toggleEditing}>{editing ? 'Concluir edição' : 'Editar treino'}</button>
        {isToday && !editing && progress.total > 0 && (
          <button className={progress.dayDone ? 'btn' : 'btn ok'} onClick={vm.toggleDayDone}>{progress.dayDone ? 'Desmarcar dia' : 'Marcar dia como feito'}</button>
        )}
      </div>

      {editing && (
        <p className="preview">Modo edição: mude repetições, a ordem, remova ou adicione exercícios. As mudanças valem para todo dia de &quot;{plan.title.toLowerCase()}&quot;. A corrida vem do plano e muda a cada semana.</p>
      )}

      {isToday && !editing && progress.total > 0 && (
        <div className="progress" aria-label={`Progresso do dia: ${progress.pct}%`}>
          <div className="bar"><div style={{ width: `${progress.pct}%` }} /></div>
          <span className="small">{progress.dayDone ? 'Exercícios do dia concluídos ✓' : `${progress.doneCount} de ${progress.total} exercícios · ${progress.pct}%`}</span>
        </div>
      )}

      {plan.kind === 'corrida' && !vm.examDone && !editing && (
        <div className="notice">
          <p><b>Antes de aumentar a carga:</b> faça o eletrocardiograma e o ecocardiograma com um cardiologista ou médico do esporte. Até lá, ritmo de conversa e sem esforço máximo. Pare e procure atendimento se sentir dor no peito, tontura forte, desmaio ou palpitação fora do normal.</p>
          <button onClick={vm.confirmExams}>Já fiz os exames</button>
        </div>
      )}

      {vm.runs.movedIn.length > 0 && !editing && (
        <section className="card">
          <h2>Treino remarcado para este dia</h2>
          {vm.runs.movedIn.map(runCard)}
        </section>
      )}

      {plan.sections.map((sec, si) => {
        const isRun = sec.id === 'corrida';
        const runHere = isRun ? [...vm.runs.here, ...vm.runs.movedAway] : [];
        return (
          <section key={sec.id} className="card">
            <h2>{sec.title}</h2>
            {sec.subtitle && <p className="muted small">{sec.subtitle}</p>}
            {isRun && !editing && runHere.map(runCard)}
            {isRun && !editing && runHere.length === 0 && vm.phase !== 'plano' && (
              <p className="muted small">{vm.phase === 'antes' ? 'O plano ainda não começou: este é só um exemplo da semana 1.' : vm.phase === 'pausa' ? 'Semana de pausa: sem corrida do plano.' : 'Plano concluído. Configure um novo início na tela Semana.'}</p>
            )}
            {isRun && editing && <p className="muted small">A corrida vem do plano e não é editada aqui. Para mudar o dia, use a tela Semana.</p>}
            <ul className="items">
              {sec.items.map((item, ii) => (
                <ItemRow key={item.uid} item={item} ex={vm.exerciseOf(item.ex)} checked={vm.isDone(item.uid!)} disabled={!isToday}
                  checkable={!isRun} withLog={!!sec.log} note={vm.noteOf(item.uid!)} editing={editing && !isRun} first={ii === 0} last={ii === sec.items.length - 1}
                  onToggle={() => vm.toggle(item.uid!)} onNote={(v) => vm.writeNote(item.uid!, v)} onPatch={(pt) => vm.edit.patch(si, ii, pt)}
                  onMove={(dir) => vm.edit.move(si, ii, dir)} onRemove={() => vm.edit.remove(si, ii)} onTimer={() => vm.openTimer(si, ii)} />
              ))}
            </ul>
            {editing && !isRun && <button className="btn add" onClick={() => vm.openPicker(si)}>+ Adicionar exercício</button>}
            {isRun && !editing && plan.kind === 'corrida' && (
              <Link href="/pomodoro" className="btn intervalbtn">Abrir pomodoro: correr e caminhar em blocos</Link>
            )}
          </section>
        );
      })}

      {editing && customized && <button className="btn danger" onClick={vm.edit.restore}>Restaurar treino padrão deste dia</button>}

      {plan.kind === 'forca' && isToday && !editing && <RestTimer prefs={vm.prefs} />}
      {vm.pickerSection !== null && (
        <ExercisePicker custom={vm.customExercises} onAdd={(item, nx) => vm.edit.add(vm.pickerSection!, item, nx)} onClose={vm.closePicker} />
      )}
      {vm.guided && <GuidedMode entries={vm.guided} onDone={vm.markGuidedDone} onClose={vm.closeGuided} prefs={vm.prefs} onPrefs={vm.changePrefs} />}
      {vm.timerItem && (
        <HoldTimerModal item={vm.timerItem} name={vm.timerItem.title ?? vm.exerciseOf(vm.timerItem.ex)?.name ?? ''} prefs={vm.prefs} onPrefs={vm.changePrefs}
          onDone={() => vm.markGuidedDone(vm.timerItem!.uid!)} onClose={vm.closeTimer} />
      )}
    </>
  );
}
