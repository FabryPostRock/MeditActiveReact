import { exerciseSections } from '../data/learningContent';
import ExerciseCard from '../components/exercise/exerciseCard';

export default function Exercises() {
  return (
    <main className="container">
      <h1>Corso base di consapevolezza del corpo</h1>

      <div>
        {exerciseSections.map((section) => (
          <ExerciseCard key={section.id} section={section} />
        ))}
      </div>
    </main>
  );
}
