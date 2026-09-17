import problemProductivityImage from '../assets/img/problem_productivity.png';
import visionImage from '../assets/img/people_meditating_cartoon_alpha.png';
import missionImage from '../assets/img/people_mission_cartoon_alpha.png';
import type { ReactNode } from 'react';

export interface HomeConceptData {
  id: string;
  title: string;
  // using description as ReactNode, allow to put html content inside an object value
  description: ReactNode;
  image: {
    src: string;
    alt: string;
  };
}

export const homeConceptsData = [
  {
    id: 'origin',
    title: 'Il nostro why..',
    description: (
      <>
        <p>
          Viviamo in una società in cui essere produttivi, raggiungere risultati e passare rapidamente da un impegno
          all’altro occupa una parte sempre più importante della nostra quotidianità. In questo contesto può diventare
          difficile fermarsi, ascoltare ciò che stiamo vivendo e capire se la direzione che stiamo seguendo corrisponde
          davvero ai nostri bisogni e alle nostre priorità.
        </p>
        <p>
          MeditActive nasce da una convinzione semplice:{' '}
          <strong>
            crescere non significa necessariamente fare sempre di più, ma imparare anche a riconoscere ciò che conta
            davvero per noi.
          </strong>
        </p>
        <p>
          La meditazione può rappresentare uno degli strumenti attraverso cui allenare questa capacità. Le pratiche di
          mindfulness portano intenzionalmente l’
          <strong>
            attenzione all’esperienza presente e possono favorire processi legati alla regolazione dell’attenzione, alla
            consapevolezza di sé e alla gestione delle emozioni
          </strong>
          . Una delle principali revisioni scientifiche sull’argomento ha individuato proprio controllo dell’attenzione,
          regolazione emotiva e self awareness tra i possibili meccanismi attraverso cui agisce la mindfulness
          <i>(Tang, Hölzel & Posner, 2015)</i>.
        </p>
        <p>
          Anche gli studi clinici suggeriscono risultati interessanti, pur senza considerare la meditazione una
          soluzione universale. Una revisione sistematica pubblicata su <i>JAMA Internal Medicine</i>, comprendente 47
          <strong>studi randomizzati e 3.515 partecipanti</strong>, ha rilevato che i programmi di mindfulness possono
          produrre <strong>riduzioni piccole o moderate di alcune dimensioni dello stress</strong> psicologico, in
          particolare ansia e sintomi depressivi (Goyal et al., 2014).
        </p>
        <p>
          Per noi, però, meditare non significa semplicemente rilassarsi. Significa imparare a creare uno spazio tra ciò
          che accade e il modo in cui decidiamo di reagire. Uno spazio in cui possiamo{' '}
          <strong>osservare pensieri, emozioni e sensazioni</strong>, riconoscere ciò di cui abbiamo bisogno e scegliere
          con maggiore consapevolezza come utilizzare il nostro tempo e le nostre energie. MeditActive nasce per aiutare
          le persone a costruire questo spazio nella vita quotidiana.'
        </p>
        ,
      </>
    ),
    image: {
      src: problemProductivityImage,
      alt: 'Persona sovraccaricata dagli impegni',
    },
  },
  {
    id: 'vision',
    title: 'Vision',
    description: (
      <>
        <p>
          Immaginiamo un futuro in cui dedicare tempo a sé stessi non venga percepito come una pausa dalla propria vita,
          ma come una parte naturale di essa.
        </p>
        <p>
          Un futuro in cui il benessere personale non venga misurato soltanto attraverso ciò che riusciamo a produrre o
          raggiungere, ma anche attraverso la capacità di ascoltarci, comprendere i nostri limiti, riconoscere le nostre
          priorità e utilizzare le nostre energie in modo più consapevole.
        </p>
        <p>
          <strong>MeditActive vuole contribuire a questo cambiamento</strong> aiutando le persone a sviluppare maggiore
          consapevolezza, equilibrio e fiducia nelle proprie capacità, affinché possano affrontare cambiamenti,
          difficoltà e nuovi obiettivi senza perdere il contatto con sé stesse. La ricerca sulla mindfulness suggerisce
          che la pratica meditativa possa coinvolgere processi di autoregolazione che comprendono attenzione ,
          consapevolezza corporea, regolazione delle emozioni e una diversa relazione con i propri pensieri e con la
          percezione di sé <i>(Hölzel et al.; Tang, Hölzel & Posner)</i>.
        </p>
        <p>
          <strong>
            Per MeditActive, essere consapevoli non significa eliminare difficoltà, pensieri o emozioni negative.
            Significa imparare a riconoscerli senza esserne automaticamente guidati.
          </strong>
        </p>
        <p>Lo stesso principio può essere applicato agli obiettivi personali.</p>
        <p>
          Un obiettivo non dovrebbe diventare una fonte costante di pressione, ma una direzione verso cui procedere
          adattando il percorso alle circostanze, alle proprie capacità e ai propri ritmi.
        </p>
        <p>
          <strong>
            La nostra visione è trasformare la crescita personale da una corsa verso il risultato a un percorso nel
            quale anche il modo in cui arriviamo alla meta diventa parte del risultato stesso.
          </strong>
        </p>
      </>
    ),
    image: {
      src: visionImage,
      alt: 'Obiettivo finale di MeditActive',
    },
  },
  {
    id: 'mission',
    title: 'Mission',
    description: (
      <>
        <p>
          La nostra missione è rendere la meditazione <strong>semplice, accessibile e concreta</strong>, aiutando ogni
          persona a trasformarla gradualmente in una pratica compatibile con la propria quotidianità.
        </p>
        <p>
          MeditActive non vuole chiederti di cambiare improvvisamente il tuo stile di vita. Vuole aiutarti a partire da
          piccoli momenti: alcuni minuti dedicati al respiro, all'ascolto del corpo, all'osservazione dei pensieri o
          semplicemente a fermarti e riportare l'attenzione su ciò che stai vivendo. La continuità è più importante
          della perfezione. Per questo MeditActive combina gli esercizi di meditazione con strumenti che permettono di{' '}
          <strong>
            organizzare la pratica, definire obiettivi, osservare i propri progressi e costruire gradualmente nuove
            routine.
          </strong>
        </p>
        <p>
          Questa impostazione è coerente anche con quanto emerge dalla ricerca sul cambiamento comportamentale. Una
          meta-analisi comprendente 141 studi e oltre 16.000 partecipanti ha riscontrato un effetto positivo del goal
          setting sul cambiamento del comportamento <i>(Epton, Currie & Armitage, 2017)</i>.
        </p>
        <p>
          Allo stesso modo, una recente revisione sistematica sugli interventi digitali per la formazione delle
          abitudini identifica{' '}
          <strong>
            auto-monitoraggio, definizione degli obiettivi, promemoria e segnali contestuali tra le strategie più
            frequentemente utilizzate
          </strong>{' '}
          per sostenere la continuità di un comportamento. Per questo l'obiettivo di MeditActive non è soltanto offrire
          una raccolta di meditazioni. L’app vuole accompagnare la persona nel processo che porta da:
          <br />
          <br />
          <i>“Vorrei dedicare più tempo a me stesso”</i>
          <br />
          <br />
          a:
          <br />
          <br />
          <i>“Ho costruito uno spazio per me all’interno della mia quotidianità”.</i>
        </p>
        <p>
          Attraverso esercizi guidati, percorsi progressivi e strumenti per osservare il proprio cammino, MeditActive
          vuole favorire l'ascolto di sé, la continuità e una crescita personale che non sia imposta dall'esterno, ma
          costruita consapevolmente dalla persona.
        </p>
        <p>
          <strong>
            Un piccolo momento di consapevolezza può diventare una pratica. Una pratica può diventare un'abitudine. E
            un'abitudine può contribuire, nel tempo, a cambiare il modo in cui affrontiamo il nostro percorso.
          </strong>
        </p>
      </>
    ),
    image: {
      src: missionImage,
      alt: 'Visione futura di MeditActive',
    },
  },
] as const satisfies readonly HomeConceptData[];
