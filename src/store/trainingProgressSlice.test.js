import { describe, expect, it } from 'vitest';
import { exerciseSections } from '../data/learningContent';
import trainingProgressReducer, {
  startVideoPlayback,
  //stopVideoPlayback,
  completeTraining,
  pauseTraining,
  resetTraining,
  setReadyToBeCompleted,
  setVideoCompleted,
  setVideoProgress,
  startTraining,
} from './trainingProgressSlice';

const START_TIME_MS = 1000;

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

function createRunningState(sectionId, startedAtMs = 1_000) {
  const state = completeVideo(createInitialState(), sectionId);

  return trainingProgressReducer(state, startTraining({ sectionId, startedAtMs }));
}

function createReadyToCompleteState(sectionId, startedAtMs = 1_000) {
  const state = createRunningState(sectionId, startedAtMs);

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

  it('does not start a second video section while another video section is being played', () => {
    const [firstSection, secondSection] = exerciseSections;
    let state = createInitialState();

    state = trainingProgressReducer(
      state,
      startVideoPlayback({
        sectionId: firstSection.id,
      }),
    );

    expect(state.activeSectionId).toBe(firstSection.id);

    const nextState = trainingProgressReducer(
      state,
      startVideoPlayback({
        sectionId: secondSection.id,
      }),
    );

    expect(nextState.activeSectionId).toBe(firstSection.id);
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
    state = trainingProgressReducer(state, startTraining({ sectionId: firstSection.id, startedAtMs: 1000 }));

    expect(state.progressBySectionId[firstSection.id].status).toBe('running');
    expect(state.progressBySectionId[secondSection.id].status).toBe('idle');
    expect(state.progressBySectionId[secondSection.id].startedAtMs).toBeNull();
    expect(state.activeSectionId).toBe(firstSection.id);

    const nextState = trainingProgressReducer(state, startTraining({ sectionId: secondSection.id, startedAtMs: 2000 }));

    expect(nextState.progressBySectionId[firstSection.id].status).toBe('running');
    expect(nextState.progressBySectionId[firstSection.id].startedAtMs).toBe(1000);
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
  });
});

/*-------------------------TRAINING PAUSE---------------------------*/
describe('trainingProgressSlice training pause', () => {
  it.each(['idle', 'paused', 'readyToComplete', 'completed'])('does not pause a section with status %s', (status) => {
    const sectionId = exerciseSections[0].id;
    let state;

    if (status === 'idle') {
      state = completeVideo(createInitialState(), sectionId);
    } else if (status === 'paused') {
      const runningState = createRunningState(sectionId);
      state = trainingProgressReducer(runningState, pauseTraining({ sectionId, elapsedTrainingMs: 2_000 }));
    } else {
      state = createReadyToCompleteState(sectionId);

      if (status === 'completed') {
        state = trainingProgressReducer(state, completeTraining({ sectionId }));
      }
    }

    const nextState = trainingProgressReducer(state, pauseTraining({ sectionId, elapsedTrainingMs: 10_000 }));

    expect(nextState).toBe(state);
  });

  it('calculates the current session duration from its start timestamp', () => {
    const sectionId = exerciseSections[0].id;
    const state = createRunningState(sectionId, 5_000);

    const nextState = trainingProgressReducer(state, pauseTraining({ sectionId, elapsedTrainingMs: 8_500 }));

    expect(nextState.progressBySectionId[sectionId].elapsedTrainingMs).toBe(3_500);
  });

  it('sets the status to paused when the required duration has not been reached', () => {
    const sectionId = exerciseSections[0].id;
    const state = createRunningState(sectionId, START_TIME_MS);
    const requiredTrainingMs = state.progressBySectionId[sectionId].requiredTrainingMs;

    const nextState = trainingProgressReducer(
      state,
      // -1 is subtracted to obtain elapsedTrainingMs < requiredTrainingMs
      pauseTraining({ sectionId, elapsedTrainingMs: START_TIME_MS + requiredTrainingMs - 1 }),
    );

    expect(nextState.progressBySectionId[sectionId].status).toBe('paused');
  });

  it('sets the status to readyToComplete when the required duration has been reached', () => {
    const sectionId = exerciseSections[0].id;
    const state = createRunningState(sectionId, START_TIME_MS);
    const requiredTrainingMs = state.progressBySectionId[sectionId].requiredTrainingMs;

    const nextState = trainingProgressReducer(
      state,
      pauseTraining({ sectionId, elapsedTrainingMs: START_TIME_MS + requiredTrainingMs }),
    );

    expect(nextState.progressBySectionId[sectionId].status).toBe('readyToComplete');
  });

  it('clears activeSectionId after pausing the active section', () => {
    const sectionId = exerciseSections[0].id;
    const state = createRunningState(sectionId, START_TIME_MS);

    const nextState = trainingProgressReducer(state, pauseTraining({ sectionId, elapsedTrainingMs: 2_000 }));

    expect(nextState.activeSectionId).toBeNull();
  });

  it('does not modify the state when pausing a section that is not active', () => {
    const [runningSection, notActiveSection] = exerciseSections;
    const runningState = createRunningState(runningSection.id, START_TIME_MS);
    const state = {
      ...runningState,
      progressBySectionId: {
        ...runningState.progressBySectionId,
        [notActiveSection.id]: {
          ...runningState.progressBySectionId[notActiveSection.id],
          elapsedTrainingMs: 0,
          startedAtMs: null,
          status: 'idle',
        },
      },
      activeSectionId: runningSection.id,
    };

    const nextState = trainingProgressReducer(
      runningState,
      // If the section was not running the elapsedTrainingMs value is ignored
      pauseTraining({ sectionId: notActiveSection.id, elapsedTrainingMs: 2_000 }),
    );

    expect(nextState).toStrictEqual(state);
  });
});

