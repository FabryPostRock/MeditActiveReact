import { configureStore } from '@reduxjs/toolkit';

type TrainingStatus = 'idle' | 'running' | 'paused' | 'completed';

interface SectionTrainingProgress {
  videoCompleted: boolean;
  elapsedTrainingMs: number;
  startedAt: number | null;
  status: TrainingStatus;
}

interface TrainingProgressState {
  progressBySectionId: Record<string, SectionTrainingProgress>;
  activeSectionId: string | null;
}

const initialState: Record<string, never> = {};

const rootReducer = (state = initialState) => state;

export const store = configureStore({
  reducer: {
    trainingProgress: rootReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
