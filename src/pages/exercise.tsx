import { useParams } from 'react-router-dom';
import ExerciseView from '../components/exercise/exerciseView';
import { useAppSelector } from '../store/hooks';
import Error from './error';
import { exerciseSectionById, isSectionId } from '../data/learningContent';
import { PageMetadata } from '../components/pageMetadata';
import { createExercisePageMetadata } from '../data/pageMetadata';

export default function Exercise() {
  const { sectionId } = useParams();

  if (!sectionId || !isSectionId(sectionId)) {
    return <Error />;
  } else {
    const section = exerciseSectionById[sectionId];
    const progress = useAppSelector((state) => state.trainingProgress.progressBySectionId[sectionId]);

    if (progress.isLocked) {
      return <Error />;
    }

    const pageMetadata = createExercisePageMetadata(section);

    return (
      <>
        <PageMetadata metadata={pageMetadata} />

        <div className="container">
          <ExerciseView section={section} isLocked={false} />
        </div>
      </>
    );
  }
}
