import "./Testimonials.css";

const testimonials = [
  {
    name: "Mariana López",
    role: "Directora de Marketing",
    company: "Natura",
    quote:
      "BeeUX transformó nuestra presencia digital. Su equipo entiende el negocio, propone soluciones creativas y siempre está enfocado en resultados.",
    featured: true,
  },
  {
    name: "Carlos Méndez",
    role: "CEO",
    company: "UrbanFit",
    quote:
      "Profesionales, creativos y muy comprometidos. Los resultados hablan por sí solos.",
  },
  {
    name: "Ana Torres",
    role: "Fundadora",
    company: "Lúmina",
    quote:
      "La mejor decisión para nuestra estrategia digital. Atención cercana y resultados reales.",
  },
];

function Testimonials() {
  const featuredTestimonial = testimonials.find(
    (testimonial) => testimonial.featured,
  );

  const secondaryTestimonials = testimonials.filter(
    (testimonial) => !testimonial.featured,
  );

  return (
    <section className="testimonials">
      <div className="testimonials__container">
        <div className="testimonials__header">
          <p className="testimonials__eyebrow">VOCES QUE NOS IMPULSAN</p>

          <h2 className="testimonials__title">
            Marcas que confían en <span>BeeUX</span>
          </h2>

          <p className="testimonials__intro">
            Construimos relaciones a largo plazo con marcas que buscan crecer de
            forma estratégica.
          </p>
        </div>

        <div className="testimonials__grid">
          <article className="testimonials__featured">
            <span className="testimonials__quote-mark">“</span>

            <blockquote className="testimonials__featured-quote">
              {featuredTestimonial.quote}
            </blockquote>

            <div className="testimonials__person">
              <div
                className="testimonials__avatar testimonials__avatar--featured"
                aria-hidden="true"
              >
                ML
              </div>

              <div>
                <p className="testimonials__name">{featuredTestimonial.name}</p>

                <p className="testimonials__role">
                  {featuredTestimonial.role} · {featuredTestimonial.company}
                </p>
              </div>
            </div>
          </article>

          <div className="testimonials__secondary">
            {secondaryTestimonials.map((testimonial) => (
              <article className="testimonials__card" key={testimonial.name}>
                <blockquote className="testimonials__card-quote">
                  “{testimonial.quote}”
                </blockquote>

                <div className="testimonials__person">
                  <div className="testimonials__avatar" aria-hidden="true">
                    {testimonial.name
                      .split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")}
                  </div>

                  <div>
                    <p className="testimonials__name">{testimonial.name}</p>

                    <p className="testimonials__role">
                      {testimonial.role} · {testimonial.company}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
