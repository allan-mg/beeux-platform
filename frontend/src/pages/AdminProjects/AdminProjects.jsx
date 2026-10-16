import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import {
  getAllProjects,
  updateProjectStatus,
  updateProjectAssignee,
} from "../../api/projectsApi";

import { getTeamMembers } from "../../api/teamApi";

import { getProjectTasks, createProjectTask } from "../../api/tasksApi";

import "./AdminProjects.css";

const statusLabels = {
  brief_received: "Brief recibido",
  planning: "Planeación",
  in_progress: "En desarrollo",
  review: "Revisión",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const taskStatusLabels = {
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

const getAssigneeId = (assignedTo) => {
  if (!assignedTo) {
    return "";
  }

  if (typeof assignedTo === "string") {
    return assignedTo;
  }

  return assignedTo._id || "";
};

function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasksByProject, setTasksByProject] = useState({});

  const [statusDrafts, setStatusDrafts] = useState({});
  const [assigneeDrafts, setAssigneeDrafts] = useState({});
  const [taskForms, setTaskForms] = useState({});

  const [savingProjectId, setSavingProjectId] = useState(null);
  const [savingAssigneeProjectId, setSavingAssigneeProjectId] = useState(null);
  const [creatingTaskProjectId, setCreatingTaskProjectId] = useState(null);

  const [isLoading, setIsLoading] = useState(() =>
    Boolean(localStorage.getItem("jwt")),
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      return;
    }

    Promise.all([getAllProjects(token), getTeamMembers(token)])
      .then(([projectsData, teamData]) => {
        setProjects(projectsData);
        setTeamMembers(teamData);

        const initialStatuses = {};
        const initialAssignees = {};
        const initialTaskForms = {};

        projectsData.forEach((project) => {
          initialStatuses[project._id] = project.status;

          initialAssignees[project._id] = getAssigneeId(project.assignedTo);

          initialTaskForms[project._id] = {
            title: "",
            description: "",
            assignedTo: getAssigneeId(project.assignedTo),
            priority: "medium",
            dueDate: "",
            clientVisible: false,
          };
        });

        setStatusDrafts(initialStatuses);
        setAssigneeDrafts(initialAssignees);
        setTaskForms(initialTaskForms);

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
        setErrorMessage(error);
      })
      .finally(() => {
        setIsLoading(false);
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
    setSuccessMessage("");

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

        setSuccessMessage("El estado del proyecto se actualizó correctamente.");
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setSavingProjectId(null);
      });
  };

  const handleAssigneeChange = (projectId, assignedTo) => {
    setAssigneeDrafts((currentAssignees) => ({
      ...currentAssignees,
      [projectId]: assignedTo,
    }));
  };

  const handleSaveAssignee = (projectId) => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    setSavingAssigneeProjectId(projectId);
    setErrorMessage("");
    setSuccessMessage("");

    updateProjectAssignee({
      token,
      projectId,
      assignedTo: assigneeDrafts[projectId] || null,
    })
      .then((updatedProject) => {
        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project._id === updatedProject._id ? updatedProject : project,
          ),
        );

        setTaskForms((currentForms) => ({
          ...currentForms,

          [projectId]: {
            ...currentForms[projectId],

            assignedTo: getAssigneeId(updatedProject.assignedTo),
          },
        }));

        setSuccessMessage(
          "El responsable del proyecto se actualizó correctamente.",
        );
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setSavingAssigneeProjectId(null);
      });
  };

  const handleTaskFormChange = (projectId, field, value) => {
    setTaskForms((currentForms) => ({
      ...currentForms,

      [projectId]: {
        ...currentForms[projectId],
        [field]: value,
      },
    }));
  };

  const handleCreateTask = (projectId) => {
    const token = localStorage.getItem("jwt");
    const taskForm = taskForms[projectId];

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    if (!taskForm?.title?.trim()) {
      setErrorMessage("Escribe un título para la tarea.");
      return;
    }

    setCreatingTaskProjectId(projectId);
    setErrorMessage("");
    setSuccessMessage("");

    const task = {
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),

      assignedTo: taskForm.assignedTo || null,

      priority: taskForm.priority,

      dueDate: taskForm.dueDate || null,

      clientVisible: Boolean(taskForm.clientVisible),
    };

    createProjectTask({
      token,
      projectId,
      task,
    })
      .then((createdTask) => {
        setTasksByProject((currentTasks) => ({
          ...currentTasks,

          [projectId]: [...(currentTasks[projectId] || []), createdTask],
        }));

        setTaskForms((currentForms) => ({
          ...currentForms,

          [projectId]: {
            title: "",
            description: "",

            assignedTo: assigneeDrafts[projectId] || "",

            priority: "medium",
            dueDate: "",
            clientVisible: false,
          },
        }));

        setSuccessMessage("La tarea se creó correctamente.");
      })
      .catch((error) => {
        setErrorMessage(error);
      })
      .finally(() => {
        setCreatingTaskProjectId(null);
      });
  };

  if (isLoading) {
    return <main className="admin-projects">Cargando proyectos...</main>;
  }

  return (
    <>
      <Header />

      <main className="admin-projects">
        <div className="admin-projects__container">
          <span className="admin-projects__eyebrow">Administración BeeUX</span>

          <h1 className="admin-projects__title">Proyectos</h1>

          <p className="admin-projects__description">
            Gestiona proyectos, responsables y tareas del equipo BeeUX.
          </p>

          {errorMessage && (
            <p className="admin-projects__error">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="admin-projects__success">{successMessage}</p>
          )}

          <div className="admin-projects__list">
            {projects.map((project) => {
              const projectTasks = tasksByProject[project._id] || [];

              const taskForm = taskForms[project._id] || {
                title: "",
                description: "",
                assignedTo: "",
                priority: "medium",
                dueDate: "",
                clientVisible: false,
              };

              return (
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
                        : "Guardar estado"}
                    </button>
                  </div>

                  <section className="admin-projects__assignment">
                    <h3>Responsable del proyecto</h3>

                    <div className="admin-projects__assignment-controls">
                      <label>
                        <span>Responsable</span>

                        <select
                          value={assigneeDrafts[project._id] || ""}
                          onChange={(event) =>
                            handleAssigneeChange(
                              project._id,
                              event.target.value,
                            )
                          }
                        >
                          <option value="">Sin asignar</option>

                          {teamMembers.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.name} —{" "}
                              {member.role === "admin" ? "Admin" : "Empleado"}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleSaveAssignee(project._id)}
                        disabled={savingAssigneeProjectId === project._id}
                      >
                        {savingAssigneeProjectId === project._id
                          ? "Asignando..."
                          : "Guardar responsable"}
                      </button>
                    </div>
                  </section>

                  <section className="admin-projects__tasks-section">
                    <div className="admin-projects__tasks-header">
                      <div>
                        <span>Trabajo del equipo</span>

                        <h3>Tareas</h3>
                      </div>

                      <strong>{projectTasks.length}</strong>
                    </div>

                    {projectTasks.length === 0 ? (
                      <p className="admin-projects__empty">
                        Este proyecto todavía no tiene tareas.
                      </p>
                    ) : (
                      <div className="admin-projects__tasks-list">
                        {projectTasks.map((task) => (
                          <article
                            className="admin-projects__task"
                            key={task._id}
                          >
                            <div>
                              <h4>{task.title}</h4>

                              {task.description && <p>{task.description}</p>}
                            </div>

                            <div className="admin-projects__task-meta">
                              <span>
                                Estado:{" "}
                                <strong>
                                  {taskStatusLabels[task.status] || task.status}
                                </strong>
                              </span>

                              <span>
                                Prioridad:{" "}
                                <strong>
                                  {priorityLabels[task.priority] ||
                                    task.priority}
                                </strong>
                              </span>

                              <span>
                                Responsable:{" "}
                                <strong>
                                  {task.assignedTo?.name || "Sin asignar"}
                                </strong>
                              </span>

                              <span>
                                Fecha límite:{" "}
                                <strong>
                                  {task.dueDate
                                    ? new Date(task.dueDate).toLocaleDateString(
                                        "es-MX",
                                      )
                                    : "Sin fecha"}
                                </strong>
                              </span>

                              <span>
                                Cliente:{" "}
                                <strong>
                                  {task.clientVisible ? "Visible" : "Interna"}
                                </strong>
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}

                    <div className="admin-projects__task-form">
                      <h3>Crear nueva tarea</h3>

                      <div className="admin-projects__task-form-grid">
                        <label>
                          <span>Título *</span>

                          <input
                            type="text"
                            value={taskForm.title}
                            onChange={(event) =>
                              handleTaskFormChange(
                                project._id,
                                "title",
                                event.target.value,
                              )
                            }
                            placeholder="Ej. Diseñar publicaciones"
                          />
                        </label>

                        <label>
                          <span>Responsable</span>

                          <select
                            value={taskForm.assignedTo}
                            onChange={(event) =>
                              handleTaskFormChange(
                                project._id,
                                "assignedTo",
                                event.target.value,
                              )
                            }
                          >
                            <option value="">Sin asignar</option>

                            {teamMembers.map((member) => (
                              <option key={member._id} value={member._id}>
                                {member.name} —{" "}
                                {member.role === "admin" ? "Admin" : "Empleado"}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          <span>Prioridad</span>

                          <select
                            value={taskForm.priority}
                            onChange={(event) =>
                              handleTaskFormChange(
                                project._id,
                                "priority",
                                event.target.value,
                              )
                            }
                          >
                            <option value="low">Baja</option>

                            <option value="medium">Media</option>

                            <option value="high">Alta</option>

                            <option value="urgent">Urgente</option>
                          </select>
                        </label>

                        <label>
                          <span>Fecha límite</span>

                          <input
                            type="date"
                            value={taskForm.dueDate}
                            onChange={(event) =>
                              handleTaskFormChange(
                                project._id,
                                "dueDate",
                                event.target.value,
                              )
                            }
                          />
                        </label>

                        <label className="admin-projects__task-description">
                          <span>Descripción</span>

                          <textarea
                            rows="4"
                            value={taskForm.description}
                            onChange={(event) =>
                              handleTaskFormChange(
                                project._id,
                                "description",
                                event.target.value,
                              )
                            }
                            placeholder="Describe qué debe realizarse, entregables y contexto necesario."
                          />
                        </label>
                      </div>

                      <label className="admin-projects__visibility">
                        <input
                          type="checkbox"
                          checked={taskForm.clientVisible}
                          onChange={(event) =>
                            handleTaskFormChange(
                              project._id,
                              "clientVisible",
                              event.target.checked,
                            )
                          }
                        />

                        <span>Mostrar esta tarea al cliente</span>
                      </label>

                      <button
                        className="admin-projects__create-task"
                        type="button"
                        onClick={() => handleCreateTask(project._id)}
                        disabled={creatingTaskProjectId === project._id}
                      >
                        {creatingTaskProjectId === project._id
                          ? "Creando tarea..."
                          : "+ Crear tarea"}
                      </button>
                    </div>
                  </section>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default AdminProjects;
