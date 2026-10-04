import "./FinalCTA.css";

function FinalCTA() {
  return (
    <section className="final-cta" id="contact">
      <div className="final-cta__container">
        <div className="final-cta__content">
          <p className="final-cta__eyebrow">HAGAMOS CRECER TU MARCA</p>

          <h2 className="final-cta__title">
            ¿Listo para hacer crecer tu negocio?
          </h2>

          <p className="final-cta__description">
            Hablemos sobre tu proyecto y descubramos cómo BeeUX puede ayudarte a
            convertir ideas en resultados.
          </p>

          <div className="final-cta__actions">
            <a
              className="final-cta__button final-cta__button--primary"
              href="#"
            >
              Agenda una llamada
            </a>

            <a
              className="final-cta__button final-cta__button--secondary"
              href="#services"
            >
              Ver servicios
            </a>
          </div>
        </div>
        <div className="final-cta__dashboard" aria-hidden="true">
          <div className="final-cta__dashboard-header">
            <span>BeeUX Dashboard</span>
            <span className="final-cta__status">En progreso</span>
          </div>

          <div className="final-cta__dashboard-card">
            <p>Proyecto activo</p>
            <strong>Diseño de marca</strong>

            <div className="final-cta__progress">
              <span className="final-cta__progress-bar" />
            </div>

            <div className="final-cta__dashboard-meta">
              <span>60% completado</span>
              <span>Entrega: 14 Oct</span>
            </div>
          </div>

          <div className="final-cta__dashboard-row">
            <div>
              <span>Próximo paso</span>
              <strong>Primera propuesta</strong>
            </div>

            <div>
              <span>Reunión</span>
              <strong>Google Meet</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
