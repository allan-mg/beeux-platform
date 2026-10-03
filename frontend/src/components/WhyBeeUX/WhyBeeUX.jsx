import "./WhyBeeUX.css";

const pillars = [
  {
    icon: "◎",
    title: "Estrategia",
    description:
      "Analizamos tu negocio, tu mercado y tus objetivos para crear un plan claro y enfocado en crecimiento.",
  },
  {
    icon: "⚙",
    title: "Ejecución",
    description:
      "Convertimos la estrategia en acciones creativas, campañas, contenido y experiencias digitales.",
  },
  {
    icon: "▥",
    title: "Resultados",
    description:
      "Medimos, optimizamos y mejoramos continuamente para que cada acción tenga un propósito.",
  },
];

function WhyBeeUX() {
  return (
    <section className="why-beeux">
      <div className="why-beeux__container">
        <div className="why-beeux__header">
          <p className="why-beeux__eyebrow">POR QUÉ BEEUX</p>

          <h2 className="why-beeux__title">
            Una metodología simple enfocada en{" "}
            <span>hacer crecer tu negocio</span>
          </h2>

          <p className="why-beeux__intro">
            Combinamos estrategia, creatividad y tecnología para convertir ideas
            en resultados medibles.
          </p>
        </div>

        <div className="why-beeux__grid">
          {pillars.map((pillar) => (
            <article className="why-beeux__card" key={pillar.title}>
              <span className="why-beeux__icon">{pillar.icon}</span>

              <div>
                <h3 className="why-beeux__card-title">{pillar.title}</h3>

                <p className="why-beeux__description">{pillar.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyBeeUX;
