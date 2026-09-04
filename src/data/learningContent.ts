import imgRespSdraiato1 from '../assets/img/resp-sdraiato-1.png';
import imgRespSdraiato2 from '../assets/img/resp-sdraiato-2.png';
import imgRespInpiedi3 from '../assets/img/resp-inpiedi-3.png';
import imgMovPiedi1 from '../assets/img/mov-piedi-1.png';
import imgMovPiedi2 from '../assets/img/mov-piedi-2.png';

/*
 * LEARNING CONTENTS DATA
 * The data that concerns a specific video lesson are static and will not be
 * changed. Therefore, it makes no sense to put them in the Redux store.
 *
 *
 */

const TIME_REQUIRED_TRAINING_SECONDS = 1 * 5;

export const exerciseSectionsData = [
  {
    id: 'breathing-section-1',
    exerciseId: 'breathing-basics',
    title: 'Respirazione da sdraiato con mani sulla pancia',
    description:
      'Sdraiati comodamente e appoggia le mani sulla pancia. Porta l’attenzione al movimento dell’addome mentre respiri, senza forzare: senti le mani sollevarsi durante l’inspirazione e abbassarsi durante l’espirazione. L’obiettivo è prendere consapevolezza del respiro e imparare a lasciarlo fluire in modo naturale.',
    videoUrl: '/videos/resp-sdraiato-1.mp4',
    thumbnailUrl: imgRespSdraiato1,
    requiredTrainingMs: TIME_REQUIRED_TRAINING_SECONDS * 1000,
    nextSectionId: 'breathing-section-2',
  },
  {
    id: 'breathing-section-2',
    exerciseId: 'breathing-basics',
    title: 'Respirazione da sdraiato con libro sulla pancia',
    description:
      'Sdraiati e appoggia un libro leggero sulla pancia. Osserva come il respiro lo fa salire durante l’inspirazione e scendere durante l’espirazione. Il piccolo peso offre un riferimento visivo e tattile che aiuta a percepire meglio il movimento addominale e a rendere il respiro più consapevole e regolare.',
    videoUrl: '/videos/resp-sdraiato-2.mp4',
    thumbnailUrl: imgRespSdraiato2,
    requiredTrainingMs: TIME_REQUIRED_TRAINING_SECONDS * 1000,
    nextSectionId: 'breathing-section-3',
  },
  {
    id: 'breathing-section-3',
    exerciseId: 'breathing-basics',
    title: 'Respirazione da in piedi',
    description:
      'Porta ora la respirazione appresa da sdraiato nella posizione eretta. Mantieni il corpo rilassato, le ginocchia morbide e il busto naturale. Respira osservando il movimento dell’addome senza irrigidirti. L’obiettivo è mantenere un respiro calmo e consapevole anche quando il corpo deve sostenersi contro la gravità.',
    videoUrl: '/videos/resp-inpiedi-3.mp4',
    thumbnailUrl: imgRespInpiedi3,
    requiredTrainingMs: TIME_REQUIRED_TRAINING_SECONDS * 1000,
    nextSectionId: 'feet-position-section-1',
  },
  {
    id: 'feet-position-section-1',
    exerciseId: 'feet-basics',
    title: 'Respirare con la terra',
    description:
      'In piedi, porta l’attenzione contemporaneamente al respiro e al contatto dei piedi con il terreno. Durante ogni ciclo respiratorio percepisci il corpo che si rilassa e il peso che scende verso la terra. Non cercare di spingere: lascia che respiro, postura e appoggio dei piedi inizino gradualmente a lavorare insieme.',
    videoUrl: '/videos/mov-piedi-1.mp4',
    thumbnailUrl: imgMovPiedi1,
    requiredTrainingMs: TIME_REQUIRED_TRAINING_SECONDS * 1000,
    nextSectionId: 'feet-position-section-2',
  },
  {
    id: 'feet-position-section-2',
    exerciseId: 'feet-basics',
    title: 'Sentire la distribuzione del peso sulla terra',
    description:
      'Porta l’attenzione sotto i piedi e osserva dove senti maggiormente il peso: tallone, avampiede, lato interno o esterno. Spostalo lentamente per esplorare le diverse sensazioni, poi cerca una posizione stabile e centrale. Respira senza tensioni e percepisci come piccoli cambiamenti dell’appoggio modificano l’equilibrio di tutto il corpo.',
    videoUrl: '/videos/mov-piedi-2.mp4',
    thumbnailUrl: imgMovPiedi2,
    requiredTrainingMs: TIME_REQUIRED_TRAINING_SECONDS * 1000,
    nextSectionId: null,
  },
  /*
   * as const: here considers the values in exerciseSectionsData as specific literals type not generic ones.
   * This have also the advantage that we can access types and get data:
   *     type SectionId = (typeof exerciseSectionsData)[number]['id'];
   * Without as const we will have generic string type.
   */
] as const;

export type SectionId = (typeof exerciseSectionsData)[number]['id'];

export default interface ExerciseSection {
  readonly id: SectionId;
  readonly exerciseId: string;
  readonly title: string;
  readonly description: string;
  readonly videoUrl: string;
  readonly thumbnailUrl: string;
  readonly requiredTrainingMs: number;
  readonly nextSectionId: SectionId | null;
}

export const exerciseSections: readonly ExerciseSection[] = exerciseSectionsData;

/**
 * Useful function to quickly look for a specific section.
 * Readonly: un utility type built-in di TypeScript. Per strutture in sola lettura.
 * Record: un utility type built-in di TypeScript. La sua forma generale è: Record<KeyType, ValueType>
 * Object.fromEntries: trasforma in oggetto le coppie chiave e valore nell'array di array
 */
export const exerciseSectionById: Readonly<Record<string, ExerciseSection>> = Object.fromEntries(
  exerciseSections.map((section) => [section.id, section]),
);

/**
 * The function controls 'value'. ': value is SectionId' is a type predicate to specify to Typescript
 * what 'true' means. The true or false result is not determined by ': value is SectionId' but from the returned result.
 *
 * @param value
 * @returns  if it returns true, TypeScript can treat 'value' as type SectionId.
 */
export function isSectionId(value: string): value is SectionId {
  return Object.prototype.hasOwnProperty.call(exerciseSectionById, value);
}
