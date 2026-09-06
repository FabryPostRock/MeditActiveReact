import { describe, expect, it } from 'vitest';
import { exerciseSections } from '../data/learningContent';
import trainingProgressReducer, { setVideoCompleted, setVideoProgress } from './trainingProgressSlice';

function createInitialState() {
  /*
  - undefined: indica che non esiste ancora uno stato. Redux Toolkit usa quindi l’initialState dichiarato nello slice.
  - { type: '@@INIT' }: è un’azione fittizia di inizializzazione. Non corrisponde a nessuno dei reducer come 
   startTraining o pauseTraining, quindi non produce modifiche.
   '@@INIT' it's just a conventional name, it could also be 'azione-sconosciuta'
  - return: restituisce lo stato iniziale generato dal reducer.
  */
  return trainingProgressReducer(undefined, { type: '@@INIT' });
}

describe('trainingProgressSlice initial state', () => {
  it('uses the required training duration defined by each exercise section', () => {
    const state = createInitialState();

    exerciseSections.forEach((section) => {
      expect(state.progressBySectionId[section.id].requiredTrainingMs).toBe(section.requiredTrainingMs);
    });
  });

  it('unlocks only the first exercise section', () => {
    const state = createInitialState();
    // splits first section from the rest
    const [firstSection, ...remainingSections] = exerciseSections;

    expect(state.progressBySectionId[firstSection.id].isLocked).toBe(false);

    remainingSections.forEach((section) => {
      expect(state.progressBySectionId[section.id].isLocked).toBe(true);
    });
  });

  it('initializes video, timer and completion progress with their default values', () => {
    const state = createInitialState();

    exerciseSections.forEach((section) => {
      expect(state.progressBySectionId[section.id]).toMatchObject({
        videoCompleted: false,
        videoCurrentSecond: 0,
        videoWatchedSeconds: 0,
        videoDurationSeconds: null,
        elapsedTrainingMs: 0,
        startedAtMs: null,
        status: 'idle',
        trainingCompleted: false,
      });
    });
  });

  it('does not have an active exercise section', () => {
    const state = createInitialState();

    expect(state.activeSectionId).toBeNull();
  });
});

describe('trainingProgressSlice video progress', () => {
  it('updates the current position, watched seconds and video duration', () => {
    const state = createInitialState();
    const sectionId = exerciseSections[0].id;

    const nextState = trainingProgressReducer(
      state,
      setVideoProgress({
        sectionId,
        currentSecond: 12,
        watchedSeconds: 9,
        durationSeconds: 60.5,
      }),
    );

    expect(nextState.progressBySectionId[sectionId]).toMatchObject({
      videoCurrentSecond: 12,
      videoWatchedSeconds: 9,
      videoDurationSeconds: 60.5,
    });
  });

  it('does not modify the progress of other sections', () => {
    const state = createInitialState();
    const [updatedSection, ...otherSections] = exerciseSections;

    const nextState = trainingProgressReducer(
      state,
      setVideoProgress({
        sectionId: updatedSection.id,
        currentSecond: 12,
        watchedSeconds: 9,
        durationSeconds: 60,
      }),
    );

    otherSections.forEach((section) => {
      expect(nextState.progressBySectionId[section.id]).toBe(state.progressBySectionId[section.id]);
    });
  });

  it('completes a video when it has been watched in full', () => {
    const state = createInitialState();
    const sectionId = exerciseSections[0].id;

    const nextState = trainingProgressReducer(
      state,
      setVideoCompleted({ sectionId, watchedSeconds: 60, durationSeconds: 60 }),
    );

    expect(nextState.progressBySectionId[sectionId].videoCompleted).toBe(true);
  });

  it('completes a video at the exact one-second tolerance boundary', () => {
    const state = createInitialState();
    const sectionId = exerciseSections[0].id;

    const nextState = trainingProgressReducer(
      state,
      setVideoCompleted({ sectionId, watchedSeconds: 59, durationSeconds: 60 }),
    );

    expect(nextState.progressBySectionId[sectionId].videoCompleted).toBe(true);
  });

  it('does not complete a video immediately below the tolerance boundary', () => {
    const state = createInitialState();
    const sectionId = exerciseSections[0].id;

    const nextState = trainingProgressReducer(
      state,
      setVideoCompleted({ sectionId, watchedSeconds: 58.999, durationSeconds: 60 }),
    );

    expect(nextState.progressBySectionId[sectionId].videoCompleted).toBe(false);
  });

  it.each([
    { caseName: 'zero', durationSeconds: 0 },
    { caseName: 'negative', durationSeconds: -1 },
    { caseName: 'NaN', durationSeconds: Number.NaN },
    { caseName: 'infinite', durationSeconds: Number.POSITIVE_INFINITY },
  ])('does not complete a video with a $caseName duration', ({ durationSeconds }) => {
    const state = createInitialState();
    const sectionId = exerciseSections[0].id;

    const nextState = trainingProgressReducer(
      state,
      setVideoCompleted({ sectionId, watchedSeconds: durationSeconds, durationSeconds }),
    );

    expect(nextState.progressBySectionId[sectionId].videoCompleted).toBe(false);
  });

  it('rounds the final video position down when completing a video', () => {
    const state = createInitialState();
    const sectionId = exerciseSections[0].id;

    const nextState = trainingProgressReducer(
      state,
      setVideoCompleted({ sectionId, watchedSeconds: 60.75, durationSeconds: 60.75 }),
    );

    expect(nextState.progressBySectionId[sectionId]).toMatchObject({
      videoCurrentSecond: 60,
      videoWatchedSeconds: 60.75,
      videoDurationSeconds: 60.75,
      videoCompleted: true,
    });
  });
});
