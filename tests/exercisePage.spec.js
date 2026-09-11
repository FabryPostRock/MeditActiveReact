/*
In Playwright we can't import learningContent.ts because it import PNG files but Playwright interprets 
them as javascript code and returns error.

With playwright it is not required to create a test store because the browser alaready creates one.

Playwright runs in a different JavaScript context from the application. Therefore this code in the Playwright test is not correct:

import store from '../src/store';
const state = store.getState();

Even importing the named export directly would not give you the Redux store used by the browser page. It would try to instantiate 
another store inside Playwright’s Node process.

For this tests, you can access the browser’s store through page.evaluate() after loading the application.
page.evaluate() executes its callback inside the browser page, not inside Playwright’s Node process.

*/
import { expect, test } from '@playwright/test';
//import { createTestStore } from '../src/timerHooks';
//import { useAppSelector } from '../../store/hooks';
// import trainingProgressReducer, {
//   pauseTraining,
//   setReadyToBeCompleted,
//   startTraining,
// } from '../src/store/trainingProgressSlice';

const exerciseSections = [
  {
    id: 'breathing-section-1',
    exerciseId: 'breathing-basics',
    title: 'Respirazione da sdraiato con mani sulla pancia',
    description:
      'Sdraiati comodamente e appoggia le mani sulla pancia. Porta l’attenzione al movimento dell’addome mentre respiri, senza forzare: senti le mani sollevarsi durante l’inspirazione e abbassarsi durante l’espirazione. L’obiettivo è prendere consapevolezza del respiro e imparare a lasciarlo fluire in modo naturale.',
    videoUrl: '/videos/resp-sdraiato-1.mp4',
    thumbnailUrl: '../assets/img/resp-sdraiato-1.png',
    requiredTrainingMs: 5000,
    nextSectionId: 'breathing-section-2',
  },
  {
    id: 'breathing-section-2',
    exerciseId: 'breathing-basics',
    title: 'Respirazione da sdraiato con libro sulla pancia',
    description:
      'Sdraiati e appoggia un libro leggero sulla pancia. Osserva come il respiro lo fa salire durante l’inspirazione e scendere durante l’espirazione. Il piccolo peso offre un riferimento visivo e tattile che aiuta a percepire meglio il movimento addominale e a rendere il respiro più consapevole e regolare.',
    videoUrl: '/videos/resp-sdraiato-2.mp4',
    thumbnailUrl: '../assets/img/resp-sdraiato-2.png',
    requiredTrainingMs: 5000,
    nextSectionId: 'breathing-section-3',
  },
  {
    id: 'breathing-section-3',
    exerciseId: 'breathing-basics',
    title: 'Respirazione da in piedi',
    description:
      'Porta ora la respirazione appresa da sdraiato nella posizione eretta. Mantieni il corpo rilassato, le ginocchia morbide e il busto naturale. Respira osservando il movimento dell’addome senza irrigidirti. L’obiettivo è mantenere un respiro calmo e consapevole anche quando il corpo deve sostenersi contro la gravità.',
    videoUrl: '/videos/resp-inpiedi-3.mp4',
    thumbnailUrl: '../assets/img/resp-inpiedi-3.png',
    requiredTrainingMs: 5000,
    nextSectionId: 'feet-position-section-1',
  },
  {
    id: 'feet-position-section-1',
    exerciseId: 'feet-basics',
    title: 'Respirare con la terra',
    description:
      'In piedi, porta l’attenzione contemporaneamente al respiro e al contatto dei piedi con il terreno. Durante ogni ciclo respiratorio percepisci il corpo che si rilassa e il peso che scende verso la terra. Non cercare di spingere: lascia che respiro, postura e appoggio dei piedi inizino gradualmente a lavorare insieme.',
    videoUrl: '/videos/mov-piedi-1.mp4',
    thumbnailUrl: '../assets/img/mov-piedi-1.png',
    requiredTrainingMs: 5000,
    nextSectionId: 'feet-position-section-2',
  },
  {
    id: 'feet-position-section-2',
    exerciseId: 'feet-basics',
    title: 'Sentire la distribuzione del peso sulla terra',
    description:
      'Porta l’attenzione sotto i piedi e osserva dove senti maggiormente il peso: tallone, avampiede, lato interno o esterno. Spostalo lentamente per esplorare le diverse sensazioni, poi cerca una posizione stabile e centrale. Respira senza tensioni e percepisci come piccoli cambiamenti dell’appoggio modificano l’equilibrio di tutto il corpo.',
    videoUrl: '/videos/mov-piedi-2.mp4',
    thumbnailUrl: '../assets/img/mov-piedi-2.png',
    requiredTrainingMs: 5000,
    nextSectionId: null,
  },
];

