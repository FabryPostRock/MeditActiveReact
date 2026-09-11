import { expect, test } from '@playwright/test';

const lesson = {
  path: '/exercise/breathing-section-1',
  title: 'Respirazione da sdraiato con mani sulla pancia',
  videoUrl: '/videos/resp-sdraiato-1.mp4',
};

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
