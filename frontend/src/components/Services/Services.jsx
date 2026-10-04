import "./Services.css";

const services = [
  {
    icon: "◌",
    title: "Administración de redes sociales",
    description: "Contenido que conecta y genera resultados.",
  },
  {
    icon: "◆",
    title: "Diseño gráfico",
    description: "Identidad visual que hace destacar tu marca.",
  },
  {
    icon: "<>",
    title: "Desarrollo web",
    description: "Sitios web modernos y orientados a la conversión.",
  },
  {
    icon: "▶",
    title: "Video marketing",
    description: "Historias que inspiran, conectan y venden.",
  },
  {
    icon: "↗",
    title: "Google Ads",
    description: "Campañas que generan oportunidades reales.",
  },
  {
    icon: "✦",
    title: "Automatización IA",
    description: "Procesos inteligentes para ayudarte a escalar.",
  },
];

function Services() {
  return (
    <section className="services" id="services">
      <div className="services__container">
        <div className="services__header">
          <div>
            <p className="services__eyebrow">NUESTROS SERVICIOS</p>

            <h2 className="services__title">
              Soluciones para <span>hacer crecer tu marca</span>
            </h2>
          </div>

          <p className="services__intro">
            Estrategia, creatividad y tecnología para cada etapa de tu negocio.
          </p>
        </div>

        <div className="services__grid">
          {services.map((service) => (
            <article className="services__card" key={service.title}>
              <span className="services__icon">{service.icon}</span>

              <h3 className="services__card-title">{service.title}</h3>

              <p className="services__description">{service.description}</p>

              <a className="services__link" href="#pricing">
                Conocer más →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
