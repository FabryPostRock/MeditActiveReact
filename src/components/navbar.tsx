import { NavLink, Link } from 'react-router-dom';
import logo from '../assets/img/logo.png';

export default function Navbar() {
  return (
    <>
      <div className="min-vw-100 position-fixed nav-wrapper">
        <div className="container nav-mb"></div>
        <nav className="navbar navbar-expand-lg navbar-dark shadow-orange ">
          <div className="container-xxl align-items-center">
            <div className="col-4 col-md-5">
              <Link className="navbar-brand" to="/">
                <img className="img-fluid rounded-circle" src={logo} alt="MeditActive" />
              </Link>
              <p className="d-inline navbar-brand brand-text">MeditActive</p>
            </div>
            <div className="col-8 col-md-7 col-lg-4 d-flex justify-content-center ">
              {/**w-100 : serve al parent ul per avere il 100% dello spazio disponibile */}
              <ul className="navbar-nav flex-row  justify-content-center justify-content-sm-end  w-100 gap-sm-5">
                <li className="nav-item flex-fill flex-sm-grow-0 lh-1">
                  {/** 
                  NavLink: NavLink, allow to add the Bootstrap class active when the page corresponds to the one that is opened.
                  isActive: React Router expose isActive through className.
                  aria-current="page": is automatically added when isActive is true.
                  */}
                  <NavLink className={({ isActive }) => `fs-5 nav-link ${isActive ? 'active' : ''}`} to="/" end>
                    <span className="nav-label">Home</span>

                    <span className="material-symbols-outlined g-icon-2em nav-icon g-icon-primary" aria-hidden="true">
                      home
                    </span>
                  </NavLink>
                </li>
                {/**flex-fill : keeps an equal spacing between the two icons with view changing. */}
                <li className="nav-item flex-fill flex-sm-grow-0 lh-1 me-5">
                  <NavLink className={({ isActive }) => `fs-5 nav-link ${isActive ? 'active' : ''}`} to="/exercises">
                    <span className="nav-label">Exercises</span>

                    <span className="material-symbols-outlined g-icon-2em nav-icon g-icon-primary" aria-hidden="true">
                      self_improvement
                    </span>
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
