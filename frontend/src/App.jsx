import { useEffect, useState } from "react";
import { getServices } from "./api/servicesApi";

function App() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getServices()
      .then((data) => {
        setServices(data);
      })
      .catch(() => {
        setError("Could not load BeeUX services.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <p>Loading services...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>BeeUX Services</h1>

      {services.map((service) => (
        <article key={service._id}>
          <h2>{service.name}</h2>

          <p>{service.shortDescription}</p>

          <p>
            ${service.price} {service.currency}
          </p>
        </article>
      ))}
    </main>
  );
}

export default App;
