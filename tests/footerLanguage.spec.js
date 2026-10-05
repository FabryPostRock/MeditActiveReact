import { expect, test } from '@playwright/test';

test.describe('Footer language detection', () => {
  test.describe('Italian browser locale', () => {
    // Creates the test page with Italian exposed through navigator.language.
    test.use({ locale: 'it-IT' });

    test('shows the footer headings in Italian', async ({ page }) => {
      await page.goto('/');

      const footer = page.locator('footer');

      await expect(footer.getByRole('heading', { name: 'Contatti', exact: true })).toBeVisible();
      await expect(footer.getByRole('heading', { name: 'Seguici sui social', exact: true })).toBeVisible();
      await expect(footer.getByRole('heading', { name: 'Contacts', exact: true })).toHaveCount(0);
      await expect(footer.getByRole('heading', { name: 'Follow us on social media', exact: true })).toHaveCount(0);
    });
  });

  test.describe('English browser locale', () => {
    // Creates the test page with English exposed through navigator.language.
    test.use({ locale: 'en-US' });

    test('shows the footer headings in English', async ({ page }) => {
      await page.goto('/');

      const footer = page.locator('footer');

      await expect(footer.getByRole('heading', { name: 'Contacts', exact: true })).toBeVisible();
      await expect(footer.getByRole('heading', { name: 'Follow us on social media', exact: true })).toBeVisible();
      await expect(footer.getByRole('heading', { name: 'Contatti', exact: true })).toHaveCount(0);
      await expect(footer.getByRole('heading', { name: 'Seguici sui social', exact: true })).toHaveCount(0);
    });
  });
});
