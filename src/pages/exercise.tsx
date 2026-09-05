import { useParams } from 'react-router-dom';
import ExerciseView from '../components/exercise/exerciseView';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { exerciseSections } from '../data/learningContent';
import Error from './error';
import { exerciseSectionById, isSectionId } from '../data/learningContent';

export default function Exercise() {
  const { sectionId } = useParams();

  if (!sectionId || !isSectionId(sectionId)) {
    return <Error />;
  } else {
    const section = exerciseSectionById[sectionId];
    const progress = useAppSelector((state) => state.trainingProgress.progressBySectionId[sectionId]);

    return (
      <main className="container">
        <div>
          <ExerciseView section={section} isLocked={progress.isLocked} />
        </div>
      </main>
    );
  }
}
