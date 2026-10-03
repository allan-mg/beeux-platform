import "./CaseStudy.css";

function CaseStudy() {
  return (
    <section className="case-study" id="cases">
      <div className="case-study__container">
        <div className="case-study__visual">
          <div className="case-study__mockup">
            <span className="case-study__mockup-label">Caso BeeUX</span>

            <h3>Transformamos presencia digital en crecimiento.</h3>

            <p>
              Estrategia, contenido, campañas y experiencia digital trabajando
              como un solo sistema.
            </p>
          </div>
        </div>

        <div className="case-study__content">
          <p className="case-study__eyebrow">CASO DESTACADO</p>

          <h2 className="case-study__title">
            Resultados que van más allá de las métricas
          </h2>

          <p className="case-study__description">
            Diseñamos estrategias digitales enfocadas en atraer mejores
            oportunidades, optimizar el costo de adquisición y convertir más
            visitantes en clientes.
          </p>

          <div className="case-study__metrics">
            <div className="case-study__metric">
              <strong>+214%</strong>
              <span>Leads calificados</span>
            </div>

            <div className="case-study__metric">
              <strong>-45%</strong>
              <span>Costo por lead</span>
            </div>

            <div className="case-study__metric">
              <strong>+180%</strong>
              <span>Tráfico web</span>
            </div>
          </div>

          <a className="case-study__link" href="#contact">
            Ver caso →
          </a>
        </div>
      </div>
    </section>
  );
}

export default CaseStudy;
