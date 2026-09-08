import { describe, expect, it } from 'vitest';
import { exerciseSections } from '../data/learningContent';
import trainingProgressReducer, {
  completeTraining,
  pauseTraining,
  setReadyToBeCompleted,
  setVideoCompleted,
  setVideoProgress,
  startTraining,
} from './trainingProgressSlice';

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

function completeVideo(state, sectionId) {
  /**
   * With the approach 'trainingProgressReducer(state, action)' what happens is:
   *
   * startTraining(payload)
   *     ↓
   *   creates the action
   *     ↓
   *   trainingProgressReducer(state, action)
   *     ↓
   *   we obtain the nextState
   *
   * Therefore in a test case we pass the action to the reducer manually and skip the store and dispatch phases
   *
   */
  return trainingProgressReducer(state, setVideoCompleted({ sectionId, watchedSeconds: 60, durationSeconds: 60 }));
}

function createReadyToCompleteState(sectionId, startedAtMs = 1_000) {
  let state = completeVideo(createInitialState(), sectionId);
  state = trainingProgressReducer(state, startTraining({ sectionId, startedAtMs }));

  return trainingProgressReducer(
    state,
    setReadyToBeCompleted({
      sectionId,
      elapsedTrainingMs: state.progressBySectionId[sectionId].requiredTrainingMs,
    }),
  );
}

/*-------------------------TRAINING INITIAL STATE---------------------------*/

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

/*-------------------------VIDEO UPDATE---------------------------*/

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

/*-------------------------TRAINING STARTUP---------------------------*/
describe('trainingProgressSlice training startup', () => {
  it('does not start before the video is completed', () => {
    const state = createInitialState();
    const sectionId = exerciseSections[0].id;

    const nextState = trainingProgressReducer(state, startTraining({ sectionId, startedAtMs: 1000 }));

    const progress = nextState.progressBySectionId[sectionId];

    expect(progress.status).toBe('idle');
    expect(progress.startedAtMs).toBeNull();
    expect(nextState.activeSectionId).toBeNull();
  });

  it('stores the timestamp and sets the status to running on the first valid start and sets the first started section as the active section', () => {
    const sectionId = exerciseSections[0].id;
    const state = completeVideo(createInitialState(), sectionId);

    const nextState = trainingProgressReducer(state, startTraining({ sectionId, startedAtMs: 1000 }));

    expect(nextState.progressBySectionId[sectionId]).toMatchObject({
      startedAtMs: 1000,
      status: 'running',
    });
    expect(nextState.activeSectionId).toBe(sectionId);
  });

  it('does not start a second section while another section is active', () => {
    const [firstSection, secondSection] = exerciseSections;
    let state = completeVideo(createInitialState(), firstSection.id);
    state = completeVideo(state, secondSection.id);
    state = trainingProgressReducer(state, startTraining({ sectionId: firstSection.id, startedAtMs: 1_000 }));

    const nextState = trainingProgressReducer(
      state,
      startTraining({ sectionId: secondSection.id, startedAtMs: 2_000 }),
    );

    expect(nextState.progressBySectionId[secondSection.id].status).toBe('idle');
    expect(nextState.progressBySectionId[secondSection.id].startedAtMs).toBeNull();
    expect(nextState.activeSectionId).toBe(firstSection.id);
  });

  it.each(['readyToComplete', 'completed'])('does not start from the %s status', (status) => {
    const sectionId = exerciseSections[0].id;
    let state = createReadyToCompleteState(sectionId);

    if (status === 'completed') {
      state = trainingProgressReducer(state, completeTraining({ sectionId }));
    }

    const nextState = trainingProgressReducer(state, startTraining({ sectionId, startedAtMs: 2_000 }));

    expect(nextState.progressBySectionId[sectionId].status).toBe(status);
    expect(nextState.progressBySectionId[sectionId].startedAtMs).toBe(1_000);
    expect(nextState.activeSectionId).toBeNull();
  });

  it('does not modify startedAtMs after an invalid start attempt', () => {
    const state = createInitialState();
    const sectionId = exerciseSections[0].id;

    const nextState = trainingProgressReducer(state, startTraining({ sectionId, startedAtMs: 1_000 }));

    expect(nextState.progressBySectionId[sectionId].startedAtMs).toBeNull();
  });

  it('resumes with a new session start without including the paused time', () => {
    const sectionId = exerciseSections[0].id;
    let state = completeVideo(createInitialState(), sectionId);
    state = trainingProgressReducer(state, startTraining({ sectionId, startedAtMs: 1_000 }));
    state = trainingProgressReducer(state, pauseTraining({ sectionId, elapsedTrainingMs: 3_000 }));

    const resumedState = trainingProgressReducer(state, startTraining({ sectionId, startedAtMs: 10_000 }));

    expect(resumedState.progressBySectionId[sectionId]).toMatchObject({
      elapsedTrainingMs: 2_000,
      startedAtMs: 10_000,
      status: 'running',
    });

    const pausedAgainState = trainingProgressReducer(
      resumedState,
      pauseTraining({ sectionId, elapsedTrainingMs: 11_000 }),
    );

    expect(pausedAgainState.progressBySectionId[sectionId].elapsedTrainingMs).toBe(3_000);
  });
});
