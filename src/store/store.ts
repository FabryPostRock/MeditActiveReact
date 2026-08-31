import { configureStore } from '@reduxjs/toolkit';
import type { SectionId } from '../data/learningContent';

type TrainingStatus = 'idle' | 'running' | 'paused' | 'completed';

interface SectionTrainingProgress {
  videoCompleted: boolean;
  elapsedTrainingMs: number;
  startedAt: number | null;
  status: TrainingStatus;
}

interface TrainingProgressState {
  progressBySectionId: Record<SectionId, SectionTrainingProgress>;
  activeSectionId: SectionId | null;
}

const initialState: TrainingProgressState = {
  progressBySectionId: {
    'breathing-section-1': {
      videoCompleted: false,
      elapsedTrainingMs: 0,
      startedAt: null,
      status: 'idle',
    },

    'breathing-section-2': {
      videoCompleted: false,
      elapsedTrainingMs: 0,
      startedAt: null,
      status: 'idle',
    },

    'breathing-section-3': {
      videoCompleted: false,
      elapsedTrainingMs: 0,
      startedAt: null,
      status: 'idle',
    },

    'feet-position-section-1': {
      videoCompleted: false,
      elapsedTrainingMs: 0,
      startedAt: null,
      status: 'idle',
    },

    'feet-position-section-2': {
      videoCompleted: false,
      elapsedTrainingMs: 0,
      startedAt: null,
      status: 'idle',
    },
  },

  activeSectionId: null,
};

const rootReducer = (state = initialState) => state;

export const store = configureStore({
  reducer: {
    trainingProgress: rootReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
