import type ExerciseSection from '../../data/learningContent';
import { Title } from '../title';
import type { TrainingStatus } from '../../store/trainingProgressSlice';
import { ProgressBar } from '../progressBar';

interface ExerciseArticleProps {
  section: ExerciseSection;
  status: TrainingStatus;
  videoCompleted: boolean;
  isLocked: boolean;
  trainingCompleted: boolean;
}

export default function Article({
  section,
  status,
  videoCompleted,
  isLocked,
  trainingCompleted,
}: ExerciseArticleProps) {
  return (
    <article
      inert={isLocked}
      aria-disabled={isLocked ? true : undefined}
      /**pe-none: impedisce interazioni con mouse e touch
       * h-100: 100% dell'altezza del parent-> cella grid
       *
       */
      className={` section-enlarge h-100 rounded pb-5 ${isLocked ? 'pe-none opacity-50' : ''}`}
    >
      {' '}
      {/**d-flex flex-column : enables the chance to manage the progress bar verical spacing with mt-auto*/}
      <div className="container h-100 d-flex flex-column mt-3 mb-3">
        <div className="d-flex flex-column justify-content-center flex-grow-1">
          <div className="col-12">
            <Title
              title={section.title}
              txtColor={'var(--bs-secondary)'}
              txtSize={['fs-3', 'fs-md-3', 'fs-lg-3']}
              headlineType={'h2'}
              position={'text-center'}
              underlineOnHover={true}
              scaleOnHover={false}
            />
          </div>
          <div className="col-12 d-flex justify-content-center mt-auto">
            <img className="h-auto w-40 rounded" src={section.thumbnailUrl} alt={`Anteprima di ${section.title}`} />
          </div>
        </div>
        <div className="row d-flex justify-content-center mt-auto">
          <ProgressBar status={status} trainingCompleted={trainingCompleted} videoCompleted={videoCompleted} />
        </div>
      </div>
    </article>
  );
}
