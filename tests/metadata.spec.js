import { expect, test } from '@playwright/test';

const SITE_ORIGIN = 'https://medit-active.web.app';

test.describe('Page metadata', () => {
  test('exposes Home SEO metadata and Organization structured data', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('MeditActive | Meditazione e crescita personale');
    await expect(page.locator('head meta[name="description"]')).toHaveAttribute('content', /meditazione/i);
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', new URL('/', SITE_ORIGIN).href);
    await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute(
      'content',
      'MeditActive | Meditazione e crescita personale',
    );
    await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute(
      'content',
      new URL('/', SITE_ORIGIN).href,
    );
    await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute('content', /^https?:\/\//);

    const organizationScript = page.locator('head #organization-structured-data');
    await expect(organizationScript).toHaveCount(1);

    const organization = JSON.parse((await organizationScript.textContent()) ?? '');

    expect(organization).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'MeditActive',
      url: new URL('/', SITE_ORIGIN).href,
      email: 'info@meditactive.com',
      telephone: '+39 3456879998',
    });
    expect(organization.logo).toMatch(/^https?:\/\//);
    expect(organization.sameAs).toHaveLength(4);
  });

  test('updates metadata and removes Organization data after client-side navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Esercizi' }).click();

    await expect(page).toHaveURL(/\/exercises$/);
    await expect(page).toHaveTitle('Corso di consapevolezza del corpo | MeditActive');
    await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Corso di consapevolezza del corpo | MeditActive',
    );
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
      'href',
      new URL('/exercises', SITE_ORIGIN).href,
    );
    await expect(page.locator('head #organization-structured-data')).toHaveCount(0);
    await expect(page.locator('head title')).toHaveCount(1);
    await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
  });

  test('uses lesson data for a single exercise page', async ({ page }) => {
    await page.goto('/exercise/breathing-section-1');

    await expect(page).toHaveTitle('Respirazione da sdraiato con mani sulla pancia | MeditActive');
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
      'href',
      new URL('/exercise/breathing-section-1', SITE_ORIGIN).href,
    );
    await expect(page.locator('head meta[property="og:image:alt"]')).toHaveAttribute(
      'content',
      'Anteprima dell’esercizio Respirazione da sdraiato con mani sulla pancia',
    );
    await expect(page.locator('head #organization-structured-data')).toHaveCount(0);
  });

  test('marks the error page as non-indexable', async ({ page }) => {
    await page.goto('/unknown-route');

    await expect(page).toHaveTitle('Pagina non trovata | MeditActive');
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator('head meta[property="og:url"]')).toHaveCount(0);
    await expect(page.locator('head #organization-structured-data')).toHaveCount(0);
  });

  test('uses only error metadata for a locked exercise', async ({ page }) => {
    await page.goto('/exercise/breathing-section-2');

    await expect(page).toHaveTitle('Pagina non trovata | MeditActive');
    await expect(page.locator('head title')).toHaveCount(1);
    await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
  });
});
