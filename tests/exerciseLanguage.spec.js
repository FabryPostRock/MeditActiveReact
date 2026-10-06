import { expect, test } from '@playwright/test';

const italianSection = {
  title: 'Respirazione da sdraiato con mani sulla pancia',
  description:
    'Sdraiati comodamente e appoggia le mani sulla pancia. Porta l’attenzione al movimento dell’addome mentre respiri, senza forzare: senti le mani sollevarsi durante l’inspirazione e abbassarsi durante l’espirazione. L’obiettivo è prendere consapevolezza del respiro e imparare a lasciarlo fluire in modo naturale.',
};

const englishSection = {
  title: 'Lying-down breathing with hands on the abdomen',
  description:
    'Lie down comfortably and place your hands on your abdomen. Bring your attention to the movement of your abdomen as you breathe, without forcing it: feel your hands rise as you inhale and fall as you exhale. The goal is to become aware of your breath and learn to let it flow naturally.',
};

test.describe('Exercise language detection', () => {
  test.describe('Italian browser locale', () => {
    test.use({ locale: 'it-IT' });

    test('shows the course and lesson content in Italian', async ({ page }) => {
      await page.goto('/exercises');

      await expect(page.getByRole('heading', { name: 'Corso base di consapevolezza del corpo' })).toBeVisible();
      await page.getByRole('link', { name: `Apri la lezione ${italianSection.title}` }).click();

      await expect(page.getByRole('heading', { name: italianSection.title })).toBeVisible();
      await expect(page.getByText(italianSection.description, { exact: true })).toBeVisible();
      await expect(page).toHaveTitle(`${italianSection.title} | MeditActive`);
      await expect(page.locator('head meta[property="og:locale"]')).toHaveAttribute('content', 'it_IT');
    });
  });

  test.describe('English browser locale', () => {
    test.use({ locale: 'en-US' });

    test('shows the course and lesson content in English', async ({ page }) => {
      await page.goto('/exercises');

      await expect(page.getByRole('heading', { name: 'Basic body awareness course' })).toBeVisible();
      await page.getByRole('link', { name: `Open lesson ${englishSection.title}` }).click();

      await expect(page.getByRole('heading', { name: englishSection.title })).toBeVisible();
      await expect(page.getByText(englishSection.description, { exact: true })).toBeVisible();
      await expect(page).toHaveTitle(`${englishSection.title} | MeditActive`);
      await expect(page.locator('head meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
    });
  });
});
