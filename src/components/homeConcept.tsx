import type { HomeConceptData } from '../data/homeConcepts';

interface HomeConceptProps {
  concept: HomeConceptData;
}

export function HomeConcept({ concept }: HomeConceptProps) {
  return (
    <section>
      <div className="container">
        <div className="justify-content-center">
          <div className="align-content-center">
            <h2 className="text-center fw-bold fs-3 mb-0">{concept.title}</h2>
          </div>
          <div className="justify-content-center">
            <div className="align-content-center">
              <img className="img-fluid mx-auto d-block" src={concept.image.src} alt={concept.image.alt} />
            </div>
            <div className="justify-content-center">
              <p className="text-justify mb-0">{concept.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
