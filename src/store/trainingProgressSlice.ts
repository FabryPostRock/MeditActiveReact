import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { exerciseSections, type SectionId } from '../data/learningContent';

type TrainingStatus = 'idle' | 'running' | 'paused' | 'readyToComplete' | 'completed';

interface SectionTrainingProgress {
  videoCompleted: boolean;
  videoCurrentSecond: number;
  videoWatchedSeconds: number;
  videoDurationSeconds: number | null;

  elapsedTrainingMs: number;
  requiredTrainingMs: number;
  startedAtMs: number | null | undefined;
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
      videoCurrentSecond: 0,
      videoWatchedSeconds: 0,
      videoDurationSeconds: null,
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

/**
 * 'createSlice' dosen't return directly a reducer but an object like:
 *
 * {
 * name: 'trainingProgress',
 * reducer: <funzione reducer >,
 * actions: {
 *   startTraining: < action creator >,
 *   pauseTraining: < action creator >,
 * },
 * caseReducers: {
 *   // ...
 * },
 * getInitialState: < funzione >,
 *  }
 */
const progressSlice = createSlice({
  name: 'trainingProgress',
  initialState,

  reducers: {
    setVideoProgress: (
      state,
      action: PayloadAction<{
        sectionId: SectionId;
        currentSecond: number;
        watchedSeconds: number;
        durationSeconds: number;
      }>,
    ) => {
      const { sectionId, currentSecond, watchedSeconds, durationSeconds } = action.payload;

      const progress = state.progressBySectionId[sectionId];

      progress.videoCurrentSecond = currentSecond;
      progress.videoWatchedSeconds = watchedSeconds;
      progress.videoDurationSeconds = durationSeconds;
    },
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
        watchedSeconds: number;
        durationSeconds: number;
      }>,
    ) => {
      const { sectionId, watchedSeconds, durationSeconds } = action.payload;
      const progress = state.progressBySectionId[sectionId];
      const completionToleranceSeconds = 1;
      const videoWasFullyWatched =
        durationSeconds > 0 && watchedSeconds >= durationSeconds - completionToleranceSeconds;

      if (!videoWasFullyWatched) {
        return;
      }

      progress.videoCurrentSecond = Math.floor(durationSeconds);
      progress.videoWatchedSeconds = watchedSeconds;
      progress.videoDurationSeconds = durationSeconds;
      progress.videoCompleted = true;
    },

    startTraining: (
      state,
      action: PayloadAction<{
        sectionId: SectionId;
        startedAtMs?: number;
      }>,
    ) => {
      // action contains what and how i want to change values.
      let { sectionId, startedAtMs } = action.payload;

      // state contains the actual state that has to be updated.
      const progress = state.progressBySectionId[sectionId];
      !startedAtMs && progress.startedAtMs
        ? (startedAtMs = progress.startedAtMs)
        : (progress.startedAtMs = startedAtMs);
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

      progress.status = 'running';
      state.activeSectionId = sectionId;
    },

    pauseTraining: (
      state,
      action: PayloadAction<{
        sectionId: SectionId;
        elapsedTrainingMs: number;
      }>,
    ) => {
      const { sectionId, elapsedTrainingMs } = action.payload;
      const progress = state.progressBySectionId[sectionId];

      if (
        progress.status !== 'running' ||
        (!progress.elapsedTrainingMs && !Number.isFinite(progress?.elapsedTrainingMs))
      ) {
        return;
      }
      // At this point progress.startedAtMs is for sure not null or undefined
      progress.elapsedTrainingMs = elapsedTrainingMs - progress.startedAtMs!;
      console.log(
        `pauseTraining elapsedTrainingMs : ${progress.elapsedTrainingMs}   startedAtMs : ${progress.startedAtMs}`,
      );
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

export const {
  setVideoProgress,
  setVideoCompleted,
  startTraining,
  pauseTraining,
  setReadyToBeCompleted,
  completeTraining,
} = progressSlice.actions;

export default progressSlice.reducer;
