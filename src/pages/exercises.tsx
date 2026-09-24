import { exerciseSections } from '../data/learningContent';
import ExerciseCard from '../components/exercise/exerciseCard';
import { Title } from '../components/title';

export default function Exercises() {
  return (
    <div className="container">
      <Title
        title={'Corso base di consapevolezza del corpo'}
        txtColor={'var(--bs-dark-green)'}
        txtSize={['fs-1', 'fs-md-2', 'fs-lg-1']}
        headlineType={'h1'}
        position={'text-center'}
        underlineOnHover={false}
        scaleOnHover={false}
      />
      <div className="container-grid">
        {exerciseSections.map((section) => (
          <ExerciseCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
