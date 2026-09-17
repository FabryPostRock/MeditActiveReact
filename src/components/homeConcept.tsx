import type { HomeConceptData } from '../data/homeConcepts';

interface HomeConceptProps {
  concept: HomeConceptData;
}

export function HomeConcept({ concept }: HomeConceptProps) {
  return (
    <section>
      <div className="container-fluid mb-5">
        <div className="row justify-content-center mx-3 mx-lg-5">
          <div className="col-12 mb-3 p-0">
            <div className="row-md-none mb-3">
              <div className="col-9 col-md-6 col-lg-5 float-none float-md-end p-4 ps-md-5 pe-md-0">
                <img
                  className="img-fluid d-block mx-auto concept-image-shadow rounded p-0 h-auto"
                  src={concept.image.src}
                  alt={concept.image.alt}
                />
              </div>

              <div className="text-justify mb-4">
                <h2 className="fs-4 secondary-color text-start">{concept.title}</h2>
                <p className="mb-0">{concept.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
