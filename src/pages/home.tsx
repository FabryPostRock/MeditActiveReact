import logo_936x905 from '../assets/img/logo_936x905.png';
import { homeConceptsData } from '../data/homeConcepts';
import { HomeConcept } from '../components/homeConcept';

export default function Home() {
  return (
    <>
      <section>
        <div className="container mb-5">
          <div className="col d-flex justify-content-center mb-3">
            <div className="">
              <img className="" src={logo_936x905} alt="Logo MeditActive" />
            </div>
            <div className="align-content-center">
              <h1 className="fw-bold secondary-color mb-0 ms-3">MeditActive</h1>
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

      {homeConceptsData.map((concept) => (
        <HomeConcept key={concept.id} concept={concept} />
      ))}
    </>
  );
}
