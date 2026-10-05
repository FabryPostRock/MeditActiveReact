import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { fallbackLanguage, i18nOptions } from './config';

export { fallbackLanguage, resources, supportedLanguages, type SupportedLanguage } from './config';

/**
 * Keeps the document language aligned with the language selected by i18next.
 * Regional tags such as en-US are reduced to their base language for the HTML lang attribute.
 */
function updateDocumentLanguage(language: string) {
  document.documentElement.lang = language.split('-')[0];
}

// Updates the document semantics whenever i18next changes its active language.
i18n.on('languageChanged', updateDocumentLanguage);

void i18n
  // Detects the preferred language from the browser sources configured in i18nOptions.
  .use(LanguageDetector)
  // Connects this i18next instance to React and enables hooks such as useTranslation.
  .use(initReactI18next)
  // Initializes i18next with the dictionaries, fallback and detection rules.
  .init(i18nOptions)
  .then(() => {
    // Ensures that the HTML lang attribute is correct after the initial detection has completed.
    updateDocumentLanguage(i18n.resolvedLanguage ?? fallbackLanguage);
  });

export default i18n;
