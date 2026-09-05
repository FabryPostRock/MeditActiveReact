import Title from './title';
import { Link } from 'react-router-dom';
import type ExerciseSection from '../../data/learningContent';
import { exerciseSections } from '../../data/learningContent';
import { useAppSelector } from '../../store/hooks';
import Article from './article';

/**
 * Definizione props con le caratteristiche statiche passate dal padre
 */
interface ExerciseCardProps {
  section: ExerciseSection;
}

export default function ExerciseCard({ section }: ExerciseCardProps) {
  const progress = useAppSelector((state) => state.trainingProgress.progressBySectionId[section.id]);
  const status = progress?.status ?? 'idle';
  const videoCompleted = progress?.videoCompleted;
  console.log(`ExerciseCard - isLocked: ${progress.isLocked}  sectionId: ${section.id}  status: ${status}`);

  return !progress.isLocked ? (
    <Link
      to={`/exercise/${section.id}`}
      className="d-block h-100 text-decoration-none text-reset"
      aria-label={`Apri la lezione ${section.title}`}
    >
      <Article section={section} status={status} videoCompleted={videoCompleted} isLocked={progress.isLocked} />
    </Link>
  ) : (
    <Article section={section} status={status} videoCompleted={videoCompleted} isLocked={progress.isLocked} />
  );
}
