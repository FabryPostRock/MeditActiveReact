import { expect, test } from '@playwright/test';

const lesson = {
  id: 'breathing-section-1',
  path: '/exercise/breathing-section-1',
  title: 'Respirazione da sdraiato con mani sulla pancia',
  videoUrl: '/videos/resp-sdraiato-1.mp4',
};

const secondLesson = {
  id: 'breathing-section-2',
  path: '/exercise/breathing-section-2',
  title: 'Respirazione da sdraiato con libro sulla pancia',
};

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
      secondSectionId: secondLesson.id,
      storageKey: TRAINING_PROGRESS_STORAGE_KEY,
    },
  );

  await page.goto(lesson.path);

  const secondPage = await context.newPage();
  await secondPage.goto(secondLesson.path);

  return { firstPage: page, secondPage };
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
    await page.goto(lesson.path);
  });

  test('uses the expected MP4 file and the resource responds successfully', async ({ page, request }) => {
    const video = page.getByLabel(`Video: ${lesson.title}`);

    await expect(video).toHaveAttribute('src', lesson.videoUrl);

    /**
     * `request.head()` uses Playwright's API request context to inspect a resource
     * without downloading its response body. It shares the configured base URL,
     * so a relative application URL can be checked directly.
     */
    const videoResponse = await request.head(lesson.videoUrl);

    expect(videoResponse.ok()).toBe(true);
    expect(videoResponse.headers()['content-type']).toContain('video/mp4');
  });

  test('shows the native video controls', async ({ page }) => {
    const video = page.getByLabel(`Video: ${lesson.title}`);

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
    const video = page.getByLabel(`Video: ${lesson.title}`);
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
    const firstVideo = firstPage.getByLabel(`Video: ${lesson.title}`);
    const secondVideo = secondPage.getByLabel(`Video: ${secondLesson.title}`);

    await installControllablePlayback(firstVideo);
    await installControllablePlayback(secondVideo);

    await firstVideo.evaluate((mediaElement) => mediaElement.play());

    await expect(firstVideo).toHaveJSProperty('paused', false);
    await expect.poll(() => getActiveSectionId(secondPage)).toBe(lesson.id);

    await secondVideo.evaluate((mediaElement) => mediaElement.play());

    await expect(secondVideo).toHaveJSProperty('paused', true);
    await expect(firstVideo).toHaveJSProperty('paused', false);
    await expect.poll(() => getActiveSectionId(firstPage)).toBe(lesson.id);
    await expect.poll(() => getActiveSectionId(secondPage)).toBe(lesson.id);

    await firstVideo.evaluate((mediaElement) => mediaElement.pause());

    await expect(firstVideo).toHaveJSProperty('paused', true);
    await expect.poll(() => getActiveSectionId(secondPage)).toBeNull();

    await secondVideo.evaluate((mediaElement) => mediaElement.play());

    await expect(secondVideo).toHaveJSProperty('paused', false);
    await expect.poll(() => getActiveSectionId(firstPage)).toBe(secondLesson.id);
    await expect.poll(() => getActiveSectionId(secondPage)).toBe(secondLesson.id);
  });

  test('clears activeSectionId when the tab playing the active video is closed', async ({ page, context }) => {
    const { firstPage, secondPage } = await prepareTwoUnlockedLessons(page, context);
    const firstVideo = firstPage.getByLabel(`Video: ${lesson.title}`);

    await installControllablePlayback(firstVideo);
    await firstVideo.evaluate((mediaElement) => mediaElement.play());

    await expect.poll(() => getActiveSectionId(secondPage)).toBe(lesson.id);
    await expect.poll(() => getStoredActiveSectionId(secondPage)).toBe(lesson.id);

    await firstPage.close({ runBeforeUnload: true });

    await expect.poll(() => getActiveSectionId(secondPage)).toBeNull();
    await expect.poll(() => getStoredActiveSectionId(secondPage)).toBeNull();
  });
});
