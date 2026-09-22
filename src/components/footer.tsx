export function Footer() {
  return (
    <footer className="container-fluid px-3 px-md-0 mt-auto">
      <div className="container">
        <div className="row d-flex mt-5">
          <div className="col-11 col-sm-6 p-0 flex-fill">
            <div className="row my-4 ms-lg-5">
              <div className="col-12">
                <h3>Contatti</h3>
              </div>
              <div className="col-12 my-2 d-flex align-items-start flex-md-row justify-content-md-start align-items-md-center">
                <span className="material-symbols-outlined g-icon-footer-color d-inline me-2">mail</span>
                <a href="mailto:info@meditactive.com" className="fs-5 d-inline mx-2 secondary-color">
                  {' '}
                  info@meditactive.com
                </a>
              </div>
              <div className="col-12 mt-2 d-flex align-items-start flex-md-row justify-content-md-start align-items-md-center">
                <span className="material-symbols-outlined g-icon-footer-color d-inline me-2">call</span>
                <p className="fs-5 d-inline mb-0 mx-2 secondary-color">+39 3456879998</p>
              </div>
            </div>
          </div>

          <div className="col-11 col-sm-6 p-0 flex-fill">
            <div className="row my-4 d-flex justify-content-end">
              <div className="col-12 col-md-8">
                <h3>Seguici sui social</h3>
              </div>
              <div className="col-12 col-md-8">
                <div className="row">
                  <div className="col-8 col-sm-12">
                    <ul className="my-4 d-flex justify-content-between">
                      <li className="d-inline">
                        <a
                          className="text-decoration-none"
                          href="https://www.instagram.com/meditactive"
                          target="_blank"
                        >
                          <span className="icon-instagram me-2 me-md-4 secondary-color"></span>
                        </a>
                      </li>
                      <li className="d-inline">
                        <a
                          className="text-decoration-none"
                          href="https://www.facebook.com/meditactive?locale=it_IT"
                          target="_blank"
                        >
                          <span className="icon-facebook2 me-2 me-md-4 secondary-color" />
                        </a>
                      </li>
                      <li className="d-inline">
                        <a
                          className="text-decoration-none"
                          href="https://www.linkedin.com/in/meditactive/"
                          target="_blank"
                        >
                          <span className="icon-linkedin2 me-2 me-md-4 secondary-color" />
                        </a>
                      </li>
                      <li className="d-inline">
                        <a
                          className="text-decoration-none"
                          href="https://www.youtube.com/@meditactive/"
                          target="_blank"
                        >
                          <span className="icon-youtube me-2 me-md-4 secondary-color" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
