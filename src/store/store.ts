import { configureStore } from '@reduxjs/toolkit';
import { initialState } from './trainingProgressSlice';
import trainingProgressReducer, { synchronizeTrainingProgress } from './trainingProgressSlice';
import {
  loadTrainingProgress,
  parseTrainingProgress,
  saveTrainingProgress,
  TRAINING_PROGRESS_STORAGE_KEY,
} from './trainingProgressStorage';

const savedTrainingProgress = loadTrainingProgress();

/**
 * The inital state is managed inside trainingProgressSlice.ts
 */

export const store = configureStore({
  reducer: {
    trainingProgress: trainingProgressReducer,
  },
  /**
   * preloadedState: overrides the predefined values in the Slice with initialState. If preloadedState is undefined then the
   * initialState is used. When a storage event is triggered no preloadedState nor initialState is used.
   */
  preloadedState: savedTrainingProgress
    ? {
        trainingProgress: {
          ...savedTrainingProgress,
        },
      }
    : undefined,
});

/**
 * The 'subscribe' function is a built-in store function that is called
 * every time dispatch is called.
 * 
 * store.dispatch(action)
        ↓
  Redux executes the reducer
        ↓
  Redux updates the state
        ↓
  Redux calls the functions registered with store.subscribe() 
 * 
 * 
 */
let previousTrainingProgress = store.getState().trainingProgress;
// This variable avoids that the state is updated with the same values from the new updated tab via dispatch
let isApplyingExternalUpdate = false;

store.subscribe(() => {
  const currentTrainingProgress = store.getState().trainingProgress;

  if (currentTrainingProgress === previousTrainingProgress) {
    return;
  }

  previousTrainingProgress = currentTrainingProgress;
  /* 
  If an error like 'Error trying to save data in Local Storage' occurs it's correct to allow React to update
  the state. The Local Storage will be updated as soon as it returns available and with a new state update.
  Otherwise this will happen:
  Example:
  setVideoCompleted changes Redux
  → the persistence subscriber is executed
  → localStorage.setItem fails
  → saveTrainingProgress throws an error
  → Redux notifications get interrupted 
  → React doesn't receive the update
  → The interface doesn't update the video watching state

  */
  try {
    saveTrainingProgress(currentTrainingProgress);
  } catch (error) {
    console.error('Unable to persist training progress:', error);
  }
});

/**
 * The 'storage' event is emitted in the other tabs when a tab changes 'localStorage'
 * Tab A: localStorage.setItem(...)
                 ↓
    Tab B: storage event
                 ↓
    Tab B: JSON.parse(event.newValue)
                 ↓
    Tab B: store.dispatch(...)
                 ↓
    Redux in Tab B gets updated
 */
window.addEventListener('storage', (event: StorageEvent) => {
  // ignores other types of storage
  if (event.storageArea !== localStorage) {
    return;
  }
  // ignores other keys
  if (event.key !== TRAINING_PROGRESS_STORAGE_KEY) {
    return;
  }
  // event.newValue contains the result of 'JSON.stringify(trainingProgress)'
  if (event.newValue === null) {
    return;
  }

  const externalTrainingProgress = parseTrainingProgress(event.newValue);

  if (!externalTrainingProgress) {
    return;
  }

  let isApplyingExternalUpdate = true;

  try {
    store.dispatch(synchronizeTrainingProgress(externalTrainingProgress));
  } finally {
    isApplyingExternalUpdate = false;
  }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
