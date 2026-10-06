import organizationLogo from '../assets/img/logo_180x180.png';
import defaultOpenGraphImage from '../assets/img/logo_936x905.png';
import type ExerciseSection from './learningContent';

export interface OpenGraphMetadataData {
  type: 'website';
  siteName: string;
  locale: 'it_IT' | 'en_US';
  image: string;
  imageAlt: string;
}

export interface OrganizationMetadataData {
  name: string;
  description: string;
  urlPath: string;
  logo: string;
  email: string;
  telephone: string;
  sameAs: readonly string[];
}

export interface PageMetadataData {
  title: string;
  description: string;
  canonicalPath?: string;
  robots: 'index, follow' | 'noindex, nofollow';
  openGraph: OpenGraphMetadataData;
  organization?: OrganizationMetadataData;
}

const sharedOpenGraphMetadata = {
  type: 'website',
  siteName: 'MeditActive',
  locale: 'it_IT',
} as const;

const organizationMetadata: OrganizationMetadataData = {
  name: 'MeditActive',
  description:
    'MeditActive combina meditazione, consapevolezza e strumenti di crescita personale per aiutare le persone a costruire abitudini sostenibili e raggiungere i propri obiettivi.',
  urlPath: '/',
  logo: organizationLogo,
  email: 'info@meditactive.com',
  telephone: '+39 3456879998',
  sameAs: [
    'https://www.instagram.com/meditactive',
    'https://www.facebook.com/meditactive?locale=it_IT',
    'https://www.linkedin.com/in/meditactive/',
    'https://www.youtube.com/@meditactive/',
  ],
};

export const homePageMetadata: PageMetadataData = {
  title: 'MeditActive | Meditazione e crescita personale',
  description:
    'MeditActive unisce meditazione, consapevolezza e strumenti di crescita personale per aiutarti a costruire abitudini e raggiungere i tuoi obiettivi.',
  canonicalPath: '/',
  robots: 'index, follow',
  openGraph: {
    ...sharedOpenGraphMetadata,
    image: defaultOpenGraphImage,
    imageAlt: 'Logo MeditActive',
  },
  organization: organizationMetadata,
};

export const exercisesPageMetadata: PageMetadataData = {
  title: 'Corso di consapevolezza del corpo | MeditActive',
  description:
    'Scopri gli esercizi guidati di MeditActive per allenare respirazione, postura e consapevolezza del corpo.',
  canonicalPath: '/exercises',
  robots: 'index, follow',
  openGraph: {
    ...sharedOpenGraphMetadata,
    image: defaultOpenGraphImage,
    imageAlt: 'Logo MeditActive',
  },
};

export const errorPageMetadata: PageMetadataData = {
  title: 'Pagina non trovata | MeditActive',
  description: 'La pagina richiesta non è disponibile.',
  robots: 'noindex, nofollow',
  openGraph: {
    ...sharedOpenGraphMetadata,
    image: defaultOpenGraphImage,
    imageAlt: 'Logo MeditActive',
  },
};

interface ExercisePageMetadataContent {
  title: string;
  description: string;
  imageAlt: string;
  locale: OpenGraphMetadataData['locale'];
}

export function createExercisePageMetadata(
  section: ExerciseSection,
  content: ExercisePageMetadataContent,
): PageMetadataData {
  return {
    title: `${content.title} | MeditActive`,
    description: content.description,
    canonicalPath: `/exercise/${section.id}`,
    robots: 'index, follow',
    openGraph: {
      ...sharedOpenGraphMetadata,
      locale: content.locale,
      image: section.thumbnailUrl,
      imageAlt: content.imageAlt,
    },
  };
}
