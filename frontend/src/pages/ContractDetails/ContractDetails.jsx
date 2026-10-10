import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import {
  generateContract,
  getContractByOrder,
  signContract,
} from "../../api/contractsApi";
import { buildContractTemplate } from "../../utils/contractTemplate";
import "./ContractDetails.css";

const BASE_URL = "http://localhost:3000";

function ContractDetails() {
  const { orderId } = useParams();

  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const [accepted, setAccepted] = useState(false);
  const [signerName, setSignerName] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

        setSignerName(
          data.contractSnapshot?.client?.legalName ||
            data.user?.legalProfile?.legalName ||
            "",
        );
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderId]);

  const handleGenerateContract = () => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    setIsGeneratingPdf(true);
    setErrorMessage("");
    setSuccessMessage("");

    generateContract({
      token,
      orderId,
    })
      .then((updatedContract) => {
        setContract(updatedContract);

        setSignerName(
          updatedContract.contractSnapshot?.client?.legalName || "",
        );
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setIsGeneratingPdf(false);
      });
  };

  const handleSignContract = () => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    if (!accepted) {
      setErrorMessage(
        "Debes aceptar expresamente el contrato antes de firmarlo.",
      );
      return;
    }

    if (!signerName.trim()) {
      setErrorMessage("Debes confirmar tu nombre legal.");
      return;
    }

    setIsSigning(true);
    setErrorMessage("");
    setSuccessMessage("");

    signContract({
      token,
      orderId,
      accepted,
      signerName: signerName.trim(),
    })
      .then((updatedContract) => {
        setContract(updatedContract);

        setSuccessMessage("Contrato firmado electrónicamente correctamente.");
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setIsSigning(false);
      });
  };

  const handleOpenContractPdf = () => {
    if (!contract?.contractUrl) {
      return;
    }

    window.open(
      `${BASE_URL}${contract.contractUrl}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleOpenSignedContractPdf = () => {
    if (!contract?.signedContractUrl) {
      return;
    }

    window.open(
      `${BASE_URL}${contract.signedContractUrl}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (isLoading) {
    return <main className="contract-details">Cargando contrato...</main>;
  }

  if (errorMessage && !contract) {
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

  const isSigned = contract.status === "signed";

  const canSign =
    contract.status === "ready_to_sign" &&
    Boolean(contract.contractUrl) &&
    accepted &&
    signerName.trim() &&
    !isSigning;

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

            {!isSigned && (
              <div className="contract-details__notice">
                Revisa el documento contractual antes de continuar con la firma
                electrónica.
              </div>
            )}

            {isSigned && (
              <div className="contract-details__signed-notice">
                Contrato firmado electrónicamente.
              </div>
            )}

            {errorMessage && (
              <p className="contract-details__error">{errorMessage}</p>
            )}

            {successMessage && (
              <p className="contract-details__success">{successMessage}</p>
            )}

            {!isSigned && contract.contractUrl && (
              <div className="contract-details__signature">
                <h2 className="contract-details__signature-title">
                  Firma electrónica
                </h2>

                <label className="contract-details__signature-field">
                  <span>Nombre legal del firmante</span>

                  <input
                    type="text"
                    value={signerName}
                    onChange={(event) => setSignerName(event.target.value)}
                  />
                </label>

                <label className="contract-details__acceptance">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                  />

                  <span>
                    Confirmo que he revisado el contrato y acepto
                    electrónicamente sus términos.
                  </span>
                </label>
              </div>
            )}

            <div className="contract-details__actions">
              {!contract.contractUrl && !isSigned && (
                <button
                  className="contract-details__button"
                  type="button"
                  onClick={handleGenerateContract}
                  disabled={
                    isGeneratingPdf || contract.status !== "ready_to_sign"
                  }
                >
                  {isGeneratingPdf
                    ? "Generando contrato..."
                    : "Generar contrato PDF"}
                </button>
              )}

              {contract.contractUrl && (
                <button
                  className="contract-details__button"
                  type="button"
                  onClick={handleOpenContractPdf}
                >
                  Ver contrato PDF
                </button>
              )}

              {!isSigned && contract.contractUrl && (
                <button
                  className="contract-details__button contract-details__button--secondary"
                  type="button"
                  onClick={handleSignContract}
                  disabled={!canSign}
                >
                  {isSigning ? "Firmando..." : "Firmar contrato"}
                </button>
              )}

              {isSigned && contract.signedContractUrl && (
                <button
                  className="contract-details__button contract-details__button--secondary"
                  type="button"
                  onClick={handleOpenSignedContractPdf}
                >
                  Ver contrato firmado
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ContractDetails;
