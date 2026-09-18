import logo_936x905 from '../assets/img/logo_936x905.png';
import { homeConceptsData } from '../data/homeConcepts';
import { HomeConcept } from '../components/homeConcept';
import { useEffect, useRef } from 'react';

export default function Home() {
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
    <>
      <section>
        <div className="container mb-5">
          <div className="row flex-row d-flex justify-content-center mb-3">
            <div className="col-12 col-md-4 col-lg-3 text-center text-md-end">
              <img className="h-auto w-sm-40 w-md-30 w-lg-40" src={logo_936x905} alt="Logo MeditActive" />
            </div>
            <div className="col-12 col-md-4 col-lg-3 align-content-center text-center text-md-start">
              <h1 className="fw-bold secondary-color mb-0 ms-md-3 ">MeditActive</h1>
            </div>
          </div>
          <div className="col">
            <h3 className="fs-4 text-center">
              L’app per combinare i benefici della meditazione con strumenti di crescita personale, aiutando gli utenti
              a raggiungere obiettivi di breve, medio e lungo termine.
            </h3>
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
  );
}
