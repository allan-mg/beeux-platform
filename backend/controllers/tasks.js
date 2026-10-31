const Task = require("../models/task");
const Project = require("../models/project");
const User = require("../models/user");
const TaskActivity = require("../models/taskActivity");
const TaskDeliverable = require("../models/taskDeliverable");

const getProjectTasks = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      throw error;
    }

    const tasks = await Task.find({
      project: project._id,
    })
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ order: 1, createdAt: 1 });

    res.send(tasks);
  } catch (error) {
    next(error);
  }
};

const createProjectTask = async (req, res, next) => {
  try {
    const {
      title,
      description = "",
      assignedTo = null,
      priority = "medium",
      dueDate = null,
      clientVisible = false,
      order = 0,
    } = req.body;

    if (!title || !title.trim()) {
      const error = new Error("Task title is required");
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      throw error;
    }

    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);

      if (!assignedUser) {
        const error = new Error("Assigned user not found");
        error.statusCode = 404;
        throw error;
      }

      if (!["employee", "admin"].includes(assignedUser.role)) {
        const error = new Error(
          "Tasks can only be assigned to employees or admins",
        );
        error.statusCode = 400;
        throw error;
      }
    }

    const task = await Task.create({
      project: project._id,
      assignedTo,
      createdBy: req.user._id,
      title: title.trim(),
      description,
      priority,
      dueDate,
      clientVisible,
      order,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    res.status(201).send(populatedTask);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      assignedTo,
      status,
      priority,
      dueDate,
      clientVisible,
      order,
      reviewMessage,
    } = req.body;

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    if (task.status === "cancelled") {
      const error = new Error("Cancelled tasks cannot be modified");
      error.statusCode = 400;
      throw error;
    }

    const previousStatus = task.status;

    if (assignedTo !== undefined && assignedTo !== null) {
      const assignedUser = await User.findById(assignedTo);

      if (!assignedUser) {
        const error = new Error("Assigned user not found");
        error.statusCode = 404;
        throw error;
      }

      if (!["employee", "admin"].includes(assignedUser.role)) {
        const error = new Error(
          "Tasks can only be assigned to employees or admins",
        );
        error.statusCode = 400;
        throw error;
      }
    }

    if (title !== undefined) {
      if (!title.trim()) {
        const error = new Error("Task title cannot be empty");
        error.statusCode = 400;
        throw error;
      }

      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description;
    }

    if (assignedTo !== undefined) {
      task.assignedTo = assignedTo || null;
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate || null;
    }

    if (clientVisible !== undefined) {
      task.clientVisible = clientVisible;
    }

    if (order !== undefined) {
      task.order = order;
    }

    if (status !== undefined) {
      task.status = status;

      if (status === "completed") {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }

      if (status === "cancelled") {
        task.cancelledAt = new Date();
      } else {
        task.cancelledAt = null;
      }
    }

    if (status === "pending" && previousStatus === "review") {
      task.status = "pending";
    }

    await task.save();

    if (status !== undefined && status !== previousStatus) {
      let activityType = "status_change";
      let activityMessage = "";

      if (status === "review") {
        activityType = "review_requested";
        activityMessage = "La tarea fue enviada a revisión.";
      }

      if (previousStatus === "review" && status === "pending") {
        activityType = "changes_requested";

        activityMessage =
          reviewMessage?.trim() ||
          "El administrador solicitó cambios en la tarea.";
      }

      if (status === "completed") {
        activityType = "approved";
        activityMessage = "La tarea fue aprobada y marcada como completada.";
      }

      if (status === "cancelled") {
        activityMessage = "La tarea fue cancelada.";
      }

      await TaskActivity.create({
        task: task._id,
        project: task.project,
        user: req.user._id,
        type: activityType,
        fromStatus: previousStatus,
        toStatus: status,
        message: activityMessage,
      });
    }

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    res.send(updatedTask);
  } catch (error) {
    next(error);
  }
};

const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
    })
      .populate("project", "serviceName serviceSlug status progress")
      .populate("createdBy", "name email role")
      .sort({ dueDate: 1, createdAt: 1 });

    res.send(tasks);
  } catch (error) {
    next(error);
  }
};

const updateMyTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "in_progress", "review"];

    if (!allowedStatuses.includes(status)) {
      const error = new Error("Invalid task status");
      error.statusCode = 400;
      throw error;
    }

    const task = await Task.findOne({
      _id: req.params.taskId,
      assignedTo: req.user._id,
    });

    if (!task) {
      const error = new Error("Task not found or not assigned to you");
      error.statusCode = 404;
      throw error;
    }

    if (task.status === "cancelled") {
      const error = new Error("Cancelled tasks cannot be modified");
      error.statusCode = 400;
      throw error;
    }

    const previousStatus = task.status;

    task.status = status;

    if (status === "completed") {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();

    if (status !== previousStatus) {
      await TaskActivity.create({
        task: task._id,
        project: task.project,
        user: req.user._id,
        type: status === "review" ? "review_requested" : "status_change",
        fromStatus: previousStatus,
        toStatus: status,
        message: status === "review" ? "La tarea fue enviada a revisión." : "",
      });
    }

    const updatedTask = await Task.findById(task._id)
      .populate("project", "serviceName serviceSlug status progress")
      .populate("createdBy", "name email role");

    res.send(updatedTask);
  } catch (error) {
    next(error);
  }
};

const getTaskActivity = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    const activities = await TaskActivity.find({
      task: task._id,
    })
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    res.send(activities);
  } catch (error) {
    next(error);
  }
};

