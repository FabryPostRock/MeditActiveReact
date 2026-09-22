import { expect, test } from '@playwright/test';

const FIRST_LESSON_LINK_NAME = 'Apri la lezione Respirazione da sdraiato con mani sulla pancia';

/*
 * TEST CONTEXT
 * PerspectiveWalls is visible only on desktop viewports at least 1200px wide.
 * These integration tests run in a real browser so CSS stacking, viewport sizing,
 * hit-testing, and user interactions are evaluated in the same context as the app.
 * The background and the content intentionally occupy the same viewport area; the
 * expected behavior is that the background remains behind the content and never
 * becomes the target of pointer interactions.
 */
test.describe('PerspectiveWalls integration', () => {
  test('keeps the viewport background behind the page content', async ({ page }) => {
    await page.goto('/exercises');

    const pageContainer = page.locator('.home-page');
    const background = page.locator('.perspective-walls');
    const content = page.locator('.home-page__content');
    const heading = page.getByRole('heading', { name: 'Corso base di consapevolezza del corpo' });

    await expect(background).toBeVisible();
    await expect(pageContainer).toHaveCSS('isolation', 'isolate');
    await expect(background).toHaveCSS('position', 'fixed');
    await expect(background).toHaveCSS('z-index', '-1');
    await expect(background).toHaveCSS('pointer-events', 'none');
    await expect(content).toHaveCSS('position', 'relative');
    await expect(content).toHaveCSS('z-index', '1');

    const backgroundBounds = await background.evaluate((element) => {
      const bounds = element.getBoundingClientRect();

      return {
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
    });

    expect(backgroundBounds).toMatchObject({
      left: 0,
      top: 0,
      width: backgroundBounds.viewportWidth,
      height: backgroundBounds.viewportHeight,
    });

    const hitTest = await heading.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const target = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
      const contentLayer = element.closest('.home-page__content');
      const backgroundLayer = document.querySelector('.perspective-walls');

      return {
        contentReceivesHit: target !== null && contentLayer?.contains(target),
        backgroundReceivesHit: target !== null && backgroundLayer?.contains(target),
      };
    });

    expect(hitTest).toEqual({
      contentReceivesHit: true,
      backgroundReceivesHit: false,
    });
  });

  test('allows the first lesson link on the Exercises page to be clicked', async ({ page }) => {
    await page.goto('/exercises');

    await expect(page.locator('.perspective-walls')).toBeVisible();

    const firstLessonLink = page.getByRole('link', {
      name: FIRST_LESSON_LINK_NAME,
      exact: true,
    });

    await expect(firstLessonLink).toBeVisible();
    await firstLessonLink.click();

    await expect(page).toHaveURL(/\/exercise\/breathing-section-1$/);
  });
});
