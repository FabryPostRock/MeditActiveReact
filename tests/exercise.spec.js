import { expect, test } from '@playwright/test';
//import { setVideoCompleted } from '../src/store/trainingProgressSlice';

const exerciseSections = [
  {
    id: 'breathing-section-1',
    exerciseId: 'breathing-basics',
    title: 'Respirazione da sdraiato con mani sulla pancia',
    description:
      'Sdraiati comodamente e appoggia le mani sulla pancia. Porta l’attenzione al movimento dell’addome mentre respiri, senza forzare: senti le mani sollevarsi durante l’inspirazione e abbassarsi durante l’espirazione. L’obiettivo è prendere consapevolezza del respiro e imparare a lasciarlo fluire in modo naturale.',
    videoUrl: '/videos/resp-sdraiato-1.mp4',
    thumbnailUrl: '../assets/img/resp-sdraiato-1.png',
    requiredTrainingMs: 5000,
    nextSectionId: 'breathing-section-2',
  },
  {
    id: 'breathing-section-2',
    exerciseId: 'breathing-basics',
    title: 'Respirazione da sdraiato con libro sulla pancia',
    description:
      'Sdraiati e appoggia un libro leggero sulla pancia. Osserva come il respiro lo fa salire durante l’inspirazione e scendere durante l’espirazione. Il piccolo peso offre un riferimento visivo e tattile che aiuta a percepire meglio il movimento addominale e a rendere il respiro più consapevole e regolare.',
    videoUrl: '/videos/resp-sdraiato-2.mp4',
    thumbnailUrl: '../assets/img/resp-sdraiato-2.png',
    requiredTrainingMs: 5000,
    nextSectionId: 'breathing-section-3',
  },
  {
    id: 'breathing-section-3',
    exerciseId: 'breathing-basics',
    title: 'Respirazione da in piedi',
    description:
      'Porta ora la respirazione appresa da sdraiato nella posizione eretta. Mantieni il corpo rilassato, le ginocchia morbide e il busto naturale. Respira osservando il movimento dell’addome senza irrigidirti. L’obiettivo è mantenere un respiro calmo e consapevole anche quando il corpo deve sostenersi contro la gravità.',
    videoUrl: '/videos/resp-inpiedi-3.mp4',
    thumbnailUrl: '../assets/img/resp-inpiedi-3.png',
    requiredTrainingMs: 5000,
    nextSectionId: 'feet-position-section-1',
  },
  {
    id: 'feet-position-section-1',
    exerciseId: 'feet-basics',
    title: 'Respirare con la terra',
    description:
      'In piedi, porta l’attenzione contemporaneamente al respiro e al contatto dei piedi con il terreno. Durante ogni ciclo respiratorio percepisci il corpo che si rilassa e il peso che scende verso la terra. Non cercare di spingere: lascia che respiro, postura e appoggio dei piedi inizino gradualmente a lavorare insieme.',
    videoUrl: '/videos/mov-piedi-1.mp4',
    thumbnailUrl: '../assets/img/mov-piedi-1.png',
    requiredTrainingMs: 5000,
    nextSectionId: 'feet-position-section-2',
  },
  {
    id: 'feet-position-section-2',
    exerciseId: 'feet-basics',
    title: 'Sentire la distribuzione del peso sulla terra',
    description:
      'Porta l’attenzione sotto i piedi e osserva dove senti maggiormente il peso: tallone, avampiede, lato interno o esterno. Spostalo lentamente per esplorare le diverse sensazioni, poi cerca una posizione stabile e centrale. Respira senza tensioni e percepisci come piccoli cambiamenti dell’appoggio modificano l’equilibrio di tutto il corpo.',
    videoUrl: '/videos/mov-piedi-2.mp4',
    thumbnailUrl: '../assets/img/mov-piedi-2.png',
    requiredTrainingMs: 5000,
    nextSectionId: null,
  },
];
const TRAINING_PROGRESS_STORAGE_KEY = 'meditactive-training-progress';

async function prepareTwoUnlockedLessons(page, context) {
  await page.goto('/');

  /**
   * `page.evaluate()` runs this setup inside the browser, where the application
   * store and localStorage used by both lesson tabs are available.
   * Therefore the evaluate() method empowers the Playwright framework allowing tests
   * to work on real DOM elements
   */
  await page.evaluate(
    async ({ secondSectionId, storageKey }) => {
      // Import the store created by the browser application, not a separate store
      // in Playwright's Node.js context.
      const { store } = await import('/src/store/store.ts');

      /**
       * `structuredClone()` creates a deep copy of the Redux state, including its
       * nested section objects. The test can therefore change the copied setup
       * data without directly mutating the current state held by Redux.
       */
      const trainingProgress = structuredClone(store.getState().trainingProgress);

      trainingProgress.progressBySectionId[secondSectionId].isLocked = false;
      trainingProgress.activeSectionId = null;
      localStorage.setItem(storageKey, JSON.stringify(trainingProgress));
    },
    {
      // Playwright serializes this argument and passes it to the browser callback.
      secondSectionId: exerciseSections[1].id,
      storageKey: TRAINING_PROGRESS_STORAGE_KEY,
    },
  );

  await page.goto(`/exercise/${exerciseSections[0].id}`);

  const secondPage = await context.newPage();
  await secondPage.goto(`/exercise/${exerciseSections[1].id}`);

  return { firstPage: page, secondPage };
}

