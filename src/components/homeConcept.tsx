import type { HomeConceptData } from '../data/homeConcepts';
import { Title } from './title';
import { Trans, useTranslation } from 'react-i18next';

interface HomeConceptProps {
  concept: HomeConceptData;
  imageOnLeft: boolean;
}

export function HomeConcept({ concept, imageOnLeft }: HomeConceptProps) {
  const { t } = useTranslation();
  const translationKey = `home.concepts.${concept.id}`;

  return (
    <section className="reveal">
      <div className="container-fluid mb-5">
        <div className="row justify-content-center mx-3 mx-lg-5">
          <div className="col-12 p-0">
            <div className="row-md-none mb-3">
              <div
                className={`col-9 col-md-7 col-xl-6 float-none ${
                  imageOnLeft ? 'float-md-start p-4 pe-md-5 ps-md-0' : 'float-md-end p-4 ps-md-5 pe-md-0'
                }`}
              >
                <div className="d-flex flex-row justify-content-center">
                  <div className="col-12 col-lg-10">
                    <img
                      className="img-fluid d-block mx-auto concept-image-shadow rounded p-0 h-auto"
                      src={concept.imageSrc}
                      alt={t(`${translationKey}.imageAlt`)}
                    />
                  </div>
                </div>
              </div>

              <div className="text-justify mb-4">
                <Title
                  title={t(`${translationKey}.title`)}
                  txtColor={imageOnLeft ? 'var(--bs-dark-green)' : 'var(--bs-secondary)'}
                  txtSize={['fs-2']}
                  headlineType={'h2'}
                  position={'text-start'}
                  underlineOnHover={true}
                  scaleOnHover={false}
                  underlineTxtFit={true}
                />
                {/**
                 * `Trans` is used instead of `t()` because these descriptions contain React elements, not only text.
                 * `i18nKey` selects the translated description for the current concept.
                 * Each entry in `components` maps a named tag from the translation string to a real React HTML element.
                 * For example, `<emphasis>text</emphasis>` becomes `<strong>text</strong>` in the rendered DOM.
                 */}
                <Trans
                  i18nKey={`${translationKey}.description`}
                  components={{
                    // Named translation tags are converted into these safe React HTML elements.
                    paragraph: <p />,
                    emphasis: <strong />,
                    citation: <i />,
                    linebreak: <br />,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
