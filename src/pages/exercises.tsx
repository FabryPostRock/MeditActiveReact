import { exerciseSections } from '../data/learningContent';
import ExerciseCard from '../components/exercise/exerciseCard';
import { PageMetadata } from '../components/pageMetadata';
import { Title } from '../components/title';
import { exercisesPageMetadata } from '../data/pageMetadata';
import { useTranslation } from 'react-i18next';

export default function Exercises() {
  const { t } = useTranslation();

  return (
    <>
      <PageMetadata metadata={exercisesPageMetadata} />

      <div className="container">
        <Title
          title={t('exercises.courseTitle')}
          txtColor={'var(--bs-dark-green)'}
          txtSize={['fs-1', 'fs-md-2', 'fs-lg-1']}
          headlineType={'h1'}
          position={'text-center'}
          underlineOnHover={false}
          scaleOnHover={false}
          underlineTxtFit={false}
        />
        <div className="container-grid">
          {exerciseSections.map((section) => (
            <ExerciseCard key={section.id} section={section} />
          ))}
        </div>
      </div>
    </>
  );
}
