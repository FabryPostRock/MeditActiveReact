import { useParams } from 'react-router-dom';
import ExerciseView from '../components/exercise/exerciseView';
import { useAppSelector } from '../store/hooks';
import Error from './error';
import { exerciseSectionById, isSectionId } from '../data/learningContent';
import { PageMetadata } from '../components/pageMetadata';
import { createExercisePageMetadata } from '../data/pageMetadata';
import { useTranslation } from 'react-i18next';

export default function Exercise() {
  const { t, i18n } = useTranslation();
  const { sectionId } = useParams();

  if (!sectionId || !isSectionId(sectionId)) {
    return <Error />;
  } else {
    const section = exerciseSectionById[sectionId];
    const progress = useAppSelector((state) => state.trainingProgress.progressBySectionId[sectionId]);

    if (progress.isLocked) {
      return <Error />;
    }

    const title = t(`exercises.sections.${section.id}.title`);
    const description = t(`exercises.sections.${section.id}.description`);
    const pageMetadata = createExercisePageMetadata(section, {
      title,
      description,
      imageAlt: t('exercises.exercisePreviewAlt', { title }),
      locale: i18n.resolvedLanguage === 'en' ? 'en_US' : 'it_IT',
    });

    return (
      <>
        <PageMetadata metadata={pageMetadata} />

        <div className="container">
          <ExerciseView section={section} isLocked={false} videoBlink={progress.videoBlink} />
        </div>
      </>
    );
  }
}
