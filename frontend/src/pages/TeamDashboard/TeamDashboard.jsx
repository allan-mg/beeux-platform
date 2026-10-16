import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import { getMyTasks, updateMyTaskStatus } from "../../api/tasksApi";

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

function TeamDashboard() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [savingTaskId, setSavingTaskId] = useState(null);

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
        setErrorMessage(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleStatusChange = (taskId, status) => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    setSavingTaskId(taskId);
    setErrorMessage("");

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
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setSavingTaskId(null);
      });
  };

  if (isLoading) {
    return <main className="team-dashboard">Cargando tareas...</main>;
  }

  return (
    <>
      <Header />

      <main className="team-dashboard">
        <div className="team-dashboard__container">
          <span className="team-dashboard__eyebrow">Equipo BeeUX</span>

          <h1 className="team-dashboard__title">Mis tareas</h1>

          <p className="team-dashboard__description">
            Consulta el trabajo que tienes asignado y el estado de cada tarea.
          </p>

          {errorMessage && (
            <p className="team-dashboard__error">{errorMessage}</p>
          )}

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
                        disabled={savingTaskId === task._id}
                      >
                        <option value="pending">Pendiente</option>

                        <option value="in_progress">En progreso</option>

                        <option value="review">En revisión</option>

                        <option value="completed">Completada</option>
                      </select>
                    </label>

                    {savingTaskId === task._id && (
                      <span className="team-dashboard__saving">
                        Guardando...
                      </span>
                    )}
                  </div>
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
