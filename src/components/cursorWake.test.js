import { createElement } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CursorWake } from './cursorWake';

let animationFrameCallbacks;
let canvasContext;
let requestAnimationFrameMock;

function createCanvasContextMock() {
  return {
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
    lineCap: '',
    lineJoin: '',
    lineWidth: 0,
    shadowBlur: 0,
    shadowColor: '',
    strokeStyle: '',
  };
}

function renderCursorWake() {
  const result = render(createElement('div', { className: 'page-isolation' }, createElement(CursorWake)));

  return {
    ...result,
    pageIsolation: result.container.querySelector('.page-isolation'),
  };
}

function dispatchMouseMove(element, x, y) {
  const event = new MouseEvent('pointermove', {
    bubbles: true,
    clientX: x,
    clientY: y,
  });

  Object.defineProperty(event, 'pointerType', { value: 'mouse' });
  fireEvent(element, event);
}

function runNextAnimationFrame(timestamp) {
  // shift(): take the first array item, removes it from the array and returns it.
  const callback = animationFrameCallbacks.shift();

  if (!callback) {
    throw new Error('Expected a pending animation frame callback.');
  }

  callback(timestamp);
}

beforeEach(() => {
  animationFrameCallbacks = [];
  canvasContext = createCanvasContextMock();

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(canvasContext);

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: true,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );

  let nextAnimationFrameId = 1;
  requestAnimationFrameMock = vi.fn((callback) => {
    // The callback is the 'animate' function in CursorWake. It's like having 'requestAnimationFrameMock(animate);'
    animationFrameCallbacks.push(callback);
    const animationFrameId = nextAnimationFrameId;
    nextAnimationFrameId += 1;
    return animationFrameId;
  });
  // The real browser requestAnimationFrame is mocked with requestAnimationFrameMock
  vi.stubGlobal('requestAnimationFrame', requestAnimationFrameMock);
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  document.documentElement.style.setProperty('--bs-secondary-rgb', '226, 106, 8');
});

afterEach(() => {
  cleanup();
  document.documentElement.style.removeProperty('--bs-secondary-rgb');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('CursorWake circle generation', () => {
  it('emits one circle only after the mouse reaches the minimum movement distance', () => {
    const { pageIsolation } = renderCursorWake();

    dispatchMouseMove(pageIsolation, 0, 0);
    dispatchMouseMove(pageIsolation, 20, 0);

    // Not called because mouse path is less then 35
    expect(requestAnimationFrameMock).not.toHaveBeenCalled();
    expect(canvasContext.arc).not.toHaveBeenCalled();

    // Rejected samples do not replace the emission origin, so movement accumulates from the last accepted point.
    dispatchMouseMove(pageIsolation, 35, 0);
    expect(requestAnimationFrameMock).toHaveBeenCalledTimes(1);

    // 100 is the timestamp
    runNextAnimationFrame(100);

    expect(canvasContext.arc.mock.calls).toEqual([[35, 0, 20, 0, Math.PI * 2]]);
  });

  it('limits the active circle collection to fifteen items', () => {
    const { pageIsolation } = renderCursorWake();

    dispatchMouseMove(pageIsolation, 0, 0);

    // Eight accepted movements create 8 circles, forcing the oldest item out of the capped collection.
    for (let movementIndex = 1; movementIndex <= 8; movementIndex += 1) {
      dispatchMouseMove(pageIsolation, movementIndex * 35, 0);
    }

    // A running animation loop must be reused instead of scheduling one loop for every pointer event.
    expect(requestAnimationFrameMock).toHaveBeenCalledTimes(1);

    // 100ms after
    runNextAnimationFrame(100);

    // Eight circles created
    expect(canvasContext.arc).toHaveBeenCalledTimes(8);
  });

  it('shrinks expired circles and stops scheduling animation frames', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const { pageIsolation } = renderCursorWake();

    dispatchMouseMove(pageIsolation, 0, 0);
    dispatchMouseMove(pageIsolation, 35, 0);
    dispatchMouseMove(pageIsolation, 80, 0);

    // The first frame establishes the time baseline, while later frames advance by the algorithm's 40 ms cap.
    runNextAnimationFrame(100);

    for (let frameIndex = 1; frameIndex <= 38; frameIndex += 1) {
      runNextAnimationFrame(100 + frameIndex * 40);
    }

    // [, , radius] : Takes the third argument. 'arc' receives 'arc(x, y, radius, startAngle, endAngle)'
    const drawnCirclesRadius = canvasContext.arc.mock.calls.map(([, , radius]) => radius);

    /* First radius in the first frame has to be 20 
      age = 0
      timeProgressRatio = 0 / 1520 = 0
      negExpFactor = (1 - 0) ^ 1.6 = 1
      radius = 6 + 1 × 14 = 20
    */
    expect(drawnCirclesRadius[0]).toBe(20);
    /* Radius in the last array element
      age = 0
      timeProgressRatio = 0 / 1520 = 0
      negExpFactor = (1 -  1) ^ 1.6 = 0
      radius = 6 + 0 × 14 = 6
    */
    expect(drawnCirclesRadius.at(-1)).toBe(6);
    expect(animationFrameCallbacks).toHaveLength(0);
    expect(requestAnimationFrameMock).toHaveBeenCalledTimes(39);
  });
});
