import logo_936x905 from '../assets/img/logo_936x905.png';
import { homeConceptsData } from '../data/homeConcepts';
import { HomeConcept } from '../components/homeConcept';
import { PerspectiveWalls } from '../components/perspectiveWalls';
import { CursorWake } from '../components/cursorWake';
import { PageMetadata } from '../components/pageMetadata';
import { createHomePageMetadata } from '../data/pageMetadata';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t, i18n } = useTranslation();
  const pageMetadata = createHomePageMetadata({
    title: t('home.metadata.title'),
    description: t('home.metadata.description'),
    organizationDescription: t('home.metadata.organizationDescription'),
    imageAlt: t('home.logoAlt'),
    locale: i18n.resolvedLanguage === 'en' ? 'en_US' : 'it_IT',
  });

  /*
  useRef creates { current: null }
              ↓
  useEffect register the function
              ↓
  React builds the DOM
              ↓
  React assign the div to 'current'
              ↓
  useEffect function gets executed
  */
  const conceptsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /*
     * React assigns the DOM element to the ref after rendering. The effect runs
     * after that, so `current` can safely be used here without causing
     * another render.
     */
    const container = conceptsContainerRef.current;

    if (!container) return;

    /*
     * Querying from the referenced container limits the selection to this
     * page's concepts instead of matching every `.reveal` element in the
     * document.
     */
    const elements = container.querySelectorAll<HTMLElement>('.reveal');

    // Keep the content visible when IntersectionObserver is not supported.
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // multiple time animation
          // entry.target.classList.toggle('is-visible', entry.isIntersecting);
          // One time animation implemented with a combination of .add() method and .unobserve method
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        /*
         * No `root` is provided, so intersections are measured against the
         * viewport. The ref only scopes the DOM query; it is not the observer's
         * root.
         */
        threshold: 0.1,
      },
    );

    elements.forEach((element) => observer.observe(element));

    // Disconnect the observer when Home unmounts or the effect is restarted.
    return () => observer.disconnect();
    // []: means only at Home mounting. But even if IntersectionObserver is mounted only one time
    // this doesn t mean that concepts cannot animate multiple times.
  }, []);

  return (
    /*<div className="page-isolation">
      <PerspectiveWalls />
      <CursorWake />

      <div className="page__content">*/
    <>
      <PageMetadata metadata={pageMetadata} />

      <section>
        <div className="container mb-5">
          <div className="row flex-row d-flex justify-content-center mb-3">
            <div className="col-12 col-md-4 col-lg-3 text-center text-md-end">
              <img
                className="h-auto w-sm-40 w-md-30 w-lg-40"
                src={logo_936x905}
                alt={t('home.logoAlt')}
              />
            </div>
            <div className="col-12 col-md-4 col-lg-3 align-content-center text-center text-md-start">
              <h1 className="fw-bold secondary-color mb-0 ms-md-3 ">MeditActive</h1>
            </div>
          </div>
          <div className="col">
            <h3 className="fs-4 text-center">{t('home.tagline')}</h3>
          </div>
        </div>
      </section>

      <div ref={conceptsContainerRef}>
        {homeConceptsData.map((concept, index) => {
          const imageOnLeft = index % 2 !== 0;
          return <HomeConcept key={concept.id} concept={concept} imageOnLeft={imageOnLeft} />;
        })}
      </div>
    </>
    /*  </div>
    </div>*/
  );
}
