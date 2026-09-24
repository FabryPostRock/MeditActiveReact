import type ExerciseSection from '../../data/learningContent';
import { Title } from '../title';
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
      <div className="container">
        <div className="row d-flex justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <Title
              title={section.title}
              txtColor={'var(--bs-secondary)'}
              headlineType={'h2'}
              position={'text-center'}
              underlineOnHover={true}
              scaleOnHover={false}
            />
          </div>
          <div className="col-12 d-flex justify-content-center">
            <img
              className="h-auto w-sm-40 w-md-30 w-lg-30 rounded"
              src={section.thumbnailUrl}
              alt={`Anteprima di ${section.title}`}
            />
          </div>
        </div>
        <div className="row d-flex justify-content-center">
          <div className="col-12  col-sm-6">
            <p>Stato: {status}</p>
          </div>
          <div className="col-12 col-sm-6">
            <p>
              Video:
              {videoCompleted ? ' completato' : ' da vedere'}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
