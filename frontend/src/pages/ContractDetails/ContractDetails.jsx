import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getContractByOrder } from "../../api/contractsApi";
import { buildContractTemplate } from "../../utils/contractTemplate";
import "./ContractDetails.css";

function ContractDetails() {
  const { orderId } = useParams();

  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      return;
    }

    getContractByOrder({
      token,
      orderId,
    })
      .then((data) => {
        setContract(data);
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderId]);

  if (isLoading) {
    return <main className="contract-details">Cargando contrato...</main>;
  }

  if (errorMessage) {
    return <main className="contract-details">{errorMessage}</main>;
  }

  const contractHtml = buildContractTemplate({
    clientName: contract.user?.name,
    clientEmail: contract.user?.email,
    serviceName: contract.order?.serviceName,
    serviceSlug: contract.order?.serviceSlug,
    amount: contract.order?.amount,
    currency: contract.order?.currency,
    billingType: contract.order?.billingType,
    createdAt: contract.createdAt,
  });

  return (
    <>
      <Header />

      <main className="contract-details">
        <div className="contract-details__container">
          <span className="contract-details__eyebrow">Contrato BeeUX</span>

          <h1 className="contract-details__title">{contract.serviceName}</h1>

          <p className="contract-details__description">
            Revisa la información de tu contrato antes de continuar con los
            siguientes pasos del servicio.
          </p>

          <div className="contract-details__card">
            <div className="contract-details__row">
              <span>Cliente</span>
              <strong>{contract.user?.name}</strong>
            </div>

            <div className="contract-details__row">
              <span>Correo</span>
              <strong>{contract.user?.email}</strong>
            </div>

            <div className="contract-details__row">
              <span>Servicio</span>
              <strong>{contract.order?.serviceName}</strong>
            </div>

            <div className="contract-details__row">
              <span>Monto</span>
              <strong>
                ${contract.order?.amount} {contract.order?.currency}
              </strong>
            </div>

            <div className="contract-details__row">
              <span>Modalidad</span>
              <strong>{contract.order?.billingType}</strong>
            </div>

            <div className="contract-details__row">
              <span>Estado del pago</span>
              <strong>{contract.order?.status}</strong>
            </div>

            <div className="contract-details__row">
              <span>Estado del contrato</span>
              <strong>{contract.status}</strong>
            </div>

            <div className="contract-details__row">
              <span>Fecha de creación</span>
              <strong>
                {new Date(contract.createdAt).toLocaleDateString("es-MX")}
              </strong>
            </div>

            <div
              className="contract-details__document"
              dangerouslySetInnerHTML={{ __html: contractHtml }}
            />

            <div className="contract-details__notice">
              El documento contractual completo está disponible para revisión.
              La firma electrónica se habilitará en el siguiente paso.
            </div>

            <button className="contract-details__button" type="button" disabled>
              Firmar contrato
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ContractDetails;