async function prepareSectionState(page, progressOverrides = {}, sectionId) {
  await page.goto('/');

  await page.evaluate(
    async ({ progressOverrides, sectionId, storageKey }) => {
      const { store } = await import('/src/store/store.ts');

      let trainingProgress = structuredClone(store.getState().trainingProgress);

      const currentProgress = trainingProgress.progressBySectionId[sectionId];

      const preparedProgress = {
        ...currentProgress,
        ...progressOverrides,
      };

      trainingProgress.progressBySectionId[sectionId] = preparedProgress;

      trainingProgress.activeSectionId = preparedProgress.status === 'running' ? sectionId : null;

      localStorage.setItem(storageKey, JSON.stringify(trainingProgress));
    },
    {
      progressOverrides,
      sectionId,
      storageKey: TRAINING_PROGRESS_STORAGE_KEY,
    },
  );

  await page.goto(`/exercise/${sectionId}`);

  return { page: page };
}

async function installControllablePlayback(video) {
  await video.evaluate((mediaElement) => {
    let isPaused = true;

    Object.defineProperty(mediaElement, 'paused', {
      configurable: true,
      get: () => isPaused,
    });

    Object.defineProperty(mediaElement, 'play', {
      configurable: true,
      // This custom function temporarily substitutes the native method video.play()
      // It's an async function that returns undefined because ther's no return statement.
      value: async () => {
        if (!isPaused) return;

        isPaused = false;
        // dispatchEvent: is native DOM method. React intercept the event through onPlay={handleVideoPlay}
        mediaElement.dispatchEvent(new Event('play', { bubbles: true }));
      },
    });

    Object.defineProperty(mediaElement, 'pause', {
      configurable: true,
      value: () => {
        if (isPaused) return;

        isPaused = true;
        mediaElement.dispatchEvent(new Event('pause', { bubbles: true }));
      },
    });
  });
}

async function getActiveSectionId(page) {
  return page.evaluate(async () => {
    const { store } = await import('/src/store/store.ts');

    return store.getState().trainingProgress.activeSectionId;
  });
}

async function getStoredActiveSectionId(page) {
  return page.evaluate((storageKey) => {
    const serializedProgress = localStorage.getItem(storageKey);

    return serializedProgress === null ? undefined : JSON.parse(serializedProgress).activeSectionId;
  }, TRAINING_PROGRESS_STORAGE_KEY);
}

test.describe('Exercise lesson page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/exercise/${exerciseSections[0].id}`);
  });

  test('uses the expected MP4 file and the resource responds successfully', async ({ page, request }) => {
    const video = page.getByLabel(`Video: ${exerciseSections[0].title}`);

    await expect(video).toHaveAttribute('src', exerciseSections[0].videoUrl);

    /**
     * `request.head()` uses Playwright's API request context to inspect a resource
     * without downloading its response body. It shares the configured base URL,
     * so a relative application URL can be checked directly.
     */
    const videoResponse = await request.head(exerciseSections[0].videoUrl);

    expect(videoResponse.ok()).toBe(true);
    expect(videoResponse.headers()['content-type']).toContain('video/mp4');
  });

  test('shows the native video controls', async ({ page }) => {
    const video = page.getByLabel(`Video: ${exerciseSections[0].title}`);

    /**
     * `toHaveJSProperty()` checks the live DOM property instead of only checking
     * the HTML attribute. This confirms that browser controls are actually enabled.
     */
    await expect(video).toHaveJSProperty('controls', true);
  });

  test('does not start training before the video is completed', async ({ page }) => {
    const startTrainingButton = page.locator('main article button').first();

    await expect(page.getByText('Video: da vedere', { exact: true })).toBeVisible();
    await expect(startTrainingButton).toHaveAttribute('aria-disabled', 'true');

    /**
     * `dispatchEvent()` sends the DOM event directly, bypassing Playwright's
     * actionability checks. This also verifies that the Redux guard rejects the
     * action if a click is triggered programmatically on the disabled control.
     */
    await startTrainingButton.dispatchEvent('click');

    await expect(page.getByText('Stato: idle', { exact: true })).toBeVisible();
    await expect(startTrainingButton).toHaveAttribute('aria-disabled', 'true');
  });

  test('enables training after the video has been fully played', async ({ page }) => {
    const video = page.getByLabel(`Video: ${exerciseSections[0].title}`);
    const startTrainingButton = page.locator('main article button').first();

    /**
     * `locator.evaluate()` runs inside the browser and receives the matched DOM
     * element. The media values are replaced with a complete played range so the
     * real `ended` handler can be tested without waiting for the full video.
     */
    await video.evaluate((mediaElement) => {
      const durationSeconds = 10;
      const fullyPlayedRange = {
        length: 1,
        start: (index) => {
          if (index !== 0) throw new DOMException('Invalid TimeRanges index', 'IndexSizeError');
          return 0;
        },
        end: (index) => {
          if (index !== 0) throw new DOMException('Invalid TimeRanges index', 'IndexSizeError');
          return durationSeconds;
        },
      };

      // `duration` is normally a read-only value calculated by the browser from
      // the video metadata. The test defines a fixed duration so that the
      // completion logic receives a predictable total length.
      Object.defineProperty(mediaElement, 'duration', {
        configurable: true,
        value: durationSeconds,
      });

      // `played` is normally a read-only TimeRanges object maintained by the
      // browser. `handleVideoEnded` reads it through `getPlayedSeconds()` to
      // verify that the watched time covers the complete video duration.
      // This mocked range represents one continuous viewing from start to end.
      Object.defineProperty(mediaElement, 'played', {
        configurable: true,
        value: fullyPlayedRange,
      });
      // 'ended': when the video is completly viewed a DOM Event 'ended' is triggered.
      // { bubbles: true }: propagates the <video> element event to his parent elements
      // Therefore the handleVideoEnded is called when the video is ended.
      mediaElement.dispatchEvent(new Event('ended', { bubbles: true }));
    });

    await expect(page.getByText('Video: completato', { exact: true })).toBeVisible();
    await expect(startTrainingButton).not.toHaveAttribute('aria-disabled', 'true');

    await startTrainingButton.click();

    await expect(page.getByText('Stato: running', { exact: true })).toBeVisible();
  });
});

