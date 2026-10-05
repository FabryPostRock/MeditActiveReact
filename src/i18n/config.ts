import type { InitOptions } from 'i18next';

import englishTranslations from './locales/en/translation.json';
import italianTranslations from './locales/it/translation.json';

export const supportedLanguages = ['it', 'en'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const fallbackLanguage: SupportedLanguage = 'it';

export const resources = {
  it: {
    translation: italianTranslations,
  },
  en: {
    translation: englishTranslations,
  },
} as const;

export const i18nOptions = {
  resources,
  fallbackLng: fallbackLanguage,
  supportedLngs: supportedLanguages,
  nonExplicitSupportedLngs: true,
  load: 'languageOnly',
  detection: {
    order: ['navigator'],
    // 'localStorage' can also be used but ignores the browser config
    caches: [],
  },
  interpolation: {
    escapeValue: false,
  },
} satisfies InitOptions;
