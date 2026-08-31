import type { RootState } from './store';
import type { SectionId } from '../data/learningContent';

export const selectTrainingProgressBySectionId = (state: RootState, sectionId: SectionId) =>
  state.trainingProgress.progressBySectionId[sectionId];
