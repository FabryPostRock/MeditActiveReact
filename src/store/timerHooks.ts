import { useEffect, useState } from 'react';

import type ExerciseSection from '../data/learningContent';

import {
  setVideoCompleted,
  startTraining,
  pauseTraining,
  setReadyToBeCompleted,
  completeTraining,
} from './trainingProgressSlice';

import { useAppDispatch, useAppSelector } from '../store/hooks';

export default function useTrainingTimer(section: ExerciseSection) {
  const dispatch = useAppDispatch();

  const progress = useAppSelector((state) => state.trainingProgress.progressBySectionId[section.id]);

  /**
   * Here useState is needed because React receives and explicit update request
   * every time setNow() is called.
   *
   */
  const [now, setNow] = useState(() => Date.now());

  useEffect(
    () => {
      if (progress.status !== 'running' || progress.startedAtMs === null) {
        return;
      }

      /**
       * Callback called from the setInterval timer
       */
      const updateTimer = () => {
        const currentTime = Date.now();

        setNow(currentTime);

        const currentSessionMs = currentTime - progress.startedAtMs!;

        const totalElapsedMs = progress.elapsedTrainingMs + currentSessionMs;

        if (totalElapsedMs >= progress.requiredTrainingMs) {
          dispatch(
            setReadyToBeCompleted({
              sectionId: section.id,
              elapsedTrainingMs: totalElapsedMs,
            }),
          );
        }
      };

      updateTimer();

      const intervalId = window.setInterval(updateTimer, 1000);

      return () => {
        // setInterval has to be cleared only when a new action is performed on start e pause buttons
        window.clearInterval(intervalId);
      };
    },
    // Here is specified that the useEffect will be executed when the following
    // objects changes.
    [
      dispatch,
      section.id,
      progress.status,
      progress.startedAtMs,
      progress.elapsedTrainingMs,
      progress.requiredTrainingMs,
    ],
  );

  const currentSessionMs =
    progress.status === 'running' && progress.startedAtMs !== null ? Math.max(now - progress.startedAtMs, 0) : 0;

  const totalElapsedMs = Math.min(progress.elapsedTrainingMs + currentSessionMs, progress.requiredTrainingMs);

  const remainingTrainingMs = Math.max(progress.requiredTrainingMs - totalElapsedMs, 0);

  return {
    progress,
    totalElapsedMs,
    remainingTrainingMs,
  };
}
