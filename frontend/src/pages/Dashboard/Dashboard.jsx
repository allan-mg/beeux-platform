import { useContext, useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import { getMyContracts } from "../../api/contractsApi";
import { updateLegalProfile } from "../../api/authApi";
import "./Dashboard.css";

function Dashboard() {
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

  const [contracts, setContracts] = useState([]);
  const [isSavingLegalProfile, setIsSavingLegalProfile] = useState(false);
  const [legalProfileMessage, setLegalProfileMessage] = useState("");
  const [legalProfileError, setLegalProfileError] = useState("");

  const [legalProfile, setLegalProfile] = useState(() => ({
    entityType: currentUser?.legalProfile?.entityType || "individual",
    legalName: currentUser?.legalProfile?.legalName || "",
    taxId: currentUser?.legalProfile?.taxId || "",
    phone: currentUser?.legalProfile?.phone || "",
    representativeName: currentUser?.legalProfile?.representativeName || "",

    address: {
      street: currentUser?.legalProfile?.address?.street || "",
      exteriorNumber: currentUser?.legalProfile?.address?.exteriorNumber || "",
      interiorNumber: currentUser?.legalProfile?.address?.interiorNumber || "",
      neighborhood: currentUser?.legalProfile?.address?.neighborhood || "",
      city: currentUser?.legalProfile?.address?.city || "",
      state: currentUser?.legalProfile?.address?.state || "",
      postalCode: currentUser?.legalProfile?.address?.postalCode || "",
      country: currentUser?.legalProfile?.address?.country || "",
    },
  }));

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      return;
    }

    getMyContracts(token)
      .then((data) => {
        setContracts(data);
      })
      .catch((error) => {
        console.error("Error loading contracts:", error);
      });
  }, []);

  const pendingContracts = contracts.filter(
    (contract) => contract.status === "pending" || contract.status === "sent",
  );

  const verificationStatus =
    currentUser?.identityVerification?.status || "unverified";

  const verificationLabels = {
    unverified: "Sin verificar",
    pending: "Verificación pendiente",
    verified: "Verificado",
    rejected: "Verificación rechazada",
  };

  const handleLegalProfileChange = (event) => {
    const { name, value } = event.target;

    setLegalProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setLegalProfile((currentProfile) => ({
      ...currentProfile,

      address: {
        ...currentProfile.address,
        [name]: value,
      },
    }));
  };

  const handleLegalProfileSubmit = (event) => {
    event.preventDefault();

    const token = localStorage.getItem("jwt");

    if (!token) {
      setLegalProfileError("No se encontró una sesión activa.");
      return;
    }

    setIsSavingLegalProfile(true);
    setLegalProfileMessage("");
    setLegalProfileError("");

    updateLegalProfile({
      token,
      legalProfile,
    })
      .then((updatedUser) => {
        setCurrentUser(updatedUser);

        setLegalProfileMessage("Tus datos legales se guardaron correctamente.");
      })
      .catch((error) => {
        setLegalProfileError(error);
      })
      .finally(() => {
        setIsSavingLegalProfile(false);
      });
  };

  return (
    <>
      <Header />

      <main className="dashboard">
        <div className="dashboard__container">
          <span className="dashboard__eyebrow">Panel BeeUX</span>

          <h1 className="dashboard__title">
            Hola, {currentUser?.name || "cliente"}
          </h1>

          <p className="dashboard__description">
            Aquí podrás consultar tus proyectos, pagos, archivos, contratos,
            reuniones y próximos pasos.
          </p>

          <div className="dashboard__grid">
            <article className="dashboard__card">
              <span>Proyectos activos</span>
              <strong>0</strong>
            </article>

            <article className="dashboard__card">
              <span>Contratos pendientes</span>
              <strong>{pendingContracts.length}</strong>
            </article>

            <article className="dashboard__card">
              <span>Próximas reuniones</span>
              <strong>0</strong>
            </article>
          </div>

          {pendingContracts.length > 0 && (
            <section className="dashboard__contracts">
              <div className="dashboard__section-header">
                <div>
                  <span className="dashboard__section-eyebrow">Contratos</span>

                  <h2 className="dashboard__section-title">
                    Pendientes por completar
                  </h2>
                </div>
              </div>

              <div className="dashboard__contracts-list">
                {pendingContracts.map((contract) => (
                  <article className="dashboard__contract" key={contract._id}>
                    <div>
                      <h3 className="dashboard__contract-title">
                        {contract.serviceName}
                      </h3>

                      <p className="dashboard__contract-status">
                        Estado: {contract.status}
                      </p>
                    </div>

                    <div className="dashboard__contract-meta">
                      <span>
                        Creado:{" "}
                        {new Date(contract.createdAt).toLocaleDateString(
                          "es-MX",
                        )}
                      </span>

                      <button
                        className="dashboard__contract-button"
                        type="button"
                        onClick={() => {
                          window.location.href = `/contracts/${contract.order}`;
                        }}
                      >
                        Ver contrato
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="dashboard__legal">
            <div className="dashboard__section-header dashboard__section-header--legal">
              <div>
                <span className="dashboard__section-eyebrow">Identidad</span>

                <h2 className="dashboard__section-title">Datos legales</h2>

                <p className="dashboard__section-description">
                  Estos datos se utilizarán para preparar tus contratos y
                  documentos relacionados con los servicios de BeeUX.
                </p>
              </div>

              <div
                className={`dashboard__verification dashboard__verification--${verificationStatus}`}
              >
                {verificationLabels[verificationStatus]}
              </div>
            </div>

            <form
              className="dashboard__legal-form"
              onSubmit={handleLegalProfileSubmit}
            >
              <div className="dashboard__form-grid">
                <label className="dashboard__field">
                  <span>Tipo de cliente</span>

                  <select
                    name="entityType"
                    value={legalProfile.entityType}
                    onChange={handleLegalProfileChange}
                  >
                    <option value="individual">Persona física</option>

                    <option value="business">Empresa / persona moral</option>
                  </select>
                </label>

                <label className="dashboard__field">
                  <span>
                    {legalProfile.entityType === "business"
                      ? "Razón social"
                      : "Nombre legal completo"}
                  </span>

                  <input
                    type="text"
                    name="legalName"
                    value={legalProfile.legalName}
                    onChange={handleLegalProfileChange}
                    placeholder={
                      legalProfile.entityType === "business"
                        ? "Nombre legal de la empresa"
                        : "Nombre completo"
                    }
                    required
                  />
                </label>

                <label className="dashboard__field">
                  <span>RFC / identificador fiscal</span>

                  <input
                    type="text"
                    name="taxId"
                    value={legalProfile.taxId}
                    onChange={handleLegalProfileChange}
                    placeholder="RFC o identificador fiscal"
                    required
                  />
                </label>

                <label className="dashboard__field">
                  <span>Teléfono</span>

                  <input
                    type="tel"
                    name="phone"
                    value={legalProfile.phone}
                    onChange={handleLegalProfileChange}
                    placeholder="Número de teléfono"
                    required
                  />
                </label>

                {legalProfile.entityType === "business" && (
                  <label className="dashboard__field dashboard__field--full">
                    <span>Representante legal</span>

                    <input
                      type="text"
                      name="representativeName"
                      value={legalProfile.representativeName}
                      onChange={handleLegalProfileChange}
                      placeholder="Nombre del representante legal"
                      required
                    />
                  </label>
                )}
              </div>

              <div className="dashboard__address">
                <h3 className="dashboard__form-title">Domicilio legal</h3>

                <div className="dashboard__form-grid">
                  <label className="dashboard__field">
                    <span>Calle</span>

                    <input
                      type="text"
                      name="street"
                      value={legalProfile.address.street}
                      onChange={handleAddressChange}
                      required
                    />
                  </label>

                  <label className="dashboard__field">
                    <span>Número exterior</span>

                    <input
                      type="text"
                      name="exteriorNumber"
                      value={legalProfile.address.exteriorNumber}
                      onChange={handleAddressChange}
                      required
                    />
                  </label>

                  <label className="dashboard__field">
                    <span>Número interior</span>

                    <input
                      type="text"
                      name="interiorNumber"
                      value={legalProfile.address.interiorNumber}
                      onChange={handleAddressChange}
                    />
                  </label>

                  <label className="dashboard__field">
                    <span>Colonia</span>

                    <input
                      type="text"
                      name="neighborhood"
                      value={legalProfile.address.neighborhood}
                      onChange={handleAddressChange}
                    />
                  </label>

                  <label className="dashboard__field">
                    <span>Ciudad</span>

                    <input
                      type="text"
                      name="city"
                      value={legalProfile.address.city}
                      onChange={handleAddressChange}
                      required
                    />
                  </label>

                  <label className="dashboard__field">
                    <span>Estado</span>

                    <input
                      type="text"
                      name="state"
                      value={legalProfile.address.state}
                      onChange={handleAddressChange}
                      required
                    />
                  </label>

                  <label className="dashboard__field">
                    <span>Código postal</span>

                    <input
                      type="text"
                      name="postalCode"
                      value={legalProfile.address.postalCode}
                      onChange={handleAddressChange}
                      required
                    />
                  </label>

                  <label className="dashboard__field">
                    <span>País</span>

                    <input
                      type="text"
                      name="country"
                      value={legalProfile.address.country}
                      onChange={handleAddressChange}
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="dashboard__verification-note">
                <strong>Verificación de identidad</strong>

                <p>
                  Guardar estos datos no significa que hayan sido verificados.
                  Más adelante BeeUX solicitará la documentación necesaria para
                  confirmar la identidad o la empresa antes de habilitar la
                  firma definitiva del contrato.
                </p>
              </div>

              {legalProfileMessage && (
                <p className="dashboard__form-message dashboard__form-message--success">
                  {legalProfileMessage}
                </p>
              )}

              {legalProfileError && (
                <p className="dashboard__form-message dashboard__form-message--error">
                  {legalProfileError}
                </p>
              )}

              <button
                className="dashboard__save-button"
                type="submit"
                disabled={isSavingLegalProfile}
              >
                {isSavingLegalProfile
                  ? "Guardando..."
                  : "Guardar datos legales"}
              </button>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Dashboard;
