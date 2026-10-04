import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getServices } from "../../api/servicesApi";
import "./ServiceDetails.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

function ServiceDetails() {
  const { slug } = useParams();

  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    getServices()
      .then((services) => {
        const currentService = services.find((item) => item.slug === slug);

        if (!currentService) {
          setApiError("Servicio no encontrado.");
          return;
        }

        setService(currentService);
      })
      .catch(() => {
        setApiError("No pudimos cargar este servicio.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return <main className="service-details">Cargando servicio...</main>;
  }

  if (apiError) {
    return <main className="service-details">{apiError}</main>;
  }

  return (
    <>
      <Header />

      <main className="service-details">
        <div className="service-details__container">
          <span className="service-details__eyebrow">Servicio BeeUX</span>

          <h1 className="service-details__title">{service.name}</h1>

          <p className="service-details__description">
            {service.description || service.shortDescription}
          </p>

          <div className="service-details__price">${service.price} USD</div>

          <ul className="service-details__features">
            {service.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <div className="service-details__notice">
            <strong>Importante:</strong>
            <p>
              La inversión publicitaria no está incluida en el precio del
              servicio. El presupuesto destinado a plataformas como Meta Ads,
              Facebook, Instagram, TikTok, Google Ads u otros medios se paga por
              separado y es cubierto directamente por el cliente.
            </p>
          </div>
          <div className="service-details__actions">
            <button className="service-details__primary-button" type="button">
              Contratar este servicio
            </button>

            <a className="service-details__secondary-button" href="/#contact">
              Hablar con BeeUX
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ServiceDetails;
