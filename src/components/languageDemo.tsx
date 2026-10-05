import { useTranslation } from 'react-i18next';

import type { SupportedLanguage } from '../i18n';

export function LanguageDemo() {
  const { t, i18n } = useTranslation();
  const currentLanguage: SupportedLanguage = i18n.resolvedLanguage === 'en' ? 'en' : 'it';

  const handleLanguageChange = (language: SupportedLanguage) => {
    void i18n.changeLanguage(language);
  };

  return (
    <section className="container my-5" lang={currentLanguage}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="border border-secondary rounded-4 p-4 p-md-5 text-center">
            <p className="text-uppercase fw-semibold secondary-color mb-2">{t('languageDemo.eyebrow')}</p>
            <h2 className="mb-3">{t('languageDemo.title')}</h2>
            <p>{t('languageDemo.description')}</p>
            <p className="mb-1" aria-live="polite">
              {t('languageDemo.activeLanguage', {
                language: t(`languageDemo.languages.${currentLanguage}`),
              })}
            </p>
            <p className="mb-4">{t('languageDemo.detectedLanguage')}</p>

            <div
              className="d-flex flex-wrap justify-content-center gap-2"
              role="group"
              aria-label={t('languageDemo.languageSelector')}
            >
              <button
                type="button"
                className={`btn ${currentLanguage === 'it' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                aria-pressed={currentLanguage === 'it'}
                onClick={() => handleLanguageChange('it')}
              >
                {t('languageDemo.languages.it')}
              </button>
              <button
                type="button"
                className={`btn ${currentLanguage === 'en' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                aria-pressed={currentLanguage === 'en'}
                onClick={() => handleLanguageChange('en')}
              >
                {t('languageDemo.languages.en')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
