import { PageMetadata } from '../components/pageMetadata';
import { Title } from '../components/title';
import { errorPageMetadata } from '../data/pageMetadata';
import errorPersonAtTableImage from '../assets/img/error_person_at_table.png';

export default function Error() {
  return (
    <>
      <PageMetadata metadata={errorPageMetadata} />

      <section className="container mb-5">
        <div className="row justify-content-center text-center">
          <div className="col-12 col-md-8 col-lg-6">
            <img
              className="img-fluid d-block mx-auto concept-image-shadow rounded p-0 h-auto mb-4"
              src={errorPersonAtTableImage}
              alt="Persona appoggiata con il gomito su un tavolo"
            />
            <Title
              title="Ops... qualcosa è andato storto..."
              txtColor="var(--bs-secondary)"
              txtSize={['fs-2']}
              headlineType="h1"
              position="text-center"
              underlineOnHover={false}
              underlineTxtFit={false}
              scaleOnHover={false}
            />
            <p className="fs-4 mb-0">Respira e continua</p>
          </div>
        </div>
      </section>
    </>
  );
}
