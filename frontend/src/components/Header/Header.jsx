import "./Header.css";
import logo from "../../assets/brand/beeux-logo.svg";

function Header() {
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
      </div>
    </header>
  );
}

export default Header;
