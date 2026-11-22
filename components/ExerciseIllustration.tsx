// Quadros numerados com o boneco em cada etapa do exercício.
import { illustrations } from '@/lib/illustrations/poses';
import { fitBox } from '@/lib/illustrations/solve';
import Figure from './Figure';

export default function ExerciseIllustration({ id }: { id: string }) {
  const frames = illustrations[id];
  if (!frames?.length) return null;
  const box = fitBox(frames.map((f) => f.pose));
  return (
    <ol className="ill" aria-label="Ilustração passo a passo">
      {frames.map((f, i) => (
        <li key={i}>
          <Figure pose={f.pose} box={box} title={`Passo ${i + 1}: ${f.caption}`} />
          <p><b>{i + 1}</b> {f.caption}</p>
        </li>
      ))}
    </ol>
  );
}
