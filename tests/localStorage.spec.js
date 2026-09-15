import { expect, test } from '@playwright/test';

const TRAINING_PROGRESS_STORAGE_KEY = 'meditactive-training-progress';
const EXERCISE_SECTION_COUNT = 5;

const firstSection = {
  id: 'breathing-section-1',
  title: 'Respirazione da sdraiato con mani sulla pancia',
  requiredTrainingMs: 5_000,
};

const secondSection = {
  id: 'breathing-section-2',
  title: 'Respirazione da sdraiato con libro sulla pancia',
};

async function getStoredTrainingProgress(page) {
  return page.evaluate((storageKey) => {
    const serializedProgress = localStorage.getItem(storageKey);

    return serializedProgress === null ? null : JSON.parse(serializedProgress);
  }, TRAINING_PROGRESS_STORAGE_KEY);
}

async function completeVideo(page, section) {
  const video = page.getByLabel(`Video: ${section.title}`);

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

    Object.defineProperty(mediaElement, 'duration', {
      configurable: true,
      value: durationSeconds,
    });
    Object.defineProperty(mediaElement, 'played', {
      configurable: true,
      value: fullyPlayedRange,
    });
    mediaElement.dispatchEvent(new Event('ended', { bubbles: true }));
  });

  await expect(page.getByText('Video: completato', { exact: true })).toBeVisible();
}

async function expectInitialTrainingState(page) {
  const sectionCards = page.locator('main article');

  await expect(sectionCards).toHaveCount(EXERCISE_SECTION_COUNT);
  await expect(sectionCards.first()).not.toHaveAttribute('aria-disabled', 'true');
  await expect(sectionCards.first().locator('p').first()).toHaveText('Stato: idle');

  for (let sectionIndex = 1; sectionIndex < EXERCISE_SECTION_COUNT; sectionIndex += 1) {
    await expect(sectionCards.nth(sectionIndex)).toHaveAttribute('aria-disabled', 'true');
  }
}