test.describe('Multiple video playback exclusion', () => {
  test('keeps the first lesson active until its video is paused', async ({ page, context }) => {
    const { firstPage, secondPage } = await prepareTwoUnlockedLessons(page, context);
    const firstVideo = firstPage.getByLabel(`Video: ${exerciseSections[0].title}`);
    const secondVideo = secondPage.getByLabel(`Video: ${exerciseSections[1].title}`);

    await installControllablePlayback(firstVideo);
    await installControllablePlayback(secondVideo);

    await firstVideo.evaluate((mediaElement) => mediaElement.play());

    await expect(firstVideo).toHaveJSProperty('paused', false);
    await expect.poll(() => getActiveSectionId(secondPage)).toBe(exerciseSections[0].id);

    await secondVideo.evaluate((mediaElement) => mediaElement.play());

    await expect(secondVideo).toHaveJSProperty('paused', true);
    await expect(firstVideo).toHaveJSProperty('paused', false);
    await expect.poll(() => getActiveSectionId(firstPage)).toBe(exerciseSections[1].id);
    await expect.poll(() => getActiveSectionId(secondPage)).toBe(exerciseSections[1].id);

    await firstVideo.evaluate((mediaElement) => mediaElement.pause());

    await expect(firstVideo).toHaveJSProperty('paused', true);
    await expect.poll(() => getActiveSectionId(secondPage)).toBeNull();

    await secondVideo.evaluate((mediaElement) => mediaElement.play());

    await expect(secondVideo).toHaveJSProperty('paused', false);
    await expect.poll(() => getActiveSectionId(firstPage)).toBe(exerciseSections[0].id);
    await expect.poll(() => getActiveSectionId(secondPage)).toBe(exerciseSections[0].id);
  });

  test('clears activeSectionId when the tab playing the active video is closed', async ({ page, context }) => {
    const { firstPage, secondPage } = await prepareTwoUnlockedLessons(page, context);
    const firstVideo = firstPage.getByLabel(`Video: ${exerciseSections[0].title}`);

    await installControllablePlayback(firstVideo);
    await firstVideo.evaluate((mediaElement) => mediaElement.play());

    await expect.poll(() => getActiveSectionId(secondPage)).toBe(exerciseSections[0].id);
    await expect.poll(() => getStoredActiveSectionId(secondPage)).toBe(exerciseSections[0].id);

    await firstPage.close({ runBeforeUnload: true });

    await expect.poll(() => getActiveSectionId(secondPage)).toBeNull();
    await expect.poll(() => getStoredActiveSectionId(secondPage)).toBeNull();
  });
});

test.describe('Timer startup and stop', () => {
  test('After 2 seconds the timer view is updated', async ({ page }) => {
    await page.clock.install({
      time: new Date('2026-01-01T10:00:00'),
    });
    await prepareSectionState(page, exerciseSections[1].id, {
      videoCompleted: true,
      videoCurrentSecond: 10,
      videoWatchedSeconds: 10,
      videoDurationSeconds: 10,
      isLocked: false,
    });
    const startTrainingButton = page.locator('main article button').first();
    const video = page.getByLabel(`Video: ${exerciseSections[1].title}`);
    await installControllablePlayback(video);
    await startTrainingButton.click();
    await expect(startTrainingButton).not.toHaveAttribute('aria-disabled', 'true');

    const timer = page.locator('main article div p').nth(3);

    // Advance browser time by two second and execute the setInterval callback.
    await page.clock.runFor(2_000);

    await expect(timer).toHaveText('00:02');
  });
});
