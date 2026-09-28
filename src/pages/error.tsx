import { PageMetadata } from '../components/pageMetadata';
import { errorPageMetadata } from '../data/pageMetadata';

export default function Error() {
  return (
    <>
      <PageMetadata metadata={errorPageMetadata} />
      <div>Pagina Errore</div>
    </>
  );
}