test.describe('localStorage persistence', () => {
  test('creates the training progress key after a progress change', async ({ page }) => {
    await page.goto(`/exercise/${firstSection.id}`);

    await expect
      .poll(() => page.evaluate((storageKey) => localStorage.getItem(storageKey), TRAINING_PROGRESS_STORAGE_KEY))
      .toBeNull();

    await completeVideo(page, firstSection);

    await expect
      .poll(() => page.evaluate((storageKey) => localStorage.getItem(storageKey), TRAINING_PROGRESS_STORAGE_KEY))
      .not.toBeNull();
  });

  test('stores valid JSON', async ({ page }) => {
    await page.goto(`/exercise/${firstSection.id}`);
    await completeVideo(page, firstSection);

    const trainingProgress = await getStoredTrainingProgress(page);

    expect(trainingProgress).not.toBeNull();
    expect(trainingProgress).toMatchObject({
      activeSectionId: null,
      progressBySectionId: expect.any(Object),
    });
  });

  test('preserves completed video, timer, status and unlocked sections after reload', async ({ page }) => {
    await page.clock.install({
      time: new Date('2026-01-01T09:59:00'),
    });
    await page.goto(`/exercise/${firstSection.id}`);
    await page.clock.pauseAt(new Date('2026-01-01T10:00:00'));

    await completeVideo(page, firstSection);

    const startTrainingButton = page.locator('main article button').first();
    const timer = page.locator('main article div p').nth(3);

    await startTrainingButton.click();
    await expect(page.getByText('Stato: running', { exact: true })).toBeVisible();

    await page.clock.runFor(firstSection.requiredTrainingMs);

    await expect(page.getByText('Stato: readyToComplete', { exact: true })).toBeVisible();
    await expect(timer).toHaveText('00:05');
    await page.getByRole('button', { name: /Esercizio Completato/ }).click();
    await expect(page.getByText('Stato: completed', { exact: true })).toBeVisible();

    // After the previous test the clock is still paused and that can cause a page block during loading.
    // That's why we need to resume the clock.
    await page.clock.resume();
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Video: completato', { exact: true })).toBeVisible();
    await expect(page.getByText('Stato: completed', { exact: true })).toBeVisible();
    await expect(timer).toHaveText('00:05');

    const trainingProgress = await getStoredTrainingProgress(page);

    expect(trainingProgress.progressBySectionId[firstSection.id]).toMatchObject({
      videoCompleted: true,
      elapsedTrainingMs: firstSection.requiredTrainingMs,
      status: 'completed',
      trainingCompleted: true,
    });
    expect(trainingProgress.progressBySectionId[secondSection.id].isLocked).toBe(false);

    await page.goto('/exercises');
    await expect(
      page.getByRole('link', {
        name: `Apri la lezione ${secondSection.title}`,
        exact: true,
      }),
    ).toHaveCount(1);
  });

  test('preserves progress after closing and reopening a page in the same context', async ({ page, context }) => {
    await page.goto(`/exercise/${firstSection.id}`);
    await completeVideo(page, firstSection);

    const appOrigin = new URL(page.url()).origin;

    await page.close();

    const reopenedPage = await context.newPage();
    await reopenedPage.goto(`${appOrigin}/exercise/${firstSection.id}`);

    await expect(reopenedPage.getByText('Video: completato', { exact: true })).toBeVisible();

    const trainingProgress = await getStoredTrainingProgress(reopenedPage);

    expect(trainingProgress.progressBySectionId[firstSection.id].videoCompleted).toBe(true);
  });

  test('starts from the initial state in a new browser context', async ({ page, browser }) => {
    await page.goto(`/exercise/${firstSection.id}`);
    await completeVideo(page, firstSection);

    const appOrigin = new URL(page.url()).origin;
    const isolatedContext = await browser.newContext();

    try {
      const isolatedPage = await isolatedContext.newPage();
      await isolatedPage.goto(`${appOrigin}/exercises`);

      const serializedProgress = await isolatedPage.evaluate(
        (storageKey) => localStorage.getItem(storageKey),
        TRAINING_PROGRESS_STORAGE_KEY,
      );

      expect(serializedProgress).toBeNull();
      await expectInitialTrainingState(isolatedPage);
    } finally {
      await isolatedContext.close();
    }
  });

  test('uses the initial state without errors when localStorage contains invalid JSON', async ({ page }) => {
    const pageErrors = [];

    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto('/exercises');
    await page.evaluate(({ storageKey, invalidJson }) => localStorage.setItem(storageKey, invalidJson), {
      storageKey: TRAINING_PROGRESS_STORAGE_KEY,
      invalidJson: '{invalid JSON',
    });

    await page.reload();

    await expect(page.getByRole('heading', { name: 'Corso base di consapevolezza del corpo' })).toBeVisible();
    await expectInitialTrainingState(page);
    expect(pageErrors).toEqual([]);
  });

  test('returns to the initial state after removing the training progress key', async ({ page }) => {
    await page.goto(`/exercise/${firstSection.id}`);
    await completeVideo(page, firstSection);

    await page.evaluate((storageKey) => localStorage.removeItem(storageKey), TRAINING_PROGRESS_STORAGE_KEY);
    await page.reload();

    await expect(page.getByText('Video: da vedere', { exact: true })).toBeVisible();
    await expect(page.getByText('Stato: idle', { exact: true })).toBeVisible();

    await page.goto('/exercises');
    await expectInitialTrainingState(page);
  });

  test('keeps the interface usable when writing to localStorage fails', async ({ page }) => {
    await page.addInitScript((storageKey) => {
      const originalSetItem = Storage.prototype.setItem;

      window.__trainingProgressWriteAttempts = 0;
      Storage.prototype.setItem = function setItem(key, value) {
        if (key === storageKey) {
          window.__trainingProgressWriteAttempts += 1;
          throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
        }

        return originalSetItem.call(this, key, value);
      };
    }, TRAINING_PROGRESS_STORAGE_KEY);

    await page.goto(`/exercise/${firstSection.id}`);
    await completeVideo(page, firstSection);

    const writeAttempts = await page.evaluate(() => window.__trainingProgressWriteAttempts);

    expect(writeAttempts).toBeGreaterThan(0);
    await expect(page.getByRole('heading', { name: firstSection.title, exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'Exercises', exact: true }).click();

    await expect(page).toHaveURL(/\/exercises$/);
    await expect(page.getByRole('heading', { name: 'Corso base di consapevolezza del corpo' })).toBeVisible();
  });
});
