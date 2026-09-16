import problemProductivityImage from '../assets/img/problem_productivity.png';
import visionImage from '../assets/img/vision_small.png';
import missionImage from '../assets/img/mission.png';

export interface HomeConceptData {
  id: string;
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
}

export const homeConceptsData = [
  {
    id: 'origin',
    title: 'Il nostro why..',
    description:
      'Nella società di oggi, la consapevolezza di sé è spesso trascurata a favore della produttività. Il mondo\
        corre veloce, lasciando poco spazio all’introspezione e al benessere mentale. MeditActive nasce con\
        l’obiettivo di aiutare le persone a ritrovare il proprio equilibrio interiore, rifocalizzandosi su sé\
        stessi e integrando pratiche come la meditazione nella quotidianità.',
    image: {
      src: problemProductivityImage,
      alt: 'Persona sovraccaricata dagli impegni',
    },
  },
  {
    id: 'vision',
    title: 'Vision',
    description:
      'Immaginiamo un futuro in cui dedicare tempo a sé stessi sia una parte naturale della quotidianità.\
       MeditActive vuole aiutare le persone a sviluppare maggiore consapevolezza, equilibrio e fiducia\
       nelle proprie capacità, affinché possano affrontare i cambiamenti con serenità e trasformare\
       i propri obiettivi in percorsi sostenibili, rispettosi dei ritmi personali e orientati a un\
       benessere duraturo.',
    image: {
      src: visionImage,
      alt: 'Obiettivo finale di MeditActive',
    },
  },
  {
    id: 'mission',
    title: 'Mission',
    description:
      'La nostra missione è rendere la meditazione semplice, accessibile e concreta, accompagnando\
       ogni persona nella costruzione di una pratica quotidiana. Attraverso esercizi guidati e strumenti\
       per organizzare il tempo e osservare i propri progressi, MeditActive favorisce la continuità, \
       l’ascolto di sé e la crescita personale, aiutando gli utenti a procedere verso i propri obiettivi\
        con maggiore presenza e consapevolezza.',
    image: {
      src: missionImage,
      alt: 'Visione futura di MeditActive',
    },
  },
] as const satisfies readonly HomeConceptData[];
