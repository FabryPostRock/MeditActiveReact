import problem_productivity from '../assets/img/problem_productivity.png';

export function HomeSection() {
  return (
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
                Nella società di oggi, la consapevolezza di sé è spesso trascurata a favore della produttività. Il mondo
                corre veloce, lasciando poco spazio all’introspezione e al benessere mentale. MeditActive nasce con
                l’obiettivo di aiutare le persone a ritrovare il proprio equilibrio interiore, rifocalizzandosi su sé
                stessi e integrando pratiche come la meditazione nella quotidianità.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
