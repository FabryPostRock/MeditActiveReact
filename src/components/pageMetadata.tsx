import { createPortal } from 'react-dom';
import type { OrganizationMetadataData, PageMetadataData } from '../data/pageMetadata';

interface PageMetadataProps {
  metadata: PageMetadataData;
}

interface OrganizationStructuredData {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  description: string;
  url: string;
  logo: string;
  email: string;
  telephone: string;
  sameAs: readonly string[];
}

function createAbsoluteUrl(path: string) {
  return new URL(path, window.location.origin).href;
}

function createOrganizationStructuredData(organization: OrganizationMetadataData): OrganizationStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organization.name,
    description: organization.description,
    url: createAbsoluteUrl(organization.urlPath),
    logo: createAbsoluteUrl(organization.logo),
    email: organization.email,
    telephone: organization.telephone,
    sameAs: organization.sameAs,
  };
}

function serializeStructuredData(structuredData: OrganizationStructuredData) {
  // The symbol substitution is made for security reasons. '\\u003c' still represents '<' and the JSON parser still read it as
  // '<' but if a closing </script> is injected before the real closing </script>, it's not interpreted by HTML parser as
  // HTML tags.
  return JSON.stringify(structuredData).replaceAll('<', '\\u003c');
}

export function PageMetadata({ metadata }: PageMetadataProps) {
  const canonicalUrl = metadata.canonicalPath ? createAbsoluteUrl(metadata.canonicalPath) : null;
  const openGraphImageUrl = createAbsoluteUrl(metadata.openGraph.image);
  const organizationStructuredData = metadata.organization
    ? createOrganizationStructuredData(metadata.organization)
    : null;

  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta name="robots" content={metadata.robots} />
      {/* aggiunge il canonical url se esiste*/}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:title" content={metadata.title} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:description" content={metadata.description} />
      <meta property="og:type" content={metadata.openGraph.type} />
      <meta property="og:image" content={openGraphImageUrl} />
      <meta property="og:image:alt" content={metadata.openGraph.imageAlt} />
      <meta property="og:site_name" content={metadata.openGraph.siteName} />
      <meta property="og:locale" content={metadata.openGraph.locale} />
      {/* createPortal  : React automatically hoists title, meta, and link elements into document.head, but not JSON-LD scripts.
      This portal mounts the structured-data script in document.head while keeping its lifecycle managed by React.
      This works in the client-rendered Vite app; SSR (Server Side Rendering) would require guarding access to document. */}
      {organizationStructuredData &&
        createPortal(
          <script id="organization-structured-data" type="application/ld+json">
            {serializeStructuredData(organizationStructuredData)}
          </script>,
          document.head,
        )}
    </>
  );
}
