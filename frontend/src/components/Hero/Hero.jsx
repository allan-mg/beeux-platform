import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <p className="hero__eyebrow">TU ALIADO EN MARKETING DIGITAL</p>

          <h1 className="hero__title">
            Colaboramos, <span>creamos</span>, convertimos
          </h1>

          <p className="hero__subtitle">
            Estrategia, diseño y tecnología para convertir atención en
            crecimiento.
          </p>

          <div className="hero__actions">
            <a className="hero__button hero__button--primary" href="#services">
              Ver servicios
            </a>

            <a className="hero__button hero__button--secondary" href="#contact">
              Empezar proyecto
            </a>
          </div>

          <div className="hero__benefits">
            <div className="hero__benefit">
              <span className="hero__benefit-icon">◎</span>
              <div>
                <strong>Estrategia</strong>
                <p>Ideas con propósito.</p>
              </div>
            </div>

            <div className="hero__benefit">
              <span className="hero__benefit-icon">⚙</span>
              <div>
                <strong>Ejecución</strong>
                <p>Planes que se hacen realidad.</p>
              </div>
            </div>

            <div className="hero__benefit">
              <span className="hero__benefit-icon">▥</span>
              <div>
                <strong>Resultados</strong>
                <p>Crecimiento medible.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__mockup">
            <div className="hero__mockup-screen">
              <span className="hero__mockup-logo">BeeUX</span>

              <h2>Impulsamos marcas con propósito</h2>

              <p>
                Estrategias digitales diseñadas para crecer, conectar y
                convertir.
              </p>

              <a href="#services">Conoce más</a>
            </div>
          </div>

          <div className="hero__stats">
            <div className="hero__stat">
              <strong>+120</strong>
              <span>marcas impulsadas</span>
            </div>

            <div className="hero__stat">
              <strong>98%</strong>
              <span>satisfacción del cliente</span>
            </div>

            <div className="hero__stat">
              <strong>+250%</strong>
              <span>crecimiento promedio</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
