import { Link } from 'react-router-dom';
import type ExerciseSection from '../../data/learningContent';
import { useAppSelector } from '../../store/hooks';
import Article from './article';
import { useTranslation } from 'react-i18next';

/**
 * Definizione props con le caratteristiche statiche passate dal padre
 */
interface ExerciseCardProps {
  section: ExerciseSection;
}

export default function ExerciseCard({ section }: ExerciseCardProps) {
  const { t } = useTranslation();
  const progress = useAppSelector((state) => state.trainingProgress.progressBySectionId[section.id]);
  const status = progress?.status ?? 'idle';
  const videoCompleted = progress?.videoCompleted;
  const title = t(`exercises.sections.${section.id}.title`);
  // console.log(`ExerciseCard - isLocked: ${progress.isLocked}  sectionId: ${section.id}  status: ${status}`);

  return !progress.isLocked ? (
    <Link
      to={`/exercise/${section.id}`}
      className="d-block h-100 text-decoration-none text-reset"
      // exercises.openLesson -> "openLesson": "Apri la lezione {{title}}"
      aria-label={t('exercises.openLesson', { title })}
    >
      <Article
        section={section}
        status={status}
        videoCompleted={videoCompleted}
        isLocked={progress.isLocked}
        trainingCompleted={progress.trainingCompleted}
      />
    </Link>
  ) : (
    <Article
      section={section}
      status={status}
      videoCompleted={videoCompleted}
      isLocked={progress.isLocked}
      trainingCompleted={progress.trainingCompleted}
    />
  );
}
