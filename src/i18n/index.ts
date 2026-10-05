import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { i18nOptions } from './config';

export { fallbackLanguage, resources, supportedLanguages, type SupportedLanguage } from './config';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nOptions);

export default i18n;
