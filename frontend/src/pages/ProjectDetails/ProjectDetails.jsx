import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import { getProjectById } from "../../api/projectsApi";

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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      return;
    }

    getProjectById({
      token,
      projectId,
    })
      .then((data) => {
        setProject(data);
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

  return (
    <>
      <Header />

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
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProjectDetails;
