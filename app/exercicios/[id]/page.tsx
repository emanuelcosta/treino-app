import Link from 'next/link';
import ExerciseDetail from '@/components/ExerciseDetail';
import ExercisePage from '@/components/ExercisePage';
import { exerciseList, exercises } from '@/lib/data';

export function generateStaticParams() {
  return exerciseList.map((e) => ({ id: e.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ex = exercises[id];
  if (!ex) return <ExercisePage id={id} />;
  return (
    <>
      <Link href="/exercicios" className="back">← Exercícios</Link>
      <h1>{ex.name}</h1>
      <p className="muted">{ex.group} · {ex.muscles}</p>
      <ExerciseDetail ex={ex} />
    </>
  );
}