const addTaskComment = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      const error = new Error("Comment message is required");
      error.statusCode = 400;
      throw error;
    }

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    if (task.status === "cancelled") {
      const error = new Error("Cancelled tasks cannot receive comments");
      error.statusCode = 400;
      throw error;
    }

    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (
      currentUser.role === "employee" &&
      String(task.assignedTo) !== String(currentUser._id)
    ) {
      const error = new Error("You can only comment on tasks assigned to you");
      error.statusCode = 403;
      throw error;
    }

    if (!["employee", "admin"].includes(currentUser.role)) {
      const error = new Error("You are not allowed to comment on this task");
      error.statusCode = 403;
      throw error;
    }

    const activity = await TaskActivity.create({
      task: task._id,
      project: task.project,
      user: currentUser._id,
      type: "comment",
      message: message.trim(),
    });

    const populatedActivity = await TaskActivity.findById(
      activity._id,
    ).populate("user", "name email role");

    res.status(201).send(populatedActivity);
  } catch (error) {
    next(error);
  }
};

const getMyTaskActivity = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      assignedTo: req.user._id,
    });

    if (!task) {
      const error = new Error("Task not found or not assigned to you");
      error.statusCode = 404;
      throw error;
    }

    const activities = await TaskActivity.find({
      task: task._id,
    })
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    res.send(activities);
  } catch (error) {
    next(error);
  }
};

const addMyTaskDeliverable = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const {
      name,
      url,
      source = "external",
      externalId = "",
      externalUrl = "",
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).send({
        message: "El entregable debe tener un nombre.",
      });
    }

    if (!url?.trim()) {
      return res.status(400).send({
        message: "El entregable debe incluir una URL.",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).send({
        message: "No se encontró la tarea.",
      });
    }

    if (!task.assignedTo || task.assignedTo.toString() !== req.user._id) {
      return res.status(403).send({
        message: "No tienes permiso para agregar entregables a esta tarea.",
      });
    }

    if (task.status === "cancelled") {
      return res.status(400).send({
        message: "No puedes agregar entregables a una tarea cancelada.",
      });
    }

    const deliverable = await TaskDeliverable.create({
      task: task._id,
      project: task.project,
      uploadedBy: req.user._id,
      type: "link",
      source,
      name: name.trim(),
      url: url.trim(),
      externalId: externalId.trim(),
      externalUrl: externalUrl.trim(),
      clientVisible: false,
      status: "submitted",
    });

    const populatedDeliverable = await TaskDeliverable.findById(
      deliverable._id,
    ).populate("uploadedBy", "name email");

    return res.status(201).send(populatedDeliverable);
  } catch (error) {
    return next(error);
  }
};

const getTaskDeliverables = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).send({
        message: "No se encontró la tarea.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send({
        message: "No se encontró el usuario.",
      });
    }

    const isAdmin = user.role === "admin";

    const isAssignedEmployee =
      task.assignedTo && task.assignedTo.toString() === req.user._id;

    if (!isAdmin && !isAssignedEmployee) {
      return res.status(403).send({
        message:
          "No tienes permiso para consultar los entregables de esta tarea.",
      });
    }

    const deliverables = await TaskDeliverable.find({
      task: taskId,
    })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    return res.send(deliverables);
  } catch (error) {
    return next(error);
  }
};

const reviewTaskDeliverable = async (req, res, next) => {
  try {
    const { deliverableId } = req.params;
    const { decision, reviewMessage = "" } = req.body;

    if (!["approve", "changes"].includes(decision)) {
      return res.status(400).send({
        message: "La decisión de revisión no es válida.",
      });
    }

    if (decision === "changes" && !reviewMessage.trim()) {
      return res.status(400).send({
        message: "Escribe qué cambios debe realizar el responsable.",
      });
    }

    const deliverable = await TaskDeliverable.findById(deliverableId);

    if (!deliverable) {
      return res.status(404).send({
        message: "No se encontró el entregable.",
      });
    }

    const task = await Task.findById(deliverable.task);

    if (!task) {
      return res.status(404).send({
        message: "No se encontró la tarea asociada.",
      });
    }

    if (task.status === "cancelled") {
      return res.status(400).send({
        message: "No se pueden revisar entregables de una tarea cancelada.",
      });
    }

    deliverable.status =
      decision === "approve" ? "approved" : "changes_requested";

    deliverable.reviewedBy = req.user._id;
    deliverable.reviewedAt = new Date();

    deliverable.reviewMessage =
      decision === "changes" ? reviewMessage.trim() : "";

    await deliverable.save();

    const populatedDeliverable = await TaskDeliverable.findById(deliverable._id)
      .populate("uploadedBy", "name email")
      .populate("reviewedBy", "name email role");

    return res.send(populatedDeliverable);
  } catch (error) {
    return next(error);
  }
};

const toggleTaskArchive = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { isArchived } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).send({
        message: "No se encontró la tarea.",
      });
    }

    task.isArchived = Boolean(isArchived);

    task.archivedAt = task.isArchived ? new Date() : null;

    task.archivedBy = task.isArchived ? req.user._id : null;

    await task.save();

    return res.send(task);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyTasks,
  getProjectTasks,
  getTaskActivity,
  getMyTaskActivity,
  createProjectTask,
  updateTask,
  updateMyTaskStatus,
  addTaskComment,
  addMyTaskDeliverable,
  getTaskDeliverables,
  toggleTaskArchive,
  reviewTaskDeliverable,
};
