import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Toast from "../../components/Toast/Toast";

import {
  getProjectById,
  getProjectDeliverables,
  reviewProjectDeliverable,
} from "../../api/projectsApi";

import "./ProjectDetails.css";

const statusLabels = {
  brief_received: "Brief recibido",
  planning: "Planeación",
  in_progress: "En desarrollo",
  review: "Revisión",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const timelineSteps = [
  "brief_received",
  "planning",
  "in_progress",
  "review",
  "delivered",
];

function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [clientChangesId, setClientChangesId] = useState(null);

  const [clientReviewMessages, setClientReviewMessages] = useState({});

  const [reviewingDeliverableId, setReviewingDeliverableId] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      return;
    }

    Promise.all([
      getProjectById({
        token,
        projectId,
      }),
      getProjectDeliverables({
        token,
        projectId,
      }),
    ])
      .then(([projectData, deliverablesData]) => {
        setProject(projectData);
        setDeliverables(deliverablesData);
      })

      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [projectId]);

  if (isLoading) {
    return <main className="project-details">Cargando proyecto...</main>;
  }

  if (!project) {
    return (
      <main className="project-details">
        {errorMessage || "No se encontró el proyecto."}
      </main>
    );
  }

  const currentStepIndex = timelineSteps.indexOf(project.status);

  const handleClientDeliverableReview = (deliverableId, decision) => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    const reviewMessage = clientReviewMessages[deliverableId]?.trim() || "";

    if (decision === "changes" && !reviewMessage) {
      setErrorMessage("Describe los cambios que necesitas.");
      return;
    }

    setReviewingDeliverableId(deliverableId);
    setErrorMessage("");
    setSuccessMessage("");

    reviewProjectDeliverable({
      token,
      projectId,
      deliverableId,
      decision,
      reviewMessage,
    })
      .then((updatedDeliverable) => {
        setDeliverables((currentDeliverables) =>
          currentDeliverables.map((deliverable) =>
            deliverable._id === updatedDeliverable._id
              ? updatedDeliverable
              : deliverable,
          ),
        );

        setClientChangesId(null);

        setClientReviewMessages((currentMessages) => ({
          ...currentMessages,
          [deliverableId]: "",
        }));

        setSuccessMessage(
          decision === "approve"
            ? "El entregable fue aprobado correctamente."
            : "Tu solicitud de cambios fue enviada correctamente.",
        );
      })
      .catch((error) => {
        setErrorMessage(
          typeof error === "string"
            ? error
            : error?.message || "No se pudo registrar tu revisión.",
        );
      })
      .finally(() => {
        setReviewingDeliverableId(null);
      });
  };

  return (
    <>
      <Header />

      {errorMessage && (
        <Toast
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage("")}
        />
      )}

      {!errorMessage && successMessage && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage("")}
        />
      )}

      <main className="project-details">
        <div className="project-details__container">
          <span className="project-details__eyebrow">Proyecto BeeUX</span>

          <h1 className="project-details__title">{project.serviceName}</h1>

          <p className="project-details__description">
            Consulta el avance y los próximos pasos de tu servicio.
          </p>

          <div className="project-details__summary">
            <div className="project-details__summary-item">
              <span>Estado</span>
              <strong>{statusLabels[project.status] || project.status}</strong>
            </div>

            <div className="project-details__summary-item">
              <span>Progreso</span>
              <strong>{project.progress}%</strong>
            </div>

            <div className="project-details__summary-item">
              <span>Creado</span>
              <strong>
                {new Date(project.createdAt).toLocaleDateString("es-MX")}
              </strong>
            </div>
          </div>

          <section className="project-details__card">
            <h2 className="project-details__section-title">
              Progreso del proyecto
            </h2>

            <div className="project-details__progress">
              <div
                className="project-details__progress-bar"
                style={{
                  width: `${project.progress}%`,
                }}
              />
            </div>

            <div className="project-details__timeline">
              {timelineSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;

                return (
                  <div
                    className={`project-details__step ${
                      isCompleted ? "project-details__step--completed" : ""
                    }`}
                    key={step}
                  >
                    <span className="project-details__step-dot">
                      {isCompleted ? "✓" : ""}
                    </span>

                    <span>{statusLabels[step]}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="project-details__card">
            <h2 className="project-details__section-title">
              Información del proyecto
            </h2>

            <div className="project-details__info">
              <div>
                <span>Servicio</span>
                <strong>{project.serviceName}</strong>
              </div>

              <div>
                <span>Responsable</span>
                <strong>
                  {project.assignedTo ? "Asignado" : "Por asignar"}
                </strong>
              </div>

              <div>
                <span>Fecha estimada</span>
                <strong>
                  {project.estimatedDeliveryAt
                    ? new Date(project.estimatedDeliveryAt).toLocaleDateString(
                        "es-MX",
                      )
                    : "Por definir"}
                </strong>
              </div>
            </div>
          </section>

          <section className="project-details__card">
            <h2 className="project-details__section-title">Documentos</h2>

            <div className="project-details__actions">
              <button
                className="project-details__button"
                type="button"
                onClick={() => {
                  window.location.href = `/briefs/${project.order?._id || project.order}`;
                }}
              >
                Ver brief
              </button>

              <button
                className="project-details__button project-details__button--secondary"
                type="button"
                onClick={() => {
                  window.location.href = `/contracts/${project.order?._id || project.order}`;
                }}
              >
                Ver contrato
              </button>
            </div>
          </section>

          <section className="project-details__deliverables">
            <div className="project-details__section-header">
              <span>Entregables</span>
              <h2>Archivos y avances publicados</h2>
            </div>

            {deliverables.length === 0 ? (
              <p className="project-details__deliverables-empty">
                Todavía no hay entregables publicados para este proyecto.
              </p>
            ) : (
              <div className="project-details__deliverables-list">
                {deliverables.map((deliverable) => (
                  <article
                    className="project-details__deliverable-card"
                    key={deliverable._id}
                  >
                    <div>
                      <span className="project-details__deliverable-source">
                        {deliverable.source === "canva"
                          ? "Canva"
                          : deliverable.source === "drive"
                            ? "Google Drive"
                            : deliverable.source === "affinity"
                              ? "Affinity"
                              : deliverable.source === "upload"
                                ? "Archivo"
                                : "Enlace externo"}
                      </span>

                      <h3>{deliverable.name}</h3>

                      <span className="project-details__deliverable-version">
                        Versión {deliverable.version || 1}
                      </span>

                      <small>
                        Publicado el{" "}
                        {new Date(deliverable.updatedAt).toLocaleDateString(
                          "es-MX",
                        )}
                      </small>
                    </div>

                    <a
                      href={deliverable.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir entregable
                    </a>

                    <div className="project-details__deliverable-review">
                      <span>
                        Tu revisión:{" "}
                        <strong>
                          {deliverable.clientReviewStatus === "approved"
                            ? "Aprobado"
                            : deliverable.clientReviewStatus ===
                                "changes_requested"
                              ? "Cambios solicitados"
                              : "Pendiente"}
                        </strong>
                      </span>

                      {(!deliverable.clientReviewStatus ||
                        deliverable.clientReviewStatus === "pending") && (
                        <div className="project-details__deliverable-review-actions">
                          <button
                            type="button"
                            className="project-details__review-changes"
                            onClick={() => setClientChangesId(deliverable._id)}
                            disabled={
                              reviewingDeliverableId === deliverable._id
                            }
                          >
                            Solicitar cambios
                          </button>

                          <button
                            type="button"
                            className="project-details__review-approve"
                            onClick={() =>
                              handleClientDeliverableReview(
                                deliverable._id,
                                "approve",
                              )
                            }
                            disabled={
                              reviewingDeliverableId === deliverable._id
                            }
                          >
                            {reviewingDeliverableId === deliverable._id
                              ? "Procesando..."
                              : "Aprobar entregable"}
                          </button>
                        </div>
                      )}
                    </div>

                    {clientChangesId === deliverable._id && (
                      <div className="project-details__changes-form">
                        <label>
                          <span>¿Qué cambios necesitas?</span>

                          <textarea
                            rows="4"
                            value={clientReviewMessages[deliverable._id] || ""}
                            onChange={(event) =>
                              setClientReviewMessages((currentMessages) => ({
                                ...currentMessages,
                                [deliverable._id]: event.target.value,
                              }))
                            }
                            placeholder="Describe claramente qué te gustaría modificar..."
                          />
                        </label>

                        <div className="project-details__changes-actions">
                          <button
                            type="button"
                            onClick={() => setClientChangesId(null)}
                          >
                            Volver
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleClientDeliverableReview(
                                deliverable._id,
                                "changes",
                              )
                            }
                            disabled={
                              reviewingDeliverableId === deliverable._id
                            }
                          >
                            {reviewingDeliverableId === deliverable._id
                              ? "Enviando..."
                              : "Enviar solicitud"}
                          </button>
                        </div>
                      </div>
                    )}

                    {deliverable.clientReviewMessage && (
                      <p className="project-details__client-review-message">
                        <strong>Tu solicitud:</strong>{" "}
                        {deliverable.clientReviewMessage}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProjectDetails;
