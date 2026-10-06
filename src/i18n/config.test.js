import { createInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fallbackLanguage, i18nOptions, resources, supportedLanguages } from './config';
import { exerciseSections } from '../data/learningContent';
import { homeConceptsData } from '../data/homeConcepts';

function mockNavigatorLanguage(language) {
  vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(language);
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue([language]);
}

async function createTestI18n() {
  const instance = createInstance();

  await instance.use(LanguageDetector).init(i18nOptions);

  return instance;
}

function getTranslationKeys(value, parentKey = '') {
  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const translationKey = parentKey ? `${parentKey}.${key}` : key;

    if (nestedValue !== null && typeof nestedValue === 'object') {
      return getTranslationKeys(nestedValue, translationKey);
    }

    return translationKey;
  });
}

function getRichTextTags(value) {
  return [...value.matchAll(/<\/?([A-Za-z]+)(?:\s*\/)?\s*>/g)].map((match) => match[1]);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('i18n browser language detection', () => {
  it.each([
    ['it-IT', 'it'],
    ['en-US', 'en'],
  ])('resolves browser language %s to %s', async (browserLanguage, expectedLanguage) => {
    mockNavigatorLanguage(browserLanguage);

    const instance = await createTestI18n();

    expect(instance.resolvedLanguage).toBe(expectedLanguage);
  });

  it('uses Italian as fallback for an unsupported browser language', async () => {
    mockNavigatorLanguage('fr-FR');

    const instance = await createTestI18n();

    expect(instance.resolvedLanguage).toBe(fallbackLanguage);
  });
});

describe('i18n dictionaries', () => {
  it('declares Italian and English with Italian as fallback', () => {
    expect(supportedLanguages).toEqual(['it', 'en']);
    expect(fallbackLanguage).toBe('it');
  });

  it('contains the same translation keys in both languages', () => {
    const italianKeys = getTranslationKeys(resources.it.translation).sort();
    const englishKeys = getTranslationKeys(resources.en.translation).sort();

    expect(englishKeys).toEqual(italianKeys);
  });

  it('contains a title and description for every exercise section in each language', () => {
    supportedLanguages.forEach((language) => {
      const translatedSections = resources[language].translation.exercises.sections;

      exerciseSections.forEach((section) => {
        expect(translatedSections[section.id].title.trim()).not.toBe('');
        expect(translatedSections[section.id].description.trim()).not.toBe('');
      });
    });
  });

  it('contains complete translations for every Home concept', () => {
    supportedLanguages.forEach((language) => {
      const translatedConcepts = resources[language].translation.home.concepts;

      homeConceptsData.forEach((concept) => {
        expect(translatedConcepts[concept.id].title.trim()).not.toBe('');
        expect(translatedConcepts[concept.id].description.trim()).not.toBe('');
        expect(translatedConcepts[concept.id].imageAlt.trim()).not.toBe('');
      });
    });
  });

  it('uses the same rich-text tag structure in both Home dictionaries', () => {
    homeConceptsData.forEach((concept) => {
      const italianDescription = resources.it.translation.home.concepts[concept.id].description;
      const englishDescription = resources.en.translation.home.concepts[concept.id].description;

      expect(getRichTextTags(englishDescription)).toEqual(getRichTextTags(italianDescription));
    });
  });
});
