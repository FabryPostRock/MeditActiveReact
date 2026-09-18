import type { HomeConceptData } from '../data/homeConcepts';
import { Title } from './title';
interface HomeConceptProps {
  concept: HomeConceptData;
  imageOnLeft: boolean;
}

export function HomeConcept({ concept, imageOnLeft }: HomeConceptProps) {
  return (
    <section className="reveal">
      <div className="container-fluid mb-5">
        <div className="row justify-content-center mx-3 mx-lg-5">
          <div className="col-12 p-0">
            <div className="row-md-none mb-3">
              <div
                className={`col-9 col-md-6 col-lg-5 float-none ${
                  imageOnLeft ? 'float-md-start p-4 pe-md-5 ps-md-0' : 'float-md-end p-4 ps-md-5 pe-md-0'
                }`}
              >
                <div className="d-flex flex-row justify-content-center">
                  <div className="col-10 col-lg-8">
                    <img
                      className="img-fluid d-block mx-auto concept-image-shadow rounded p-0 h-auto"
                      src={concept.image.src}
                      alt={concept.image.alt}
                    />
                  </div>
                </div>
              </div>

              <div className="text-justify mb-4">
                <Title title={concept.title} txtColor={imageOnLeft ? 'var(--bs-dark-green)' : 'var(--bs-secondary)'} />
                {concept.description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
