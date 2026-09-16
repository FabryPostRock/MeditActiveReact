import logo_936x905 from '../assets/img/logo_936x905.png';
import problem_productivity from '../assets/img/problem_productivity.png';
import vision_small from '../assets/img/vision_small.png';
import mission from '../assets/img/mission.png';

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
      <section>
        <div className="container">
          <div className="justify-content-center">
            <div className="align-content-center">
              <h2 className="text-center fw-bold fs-3 mb-0">Da dove nasce l’idea..</h2>
            </div>
            <div className="justify-content-center">
              <div className="align-content-center">
                <img
                  className="img-fluid mx-auto d-block"
                  src={problem_productivity}
                  alt="persona sovraccaricata dagli impegni"
                />
              </div>
              <div className="justify-content-center">
                <p className="text-justify mb-0">
                  Nella società di oggi, la consapevolezza di sé è spesso trascurata a favore della produttività. Il
                  mondo corre veloce, lasciando poco spazio all’introspezione e al benessere mentale. MeditActive nasce
                  con l’obiettivo di aiutare le persone a ritrovare il proprio equilibrio interiore, rifocalizzandosi su
                  sé stessi e integrando pratiche come la meditazione nella quotidianità.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="">
          <div>----------------------------------------------</div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="">
            <h2 className="">Vision</h2>
          </div>
          <div className="">
            <div className="">
              <img className="" src={vision_small} alt="Obiettivo finale di MeditActive" />
            </div>
            <div className="">
              <p className="">
                🌿 Supportare le persone nel raggiungimento dei propri obiettivi, aiutandole a vivere in armonia con sé
                stesse.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="">
          <div className="">
            <h2 className="">Mission</h2>
          </div>
          <div className="">
            <div className="">
              <img className="" src={mission} alt="Visione futura di MeditActive" />
            </div>
            <div className="">
              <p className="">
                Guidare gli utenti in un percorso di meditazione quotidiano, favorendo la crescita personale e il
                benessere mentale.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="">
        <div>----------------------------------------------</div>
      </div>
      <footer></footer>
    </>
  );
}
