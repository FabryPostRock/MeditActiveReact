import { expect, test } from '@playwright/test';

test.describe('Navbar language detection', () => {
  test.describe('Italian browser locale', () => {
    test.use({ locale: 'it-IT' });

    test('shows the navigation labels in Italian', async ({ page }) => {
      await page.goto('/');

      const navigation = page.getByRole('navigation');

      await expect(navigation.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
      await expect(navigation.getByRole('link', { name: 'Esercizi', exact: true })).toBeVisible();
      await expect(navigation.getByRole('link', { name: 'Exercises', exact: true })).toHaveCount(0);
    });
  });

  test.describe('English browser locale', () => {
    test.use({ locale: 'en-US' });

    test('shows the navigation labels in English', async ({ page }) => {
      await page.goto('/');

      const navigation = page.getByRole('navigation');

      await expect(navigation.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
      await expect(navigation.getByRole('link', { name: 'Exercises', exact: true })).toBeVisible();
      await expect(navigation.getByRole('link', { name: 'Esercizi', exact: true })).toHaveCount(0);
    });
  });
});
