'use client';
import Link from 'next/link';
import { findEx } from '@/lib/domain/store';
import { useStore } from '@/lib/useStore';
import ExerciseDetail from './ExerciseDetail';

export default function ExercisePage({ id }: { id: string }) {
  const { store, ready } = useStore();
  if (!ready) return <div className="muted">Carregando…</div>;
  const ex = findEx(store, id);
  return (
    <>
      <Link href="/exercicios" className="back">← Exercícios</Link>
      {ex ? (<><h1>{ex.name}</h1><p className="muted">{ex.group} · {ex.muscles}</p><ExerciseDetail ex={ex} /></>) : <p>Exercício não encontrado.</p>}
    </>
  );
}
