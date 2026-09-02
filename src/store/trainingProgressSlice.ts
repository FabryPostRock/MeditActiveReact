import type { RootState } from './store';
import { store } from './store';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { exerciseSections, type SectionId } from '../data/learningContent';

type TrainingStatus = 'idle' | 'running' | 'paused' | 'readyToComplete' | 'completed';

interface SectionTrainingProgress {
  videoCompleted: boolean;
  elapsedTrainingMs: number;
  requiredTrainingMs: number;
  startedAtMs: number | null;
  status: TrainingStatus;
}

export interface TrainingProgressState {
  progressBySectionId: Record<SectionId, SectionTrainingProgress>;
  activeSectionId: SectionId | null;
}

/**
 * Mappatura automatica dello stato iniziale a partire da una porzione dei dati statici
 */
const initialProgressBySectionId = Object.fromEntries(
  exerciseSections.map((section) => [
    section.id,
    {
      videoCompleted: false,
      elapsedTrainingMs: 0,
      requiredTrainingMs: section.requiredTrainingMs,
      startedAtMs: null,
      status: 'idle',
    },
  ]),
) as Record<SectionId, SectionTrainingProgress>;

export const initialState: TrainingProgressState = {
  progressBySectionId: initialProgressBySectionId,
  activeSectionId: null,
};

const progressSlice = createSlice({
  name: 'trainingProgress',
  initialState,

  reducers: {
    setVideoCompleted: (
      state,
      /**
       * PayloadAction: a redux type that describes the specific type of redux action payload
       *
       * action : {
       *   type: 'trainingProgress/markVideoCompleted',
       *   payload: {
       *       sectionId: 'breathing-section-1',
       *   },
       * }
       */
      action: PayloadAction<{
        sectionId: SectionId;
      }>,
    ) => {
      const progress = state.progressBySectionId[action.payload.sectionId];

      progress.videoCompleted = true;
    },

    startTraining: (
      state,
      action: PayloadAction<{
        sectionId: SectionId;
        startedAtMs: number;
      }>,
    ) => {
      // action contains what and how i want to change values.
      const { sectionId, startedAtMs } = action.payload;
      // state contains the actual state that has to be updated.
      const progress = state.progressBySectionId[sectionId];

      if (!progress.videoCompleted) {
        return;
      }

      // Start and pause are binded to the same button
      if (progress.status === 'readyToComplete' || progress.status === 'completed') {
        return;
      }

      if (state.activeSectionId !== null && state.activeSectionId !== sectionId) {
        return;
      }
      progress.startedAtMs = startedAtMs;
      progress.status = 'running';
      state.activeSectionId = sectionId;
    },

    pauseTraining: (
      state,
      action: PayloadAction<{
        sectionId: SectionId;
        startedAtMs: number;
        elapsedTrainingMs: number;
      }>,
    ) => {
      const { sectionId, startedAtMs, elapsedTrainingMs } = action.payload;

      const progress = state.progressBySectionId[sectionId];

      if (progress.status !== 'running' || progress.elapsedTrainingMs === null) {
        return;
      }

      progress.status = progress.elapsedTrainingMs >= progress.requiredTrainingMs ? 'readyToComplete' : 'paused';

      // If the training is not running no active Section is valid
      if (state.activeSectionId === sectionId) {
        state.activeSectionId = null;
      }
    },

    setReadyToBeCompleted: (
      state,
      action: PayloadAction<{
        sectionId: SectionId;
        elapsedTrainingMs: number;
      }>,
    ) => {
      const { sectionId, elapsedTrainingMs } = action.payload;
      const progress = state.progressBySectionId[sectionId];
      if (progress.status !== 'running') {
        return;
      }

      if (progress.elapsedTrainingMs < progress.requiredTrainingMs) {
        return;
      }

      progress.elapsedTrainingMs = progress.requiredTrainingMs;
      progress.status = 'readyToComplete';

      if (state.activeSectionId === sectionId) {
        state.activeSectionId = null;
      }
    },

    completeTraining: (
      state,
      action: PayloadAction<{
        sectionId: SectionId;
      }>,
    ) => {
      const progress = state.progressBySectionId[action.payload.sectionId];

      if (progress.status !== 'readyToComplete') {
        return;
      }

      progress.status = 'completed';
    },
  },
});

export const { setVideoCompleted, startTraining, pauseTraining, setReadyToBeCompleted, completeTraining } =
  progressSlice.actions;

export default progressSlice.reducer;
