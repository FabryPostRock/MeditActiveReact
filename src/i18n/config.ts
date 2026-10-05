import type { InitOptions } from 'i18next';

import englishTranslations from './locales/en/translation.json';
import italianTranslations from './locales/it/translation.json';

// Lists the language codes for which the application provides a translation dictionary.
export const supportedLanguages = ['it', 'en'] as const;

// Restricts language values to one of the supported language codes.
export type SupportedLanguage = (typeof supportedLanguages)[number];

// Provides a safe default when the browser language is not supported.
export const fallbackLanguage: SupportedLanguage = 'it';

// Maps each supported language to its translation dictionary.
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
  // Uses Italian when none of the detected browser languages is supported.
  fallbackLng: fallbackLanguage,
  // Prevents i18next from selecting a language in the browser (for instance) without a corresponding dictionary.
  supportedLngs: supportedLanguages,
  // Treats regional variants such as en-US as compatible with the base language en.
  nonExplicitSupportedLngs: true,
  // Loads the base-language dictionary instead of requiring a regional dictionary.
  load: 'languageOnly',
  detection: {
    // Reads the preferred languages exposed by navigator.languages and navigator.language.
    order: ['navigator'],
    // Avoids persisting a language that would override later browser-setting changes.
    caches: [],
  },
  interpolation: {
    // React already escapes rendered values, so i18next must not escape them again.
    escapeValue: false,
  },
} satisfies InitOptions;
