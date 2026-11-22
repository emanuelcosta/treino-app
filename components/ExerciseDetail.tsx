import { stepsOf, type Exercise } from '@/lib/data';
import { hasIllustration } from '@/lib/illustrations/poses';
import ExerciseIllustration from './ExerciseIllustration';
import VideoPlayer from './VideoPlayer';

export default function ExerciseDetail({ ex, compact = false }: { ex: Exercise; compact?: boolean }) {
  const steps = stepsOf(ex);
  return (
    <div className={compact ? 'detail compact' : 'detail'}>
      {compact && ex.muscles && <p className="muted small">{ex.muscles}</p>}
      {hasIllustration(ex.id) && (<><h3>Veja como fazer</h3><ExerciseIllustration id={ex.id} /></>)}
      <h3>Passo a passo</h3>
      <ol className="steps">
        {steps.map((s, i) => (<li key={i}>{s}</li>))}
      </ol>
      {ex.mistake && (<><h3>Cuidado</h3><p>{ex.mistake}</p></>)}
      {(ex.easier || ex.harder) && (
        <div className="levels">
          {ex.easier && <div><h3>Está difícil? Faça assim</h3><p>{ex.easier}</p></div>}
          {ex.harder && <div><h3>Ficou fácil? Evolua</h3><p>{ex.harder}</p></div>}
        </div>
      )}
      <h3>Vídeos</h3>
      <VideoPlayer videos={ex.videos} query={ex.query} />
    </div>
  );
}
