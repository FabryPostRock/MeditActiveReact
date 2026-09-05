import type ExerciseSection from '../../data/learningContent';
import Title from './title';
import type { TrainingStatus } from '../../store/trainingProgressSlice';

interface ExerciseArticleProps {
  section: ExerciseSection;
  status: TrainingStatus;
  videoCompleted: boolean;
  isLocked: boolean;
}

export default function Article({ section, status, videoCompleted, isLocked }: ExerciseArticleProps) {
  return (
    <article
      inert={isLocked}
      aria-disabled={isLocked ? true : undefined}
      /**pe-none: impedisce interazioni con mouse e touch */
      className={isLocked ? 'pe-none opacity-50' : ''}
    >
      <div>
        <Title title={section.title} />
        <div>
          <img src={section.thumbnailUrl} alt={`Anteprima di ${section.title}`} />
        </div>
        <div>
          <p>Stato: {status}</p>

          <p>
            Video:
            {videoCompleted ? ' completato' : ' da vedere'}
          </p>
        </div>
      </div>
    </article>
  );
}
