import "./Header.css";
import logo from "../../assets/brand/beeux-logo.svg";
import { useContext } from "react";
import { Link } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext";

function Header() {
  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setCurrentUser(null);
  };

  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
  return (
    <header className="header">
      <div className="header__container">
        <a className="header__logo" href="/" aria-label="BeeUX home">
          <img className="header__logo-image" src={logo} alt="BeeUX" />
        </a>

        <nav className="header__nav" aria-label="Primary navigation">
          <a className="header__link" href="#services">
            Servicios
          </a>

          <a className="header__link" href="#cases">
            Casos
          </a>

          <a className="header__link" href="#pricing">
            Precios
          </a>

          <a className="header__link" href="#about">
            Nosotros
          </a>

          <a className="header__link" href="#contact">
            Contacto
          </a>
        </nav>

        <a className="header__cta" href="#contact">
          Agenda una llamada
        </a>

        <div className="header__account">
          {currentUser ? (
            <>
              <Link className="header__account-link" to="/dashboard">
                Mi panel
              </Link>

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
      </div>
    </header>
  );
}

export default Header;
