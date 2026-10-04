import logoWhite from "../../assets/brand/beeux-logo-white.svg";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <img className="footer__logo" src={logoWhite} alt="BeeUX" />

          <p className="footer__tagline">Colaboramos, creamos, convertimos.</p>
        </div>

        <div className="footer__column">
          <h3 className="footer__title">Navegación</h3>

          <a className="footer__link" href="#services">
            Servicios
          </a>
          <a className="footer__link" href="#cases">
            Casos
          </a>
          <a className="footer__link" href="#pricing">
            Precios
          </a>
          <a className="footer__link" href="#contact">
            Contacto
          </a>
        </div>

        <div className="footer__column">
          <h3 className="footer__title">Contacto</h3>

          <a className="footer__link" href="mailto:contacto@beeux.mx">
            contacto@beeux.mx
          </a>

          <a className="footer__link" href="tel:+528717976121">
            +52 871 797 6121
          </a>

          <span className="footer__text">beeux.mx</span>
        </div>

        <div className="footer__column">
          <h3 className="footer__title">Síguenos</h3>

          <div className="footer__socials">
            <a className="footer__social" href="#" aria-label="Instagram">
              IG
            </a>

            <a className="footer__social" href="#" aria-label="Facebook">
              FB
            </a>

            <a className="footer__social" href="#" aria-label="LinkedIn">
              IN
            </a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__bottom-container">
          <p>© 2026 BeeUX. Todos los derechos reservados.</p>

          <div className="footer__legal">
            <a href="#">Aviso de privacidad</a>
            <a href="#">Términos y condiciones</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
