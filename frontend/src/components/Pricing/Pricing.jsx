import { useEffect, useState } from "react";
import { getServices } from "../../api/servicesApi";
import "./Pricing.css";

const homePlanSlugs = [
  "plan-esencial",
  "plan-profesional",
  "plan-omnipresente",
];

function Pricing() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getServices()
      .then((services) => {
        const selectedPlans = homePlanSlugs
          .map((slug) => services.find((service) => service.slug === slug))
          .filter(Boolean);

        setPlans(selectedPlans);
      })
      .catch(() => {
        setError("No pudimos cargar los planes.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <section className="pricing" id="pricing">
      <div className="pricing__container">
        <div className="pricing__header">
          <p className="pricing__eyebrow">PLANES DE SOCIAL MEDIA</p>

          <h2 className="pricing__title">
            Planes que impulsan <span>tu crecimiento</span>
          </h2>

          <p className="pricing__intro">
            Elige el plan que mejor se adapte a la etapa actual de tu marca.
          </p>
        </div>

        {isLoading && <p className="pricing__status">Cargando planes...</p>}

        {error && (
          <p className="pricing__status pricing__status--error">{error}</p>
        )}

        {!isLoading && !error && (
          <div className="pricing__grid">
            {plans.map((plan) => (
              <article
                className={`pricing__card ${
                  plan.featured ? "pricing__card--featured" : ""
                }`}
                key={plan._id}
              >
                {plan.featured && (
                  <span className="pricing__badge">Más popular</span>
                )}

                <h3 className="pricing__plan-name">{plan.name}</h3>

                <p className="pricing__plan-description">
                  {plan.shortDescription}
                </p>

                <div className="pricing__price">
                  <span className="pricing__currency">$</span>

                  <strong>{plan.price}</strong>

                  <span className="pricing__period">/mes</span>
                </div>

                <ul className="pricing__features">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li className="pricing__feature" key={feature}>
                      <span>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  className={`pricing__button ${
                    plan.featured ? "pricing__button--featured" : ""
                  }`}
                  href="#contact"
                >
                  Comenzar
                </a>

                {plan.yearlyPrice && (
                  <p className="pricing__annual">
                    ${plan.yearlyPrice} USD / año
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Pricing;
