import problemProductivityImage from '../assets/img/problem_productivity.png';
import visionImage from '../assets/img/people_meditating_cartoon_alpha.png';
import missionImage from '../assets/img/people_mission_cartoon_alpha.png';

export const homeConceptsData = [
  {
    id: 'origin',
    imageSrc: problemProductivityImage,
  },
  {
    id: 'vision',
    imageSrc: visionImage,
  },
  {
    id: 'mission',
    imageSrc: missionImage,
  },
] as const;

export type HomeConceptData = (typeof homeConceptsData)[number];
