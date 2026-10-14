import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import { getAllProjects, updateProjectStatus } from "../../api/projectsApi";

import "./AdminProjects.css";

const statusLabels = {
  brief_received: "Brief recibido",
  planning: "Planeación",
  in_progress: "En desarrollo",
  review: "Revisión",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [savingProjectId, setSavingProjectId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      return;
    }

    getAllProjects(token)
      .then((data) => {
        setProjects(data);

        const initialStatuses = {};

        data.forEach((project) => {
          initialStatuses[project._id] = project.status;
        });

        setStatusDrafts(initialStatuses);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  }, []);

  const handleStatusChange = (projectId, status) => {
    setStatusDrafts((currentStatuses) => ({
      ...currentStatuses,
      [projectId]: status,
    }));
  };

  const handleSaveStatus = (projectId) => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    setSavingProjectId(projectId);
    setErrorMessage("");

    updateProjectStatus({
      token,
      projectId,
      status: statusDrafts[projectId],
    })
      .then((updatedProject) => {
        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project._id === updatedProject._id ? updatedProject : project,
          ),
        );
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setSavingProjectId(null);
      });
  };

  return (
    <>
      <Header />

      <main className="admin-projects">
        <div className="admin-projects__container">
          <span className="admin-projects__eyebrow">Administración BeeUX</span>

          <h1 className="admin-projects__title">Proyectos</h1>

          <p className="admin-projects__description">
            Gestiona el estado y avance de los proyectos de tus clientes.
          </p>

          {errorMessage && (
            <p className="admin-projects__error">{errorMessage}</p>
          )}

          <div className="admin-projects__list">
            {projects.map((project) => (
              <article className="admin-projects__card" key={project._id}>
                <div className="admin-projects__main">
                  <div>
                    <span className="admin-projects__service-label">
                      Servicio
                    </span>

                    <h2 className="admin-projects__service">
                      {project.serviceName}
                    </h2>
                  </div>

                  <div className="admin-projects__client">
                    <span>Cliente</span>

                    <strong>{project.user?.name || "Cliente"}</strong>

                    <small>{project.user?.email || ""}</small>
                  </div>
                </div>

                <div className="admin-projects__progress-info">
                  <span>
                    Estado actual:{" "}
                    <strong>
                      {statusLabels[project.status] || project.status}
                    </strong>
                  </span>

                  <span>
                    Progreso: <strong>{project.progress}%</strong>
                  </span>
                </div>

                <div className="admin-projects__progress">
                  <div
                    className="admin-projects__progress-bar"
                    style={{
                      width: `${project.progress}%`,
                    }}
                  />
                </div>

                <div className="admin-projects__controls">
                  <label>
                    <span>Nuevo estado</span>

                    <select
                      value={statusDrafts[project._id] || project.status}
                      onChange={(event) =>
                        handleStatusChange(project._id, event.target.value)
                      }
                    >
                      <option value="brief_received">Brief recibido</option>

                      <option value="planning">Planeación</option>

                      <option value="in_progress">En desarrollo</option>

                      <option value="review">Revisión</option>

                      <option value="delivered">Entregado</option>

                      <option value="cancelled">Cancelado</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleSaveStatus(project._id)}
                    disabled={savingProjectId === project._id}
                  >
                    {savingProjectId === project._id
                      ? "Guardando..."
                      : "Guardar cambios"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default AdminProjects;