/*-------------------------REQUIRED TRAINING DURATION---------------------------*/
describe('trainingProgressSlice required training duration', () => {
  it('ignores setReadyToBeCompleted when the section is not running', () => {
    const sectionId = exerciseSections[0].id;
    const state = completeVideo(createInitialState(), sectionId);

    const nextState = trainingProgressReducer(
      state,
      setReadyToBeCompleted({
        sectionId,
        elapsedTrainingMs: state.progressBySectionId[sectionId].requiredTrainingMs,
      }),
    );

    expect(nextState).toBe(state);
  });

  it('ignores setReadyToBeCompleted below the required duration', () => {
    const sectionId = exerciseSections[0].id;
    const state = createRunningState(sectionId);
    const requiredTrainingMs = state.progressBySectionId[sectionId].requiredTrainingMs;

    const nextState = trainingProgressReducer(
      state,
      setReadyToBeCompleted({ sectionId, elapsedTrainingMs: requiredTrainingMs - 1 }),
    );

    expect(nextState).toBe(state);
  });

  it('sets the status to readyToComplete at the required duration', () => {
    const sectionId = exerciseSections[0].id;
    const state = createRunningState(sectionId);
    const requiredTrainingMs = state.progressBySectionId[sectionId].requiredTrainingMs;

    const nextState = trainingProgressReducer(
      state,
      setReadyToBeCompleted({ sectionId, elapsedTrainingMs: requiredTrainingMs }),
    );

    expect(nextState.progressBySectionId[sectionId].status).toBe('readyToComplete');
  });

  it('caps the saved elapsed time at exactly the required duration', () => {
    const sectionId = exerciseSections[0].id;
    const state = createRunningState(sectionId);
    const requiredTrainingMs = state.progressBySectionId[sectionId].requiredTrainingMs;

    const nextState = trainingProgressReducer(
      state,
      setReadyToBeCompleted({ sectionId, elapsedTrainingMs: requiredTrainingMs + 1_000 }),
    );

    expect(nextState.progressBySectionId[sectionId].elapsedTrainingMs).toBe(requiredTrainingMs);
  });

  it('clears activeSectionId after reaching the required duration', () => {
    const sectionId = exerciseSections[0].id;
    const state = createRunningState(sectionId);
    const requiredTrainingMs = state.progressBySectionId[sectionId].requiredTrainingMs;

    const nextState = trainingProgressReducer(
      state,
      setReadyToBeCompleted({ sectionId, elapsedTrainingMs: requiredTrainingMs }),
    );

    expect(nextState.activeSectionId).toBeNull();
  });

  it('does not modify the state after repeated setReadyToBeCompleted actions', () => {
    const sectionId = exerciseSections[0].id;
    const readyState = createReadyToCompleteState(sectionId);

    const nextState = trainingProgressReducer(
      readyState,
      setReadyToBeCompleted({
        sectionId,
        elapsedTrainingMs: readyState.progressBySectionId[sectionId].requiredTrainingMs + 1_000,
      }),
    );

    expect(nextState).toBe(readyState);
  });
});

