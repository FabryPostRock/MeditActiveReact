import type { TrainingProgressState } from './trainingProgressSlice';

export const TRAINING_PROGRESS_STORAGE_KEY = 'meditactive-training-progress';

export function loadTrainingProgress(): TrainingProgressState | undefined {
  try {
    const serializedProgress = localStorage.getItem(TRAINING_PROGRESS_STORAGE_KEY);

    if (serializedProgress === null) {
      return undefined;
    }

    return JSON.parse(serializedProgress) as TrainingProgressState;
  } catch {
    return undefined;
  }
}

export function saveTrainingProgress(trainingProgress: TrainingProgressState) {
  try {
    localStorage.setItem(TRAINING_PROGRESS_STORAGE_KEY, JSON.stringify(trainingProgress));
  } catch {
    throw new Error('Error trying to save data in Local Storage');
  }
}

export function parseTrainingProgress(serializedProgress: string): TrainingProgressState | undefined {
  try {
    return JSON.parse(serializedProgress) as TrainingProgressState;
  } catch {
    return undefined;
  }
}
