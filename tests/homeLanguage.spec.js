import { expect, test } from '@playwright/test';

const italianContent = {
  tagline:
    'L’app per combinare i benefici della meditazione con strumenti di crescita personale, aiutando gli utenti a raggiungere obiettivi di breve, medio e lungo termine.',
  originTitle: 'Il nostro why..',
  originImageAlt: 'Persona sovraccaricata dagli impegni',
  emphasizedText:
    'crescere non significa necessariamente fare sempre di più, ma imparare anche a riconoscere ciò che conta davvero per noi.',
  pageTitle: 'MeditActive | Meditazione e crescita personale',
};

const englishContent = {
  tagline:
    'The app that combines the benefits of meditation with personal growth tools, helping users achieve short-, medium-, and long-term goals.',
  originTitle: 'Our why...',
  originImageAlt: 'Person overwhelmed by commitments',
  emphasizedText:
    'growth does not necessarily mean always doing more, but also learning to recognize what truly matters to us.',
  pageTitle: 'MeditActive | Meditation and personal growth',
};

async function expectLocalizedHome(page, content, htmlLanguage, openGraphLocale) {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', htmlLanguage);
  await expect(page.getByRole('heading', { name: content.tagline })).toBeVisible();

  const conceptHeading = page.getByRole('heading', { name: content.originTitle });
  await conceptHeading.scrollIntoViewIfNeeded();
  await expect(conceptHeading).toBeVisible();
  await expect(page.getByRole('img', { name: content.originImageAlt })).toBeVisible();
  await expect(page.locator('strong').filter({ hasText: content.emphasizedText })).toBeVisible();

  await expect(page).toHaveTitle(content.pageTitle);
  await expect(page.locator('head meta[property="og:locale"]')).toHaveAttribute('content', openGraphLocale);
}

test.describe('Home language detection', () => {
  test.describe('Italian browser locale', () => {
    test.use({ locale: 'it-IT' });

    test('shows the Home content in Italian', async ({ page }) => {
      await expectLocalizedHome(page, italianContent, 'it', 'it_IT');
    });
  });

  test.describe('English browser locale', () => {
    test.use({ locale: 'en-US' });

    test('shows the Home content in English', async ({ page }) => {
      await expectLocalizedHome(page, englishContent, 'en', 'en_US');
    });
  });
});
