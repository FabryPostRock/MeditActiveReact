import Title from './title';
import { Link } from 'react-router-dom';
import type ExerciseSection from '../../data/learningContent';
import { useAppSelector } from '../../store/hooks';
import { selectTrainingProgressBySectionId } from '../../store/trainingProgressSlice';

/**
 * Definizione props con le caratteristiche statiche passate dal padre
 */
interface ExerciseCardProps {
  section: ExerciseSection;
}

export default function ExerciseView({ section }: ExerciseCardProps) {
  const progress = useAppSelector((state) => selectTrainingProgressBySectionId(state, section.id));

  const status = progress?.status ?? 'idle';
  const videoCompleted = progress?.videoCompleted ?? false;

  return (
    <Link
      to={`/exercise/${section.id}`}
      className="d-block h-100 text-decoration-none text-reset"
      aria-label={`Apri la lezione ${section.title}`}
    >
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
        </div>
      </article>
    </Link>
  );
}