/*-------------------------TRAINING COMPLETION---------------------------*/
describe('trainingProgressSlice training completion and unlocking', () => {
  it.each(['idle', 'running', 'paused'])(
    'ignores completeTraining when the section status is %s',
    (status) => {
      const sectionId = exerciseSections[0].id;
      let state = createInitialState();

      if (status === 'running' || status === 'paused') {
        state = createRunningState(sectionId);
      }

      if (status === 'paused') {
        state = trainingProgressReducer(state, pauseTraining({ sectionId, elapsedTrainingMs: 2_000 }));
      }

      const nextState = trainingProgressReducer(state, completeTraining({ sectionId }));

      expect(nextState).toBe(state);
    },
  );

  it('sets status to completed and trainingCompleted to true', () => {
    const sectionId = exerciseSections[0].id;
    const state = createReadyToCompleteState(sectionId);

    const nextState = trainingProgressReducer(state, completeTraining({ sectionId }));

    expect(nextState.progressBySectionId[sectionId]).toMatchObject({
      status: 'completed',
      trainingCompleted: true,
    });
  });

  it('unlocks only the section immediately following the completed section', () => {
    const [completedSection, nextSection, ...remainingSections] = exerciseSections;
    const state = createReadyToCompleteState(completedSection.id);

    const nextState = trainingProgressReducer(state, completeTraining({ sectionId: completedSection.id }));

    expect(nextState.progressBySectionId[nextSection.id].isLocked).toBe(false);

    remainingSections.forEach((section) => {
      expect(nextState.progressBySectionId[section.id].isLocked).toBe(true);
    });
  });

  it('does not alter sections unrelated to the completed or next section', () => {
    const [completedSection, , ...unrelatedSections] = exerciseSections;
    const state = createReadyToCompleteState(completedSection.id);

    const nextState = trainingProgressReducer(state, completeTraining({ sectionId: completedSection.id }));

    unrelatedSections.forEach((section) => {
      expect(nextState.progressBySectionId[section.id]).toBe(state.progressBySectionId[section.id]);
    });
  });

  it('completes the last section without errors', () => {
    const lastSection = exerciseSections.at(-1);
    const state = createReadyToCompleteState(lastSection.id);

    const nextState = trainingProgressReducer(state, completeTraining({ sectionId: lastSection.id }));

    expect(nextState.progressBySectionId[lastSection.id]).toMatchObject({
      status: 'completed',
      trainingCompleted: true,
    });
  });

  it('does not unlock any section when completion is attempted too early', () => {
    const [section, ...otherSections] = exerciseSections;
    const state = createRunningState(section.id);

    const nextState = trainingProgressReducer(state, completeTraining({ sectionId: section.id }));

    expect(nextState).toBe(state);
    otherSections.forEach((otherSection) => {
      expect(nextState.progressBySectionId[otherSection.id].isLocked).toBe(true);
    });
  });

  it('does not modify the state when completing the same section twice', () => {
    const sectionId = exerciseSections[0].id;
    const readyState = createReadyToCompleteState(sectionId);
    const completedState = trainingProgressReducer(readyState, completeTraining({ sectionId }));

    const nextState = trainingProgressReducer(completedState, completeTraining({ sectionId }));

    expect(nextState).toBe(completedState);
  });
});

/*-------------------------TRAINING RESET---------------------------*/
describe('trainingProgressSlice training reset', () => {
  it.each(['idle', 'running', 'paused'])('ignores resetTraining when the section status is %s', (status) => {
    const sectionId = exerciseSections[0].id;
    let state = createInitialState();

    if (status === 'running' || status === 'paused') {
      state = createRunningState(sectionId);
    }

    if (status === 'paused') {
      state = trainingProgressReducer(state, pauseTraining({ sectionId, elapsedTrainingMs: 2_000 }));
    }

    const nextState = trainingProgressReducer(state, resetTraining({ sectionId }));

    expect(nextState).toBe(state);
  });

  it.each(['readyToComplete', 'completed'])(
    'clears elapsed time and timestamp and sets status to idle when resetting from %s',
    (status) => {
      const sectionId = exerciseSections[0].id;
      let state = createReadyToCompleteState(sectionId);

      if (status === 'completed') {
        state = trainingProgressReducer(state, completeTraining({ sectionId }));
      }

      const nextState = trainingProgressReducer(state, resetTraining({ sectionId }));

      expect(nextState.progressBySectionId[sectionId]).toMatchObject({
        elapsedTrainingMs: 0,
        startedAtMs: null,
        status: 'idle',
      });
    },
  );

  it.each(['readyToComplete', 'completed'])('preserves videoCompleted when resetting from %s', (status) => {
    const sectionId = exerciseSections[0].id;
    let state = createReadyToCompleteState(sectionId);

    if (status === 'completed') {
      state = trainingProgressReducer(state, completeTraining({ sectionId }));
    }

    const nextState = trainingProgressReducer(state, resetTraining({ sectionId }));

    expect(nextState.progressBySectionId[sectionId].videoCompleted).toBe(true);
  });

  it('preserves trainingCompleted after resetting a completed section', () => {
    const sectionId = exerciseSections[0].id;
    const readyState = createReadyToCompleteState(sectionId);
    const completedState = trainingProgressReducer(readyState, completeTraining({ sectionId }));

    const nextState = trainingProgressReducer(completedState, resetTraining({ sectionId }));

    expect(nextState.progressBySectionId[sectionId].trainingCompleted).toBe(true);
  });

  it('does not lock a section that was already unlocked', () => {
    const [completedSection, unlockedSection] = exerciseSections;
    const readyState = createReadyToCompleteState(completedSection.id);
    const completedState = trainingProgressReducer(
      readyState,
      completeTraining({ sectionId: completedSection.id }),
    );

    expect(completedState.progressBySectionId[unlockedSection.id].isLocked).toBe(false);

    const nextState = trainingProgressReducer(completedState, resetTraining({ sectionId: completedSection.id }));

    expect(nextState.progressBySectionId[unlockedSection.id].isLocked).toBe(false);
    expect(nextState.progressBySectionId[unlockedSection.id]).toBe(
      completedState.progressBySectionId[unlockedSection.id],
    );
  });
});
