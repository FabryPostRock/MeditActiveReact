import { createElement } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { exerciseSections } from '../data/learningContent';
import useTrainingTimer from './timerHooks';
import trainingProgressReducer, { pauseTraining, setReadyToBeCompleted, startTraining } from './trainingProgressSlice';

const CURRENT_TIME_MS = 100_000;

function createTrainingProgressState(section, progressOverrides = {}) {
  const state = trainingProgressReducer(undefined, { type: '@@INIT' });
  const progress = {
    ...state.progressBySectionId[section.id],
    videoCompleted: true,
    ...progressOverrides,
  };

  return {
    ...state,
    progressBySectionId: {
      ...state.progressBySectionId,
      [section.id]: progress,
    },
    activeSectionId: progress.status === 'running' ? section.id : null,
  };
}

function createTestStore(section, progressOverrides = {}) {
  const dispatchedActions = [];

  /**
   * Redux middleware has the signature `storeApi => next => action`:
   * - the unused first argument 'storeApi' normally provides `dispatch` and `getState`
   *    In the following code is not use therefore instead of 'recordActions = (storeApi)'
   *    we have 'recordActions = ()'
   * - `next` forwards the action to the next middleware in the chain;
   * - after the last middleware, Redux's original dispatch runs the reducer.
   *
   * Recording happens before the reducer. Returning `next(action)` is essential:
   * without it, the action would stop here and the Redux state would not change.
   * Calling `storeApi.dispatch(action)` instead would restart the whole middleware
   * chain, while `next(action)` continues from the following middleware.
   *
   * The default thunk middleware intercepts function actions and invokes them with
   * `dispatch` and `getState`. A thunk changes state only by dispatching a regular
   * action; regular action objects are forwarded with `next(action)` to the reducer.
   */
  const recordActions = () => (next) => (action) => {
    dispatchedActions.push(action);
    return next(action);
  };

  const store = configureStore({
    reducer: {
      trainingProgress: trainingProgressReducer,
    },
    preloadedState: {
      trainingProgress: createTrainingProgressState(section, progressOverrides),
    },
    // Keep Redux Toolkit's default middleware, including thunk and development
    // checks, then append the test-only action recorder to the middleware chain.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(recordActions),
  });

  return { store, dispatchedActions };
}

/**
 * Hooks using useAppSelector or useAppDispatch need React Redux context.
 * This wrapper supplies the isolated test store through Provider when renderHook
 * mounts its internal test component.
 */
function createWrapper(store) {
  return function TestStoreProvider({ children }) {
    return createElement(Provider, { store }, children);
  };
}

function getCompletionActions(dispatchedActions) {
  return dispatchedActions.filter((action) => action.type === setReadyToBeCompleted.type);
}

