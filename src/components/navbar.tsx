import { NavLink, Link } from 'react-router-dom';
import logo from '../assets/img/logo.png';

export default function Navbar() {
  return (
    <div className="min-vw-100">
      <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-secondary shadow-orange nav-with-light ">
        <div className="container-xxl align-items-center">
          <div className="col-8 col-sm-6 col-md-4">
            <Link className="navbar-brand" to="/">
              <img className="img-fluid rounded-circle" src={logo} alt="MeditActive" width={60} height="auto" />
            </Link>
            <p className="d-inline navbar-brand ">MeditActive</p>
          </div>
          <div className="col-4 col-sm-6 col-md-2 col-lg-4 d-flex d-flex justify-content-end">
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasNavbar"
              aria-controls="offcanvasNavbar"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className="offcanvas offcanvas-end w-25-lg w-80-md bg-secondary"
              tabIndex={-1}
              id="offcanvasNavbar"
              aria-labelledby="offcanvasNavbarLabel"
            >
              <div className="offcanvas-header">
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
              </div>
              <div className="offcanvas-body ">
                <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                  <li className="nav-item">
                    {/** 
                     NavLink: NavLink, perché permette di aggiungere la classe Bootstrap 'active' quando la pagina corrisponde all’URL corrente.
                      isActive: React Router espone isActive attraverso className.
                      aria-current="page": viene aggiunto automaticamente quando isActive è true.
                      */}
                    <NavLink className={({ isActive }) => `fs-5 nav-link ${isActive ? 'active' : ''}`} to="/" end>
                      Home
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className={({ isActive }) => `fs-5 nav-link ${isActive ? 'active' : ''}`} to="/exercises">
                      Exercises
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
