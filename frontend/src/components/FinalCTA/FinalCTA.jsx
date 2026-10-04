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
      </div>
    </section>
  );
}

export default FinalCTA;
