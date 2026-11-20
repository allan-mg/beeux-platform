import "./Header.css";
import logo from "../../assets/brand/beeux-logo.svg";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext";

function Header() {
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setCurrentUser(null);
    setIsMenuOpen(false);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const handleToggleMenu = () => {
    setIsMenuOpen((currentValue) => !currentValue);
  };

  const panelPath =
    currentUser?.role === "admin"
      ? "/admin/dashboard"
      : currentUser?.role === "employee"
        ? "/team/dashboard"
        : "/dashboard";

  return (
    <header className="header">
      <div className="header__container">
        <Link
          className="header__logo"
          to="/"
          aria-label="BeeUX home"
          onClick={handleCloseMenu}
        >
          <img className="header__logo-image" src={logo} alt="BeeUX" />
        </Link>

        <nav className="header__nav" aria-label="Navegación principal">
          <a className="header__link" href="/#services">
            Servicios
          </a>

          <a className="header__link" href="/#cases">
            Casos
          </a>

          <a className="header__link" href="/#pricing">
            Precios
          </a>

          <a className="header__link" href="/#about">
            Nosotros
          </a>

          <a className="header__link" href="/#contact">
            Contacto
          </a>
        </nav>

        <a className="header__cta header__cta--desktop" href="/#contact">
          Agenda una llamada
        </a>

        <div className="header__account">
          {currentUser ? (
            <>
              <Link className="header__account-link" to={panelPath}>
                Mi panel
              </Link>

              {currentUser.role === "admin" && (
                <>
                  <Link className="header__account-link" to="/admin/projects">
                    Proyectos
                  </Link>

                  <Link className="header__account-link" to="/admin/team">
                    Equipo
                  </Link>
                </>
              )}

              <button
                className="header__logout"
                type="button"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link className="header__account-link" to="/login">
                Iniciar sesión
              </Link>

              <Link className="header__account-button" to="/register">
                Crear cuenta
              </Link>
            </>
          )}
        </div>

        <button
          className={`header__menu-toggle ${
            isMenuOpen ? "header__menu-toggle--open" : ""
          }`}
          type="button"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={handleToggleMenu}
        >
          <span />
          <span />
          <span />
        </button>

        {isMenuOpen && (
          <div className="header__mobile-menu" id="mobile-navigation">
            <nav className="header__mobile-nav" aria-label="Navegación móvil">
              <a
                className="header__mobile-link"
                href="/#services"
                onClick={handleCloseMenu}
              >
                Servicios
              </a>

              <a
                className="header__mobile-link"
                href="/#cases"
                onClick={handleCloseMenu}
              >
                Casos
              </a>

              <a
                className="header__mobile-link"
                href="/#pricing"
                onClick={handleCloseMenu}
              >
                Precios
              </a>

              <a
                className="header__mobile-link"
                href="/#about"
                onClick={handleCloseMenu}
              >
                Nosotros
              </a>

              <a
                className="header__mobile-link"
                href="/#contact"
                onClick={handleCloseMenu}
              >
                Contacto
              </a>
            </nav>

            <div className="header__mobile-divider" />

            <div className="header__mobile-account">
              {currentUser ? (
                <>
                  <Link
                    className="header__mobile-link"
                    to={panelPath}
                    onClick={handleCloseMenu}
                  >
                    Mi panel
                  </Link>

                  {currentUser.role === "admin" && (
                    <>
                      <Link
                        className="header__mobile-link"
                        to="/admin/projects"
                        onClick={handleCloseMenu}
                      >
                        Proyectos
                      </Link>

                      <Link
                        className="header__mobile-link"
                        to="/admin/team"
                        onClick={handleCloseMenu}
                      >
                        Equipo
                      </Link>
                    </>
                  )}

                  <button
                    className="header__mobile-logout"
                    type="button"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="header__mobile-link"
                    to="/login"
                    onClick={handleCloseMenu}
                  >
                    Iniciar sesión
                  </Link>

                  <Link
                    className="header__mobile-button"
                    to="/register"
                    onClick={handleCloseMenu}
                  >
                    Crear cuenta
                  </Link>
                </>
              )}

              <a
                className="header__mobile-cta"
                href="/#contact"
                onClick={handleCloseMenu}
              >
                Agenda una llamada
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
