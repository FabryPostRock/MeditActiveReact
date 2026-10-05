import { expect, test } from '@playwright/test';

test.describe('Navbar language detection', () => {
  test.describe('Italian browser locale', () => {
    // Creates the test page with Italian exposed through navigator.language.
    test.use({ locale: 'it-IT' });

    test('shows the navigation labels in Italian', async ({ page }) => {
      await page.goto('/');

      const navigation = page.getByRole('navigation');

      await expect(page.locator('html')).toHaveAttribute('lang', 'it');
      await expect(navigation.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
      await expect(navigation.getByRole('link', { name: 'Esercizi', exact: true })).toBeVisible();
      await expect(navigation.getByRole('link', { name: 'Exercises', exact: true })).toHaveCount(0);
    });
  });

  test.describe('English browser locale', () => {
    // Creates the test page with English exposed through navigator.language.
    test.use({ locale: 'en-US' });

    test('shows the navigation labels in English', async ({ page }) => {
      await page.goto('/');

      const navigation = page.getByRole('navigation');

      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(navigation.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
      await expect(navigation.getByRole('link', { name: 'Exercises', exact: true })).toBeVisible();
      await expect(navigation.getByRole('link', { name: 'Esercizi', exact: true })).toHaveCount(0);
    });
  });
});
