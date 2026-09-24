import type ExerciseSection from '../../data/learningContent';
import { Title } from '../title';
import type { TrainingStatus } from '../../store/trainingProgressSlice';
import { LessonProgress } from '../progressBar';

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
      <div className="container mt-3 mb-3">
        <div className="row d-flex justify-content-center">
          <div className="col-12">
            <Title
              title={section.title}
              txtColor={'var(--bs-secondary)'}
              txtSize={['fs-2', 'fs-md-3', 'fs-lg-3']}
              headlineType={'h2'}
              position={'text-center'}
              underlineOnHover={true}
              scaleOnHover={false}
            />
          </div>
          <div className="col-12 d-flex justify-content-center">
            <img className="h-auto w-40 rounded" src={section.thumbnailUrl} alt={`Anteprima di ${section.title}`} />
          </div>
        </div>
        <div className="row d-flex justify-content-center mt-3">
          <div className="col-12 text-md-center text-lg-start">
            <p>Stato: {status}</p>
          </div>
          <div className="col-12 text-md-center text-lg-start">
            <p>
              Video:
              {videoCompleted ? ' completato' : ' da vedere'}
            </p>
          </div>
          <div className="">
            <LessonProgress />
          </div>
        </div>
      </div>
    </article>
  );
}
