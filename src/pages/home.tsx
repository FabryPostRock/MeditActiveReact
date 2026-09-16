import logo_936x905 from '../assets/img/logo_936x905.png';
import problem_productivity from '../assets/img/problem_productivity.png';
import vision_small from '../assets/img/vision_small.png';
import mission from '../assets/img/mission.png';

export default function Home() {
  return (
    <>
      <div className="">
        <div className="">
          <img className="" src={logo_936x905} alt="Logo MeditActive" />
        </div>
        <div className="">
          <h1 id="title-company-name">MeditActive</h1>
        </div>
      </div>
      <div className="">
        <p id="descr-uvp" className="">
          L’app per combinare i benefici della meditazione con strumenti di crescita personale, aiutando gli utenti a
          raggiungere obiettivi di breve, medio e lungo termine.
        </p>
      </div>

      <div className="">
        <div className="">
          <div className="">
            <h2 className="">Da dove nasce l’idea..</h2>
          </div>
          <div className="">
            <div className="">
              <img className="" src={problem_productivity} alt="persona sovraccaricata dagli impegni" />
            </div>
            <div className="">
              <p className="">
                Nella società di oggi, la consapevolezza di sé è spesso trascurata a favore della produttività. Il mondo
                corre veloce, lasciando poco spazio all’introspezione e al benessere mentale. MeditActive nasce con
                l’obiettivo di aiutare le persone a ritrovare il proprio equilibrio interiore, rifocalizzandosi su sé
                stessi e integrando pratiche come la meditazione nella quotidianità.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="">
        <div>----------------------------------------------</div>
      </div>
      <div className="">
        <div className="">
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
      </div>
      <div className="">
        <div>----------------------------------------------</div>
      </div>
      <footer></footer>
    </>
  );
}
