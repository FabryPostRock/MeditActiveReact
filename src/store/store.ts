import { configureStore } from '@reduxjs/toolkit';
import { initialState } from './trainingProgressSlice';

const rootReducer = (state = initialState) => state;

export const store = configureStore({
  reducer: {
    trainingProgress: rootReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
