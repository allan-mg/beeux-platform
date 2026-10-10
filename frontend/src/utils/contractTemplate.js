import { agencyLegalData } from "../config/agencyLegalData";
import { contractClauses } from "../config/contractClauses";

export const buildContractTemplate = ({
  clientName,
  clientEmail,
  serviceName,
  serviceSlug,
  amount,
  currency,
  billingType,
  createdAt,
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString("es-MX");

  const selectedServiceClauses =
    contractClauses[serviceSlug] || contractClauses.default;

  return `
    <section class="contract-document">
      <h2>Contrato de prestación de servicios</h2>

      <p>
        Este contrato se celebra entre
        <strong>${agencyLegalData.legalName}</strong>,
        en adelante "EL PRESTADOR", y
        <strong>${clientName}</strong>,
        con correo <strong>${clientEmail}</strong>,
        en adelante "EL CLIENTE".
      </p>

      <h3>1. Servicio contratado</h3>

      <p>
        EL CLIENTE contrata el servicio
        <strong>${serviceName}</strong>.
      </p>

      <h3>2. Precio y modalidad</h3>

      <p>
        El importe correspondiente al servicio es de
        <strong>$${amount} ${currency}</strong>,
        bajo modalidad <strong>${billingType}</strong>.
      </p>

      <h3>3. Inversión publicitaria</h3>

      <p>
        La inversión destinada a plataformas publicitarias como Meta Ads,
        Facebook, Instagram, TikTok, Google Ads u otros medios no está incluida
        en el precio del servicio y deberá ser cubierta directamente por
        EL CLIENTE.
      </p>

      ${selectedServiceClauses}

      <h3>6. Inicio del servicio</h3>

      <p>
        El servicio podrá iniciar una vez que el pago haya sido confirmado,
        el contrato haya sido aceptado y el brief correspondiente haya sido
        completado.
      </p>

      <h3>7. Fecha</h3>

      <p>
        Fecha de generación del contrato:
        <strong>${formattedDate}</strong>.
      </p>

      <div class="contract-document__legal-note">
        Esta plantilla es una versión de desarrollo y deberá ser revisada
        legalmente antes de utilizarse como contrato definitivo en producción.
      </div>
    </section>
  `;
};