beforeEach(() => {
  // Replace real browser timers with Vitest-controlled timers so tests can move
  // time forward instantly and deterministically instead of waiting in real time.
  vi.useFakeTimers();

  // Set the fake clock used by Date.now(). Setting the clock alone does not run
  // scheduled callbacks. advanceTimersByTime does that explicitly in each test.
  vi.setSystemTime(CURRENT_TIME_MS);

  // Silence application logs while retaining a spy that could still be asserted.
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  // Unmount rendered hooks, restore real timers, and remove all temporary spies.
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useTrainingTimer', () => {
  it.each(['idle', 'paused', 'readyToComplete', 'completed'])(
    'does not create an interval when the training status is %s',
    (status) => {
      const section = exerciseSections[0];
      const setIntervalSpy = vi.spyOn(window, 'setInterval');
      const { store } = createTestStore(section, {
        status,
        startedAtMs: CURRENT_TIME_MS - 1_000,
      });
      /** 'useTrainingTimer' is not a normal function because it contains useState and useEffect hooks.
       Therefore it has to be called into a component. 
       Using renderHook the following sequence occurs:
        renderHook(...)
            ↓
        test component creation
            ↓
        React renders the component
            ↓
        the component calls useTrainingTimer(section)
            ↓
        useTrainingTimer can now use useState, useEffect and Redux hook
      
      'renderHook' executes the hook inside a React test component. The wrapper
       provides the Redux store required by useAppSelector and useAppDispatch.
       An alternative to 'renderHook' is to manually create the function component and then
       render it like:

        let timerResult;

        function TimerTestComponent() {
          timerResult = useTrainingTimer(section);
          return null;
        }
        .
        .
        render(
            <Provider store={store}>
              <TimerTestComponent />
            </Provider>,
          );
      */
      renderHook(() => useTrainingTimer(section), {
        wrapper: createWrapper(store),
      });

      expect(setIntervalSpy).not.toHaveBeenCalled();
    },
  );

  it('reports the running time immediately without waiting for the first interval', () => {
    const section = exerciseSections[0];
    const { store } = createTestStore(section, {
      status: 'running',
      startedAtMs: CURRENT_TIME_MS - 750,
    });

    const { result } = renderHook(() => useTrainingTimer(section), {
      wrapper: createWrapper(store),
    });

    // currentSessionMs is returned by 'useTrainingTimer'
    expect(result.current.currentSessionMs).toBe(750);
  });

  it('updates the running time every second', () => {
    const section = exerciseSections[0];
    const { store } = createTestStore(section, {
      status: 'running',
      startedAtMs: CURRENT_TIME_MS,
    });
    /*
    The complete object returned by renderHook():

    {
      result: {
        current: {
          progress: // stato della sezione ,
          totalElapsedMs: 750,
          currentSessionMs: 750,
        },
      },
      rerender: function rerender() {},
      unmount: function unmount() {},
    }
    */
    const { result } = renderHook(() => useTrainingTimer(section), {
      wrapper: createWrapper(store),
    });

    // Advancing the fake clock executes callbacks scheduled during this second.
    // act waits for the resulting setNow call and React render before assertions.
    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current.currentSessionMs).toBe(1_000);

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current.currentSessionMs).toBe(2_000);
  });

  it('returns currentSessionMs and totalElapsedMs correctly', () => {
    const section = exerciseSections[0];
    const { store } = createTestStore(section, {
      status: 'running',
      startedAtMs: CURRENT_TIME_MS - 800,
      elapsedTrainingMs: 1_200,
    });

    const { result } = renderHook(() => useTrainingTimer(section), {
      wrapper: createWrapper(store),
    });

    expect(result.current.currentSessionMs).toBe(800);
    expect(result.current.totalElapsedMs).toBe(2_000);
  });

  it('does not return totalElapsedMs above requiredTrainingMs', () => {
    const section = exerciseSections[0];
    const requiredTrainingMs = section.requiredTrainingMs;
    const { store } = createTestStore(section, {
      status: 'running',
      startedAtMs: CURRENT_TIME_MS - 2_000,
      elapsedTrainingMs: requiredTrainingMs - 1_000,
    });

    const { result } = renderHook(() => useTrainingTimer(section), {
      wrapper: createWrapper(store),
    });

    expect(result.current.totalElapsedMs).toBe(requiredTrainingMs);
  });

  it('does not return negative values when startedAtMs is in the future', () => {
    const section = exerciseSections[0];
    const { store } = createTestStore(section, {
      status: 'running',
      startedAtMs: CURRENT_TIME_MS + 1_000,
      elapsedTrainingMs: 500,
    });

    const { result } = renderHook(() => useTrainingTimer(section), {
      wrapper: createWrapper(store),
    });

    expect(result.current.currentSessionMs).toBe(0);
    expect(result.current.totalElapsedMs).toBe(500);
  });

  it('dispatches setReadyToBeCompleted when the required duration is reached', () => {
    const section = exerciseSections[0];
    const { store, dispatchedActions } = createTestStore(section, {
      status: 'running',
      startedAtMs: CURRENT_TIME_MS - section.requiredTrainingMs,
    });

    renderHook(() => useTrainingTimer(section), {
      wrapper: createWrapper(store),
    });

    expect(getCompletionActions(dispatchedActions)).toEqual([
      setReadyToBeCompleted({
        sectionId: section.id,
        elapsedTrainingMs: section.requiredTrainingMs,
      }),
    ]);
  });

  it('dispatches the temporal completion action only once', () => {
    const section = exerciseSections[0];
    const { store, dispatchedActions } = createTestStore(section, {
      status: 'running',
      startedAtMs: CURRENT_TIME_MS - section.requiredTrainingMs + 1_000,
    });

    renderHook(() => useTrainingTimer(section), {
      wrapper: createWrapper(store),
    });

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(getCompletionActions(dispatchedActions)).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(getCompletionActions(dispatchedActions)).toHaveLength(1);
  });

  it('clears the interval when the training is paused', () => {
    const section = exerciseSections[0];
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { store } = createTestStore(section, {
      status: 'running',
      startedAtMs: CURRENT_TIME_MS,
    });

    renderHook(() => useTrainingTimer(section), {
      wrapper: createWrapper(store),
    });

    act(() => {
      store.dispatch(
        pauseTraining({
          sectionId: section.id,
          elapsedTrainingMs: Date.now(),
        }),
      );
    });

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });

  it('clears the interval when the selected section changes', () => {
    const [firstSection, secondSection] = exerciseSections;
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { store } = createTestStore(firstSection, {
      status: 'running',
      startedAtMs: CURRENT_TIME_MS,
    });
    const { rerender } = renderHook(({ section }) => useTrainingTimer(section), {
      initialProps: { section: firstSection },
      wrapper: createWrapper(store),
    });

    //updates the view with the second section
    rerender({ section: secondSection });

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });

  it('clears the interval when the hook is unmounted', () => {
    const section = exerciseSections[0];
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { store } = createTestStore(section, {
      status: 'running',
      startedAtMs: CURRENT_TIME_MS,
    });
    const { unmount } = renderHook(() => useTrainingTimer(section), {
      wrapper: createWrapper(store),
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });

  it('counts only active training time after pausing and resuming', () => {
    const section = exerciseSections[0];
    const { store } = createTestStore(section, {
      status: 'running',
      startedAtMs: CURRENT_TIME_MS,
    });
    const { result } = renderHook(() => useTrainingTimer(section), {
      wrapper: createWrapper(store),
    });

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(result.current.totalElapsedMs).toBe(2_000);

    act(() => {
      store.dispatch(
        pauseTraining({
          sectionId: section.id,
          elapsedTrainingMs: Date.now(),
        }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(result.current.totalElapsedMs).toBe(2_000);

    act(() => {
      store.dispatch(
        startTraining({
          sectionId: section.id,
          startedAtMs: Date.now(),
        }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current.currentSessionMs).toBe(1_000);
    expect(result.current.totalElapsedMs).toBe(3_000);
  });
});
