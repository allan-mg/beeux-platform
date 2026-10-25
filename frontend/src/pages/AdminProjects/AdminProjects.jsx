import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Toast from "../../components/Toast/Toast";

import {
  getAllProjects,
  updateProjectStatus,
  updateProjectAssignee,
} from "../../api/projectsApi";

import { getTeamMembers } from "../../api/teamApi";

import {
  getProjectTasks,
  createProjectTask,
  updateTask,
  getTaskActivity,
  addTaskComment,
  getTaskDeliverables,
  toggleTaskArchive,
} from "../../api/tasksApi";

import "./AdminProjects.css";

const statusLabels = {
  brief_received: "Brief recibido",
  planning: "Planeación",
  in_progress: "En desarrollo",
  review: "Revisión",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const projectStatusSteps = [
  "brief_received",
  "planning",
  "in_progress",
  "review",
  "delivered",
];

const getProjectStatusIndex = (status) => projectStatusSteps.indexOf(status);

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

const deliverableSourceLabels = {
  upload: "Archivo",
  canva: "Canva",
  affinity: "Affinity",
  drive: "Google Drive",
  external: "Enlace externo",
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

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskEditForms, setTaskEditForms] = useState({});
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const [taskActivityById, setTaskActivityById] = useState({});

  const [openActivityTaskId, setOpenActivityTaskId] = useState(null);

  const [loadingActivityTaskId, setLoadingActivityTaskId] = useState(null);

  const [taskComments, setTaskComments] = useState({});

  const [sendingCommentTaskId, setSendingCommentTaskId] = useState(null);

  const [requestChangesTaskId, setRequestChangesTaskId] = useState(null);

  const [reviewMessages, setReviewMessages] = useState({});

  const [taskDeliverablesById, setTaskDeliverablesById] = useState({});

  const [openDeliverablesTaskId, setOpenDeliverablesTaskId] = useState(null);

  const [loadingDeliverablesTaskId, setLoadingDeliverablesTaskId] =
    useState(null);

  const [approveTaskModal, setApproveTaskModal] = useState(null);

  const [archiveTaskModal, setArchiveTaskModal] = useState(null);

  const [cancelTaskModal, setCancelTaskModal] = useState(null);

  const [taskFilter, setTaskFilter] = useState("active");

  const [expandedProjects, setExpandedProjects] = useState({});

  const [projectSearch, setProjectSearch] = useState("");

  const [projectStatusFilter, setProjectStatusFilter] = useState("all");

  const [projectAssigneeFilter, setProjectAssigneeFilter] = useState("all");

  const [projectViewMode, setProjectViewMode] = useState("clients");

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
        setErrorMessage(
          error.message || "No se pudieron cargar los proyectos.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleToggleProject = (projectId) => {
    setExpandedProjects((currentProjects) => ({
      ...currentProjects,
      [projectId]: !currentProjects[projectId],
    }));
  };

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
        setErrorMessage(error.message || "No se pudo actualizar el proyecto.");
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
        setErrorMessage(
          error.message || "No se pudo actualizar el responsable.",
        );
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
        setErrorMessage(error.message || "No se pudo crear la tarea.");
      })
      .finally(() => {
        setCreatingTaskProjectId(null);
      });
  };

  const handleStartEditTask = (task) => {
    setEditingTaskId(task._id);

    setTaskEditForms((currentForms) => ({
      ...currentForms,

      [task._id]: {
        title: task.title || "",
        description: task.description || "",

        assignedTo: getAssigneeId(task.assignedTo),

        priority: task.priority || "medium",

        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().slice(0, 10)
          : "",

        clientVisible: Boolean(task.clientVisible),
      },
    }));
  };

  const handleTaskEditChange = (taskId, field, value) => {
    setTaskEditForms((currentForms) => ({
      ...currentForms,

      [taskId]: {
        ...currentForms[taskId],
        [field]: value,
      },
    }));
  };

  const handleSaveTaskEdit = (projectId, taskId) => {
    const token = localStorage.getItem("jwt");

    const editForm = taskEditForms[taskId];

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    if (!editForm?.title?.trim()) {
      setErrorMessage("El título de la tarea es obligatorio.");
      return;
    }

    setUpdatingTaskId(taskId);
    setErrorMessage("");
    setSuccessMessage("");

    updateTask({
      token,
      taskId,

      updates: {
        title: editForm.title.trim(),

        description: editForm.description.trim(),

        assignedTo: editForm.assignedTo || null,

        priority: editForm.priority,

        dueDate: editForm.dueDate || null,

        clientVisible: Boolean(editForm.clientVisible),
      },
    })
      .then((updatedTask) => {
        setTasksByProject((currentTasks) => ({
          ...currentTasks,

          [projectId]: currentTasks[projectId].map((task) =>
            task._id === updatedTask._id ? updatedTask : task,
          ),
        }));

        setEditingTaskId(null);

        setSuccessMessage("La tarea se actualizó correctamente.");
      })
      .catch((error) => {
        setErrorMessage(error.message || "No se pudo actualizar la tarea.");
      })
      .finally(() => {
        setUpdatingTaskId(null);
      });
  };

  const handleCancelTask = (projectId, taskId) => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    setUpdatingTaskId(taskId);
    setErrorMessage("");
    setSuccessMessage("");

    updateTask({
      token,
      taskId,

      updates: {
        status: "cancelled",
      },
    })
      .then((updatedTask) => {
        setTasksByProject((currentTasks) => ({
          ...currentTasks,

          [projectId]: currentTasks[projectId].map((task) =>
            task._id === updatedTask._id ? updatedTask : task,
          ),
        }));

        setSuccessMessage(
          "La tarea fue cancelada y se conservará en el historial.",
        );

        setTaskActivityById((currentActivity) => {
          const updatedActivity = {
            ...currentActivity,
          };

          delete updatedActivity[taskId];

          return updatedActivity;
        });
      })
      .catch((error) => {
        setErrorMessage(error.message || "No se pudo cancelar la tarea.");
      })
      .finally(() => {
        setUpdatingTaskId(null);
      });
  };

  const handleToggleTaskArchive = (projectId, taskId, isArchived) => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    setUpdatingTaskId(taskId);
    setErrorMessage("");
    setSuccessMessage("");

    toggleTaskArchive({
      token,
      taskId,
      isArchived,
    })
      .then((updatedTask) => {
        setTasksByProject((currentTasks) => ({
          ...currentTasks,
          [projectId]: currentTasks[projectId].map((task) =>
            task._id === updatedTask._id
              ? {
                  ...task,
                  ...updatedTask,
                }
              : task,
          ),
        }));

        setSuccessMessage(
          isArchived
            ? "La tarea fue archivada correctamente."
            : "La tarea fue restaurada correctamente.",
        );
      })
      .catch((error) => {
        setErrorMessage(
          error.message || "No se pudo actualizar el archivo de la tarea.",
        );
      })
      .finally(() => {
        setUpdatingTaskId(null);
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

    getTaskActivity({
      token,
      taskId,
    })
      .then((activities) => {
        setTaskActivityById((currentActivity) => ({
          ...currentActivity,

          [taskId]: activities,
        }));
      })
      .catch((error) => {
        setErrorMessage(error.message || "No se pudo cargar el historial.");
      })
      .finally(() => {
        setLoadingActivityTaskId(null);
      });
  };

  const handleToggleTaskDeliverables = (taskId) => {
    if (openDeliverablesTaskId === taskId) {
      setOpenDeliverablesTaskId(null);
      return;
    }

    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    setOpenDeliverablesTaskId(taskId);

    if (taskDeliverablesById[taskId]) {
      return;
    }

    setLoadingDeliverablesTaskId(taskId);
    setErrorMessage("");

    getTaskDeliverables({
      token,
      taskId,
      mode: "admin",
    })
      .then((deliverables) => {
        setTaskDeliverablesById((currentDeliverables) => ({
          ...currentDeliverables,
          [taskId]: deliverables,
        }));
      })
      .catch((error) => {
        setErrorMessage(
          error.message || "No se pudieron cargar los entregables.",
        );
      })
      .finally(() => {
        setLoadingDeliverablesTaskId(null);
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
      mode: "admin",
    })
      .then((activity) => {
        setTaskActivityById((currentActivity) => ({
          ...currentActivity,

          [taskId]: [...(currentActivity[taskId] || []), activity],
        }));

        setTaskComments((currentComments) => ({
          ...currentComments,

          [taskId]: "",
        }));

        setOpenActivityTaskId(taskId);

        setSuccessMessage("Comentario agregado correctamente.");
      })
      .catch((error) => {
        setErrorMessage(error.message || "No se pudo agregar el comentario.");
      })
      .finally(() => {
        setSendingCommentTaskId(null);
      });
  };

  if (isLoading) {
    return <main className="admin-projects">Cargando proyectos...</main>;
  }

  const projectsByClient = projects.reduce((groups, project) => {
    const clientId =
      project.user?._id || project.user?.email || "unknown-client";

    if (!groups[clientId]) {
      groups[clientId] = {
        client: {
          _id: project.user?._id || "",
          name: project.user?.name || "Cliente",
          email: project.user?.email || "",
        },
        projects: [],
      };
    }

    groups[clientId].projects.push(project);

    return groups;
  }, {});

  const clientGroups = Object.values(projectsByClient);

  const normalizedProjectSearch = projectSearch.trim().toLowerCase();

  const filteredClientGroups = clientGroups
    .map((group) => {
      const clientMatches =
        group.client.name?.toLowerCase().includes(normalizedProjectSearch) ||
        group.client.email?.toLowerCase().includes(normalizedProjectSearch);

      const matchingProjects = group.projects.filter((project) => {
        const matchesSearch =
          !normalizedProjectSearch ||
          project.serviceName?.toLowerCase().includes(normalizedProjectSearch);

        const matchesStatus =
          projectStatusFilter === "all" ||
          project.status === projectStatusFilter;

        const projectAssigneeId =
          project.assignedTo?._id || project.assignedTo || "";

        const matchesAssignee =
          projectAssigneeFilter === "all" ||
          projectAssigneeId === projectAssigneeFilter;

        return matchesSearch && matchesStatus && matchesAssignee;
      });

      if (clientMatches) {
        const projectsMatchingFilters = group.projects.filter((project) => {
          const matchesStatus =
            projectStatusFilter === "all" ||
            project.status === projectStatusFilter;

          const projectAssigneeId =
            project.assignedTo?._id || project.assignedTo || "";

          const matchesAssignee =
            projectAssigneeFilter === "all" ||
            projectAssigneeId === projectAssigneeFilter;

          return matchesStatus && matchesAssignee;
        });

        if (projectsMatchingFilters.length === 0) {
          return null;
        }

        return {
          ...group,
          projects: projectsMatchingFilters,
        };
      }

      if (matchingProjects.length > 0) {
        return {
          ...group,
          projects: matchingProjects,
        };
      }

      return null;
    })
    .filter(Boolean);

  const filteredProjects = filteredClientGroups.flatMap(
    (group) => group.projects,
  );

  const displayedProjectGroups =
    projectViewMode === "clients"
      ? filteredClientGroups
      : [
          {
            client: {
              _id: "all-projects",
              name: "Todos los proyectos",
              email: "",
            },
            projects: filteredProjects,
          },
        ];

  const filteredProjectCount = filteredClientGroups.reduce(
    (total, group) => total + group.projects.length,
    0,
  );

  const hasActiveProjectFilters =
    Boolean(projectSearch.trim()) ||
    projectStatusFilter !== "all" ||
    projectAssigneeFilter !== "all";

  const handleClearProjectFilters = () => {
    setProjectSearch("");
    setProjectStatusFilter("all");
    setProjectAssigneeFilter("all");
  };

  const handleReviewDecision = (projectId, taskId, decision) => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setErrorMessage("No se encontró una sesión activa.");
      return;
    }

    const reviewMessage = reviewMessages[taskId]?.trim() || "";

    if (decision === "changes" && !reviewMessage) {
      setErrorMessage("Escribe qué cambios debe realizar el responsable.");
      return;
    }

    const newStatus = decision === "approve" ? "completed" : "pending";

    setUpdatingTaskId(taskId);
    setErrorMessage("");
    setSuccessMessage("");

    updateTask({
      token,
      taskId,

      updates: {
        status: newStatus,

        ...(decision === "changes" && {
          reviewMessage,
        }),
      },
    })
      .then((updatedTask) => {
        setTasksByProject((currentTasks) => ({
          ...currentTasks,

          [projectId]: currentTasks[projectId].map((task) =>
            task._id === updatedTask._id ? updatedTask : task,
          ),
        }));

        setTaskActivityById((currentActivity) => {
          const updatedActivity = {
            ...currentActivity,
          };

          delete updatedActivity[taskId];

          return updatedActivity;
        });

        setRequestChangesTaskId(null);

        setReviewMessages((currentMessages) => ({
          ...currentMessages,
          [taskId]: "",
        }));

        setSuccessMessage(
          decision === "approve"
            ? "La tarea fue aprobada correctamente."
            : "Los cambios se solicitaron correctamente.",
        );
      })
      .catch((error) => {
        setErrorMessage(
          error.message || "No se pudo actualizar la revisión de la tarea.",
        );
      })
      .finally(() => {
        setUpdatingTaskId(null);
      });
  };

  const handleReviewMessageChange = (taskId, value) => {
    setReviewMessages((currentMessages) => ({
      ...currentMessages,
      [taskId]: value,
    }));
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

      <main className="admin-projects">
        <div className="admin-projects__container">
          <span className="admin-projects__eyebrow">Administración BeeUX</span>

          <h1 className="admin-projects__title">Proyectos</h1>

          <p className="admin-projects__description">
            Gestiona proyectos, responsables y tareas del equipo BeeUX.
          </p>

          <div className="admin-projects__search">
            <label htmlFor="project-search">
              Buscar cliente, email o servicio
            </label>

            <input
              id="project-search"
              type="search"
              value={projectSearch}
              onChange={(event) => setProjectSearch(event.target.value)}
              placeholder="Ej. Cliente BeeUX, cliente@beeux.mx o UGC Ads"
            />
          </div>

          <div className="admin-projects__project-filters">
            <label>
              <span>Estado del proyecto</span>

              <select
                value={projectStatusFilter}
                onChange={(event) => setProjectStatusFilter(event.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="brief_received">Brief recibido</option>
                <option value="planning">Planeación</option>
                <option value="in_progress">En desarrollo</option>
                <option value="review">Revisión</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </label>

            <label>
              <span>Responsable</span>

              <select
                value={projectAssigneeFilter}
                onChange={(event) =>
                  setProjectAssigneeFilter(event.target.value)
                }
              >
                <option value="all">Todos los responsables</option>

                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-projects__view-controls">
            <span>Vista</span>

            <div className="admin-projects__view-buttons">
              <button
                type="button"
                className={projectViewMode === "clients" ? "is-active" : ""}
                onClick={() => setProjectViewMode("clients")}
              >
                Por cliente
              </button>

              <button
                type="button"
                className={projectViewMode === "projects" ? "is-active" : ""}
                onClick={() => setProjectViewMode("projects")}
              >
                Todos los proyectos ({filteredProjects.length})
              </button>
            </div>
          </div>

          <div className="admin-projects__results-toolbar">
            <span>
              {filteredProjectCount}{" "}
              {filteredProjectCount === 1
                ? "proyecto encontrado"
                : "proyectos encontrados"}
            </span>

            {hasActiveProjectFilters && (
              <button type="button" onClick={handleClearProjectFilters}>
                Limpiar filtros
              </button>
            )}
          </div>

          {filteredClientGroups.length === 0 && (
            <div className="admin-projects__empty-search">
              No se encontraron clientes o proyectos con esa búsqueda.
            </div>
          )}

          <div className="admin-projects__list">
            {displayedProjectGroups.map(
              ({ client, projects: clientProjects }) => (
                <section
                  className="admin-projects__client-group"
                  key={client._id || client.email}
                >
                  {projectViewMode === "clients" && (
                    <div className="admin-projects__client-group-header">
                      <div className="admin-projects__client-group-avatar">
                        {(client.name || "C").charAt(0).toUpperCase()}
                      </div>

                      <div className="admin-projects__client-group-info">
                        <span>Cliente</span>

                        <h2>{client.name}</h2>

                        <small>{client.email}</small>
                      </div>

                      <strong className="admin-projects__client-project-count">
                        {clientProjects.length}{" "}
                        {clientProjects.length === 1 ? "proyecto" : "proyectos"}
                      </strong>
                    </div>
                  )}

                  <div className="admin-projects__client-projects">
                    {clientProjects.map((project) => {
                      const projectTasks = tasksByProject[project._id] || [];

                      const taskCounts = {
                        active: projectTasks.filter(
                          (task) =>
                            !task.isArchived &&
                            ["pending", "in_progress"].includes(task.status),
                        ).length,

                        review: projectTasks.filter(
                          (task) =>
                            !task.isArchived && task.status === "review",
                        ).length,

                        completed: projectTasks.filter(
                          (task) =>
                            !task.isArchived && task.status === "completed",
                        ).length,

                        cancelled: projectTasks.filter(
                          (task) =>
                            !task.isArchived && task.status === "cancelled",
                        ).length,

                        archived: projectTasks.filter((task) => task.isArchived)
                          .length,

                        all: projectTasks.filter((task) => !task.isArchived)
                          .length,
                      };

                      const filteredProjectTasks = projectTasks.filter(
                        (task) => {
                          if (taskFilter === "all") {
                            return !task.isArchived;
                          }

                          if (taskFilter === "archived") {
                            return task.isArchived;
                          }

                          if (task.isArchived) {
                            return false;
                          }

                          if (taskFilter === "active") {
                            return ["pending", "in_progress"].includes(
                              task.status,
                            );
                          }

                          if (taskFilter === "review") {
                            return task.status === "review";
                          }

                          if (taskFilter === "completed") {
                            return task.status === "completed";
                          }

                          if (taskFilter === "cancelled") {
                            return task.status === "cancelled";
                          }

                          return true;
                        },
                      );

                      const taskForm = taskForms[project._id] || {
                        title: "",
                        description: "",
                        assignedTo: "",
                        priority: "medium",
                        dueDate: "",
                        clientVisible: false,
                      };

                      return (
                        <article
                          className="admin-projects__card"
                          key={project._id}
                        >
                          <div className="admin-projects__main">
                            <div>
                              <span className="admin-projects__service-label">
                                Servicio
                              </span>

                              <h2 className="admin-projects__service">
                                {project.serviceName}
                              </h2>
                            </div>

                            {projectViewMode === "projects" && (
                              <div className="admin-projects__flat-client">
                                <span>Cliente</span>

                                <strong>
                                  {project.user?.name || "Cliente"}
                                </strong>

                                <small>{project.user?.email || ""}</small>
                              </div>
                            )}
                          </div>

                          <div className="admin-projects__progress-info">
                            <span>
                              Estado actual:{" "}
                              <strong>
                                {statusLabels[project.status] || project.status}
                              </strong>
                            </span>

                            <span>
                              Responsable:{" "}
                              <strong>
                                {project.assignedTo?.name || "Sin asignar"}
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

                          {project.status === "cancelled" && (
                            <div className="admin-projects__cancelled-project">
                              Proyecto cancelado
                            </div>
                          )}

                          <div
                            className={`admin-projects__status-stepper ${
                              project.status === "cancelled"
                                ? "is-cancelled"
                                : ""
                            }`}
                          >
                            {projectStatusSteps.map((status, index) => {
                              const currentStatusIndex = getProjectStatusIndex(
                                project.status,
                              );

                              const isCompleted =
                                currentStatusIndex !== -1 &&
                                index < currentStatusIndex;

                              const isCurrent = status === project.status;

                              return (
                                <div
                                  className={`admin-projects__status-step ${
                                    isCompleted ? "is-completed" : ""
                                  } ${isCurrent ? "is-current" : ""}`}
                                  key={status}
                                >
                                  <div className="admin-projects__status-step-marker">
                                    {isCompleted ? "✓" : index + 1}
                                  </div>

                                  <span>{statusLabels[status] || status}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="admin-projects__project-toggle">
                            <button
                              type="button"
                              onClick={() => handleToggleProject(project._id)}
                            >
                              {expandedProjects[project._id]
                                ? "Ocultar detalles"
                                : "Ver proyecto"}
                            </button>
                          </div>

                          {expandedProjects[project._id] && (
                            <>
                              <div className="admin-projects__controls">
                                <label>
                                  <span>Nuevo estado</span>

                                  <select
                                    value={
                                      statusDrafts[project._id] ||
                                      project.status
                                    }
                                    onChange={(event) =>
                                      handleStatusChange(
                                        project._id,
                                        event.target.value,
                                      )
                                    }
                                  >
                                    <option value="brief_received">
                                      Brief recibido
                                    </option>

                                    <option value="planning">Planeación</option>

                                    <option value="in_progress">
                                      En desarrollo
                                    </option>

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
                                        <option
                                          key={member._id}
                                          value={member._id}
                                        >
                                          {member.name} —{" "}
                                          {member.role === "admin"
                                            ? "Admin"
                                            : "Empleado"}
                                        </option>
                                      ))}
                                    </select>
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSaveAssignee(project._id)
                                    }
                                    disabled={
                                      savingAssigneeProjectId === project._id
                                    }
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

                                  <strong>{filteredProjectTasks.length}</strong>
                                </div>

                                <div className="admin-projects__task-filters">
                                  <button
                                    type="button"
                                    className={
                                      taskFilter === "active" ? "is-active" : ""
                                    }
                                    onClick={() => setTaskFilter("active")}
                                  >
                                    Activas ({taskCounts.active})
                                  </button>

                                  <button
                                    type="button"
                                    className={
                                      taskFilter === "review" ? "is-active" : ""
                                    }
                                    onClick={() => setTaskFilter("review")}
                                  >
                                    En revisión ({taskCounts.review})
                                  </button>

                                  <button
                                    type="button"
                                    className={
                                      taskFilter === "completed"
                                        ? "is-active"
                                        : ""
                                    }
                                    onClick={() => setTaskFilter("completed")}
                                  >
                                    Completadas ({taskCounts.completed})
                                  </button>

                                  <button
                                    type="button"
                                    className={
                                      taskFilter === "cancelled"
                                        ? "is-active"
                                        : ""
                                    }
                                    onClick={() => setTaskFilter("cancelled")}
                                  >
                                    Canceladas ({taskCounts.cancelled})
                                  </button>

                                  <button
                                    type="button"
                                    className={
                                      taskFilter === "archived"
                                        ? "is-active"
                                        : ""
                                    }
                                    onClick={() => setTaskFilter("archived")}
                                  >
                                    Archivadas ({taskCounts.archived})
                                  </button>

                                  <button
                                    type="button"
                                    className={
                                      taskFilter === "all" ? "is-active" : ""
                                    }
                                    onClick={() => setTaskFilter("all")}
                                  >
                                    Todas ({taskCounts.all})
                                  </button>
                                </div>

                                {filteredProjectTasks.length === 0 ? (
                                  <p className="admin-projects__empty">
                                    No hay tareas para este filtro.
                                  </p>
                                ) : (
                                  <div className="admin-projects__tasks-list">
                                    {filteredProjectTasks.map((task) => {
                                      const isEditing =
                                        editingTaskId === task._id;

                                      const editForm = taskEditForms[
                                        task._id
                                      ] || {
                                        title: task.title || "",

                                        description: task.description || "",

                                        assignedTo: getAssigneeId(
                                          task.assignedTo,
                                        ),

                                        priority: task.priority || "medium",

                                        dueDate: task.dueDate
                                          ? new Date(task.dueDate)
                                              .toISOString()
                                              .slice(0, 10)
                                          : "",

                                        clientVisible: Boolean(
                                          task.clientVisible,
                                        ),
                                      };

                                      return (
                                        <article
                                          className="admin-projects__task"
                                          key={task._id}
                                        >
                                          {!isEditing ? (
                                            <>
                                              <div>
                                                <h4>{task.title}</h4>

                                                {task.description && (
                                                  <p>{task.description}</p>
                                                )}
                                              </div>

                                              <div className="admin-projects__task-meta">
                                                <span>
                                                  Estado:{" "}
                                                  <strong>
                                                    {taskStatusLabels[
                                                      task.status
                                                    ] || task.status}
                                                  </strong>
                                                </span>

                                                <span>
                                                  Prioridad:{" "}
                                                  <strong>
                                                    {priorityLabels[
                                                      task.priority
                                                    ] || task.priority}
                                                  </strong>
                                                </span>

                                                <span>
                                                  Responsable:{" "}
                                                  <strong>
                                                    {task.assignedTo?.name ||
                                                      "Sin asignar"}
                                                  </strong>
                                                </span>

                                                <span>
                                                  Fecha límite:{" "}
                                                  <strong>
                                                    {task.dueDate
                                                      ? new Date(
                                                          task.dueDate,
                                                        ).toLocaleDateString(
                                                          "es-MX",
                                                        )
                                                      : "Sin fecha"}
                                                  </strong>
                                                </span>

                                                <span>
                                                  Cliente:{" "}
                                                  <strong>
                                                    {task.clientVisible
                                                      ? "Visible"
                                                      : "Interna"}
                                                  </strong>
                                                </span>

                                                {task.status === "review" && (
                                                  <>
                                                    <div className="admin-projects__review-actions">
                                                      <button
                                                        type="button"
                                                        className="admin-projects__request-changes"
                                                        onClick={() => {
                                                          setRequestChangesTaskId(
                                                            task._id,
                                                          );

                                                          setErrorMessage("");
                                                          setSuccessMessage("");
                                                        }}
                                                        disabled={
                                                          updatingTaskId ===
                                                          task._id
                                                        }
                                                      >
                                                        Solicitar cambios
                                                      </button>

                                                      <button
                                                        type="button"
                                                        className="admin-projects__approve-task"
                                                        onClick={() =>
                                                          setApproveTaskModal({
                                                            projectId:
                                                              project._id,
                                                            taskId: task._id,
                                                            taskTitle:
                                                              task.title,
                                                          })
                                                        }
                                                        disabled={
                                                          updatingTaskId ===
                                                          task._id
                                                        }
                                                      >
                                                        Aprobar tarea
                                                      </button>
                                                    </div>

                                                    {requestChangesTaskId ===
                                                      task._id && (
                                                      <div className="admin-projects__changes-form">
                                                        <label>
                                                          <span>
                                                            ¿Qué debe
                                                            corregirse?
                                                          </span>

                                                          <textarea
                                                            rows="4"
                                                            value={
                                                              reviewMessages[
                                                                task._id
                                                              ] || ""
                                                            }
                                                            onChange={(event) =>
                                                              handleReviewMessageChange(
                                                                task._id,
                                                                event.target
                                                                  .value,
                                                              )
                                                            }
                                                            placeholder="Describe claramente los cambios que debe realizar el responsable..."
                                                          />
                                                        </label>

                                                        <div className="admin-projects__changes-form-actions">
                                                          <button
                                                            type="button"
                                                            className="admin-projects__changes-back"
                                                            onClick={() => {
                                                              setRequestChangesTaskId(
                                                                null,
                                                              );

                                                              setErrorMessage(
                                                                "",
                                                              );
                                                            }}
                                                            disabled={
                                                              updatingTaskId ===
                                                              task._id
                                                            }
                                                          >
                                                            Volver
                                                          </button>

                                                          <button
                                                            type="button"
                                                            className="admin-projects__changes-submit"
                                                            onClick={() =>
                                                              handleReviewDecision(
                                                                project._id,
                                                                task._id,
                                                                "changes",
                                                              )
                                                            }
                                                            disabled={
                                                              updatingTaskId ===
                                                              task._id
                                                            }
                                                          >
                                                            {updatingTaskId ===
                                                            task._id
                                                              ? "Enviando..."
                                                              : "Enviar solicitud"}
                                                          </button>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </>
                                                )}

                                                <div className="admin-projects__task-actions">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleStartEditTask(task)
                                                    }
                                                    disabled={
                                                      updatingTaskId ===
                                                        task._id ||
                                                      task.status ===
                                                        "cancelled"
                                                    }
                                                  >
                                                    Editar
                                                  </button>

                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleToggleTaskActivity(
                                                        task._id,
                                                      )
                                                    }
                                                  >
                                                    {openActivityTaskId ===
                                                    task._id
                                                      ? "Ocultar historial"
                                                      : "Ver historial"}
                                                  </button>

                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleToggleTaskDeliverables(
                                                        task._id,
                                                      )
                                                    }
                                                  >
                                                    {openDeliverablesTaskId ===
                                                    task._id
                                                      ? "Ocultar entregables"
                                                      : "Ver entregables"}
                                                  </button>

                                                  {task.isArchived ? (
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        handleToggleTaskArchive(
                                                          project._id,
                                                          task._id,
                                                          false,
                                                        )
                                                      }
                                                      disabled={
                                                        updatingTaskId ===
                                                        task._id
                                                      }
                                                    >
                                                      Desarchivar
                                                    </button>
                                                  ) : (
                                                    [
                                                      "completed",
                                                      "cancelled",
                                                    ].includes(task.status) && (
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          setArchiveTaskModal({
                                                            projectId:
                                                              project._id,
                                                            taskId: task._id,
                                                            taskTitle:
                                                              task.title,
                                                          })
                                                        }
                                                        disabled={
                                                          updatingTaskId ===
                                                          task._id
                                                        }
                                                      >
                                                        Archivar
                                                      </button>
                                                    )
                                                  )}

                                                  <button
                                                    type="button"
                                                    className="admin-projects__task-cancel"
                                                    onClick={() =>
                                                      setCancelTaskModal({
                                                        projectId: project._id,
                                                        taskId: task._id,
                                                        taskTitle: task.title,
                                                      })
                                                    }
                                                    disabled={
                                                      updatingTaskId ===
                                                        task._id ||
                                                      task.status ===
                                                        "cancelled"
                                                    }
                                                  >
                                                    {task.status === "cancelled"
                                                      ? "Cancelada"
                                                      : "Cancelar"}
                                                  </button>
                                                </div>
                                              </div>

                                              {openDeliverablesTaskId ===
                                                task._id && (
                                                <div className="admin-projects__task-deliverables">
                                                  <h5>
                                                    Entregables de la tarea
                                                  </h5>

                                                  {loadingDeliverablesTaskId ===
                                                  task._id ? (
                                                    <p>
                                                      Cargando entregables...
                                                    </p>
                                                  ) : taskDeliverablesById[
                                                      task._id
                                                    ]?.length ? (
                                                    <div className="admin-projects__deliverables-list">
                                                      {taskDeliverablesById[
                                                        task._id
                                                      ].map((deliverable) => (
                                                        <div
                                                          className="admin-projects__deliverable-item"
                                                          key={deliverable._id}
                                                        >
                                                          <div className="admin-projects__deliverable-info">
                                                            <strong>
                                                              {deliverable.name}
                                                            </strong>

                                                            <span>
                                                              {deliverableSourceLabels[
                                                                deliverable
                                                                  .source
                                                              ] ||
                                                                deliverable.source}
                                                            </span>
                                                          </div>

                                                          <a
                                                            href={
                                                              deliverable.url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                          >
                                                            {deliverable.source ===
                                                            "canva"
                                                              ? "Abrir en Canva"
                                                              : deliverable.source ===
                                                                  "drive"
                                                                ? "Abrir en Drive"
                                                                : deliverable.source ===
                                                                    "affinity"
                                                                  ? "Abrir en Affinity"
                                                                  : deliverable.source ===
                                                                      "upload"
                                                                    ? "Abrir archivo"
                                                                    : "Abrir enlace"}
                                                          </a>

                                                          <small>
                                                            Agregado por{" "}
                                                            {deliverable
                                                              .uploadedBy
                                                              ?.name ||
                                                              "Usuario BeeUX"}
                                                            {" · "}
                                                            {new Date(
                                                              deliverable.createdAt,
                                                            ).toLocaleString(
                                                              "es-MX",
                                                            )}
                                                          </small>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  ) : (
                                                    <p>
                                                      Todavía no hay entregables
                                                      para esta tarea.
                                                    </p>
                                                  )}
                                                </div>
                                              )}

                                              {openActivityTaskId ===
                                                task._id && (
                                                <div className="admin-projects__task-activity">
                                                  <h5>
                                                    Historial de actividad
                                                  </h5>

                                                  {task.status !==
                                                    "cancelled" && (
                                                    <div className="admin-projects__task-comment-form">
                                                      <textarea
                                                        rows="3"
                                                        value={
                                                          taskComments[
                                                            task._id
                                                          ] || ""
                                                        }
                                                        onChange={(event) =>
                                                          handleTaskCommentChange(
                                                            task._id,
                                                            event.target.value,
                                                          )
                                                        }
                                                        placeholder="Escribe una nota o comentario sobre esta tarea..."
                                                      />

                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          handleAddTaskComment(
                                                            task._id,
                                                          )
                                                        }
                                                        disabled={
                                                          sendingCommentTaskId ===
                                                          task._id
                                                        }
                                                      >
                                                        {sendingCommentTaskId ===
                                                        task._id
                                                          ? "Enviando..."
                                                          : "Agregar comentario"}
                                                      </button>
                                                    </div>
                                                  )}

                                                  {loadingActivityTaskId ===
                                                  task._id ? (
                                                    <p>Cargando historial...</p>
                                                  ) : taskActivityById[task._id]
                                                      ?.length ? (
                                                    <div className="admin-projects__activity-list">
                                                      {taskActivityById[
                                                        task._id
                                                      ].map((activity) => (
                                                        <div
                                                          className="admin-projects__activity-item"
                                                          key={activity._id}
                                                        >
                                                          <strong>
                                                            {activity.user
                                                              ?.name ||
                                                              "Usuario BeeUX"}
                                                          </strong>

                                                          <span>
                                                            {activity.fromStatus &&
                                                            activity.toStatus
                                                              ? `${
                                                                  taskStatusLabels[
                                                                    activity
                                                                      .fromStatus
                                                                  ] ||
                                                                  activity.fromStatus
                                                                } → ${
                                                                  taskStatusLabels[
                                                                    activity
                                                                      .toStatus
                                                                  ] ||
                                                                  activity.toStatus
                                                                }`
                                                              : activity.type ===
                                                                  "comment"
                                                                ? "Comentario"
                                                                : activity.type}
                                                          </span>

                                                          {activity.message && (
                                                            <p>
                                                              {activity.message}
                                                            </p>
                                                          )}

                                                          <small>
                                                            {new Date(
                                                              activity.createdAt,
                                                            ).toLocaleString(
                                                              "es-MX",
                                                            )}
                                                          </small>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  ) : (
                                                    <p>
                                                      Todavía no hay actividad
                                                      registrada para esta
                                                      tarea.
                                                    </p>
                                                  )}
                                                </div>
                                              )}
                                            </>
                                          ) : (
                                            <div className="admin-projects__task-edit">
                                              <label>
                                                <span>Título</span>

                                                <input
                                                  type="text"
                                                  value={editForm.title}
                                                  onChange={(event) =>
                                                    handleTaskEditChange(
                                                      task._id,
                                                      "title",
                                                      event.target.value,
                                                    )
                                                  }
                                                />
                                              </label>

                                              <label>
                                                <span>Responsable</span>

                                                <select
                                                  value={editForm.assignedTo}
                                                  onChange={(event) =>
                                                    handleTaskEditChange(
                                                      task._id,
                                                      "assignedTo",
                                                      event.target.value,
                                                    )
                                                  }
                                                >
                                                  <option value="">
                                                    Sin asignar
                                                  </option>

                                                  {teamMembers.map((member) => (
                                                    <option
                                                      key={member._id}
                                                      value={member._id}
                                                    >
                                                      {member.name} —{" "}
                                                      {member.role === "admin"
                                                        ? "Admin"
                                                        : "Empleado"}
                                                    </option>
                                                  ))}
                                                </select>
                                              </label>

                                              <label>
                                                <span>Prioridad</span>

                                                <select
                                                  value={editForm.priority}
                                                  onChange={(event) =>
                                                    handleTaskEditChange(
                                                      task._id,
                                                      "priority",
                                                      event.target.value,
                                                    )
                                                  }
                                                >
                                                  <option value="low">
                                                    Baja
                                                  </option>

                                                  <option value="medium">
                                                    Media
                                                  </option>

                                                  <option value="high">
                                                    Alta
                                                  </option>

                                                  <option value="urgent">
                                                    Urgente
                                                  </option>
                                                </select>
                                              </label>

                                              <label>
                                                <span>Fecha límite</span>

                                                <input
                                                  type="date"
                                                  value={editForm.dueDate}
                                                  onChange={(event) =>
                                                    handleTaskEditChange(
                                                      task._id,
                                                      "dueDate",
                                                      event.target.value,
                                                    )
                                                  }
                                                />
                                              </label>

                                              <label className="admin-projects__task-edit-description">
                                                <span>Descripción</span>

                                                <textarea
                                                  rows="4"
                                                  value={editForm.description}
                                                  onChange={(event) =>
                                                    handleTaskEditChange(
                                                      task._id,
                                                      "description",
                                                      event.target.value,
                                                    )
                                                  }
                                                />
                                              </label>

                                              <label className="admin-projects__visibility">
                                                <input
                                                  type="checkbox"
                                                  checked={
                                                    editForm.clientVisible
                                                  }
                                                  onChange={(event) =>
                                                    handleTaskEditChange(
                                                      task._id,
                                                      "clientVisible",
                                                      event.target.checked,
                                                    )
                                                  }
                                                />

                                                <span>
                                                  Mostrar esta tarea al cliente
                                                </span>
                                              </label>

                                              <div className="admin-projects__task-edit-actions">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleSaveTaskEdit(
                                                      project._id,
                                                      task._id,
                                                    )
                                                  }
                                                  disabled={
                                                    updatingTaskId === task._id
                                                  }
                                                >
                                                  {updatingTaskId === task._id
                                                    ? "Guardando..."
                                                    : "Guardar"}
                                                </button>

                                                <button
                                                  type="button"
                                                  className="admin-projects__task-edit-cancel"
                                                  onClick={() =>
                                                    setEditingTaskId(null)
                                                  }
                                                  disabled={
                                                    updatingTaskId === task._id
                                                  }
                                                >
                                                  Cerrar
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </article>
                                      );
                                    })}
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
                                          <option
                                            key={member._id}
                                            value={member._id}
                                          >
                                            {member.name} —{" "}
                                            {member.role === "admin"
                                              ? "Admin"
                                              : "Empleado"}
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
                                    onClick={() =>
                                      handleCreateTask(project._id)
                                    }
                                    disabled={
                                      creatingTaskProjectId === project._id
                                    }
                                  >
                                    {creatingTaskProjectId === project._id
                                      ? "Creando tarea..."
                                      : "+ Crear tarea"}
                                  </button>
                                </div>
                              </section>
                            </>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ),
            )}
          </div>
        </div>
      </main>

      {approveTaskModal && (
        <div className="admin-projects__modal-backdrop" role="presentation">
          <div
            className="admin-projects__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-task-title"
          >
            <span className="admin-projects__modal-eyebrow">
              Confirmar aprobación
            </span>

            <h2 id="approve-task-title">¿Aprobar esta tarea?</h2>

            <p>
              La tarea <strong>{approveTaskModal.taskTitle}</strong> se marcará
              como completada y quedará registrada en el historial.
            </p>

            <div className="admin-projects__modal-actions">
              <button
                type="button"
                className="admin-projects__modal-back"
                onClick={() => setApproveTaskModal(null)}
                disabled={updatingTaskId === approveTaskModal.taskId}
              >
                Volver
              </button>

              <button
                type="button"
                className="admin-projects__modal-confirm"
                onClick={() => {
                  const { projectId, taskId } = approveTaskModal;

                  setApproveTaskModal(null);

                  handleReviewDecision(projectId, taskId, "approve");
                }}
                disabled={updatingTaskId === approveTaskModal.taskId}
              >
                Aprobar tarea
              </button>
            </div>
          </div>
        </div>
      )}

      {archiveTaskModal && (
        <div className="admin-projects__modal-backdrop" role="presentation">
          <div
            className="admin-projects__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-task-title"
          >
            <span className="admin-projects__modal-eyebrow">
              Confirmar archivo
            </span>

            <h2 id="archive-task-title">¿Archivar esta tarea?</h2>

            <p>
              La tarea <strong>{archiveTaskModal.taskTitle}</strong> dejará de
              aparecer en las vistas operativas, pero conservará su historial y
              sus entregables.
            </p>

            <div className="admin-projects__modal-actions">
              <button
                type="button"
                className="admin-projects__modal-back"
                onClick={() => setArchiveTaskModal(null)}
                disabled={updatingTaskId === archiveTaskModal.taskId}
              >
                Volver
              </button>

              <button
                type="button"
                className="admin-projects__modal-confirm"
                onClick={() => {
                  const { projectId, taskId } = archiveTaskModal;

                  setArchiveTaskModal(null);

                  handleToggleTaskArchive(projectId, taskId, true);
                }}
                disabled={updatingTaskId === archiveTaskModal.taskId}
              >
                Archivar tarea
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelTaskModal && (
        <div className="admin-projects__modal-backdrop" role="presentation">
          <div
            className="admin-projects__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-task-title"
          >
            <span className="admin-projects__modal-eyebrow">
              Confirmar cancelación
            </span>

            <h2 id="cancel-task-title">¿Cancelar esta tarea?</h2>

            <p>
              La tarea <strong>{cancelTaskModal.taskTitle}</strong> se marcará
              como cancelada. Su historial y sus entregables se conservarán para
              consulta.
            </p>

            <div className="admin-projects__modal-actions">
              <button
                type="button"
                className="admin-projects__modal-back"
                onClick={() => setCancelTaskModal(null)}
                disabled={updatingTaskId === cancelTaskModal.taskId}
              >
                Volver
              </button>

              <button
                type="button"
                className="admin-projects__modal-danger"
                onClick={() => {
                  const { projectId, taskId } = cancelTaskModal;

                  setCancelTaskModal(null);

                  handleCancelTask(projectId, taskId);
                }}
                disabled={updatingTaskId === cancelTaskModal.taskId}
              >
                Cancelar tarea
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default AdminProjects;
