import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Toast from "../../components/Toast/Toast";

import {
  getMyTasks,
  updateMyTaskStatus,
  addTaskComment,
  getMyTaskActivity,
  getTaskDeliverables,
  addMyTaskDeliverable,
} from "../../api/tasksApi";

import "./TeamDashboard.css";

const statusLabels = {
  pending: "Pendiente",
  in_progress: "En progreso",
  review: "En revisión",
  completed: "Completada",
  cancelled: "Cancelada",
};

const priorityLabels = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

const sourceLabels = {
  upload: "Archivo",
  canva: "Canva",
  affinity: "Affinity",
  drive: "Google Drive",
  external: "Enlace externo",
};

function TeamDashboard() {
  const [tasks, setTasks] = useState([]);

  const [isLoading, setIsLoading] = useState(() =>
    Boolean(localStorage.getItem("jwt")),
  );

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [savingTaskId, setSavingTaskId] = useState(null);

  const [taskComments, setTaskComments] = useState({});

  const [sendingCommentTaskId, setSendingCommentTaskId] = useState(null);

  const [taskActivityById, setTaskActivityById] = useState({});

  const [openActivityTaskId, setOpenActivityTaskId] = useState(null);

  const [loadingActivityTaskId, setLoadingActivityTaskId] = useState(null);

  const [deliverablesByTask, setDeliverablesByTask] = useState({});

  const [deliverablesOpen, setDeliverablesOpen] = useState({});

  const [deliverablesLoading, setDeliverablesLoading] = useState({});

  const [deliverableForms, setDeliverableForms] = useState({});

  const [sendingDeliverableTaskId, setSendingDeliverableTaskId] =
    useState(null);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setErrorMessage("");
    }, 6000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [errorMessage]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      return;
    }

    getMyTasks(token)
      .then((data) => {
        setTasks(data);
      })
      .catch((error) => {
        setErrorMessage(error.message || "No se pudieron cargar las tareas.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const refreshTaskActivity = (taskId, token) => {
    return getMyTaskActivity({
      token,
      taskId,
    }).then((activities) => {
      setTaskActivityById((currentActivity) => ({
        ...currentActivity,
        [taskId]: activities,
      }));

      return activities;
    });
  };

  const refreshTaskDeliverables = (taskId, token) => {
    return getTaskDeliverables({
      token,
      taskId,
      mode: "team",
    }).then((deliverables) => {
      setDeliverablesByTask((currentDeliverables) => ({
        ...currentDeliverables,
        [taskId]: deliverables,
      }));

      return deliverables;
    });
  };

  const handleStatusChange = (taskId, status) => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    setSavingTaskId(taskId);
    setErrorMessage("");
    setSuccessMessage("");

    updateMyTaskStatus({
      token,
      taskId,
      status,
    })
      .then((updatedTask) => {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task,
          ),
        );

        if (openActivityTaskId === taskId) {
          return refreshTaskActivity(taskId, token).then(() => updatedTask);
        }

        setTaskActivityById((currentActivity) => {
          const updatedActivity = {
            ...currentActivity,
          };

          delete updatedActivity[taskId];

          return updatedActivity;
        });

        return updatedTask;
      })
      .then(() => {
        setSuccessMessage("El estado de la tarea se actualizó correctamente.");
      })
      .catch((error) => {
        setErrorMessage(
          error.message || "No se pudo actualizar el estado de la tarea.",
        );
      })
      .finally(() => {
        setSavingTaskId(null);
      });
  };

  const handleTaskCommentChange = (taskId, value) => {
    setTaskComments((currentComments) => ({
      ...currentComments,
      [taskId]: value,
    }));
  };

  const handleAddTaskComment = (taskId) => {
    const token = localStorage.getItem("jwt");

    const message = taskComments[taskId]?.trim();

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    if (!message) {
      setErrorMessage("Escribe un comentario antes de enviarlo.");
      return;
    }

    setSendingCommentTaskId(taskId);
    setErrorMessage("");
    setSuccessMessage("");

    addTaskComment({
      token,
      taskId,
      message,
      mode: "team",
    })
      .then(() => {
        setTaskComments((currentComments) => ({
          ...currentComments,
          [taskId]: "",
        }));

        return refreshTaskActivity(taskId, token);
      })
      .then(() => {
        setSuccessMessage("Comentario agregado correctamente.");
      })
      .catch((error) => {
        setErrorMessage(error.message || "No se pudo agregar el comentario.");
      })
      .finally(() => {
        setSendingCommentTaskId(null);
      });
  };

  const handleToggleTaskActivity = (taskId) => {
    if (openActivityTaskId === taskId) {
      setOpenActivityTaskId(null);
      return;
    }

    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    setOpenActivityTaskId(taskId);

    if (taskActivityById[taskId]) {
      return;
    }

    setLoadingActivityTaskId(taskId);
    setErrorMessage("");

    refreshTaskActivity(taskId, token)
      .catch((error) => {
        setErrorMessage(error.message || "No se pudo cargar el historial.");
      })
      .finally(() => {
        setLoadingActivityTaskId(null);
      });
  };

  const handleDeliverableChange = (taskId, field, value) => {
    setDeliverableForms((currentForms) => ({
      ...currentForms,
      [taskId]: {
        ...currentForms[taskId],
        [field]: value,
      },
    }));
  };

  const handleToggleDeliverables = (taskId) => {
    const isOpen = Boolean(deliverablesOpen[taskId]);

    if (isOpen) {
      setDeliverablesOpen((currentOpen) => ({
        ...currentOpen,
        [taskId]: false,
      }));

      return;
    }

    setDeliverablesOpen((currentOpen) => ({
      ...currentOpen,
      [taskId]: true,
    }));

    if (deliverablesByTask[taskId]) {
      return;
    }

    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    setDeliverablesLoading((currentLoading) => ({
      ...currentLoading,
      [taskId]: true,
    }));

    setErrorMessage("");

    refreshTaskDeliverables(taskId, token)
      .catch((error) => {
        setErrorMessage(
          error.message || "No se pudieron cargar los entregables.",
        );
      })
      .finally(() => {
        setDeliverablesLoading((currentLoading) => ({
          ...currentLoading,
          [taskId]: false,
        }));
      });
  };

  const handleAddDeliverable = (taskId) => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    const form = deliverableForms[taskId] || {};

    const name = form.name?.trim() || "";
    const url = form.url?.trim() || "";
    const source = form.source || "external";

    if (!name) {
      setErrorMessage("Escribe un nombre para el entregable.");
      return;
    }

    if (!url) {
      setErrorMessage("Agrega la URL del entregable.");
      return;
    }

    setSendingDeliverableTaskId(taskId);
    setErrorMessage("");
    setSuccessMessage("");

    addMyTaskDeliverable({
      token,
      taskId,
      deliverable: {
        name,
        url,
        source,
        externalUrl: url,
        clientVisible: false,
      },
    })
      .then(() => {
        setDeliverableForms((currentForms) => ({
          ...currentForms,
          [taskId]: {
            name: "",
            url: "",
            source: "external",
          },
        }));

        setDeliverablesOpen((currentOpen) => ({
          ...currentOpen,
          [taskId]: true,
        }));

        return refreshTaskDeliverables(taskId, token);
      })
      .then(() => {
        setSuccessMessage("Entregable agregado correctamente.");
      })
      .catch((error) => {
        setErrorMessage(error.message || "No se pudo agregar el entregable.");
      })
      .finally(() => {
        setSendingDeliverableTaskId(null);
      });
  };

  if (isLoading) {
    return <main className="team-dashboard">Cargando tareas...</main>;
  }

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

      <main className="team-dashboard">
        <div className="team-dashboard__container">
          <span className="team-dashboard__eyebrow">Equipo BeeUX</span>

          <h1 className="team-dashboard__title">Mis tareas</h1>

          <p className="team-dashboard__description">
            Consulta el trabajo que tienes asignado y el estado de cada tarea.
          </p>

          <div className="team-dashboard__summary">
            <article>
              <span>Total</span>
              <strong>{tasks.length}</strong>
            </article>

            <article>
              <span>Pendientes</span>

              <strong>
                {tasks.filter((task) => task.status === "pending").length}
              </strong>
            </article>

            <article>
              <span>En progreso</span>

              <strong>
                {tasks.filter((task) => task.status === "in_progress").length}
              </strong>
            </article>
          </div>

          <section className="team-dashboard__tasks">
            {tasks.length === 0 ? (
              <div className="team-dashboard__empty">
                No tienes tareas asignadas.
              </div>
            ) : (
              tasks.map((task) => (
                <article className="team-dashboard__task" key={task._id}>
                  <div className="team-dashboard__task-main">
                    <div>
                      <span className="team-dashboard__project">
                        {task.project?.serviceName || "Proyecto"}
                      </span>

                      <h2>{task.title}</h2>

                      {task.description && <p>{task.description}</p>}
                    </div>

                    <div className="team-dashboard__task-meta">
                      <span>
                        Estado:{" "}
                        <strong>
                          {statusLabels[task.status] || task.status}
                        </strong>
                      </span>

                      <span>
                        Prioridad:{" "}
                        <strong>
                          {priorityLabels[task.priority] || task.priority}
                        </strong>
                      </span>

                      <span>
                        Fecha límite:{" "}
                        <strong>
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString("es-MX")
                            : "Sin fecha"}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="team-dashboard__task-controls">
                    <label>
                      <span>Actualizar estado</span>

                      <select
                        value={task.status}
                        onChange={(event) =>
                          handleStatusChange(task._id, event.target.value)
                        }
                        disabled={
                          savingTaskId === task._id ||
                          task.status === "cancelled" ||
                          task.status === "completed"
                        }
                      >
                        <option value="pending">Pendiente</option>

                        <option value="in_progress">En progreso</option>

                        <option value="review">En revisión</option>

                        {task.status === "completed" && (
                          <option value="completed" disabled>
                            Completada
                          </option>
                        )}

                        {task.status === "cancelled" && (
                          <option value="cancelled" disabled>
                            Cancelada
                          </option>
                        )}
                      </select>
                    </label>

                    {savingTaskId === task._id && (
                      <span className="team-dashboard__saving">
                        Guardando...
                      </span>
                    )}
                  </div>

                  <div className="team-dashboard__secondary-actions">
                    <button
                      type="button"
                      className="team-dashboard__history-button"
                      onClick={() => handleToggleTaskActivity(task._id)}
                    >
                      {openActivityTaskId === task._id
                        ? "Ocultar historial"
                        : "Ver historial"}
                    </button>

                    <button
                      type="button"
                      className="team-dashboard__deliverables-button"
                      onClick={() => handleToggleDeliverables(task._id)}
                    >
                      {deliverablesOpen[task._id]
                        ? "Ocultar entregables"
                        : "Ver entregables"}
                    </button>
                  </div>

                  {task.status !== "cancelled" &&
                    task.status !== "completed" && (
                      <div className="team-dashboard__comment-form">
                        <label>
                          <span>Comentario o avance</span>

                          <textarea
                            rows="3"
                            value={taskComments[task._id] || ""}
                            onChange={(event) =>
                              handleTaskCommentChange(
                                task._id,
                                event.target.value,
                              )
                            }
                            placeholder="Agrega una nota o avance sobre esta tarea..."
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleAddTaskComment(task._id)}
                          disabled={sendingCommentTaskId === task._id}
                        >
                          {sendingCommentTaskId === task._id
                            ? "Enviando..."
                            : "Agregar comentario"}
                        </button>
                      </div>
                    )}

                  {deliverablesOpen[task._id] && (
                    <div className="team-dashboard__deliverables">
                      <h3>Entregables</h3>

                      {task.status !== "cancelled" &&
                        task.status !== "completed" && (
                          <div className="team-dashboard__deliverable-form">
                            <label>
                              <span>Nombre del entregable</span>

                              <input
                                type="text"
                                value={deliverableForms[task._id]?.name || ""}
                                onChange={(event) =>
                                  handleDeliverableChange(
                                    task._id,
                                    "name",
                                    event.target.value,
                                  )
                                }
                                placeholder="Ej. Calendario de contenido octubre"
                              />
                            </label>

                            <label>
                              <span>Origen</span>

                              <select
                                value={
                                  deliverableForms[task._id]?.source ||
                                  "external"
                                }
                                onChange={(event) =>
                                  handleDeliverableChange(
                                    task._id,
                                    "source",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="external">Enlace externo</option>

                                <option value="canva">Canva</option>

                                <option value="drive">Google Drive</option>

                                <option value="affinity">Affinity</option>
                              </select>
                            </label>

                            <label>
                              <span>URL</span>

                              <input
                                type="url"
                                value={deliverableForms[task._id]?.url || ""}
                                onChange={(event) =>
                                  handleDeliverableChange(
                                    task._id,
                                    "url",
                                    event.target.value,
                                  )
                                }
                                placeholder="https://..."
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => handleAddDeliverable(task._id)}
                              disabled={sendingDeliverableTaskId === task._id}
                            >
                              {sendingDeliverableTaskId === task._id
                                ? "Agregando..."
                                : "Agregar entregable"}
                            </button>
                          </div>
                        )}

                      {deliverablesLoading[task._id] ? (
                        <p>Cargando entregables...</p>
                      ) : deliverablesByTask[task._id]?.length ? (
                        <div className="team-dashboard__deliverables-list">
                          {deliverablesByTask[task._id].map((deliverable) => (
                            <div
                              className="team-dashboard__deliverable-item"
                              key={deliverable._id}
                            >
                              <div>
                                <strong>{deliverable.name}</strong>

                                <span>
                                  {sourceLabels[deliverable.source] ||
                                    deliverable.source}
                                </span>
                                <span>
                                  Estado:{" "}
                                  <strong>
                                    {deliverable.status === "approved"
                                      ? "Aprobado"
                                      : deliverable.status ===
                                          "changes_requested"
                                        ? "Cambios solicitados"
                                        : deliverable.status === "draft"
                                          ? "Borrador"
                                          : "Pendiente de revisión"}
                                  </strong>
                                </span>
                              </div>

                              <a
                                href={deliverable.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Abrir entregable
                              </a>

                              {deliverable.reviewMessage && (
                                <p className="team-dashboard__deliverable-review-message">
                                  <strong>Comentarios de revisión:</strong>{" "}
                                  {deliverable.reviewMessage}
                                </p>
                              )}

                              <small>
                                Agregado por{" "}
                                {deliverable.uploadedBy?.name ||
                                  "Usuario BeeUX"}
                                {" · "}
                                {new Date(deliverable.createdAt).toLocaleString(
                                  "es-MX",
                                )}
                              </small>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>Todavía no hay entregables para esta tarea.</p>
                      )}
                    </div>
                  )}

                  {openActivityTaskId === task._id && (
                    <div className="team-dashboard__activity">
                      <h3>Historial de actividad</h3>

                      {loadingActivityTaskId === task._id ? (
                        <p>Cargando historial...</p>
                      ) : taskActivityById[task._id]?.length ? (
                        <div className="team-dashboard__activity-list">
                          {taskActivityById[task._id].map((activity) => (
                            <div
                              className="team-dashboard__activity-item"
                              key={activity._id}
                            >
                              <strong>
                                {activity.user?.name || "Usuario BeeUX"}
                              </strong>

                              <span>
                                {activity.fromStatus && activity.toStatus
                                  ? `${
                                      statusLabels[activity.fromStatus] ||
                                      activity.fromStatus
                                    } → ${
                                      statusLabels[activity.toStatus] ||
                                      activity.toStatus
                                    }`
                                  : activity.type === "comment"
                                    ? "Comentario"
                                    : activity.type === "review_requested"
                                      ? "Enviada a revisión"
                                      : activity.type === "approved"
                                        ? "Aprobada"
                                        : activity.type}
                              </span>

                              {activity.message && <p>{activity.message}</p>}

                              <small>
                                {new Date(activity.createdAt).toLocaleString(
                                  "es-MX",
                                )}
                              </small>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>
                          Todavía no hay actividad registrada para esta tarea.
                        </p>
                      )}
                    </div>
                  )}
                </article>
              ))
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default TeamDashboard;