test.describe('Section list', () => {
  test('Verify if /exercises show course title', async ({ page }) => {
    await page.goto('/exercises');
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await expect(page.getByRole('heading', { name: 'Corso base di consapevolezza del corpo' })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('Verify that all five sections are visible', async ({ page }) => {
    await page.goto('/exercises');
    const state = await page.evaluate(async () => {
      const { store } = await import('/src/store/store.ts');

      return store.getState();
    });
    const sectionCards = page.locator('main article');
    await expect(sectionCards).toHaveCount(exerciseSections.length);

    for (const [index, section] of exerciseSections.entries()) {
      const currentSection = state.trainingProgress.progressBySectionId[section.id];
      const sectionCard = sectionCards.nth(index);
      await expect(
        sectionCard.getByRole('heading', {
          name: section.title,
          exact: true,
        }),
      ).toBeVisible();

      const image = sectionCard.getByRole('img', {
        name: `Anteprima di ${section.title}`,
        exact: true,
      });

      // Verifies that the image element is visible on the page.
      await expect(image).toBeVisible();

      // Verifies that the image resource was successfully loaded.
      await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
      // first(): get the first p element
      await expect(sectionCard.locator('p').first()).toHaveText(`Stato: ${currentSection.status}`);
    }
  });

  test('Verify that only the first section is clickable', async ({ page }) => {
    await page.goto('/exercises');
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const sectionCards = page.locator('main article');

    for (const [index, section] of exerciseSections.entries()) {
      const urlBeforeClick = page.url();
      const sectionCard = sectionCards.nth(index);
      // Dispatching the event verifies that the card has no navigation behavior.
      await sectionCard.dispatchEvent('click');

      if (index > 0) {
        await expect(page).toHaveURL(urlBeforeClick);
      } else {
        await expect(page).toHaveURL(`/exercise/${section.id}`);
        await page.goto('/exercises');
      }
    }
  });

  test('locked sections cannot be reached using the keyboard', async ({ page }) => {
    await page.goto('/exercises');

    const lockedCards = page.locator('main article[aria-disabled="true"]');

    await expect(lockedCards).toHaveCount(4);

    for (const lockedCard of await lockedCards.all()) {
      await expect(lockedCard).toHaveAttribute('inert', '');

      // A locked card must not contain links or other keyboard controls.
      await expect(
        lockedCard.locator('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      ).toHaveCount(0);
    }

    const initialUrl = page.url();

    const possibleTabStops = page.locator(
      // button:not([disabled]) : selects the buttons that doesn't have the 'disabled' attribute.
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    // One additional iteration verifies that focus wraps around without
    // entering any locked card.
    const numberOfTabPresses = (await possibleTabStops.count()) + 1;

    for (let index = 0; index < numberOfTabPresses; index += 1) {
      await page.keyboard.press('Tab');

      const focusIsInsideLockedCard = await lockedCards.evaluateAll((cards) => {
        const activeElement = document.activeElement;
        // controls that at least one element satysfies the condition
        return cards.some((card) => card.contains(activeElement));
      });

      expect(focusIsInsideLockedCard).toBe(false);
    }

    await expect(page).toHaveURL(initialUrl);
  });
});
