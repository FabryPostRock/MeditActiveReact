import { expect, test } from '@playwright/test';

test.describe('Navigation and routing', () => {
  test('loads the home page without JavaScript errors', async ({ page }) => {
    const pageErrors = [];

    /**
     * `page.on(eventName, listener)` subscribes to browser-page events.
     * The `pageerror` event provides uncaught JavaScript errors thrown by the page,
     * so the listener is registered before `goto` to also capture startup errors.
     * Each error message is collected and asserted after the page has rendered.
     */
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto('/');

    /**
     * `page.getByRole` creates a locator from the browser accessibility tree.
     * Here `navigation` matches the implicit role of the `<nav>` element. For
     * elements such as links and headings, the `name` option can additionally
     * match their accessible name from visible text, `aria-label`, or related
     * accessibility attributes. Role locators are more resilient and closer to
     * user interaction than CSS selectors tied to the current DOM structure.
     */
    await expect(page.getByRole('navigation')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('opens the exercises page from the Exercises link', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Exercises' }).click();

    await expect(page).toHaveURL(/\/exercises$/);
  });

  test('returns to the home page from the Home link', async ({ page }) => {
    await page.goto('/exercises');

    await page.getByRole('link', { name: 'Home' }).click();

    await expect(page).toHaveURL(/\/$/);
  });

  test('marks the link for the current page with aria-current="page"', async ({ page }) => {
    await page.goto('/');

    const homeLink = page.getByRole('link', { name: 'Home' });
    const exercisesLink = page.getByRole('link', { name: 'Exercises' });

    await expect(homeLink).toHaveAttribute('aria-current', 'page');
    await expect(exercisesLink).not.toHaveAttribute('aria-current', 'page');

    await exercisesLink.click();

    await expect(exercisesLink).toHaveAttribute('aria-current', 'page');
    await expect(homeLink).not.toHaveAttribute('aria-current', 'page');
  });

  test('opens the first exercise section from its lesson link', async ({ page }) => {
    await page.goto('/exercises');

    await page
      .getByRole('link', {
        name: 'Apri la lezione Respirazione da sdraiato con mani sulla pancia',
      })
      .click();

    await expect(page).toHaveURL(/\/exercise\/breathing-section-1$/);

    /**
     * `heading` is the accessible role assigned to HTML headings from `<h1>`
     * through `<h6>`. In this page the `Title` component renders the lesson title
     * inside an `<h4>`, and its visible text becomes the heading's accessible name.
     * The locator therefore searches the accessibility tree for that heading,
     * independently of its CSS classes or position in the DOM.
     */
    await expect(page.getByRole('heading', { name: 'Respirazione da sdraiato con mani sulla pancia' })).toBeVisible();
  });

  test('shows the error page for an unknown exercise section', async ({ page }) => {
    await page.goto('/exercise/unknown');

    /**
     * `getByText` locates an element from its rendered text. With `exact: true`,
     * the complete normalized text must match `Pagina Errore`; a longer string
     * that merely contains those words is not accepted. Playwright still trims
     * surrounding whitespace and normalizes repeated whitespace before matching.
     */
    await expect(page.getByText('Pagina Errore', { exact: true })).toBeVisible();
  });

  test('shows the error page for an unknown route', async ({ page }) => {
    await page.goto('/unknown-route');
    await expect(page.getByText('Pagina Errore', { exact: true })).toBeVisible();
  });

  test('shows the error page when directly opening a locked section', async ({ page }) => {
    await page.goto('/exercise/breathing-section-2');

    await expect(page.getByText('Pagina Errore', { exact: true })).toBeVisible();
  });
});
