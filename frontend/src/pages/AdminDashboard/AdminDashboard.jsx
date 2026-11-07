import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import { getAllProjects } from "../../api/projectsApi";
import { getProjectTasks } from "../../api/tasksApi";

import "./AdminDashboard.css";

function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [tasksByProject, setTasksByProject] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setIsLoading(false);
      return;
    }

    getAllProjects(token)
      .then((projectsData) => {
        setProjects(projectsData);

        return Promise.all(
          projectsData.map((project) =>
            getProjectTasks({
              token,
              projectId: project._id,
            }).then((tasks) => ({
              projectId: project._id,
              tasks,
            })),
          ),
        );
      })
      .then((taskResults) => {
        const tasksMap = {};

        taskResults.forEach(({ projectId, tasks }) => {
          tasksMap[projectId] = tasks;
        });

        setTasksByProject(tasksMap);
      })
      .catch((error) => {
        setErrorMessage(
          error.message || "No se pudo cargar el panel administrativo.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const allTasks = Object.values(tasksByProject).flat();

  const activeProjects = projects.filter(
    (project) =>
      project.status !== "delivered" && project.status !== "cancelled",
  );

  const pendingTasks = allTasks.filter(
    (task) =>
      !task.isArchived && ["pending", "in_progress"].includes(task.status),
  );

  const reviewTasks = allTasks.filter(
    (task) => !task.isArchived && task.status === "review",
  );

  const clientChangesTasks = allTasks.filter(
    (task) => !task.isArchived && task.clientChangesPending,
  );

  const getTaskProjectName = (task) => {
    const projectId =
      typeof task.project === "string" ? task.project : task.project?._id;

    const project = projects.find(
      (currentProject) => currentProject._id === projectId,
    );

    return project?.serviceName || task.project?.serviceName || "Proyecto";
  };

  const attentionItems = [
    ...clientChangesTasks.map((task) => ({
      id: `client-changes-${task._id}`,
      type: "client_changes",
      title: task.title,
      projectName: getTaskProjectName(task),
      message:
        task.clientChangesMessage ||
        "El cliente solicitó cambios en esta tarea.",
    })),

    ...reviewTasks.map((task) => ({
      id: `review-${task._id}`,
      type: "review",
      title: task.title,
      projectName: task.project?.serviceName || "Proyecto",
      message: "Esta tarea está pendiente de revisión.",
    })),
  ];

  if (isLoading) {
    return (
      <>
        <Header />

        <main className="admin-dashboard">
          <div className="admin-dashboard__container">
            Cargando panel administrativo...
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="admin-dashboard">
        <div className="admin-dashboard__container">
          <span className="admin-dashboard__eyebrow">
            Operations Command Center
          </span>

          <h1 className="admin-dashboard__title">Panel administrativo</h1>

          <p className="admin-dashboard__description">
            Supervisa proyectos, tareas, revisiones y acciones que requieren
            atención en BeeUX.
          </p>

          {errorMessage && (
            <div className="admin-dashboard__error">{errorMessage}</div>
          )}

          <section className="admin-dashboard__kpis">
            <article className="admin-dashboard__kpi">
              <span>Proyectos activos</span>
              <strong>{activeProjects.length}</strong>
            </article>

            <article className="admin-dashboard__kpi">
              <span>Tareas activas</span>
              <strong>{pendingTasks.length}</strong>
            </article>

            <article className="admin-dashboard__kpi">
              <span>En revisión</span>
              <strong>{reviewTasks.length}</strong>
            </article>

            <article className="admin-dashboard__kpi admin-dashboard__kpi--attention">
              <span>Cambios del cliente</span>
              <strong>{clientChangesTasks.length}</strong>
            </article>
          </section>

          <section className="admin-dashboard__attention">
            <div className="admin-dashboard__section-header">
              <div>
                <span className="admin-dashboard__section-eyebrow">
                  Operación
                </span>

                <h2>Requiere atención</h2>
              </div>

              <strong>{attentionItems.length}</strong>
            </div>

            {attentionItems.length === 0 ? (
              <div className="admin-dashboard__attention-empty">
                No hay pendientes críticos por atender.
              </div>
            ) : (
              <div className="admin-dashboard__attention-list">
                {attentionItems.map((item) => (
                  <article
                    className={`admin-dashboard__attention-item admin-dashboard__attention-item--${item.type}`}
                    key={item.id}
                  >
                    <div>
                      <span className="admin-dashboard__attention-type">
                        {item.type === "client_changes"
                          ? "⚠ Cambios solicitados por cliente"
                          : "⏳ Tarea en revisión"}
                      </span>

                      <h3>{item.title}</h3>

                      <small>{item.projectName}</small>

                      <p>{item.message}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = "/admin/projects";
                      }}
                    >
                      Ver proyecto
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="admin-dashboard__quick-actions">
            <div className="admin-dashboard__section-header">
              <div>
                <span className="admin-dashboard__section-eyebrow">
                  Accesos directos
                </span>

                <h2>Acciones rápidas</h2>
              </div>
            </div>

            <div className="admin-dashboard__quick-actions-grid">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/admin/projects";
                }}
              >
                <strong>Gestionar proyectos</strong>
                <span>Clientes, proyectos, tareas y entregables</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/admin/projects";
                }}
              >
                <strong>Revisar tareas</strong>
                <span>Revisiones, cambios y trabajo pendiente</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/admin/projects";
                }}
              >
                <strong>Ver cambios del cliente</strong>
                <span>{clientChangesTasks.length} pendientes actualmente</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default AdminDashboard;
