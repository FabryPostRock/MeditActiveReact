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

export default function ExerciseCard({ section }: ExerciseCardProps) {
  const progress = useAppSelector((state) => state.trainingProgress.progressBySectionId[section.id]);

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
    </Link>
  );
}
