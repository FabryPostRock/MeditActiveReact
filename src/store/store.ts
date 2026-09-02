import { configureStore } from '@reduxjs/toolkit';
import { initialState } from './trainingProgressSlice';
import trainingProgressReducer from './trainingProgressSlice';

/**
 * The inital state is managed inside trainingProgressSlice.ts
 */

export const store = configureStore({
  reducer: {
    trainingProgress: trainingProgressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
