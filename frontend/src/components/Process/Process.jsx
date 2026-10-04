import "./Process.css";

const steps = [
  {
    number: "01",
    icon: "◎",
    title: "Descubrimos",
    description:
      "Conocemos tu negocio, tus objetivos, tu audiencia y lo que quieres lograr.",
  },
  {
    number: "02",
    icon: "◫",
    title: "Planeamos",
    description:
      "Diseñamos una estrategia clara y alineada con las necesidades de tu marca.",
  },
  {
    number: "03",
    icon: "⚙",
    title: "Ejecutamos",
    description:
      "Convertimos el plan en acciones, contenido, campañas y experiencias digitales.",
  },
  {
    number: "04",
    icon: "▥",
    title: "Medimos",
    description:
      "Analizamos resultados, optimizamos y buscamos oportunidades para seguir creciendo.",
  },
];

function Process() {
  return (
    <section className="process">
      <div className="process__container">
        <div className="process__header">
          <p className="process__eyebrow">DE UNA IDEA A GRANDES RESULTADOS</p>

          <h2 className="process__title">Cómo trabajamos</h2>

          <p className="process__intro">
            Un proceso claro, colaborativo y enfocado en convertir estrategia en
            resultados.
          </p>
        </div>

        <div className="process__steps">
          {steps.map((step, index) => (
            <article className="process__step" key={step.number}>
              <div className="process__top">
                <span className="process__number">{step.number}</span>

                <span className="process__icon">{step.icon}</span>
              </div>

              <h3 className="process__step-title">{step.title}</h3>

              <p className="process__description">{step.description}</p>

              {index < steps.length - 1 && (
                <span className="process__connector" aria-hidden="true" />
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Process;
