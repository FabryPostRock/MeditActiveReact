import Title from './title';
import { Link } from 'react-router-dom';
import type ExerciseSection from '../../data/learningContent';
import { useAppSelector } from '../../store/hooks';

/**
 * Definizione props con le caratteristiche statiche passate dal padre
 */
interface ExerciseCardProps {
  section: ExerciseSection;
}

export default function ExerciseView({ section }: ExerciseCardProps) {
  const progress = useAppSelector((state) => state.trainingProgress.progressBySectionId[section.id]);

  const status = progress?.status ?? 'idle';
  const videoCompleted = progress?.videoCompleted ?? false;

  return (
    <article>
      <div>
        <Title title={section.title} />
        <div>
          <iframe
            src={section.videoUrl}
            width="100%"
            height="100%"
            allow="autoplay; fullscreen"
            allowFullScreen
            aria-label={`Anteprima di ${section.title}`}
          ></iframe>
          <p>{section.description}</p>
        </div>
        <div>
          <p>Stato: {status}</p>

          <p>
            Video:
            {videoCompleted ? ' completato' : ' da vedere'}
          </p>
        </div>
        <div>
          <p>${progress.elapsedTrainingMs}</p>
          <div className="d-flex col-3 justify-content-center m-3 m-lg-5">
            <button className="btn-big btn btn-secondary d-inline-flex align-items-center justify-content-center w-100 rounded-5">
              {' '}
              <span className="material-symbols-outlined g-icon-sm-2em g-icon-secondary-color">play_arrow</span>{' '}
            </button>
          </div>
          <div className="d-flex col-3 justify-content-center m-3 m-lg-5">
            <button className="btn-big btn btn-secondary d-inline-flex align-items-center justify-content-center w-100 rounded-5">
              {' '}
              <span className="material-symbols-outlined g-icon-sm-2em g-icon-secondary-color">stop</span>{' '}
            </button>
          </div>
          <div className="d-flex col-3 justify-content-center m-3 m-lg-5">
            <button className="btn-big btn btn-secondary d-inline-flex align-items-center justify-content-center w-100 rounded-5">
              {' '}
              <span className="material-symbols-outlined g-icon-sm-2em g-icon-secondary-color">pause</span>{' '}
            </button>
          </div>
          <button> Completa Allenamento </button>
        </div>
      </div>
    </article>
  );
}
