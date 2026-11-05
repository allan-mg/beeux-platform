const Project = require("../models/project");
const User = require("../models/user");
const Task = require("../models/task");
const TaskActivity = require("../models/taskActivity");
const TaskDeliverable = require("../models/taskDeliverable");

const projectProgressByStatus = {
  brief_received: 10,
  planning: 25,
  in_progress: 60,
  review: 85,
  delivered: 100,
};

const getMyProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      user: req.user._id,
    })
      .populate("order")
      .populate("contract")
      .populate("brief")
      .sort({ createdAt: -1 });

    res.send(projects);
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      user: req.user._id,
    })
      .populate("order")
      .populate("contract")
      .populate("brief");

    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      throw error;
    }

    res.send(project);
  } catch (error) {
    next(error);
  }
};

const getProjectDeliverables = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).send({
        message: "No se encontró el proyecto.",
      });
    }

    const deliverables = await TaskDeliverable.find({
      project: project._id,
      status: "approved",
      clientVisible: true,
    })
      .populate("uploadedBy", "name")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    return res.send(deliverables);
  } catch (error) {
    return next(error);
  }
};

const updateProjectStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "brief_received",
      "planning",
      "in_progress",
      "review",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      const error = new Error("Invalid project status");
      error.statusCode = 400;
      throw error;
    }

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      throw error;
    }

    project.status = status;

    if (projectProgressByStatus[status] !== undefined) {
      project.progress = projectProgressByStatus[status];
    }

    if (["planning", "in_progress"].includes(status) && !project.startedAt) {
      project.startedAt = new Date();
    }

    if (status === "delivered") {
      project.deliveredAt = new Date();
    } else {
      project.deliveredAt = null;
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("order")
      .populate("contract")
      .populate("brief");

    res.send(updatedProject);
  } catch (error) {
    next(error);
  }
};

const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate("user", "name email")
      .populate("order")
      .populate("contract")
      .populate("brief")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.send(projects);
  } catch (error) {
    next(error);
  }
};

const updateProjectAssignee = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      throw error;
    }

    if (assignedTo) {
      const user = await User.findById(assignedTo);

      if (!user) {
        const error = new Error("Assigned user not found");
        error.statusCode = 404;
        throw error;
      }

      if (!["employee", "admin"].includes(user.role)) {
        const error = new Error(
          "Project can only be assigned to an employee or admin",
        );
        error.statusCode = 400;
        throw error;
      }

      project.assignedTo = user._id;
    } else {
      project.assignedTo = null;
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("user", "name email")
      .populate("assignedTo", "name email role")
      .populate("order")
      .populate("contract")
      .populate("brief");

    res.send(updatedProject);
  } catch (error) {
    next(error);
  }
};

const reviewProjectDeliverable = async (req, res, next) => {
  try {
    const { projectId, deliverableId } = req.params;
    const { decision, reviewMessage = "" } = req.body;

    if (!["approve", "changes"].includes(decision)) {
      return res.status(400).send({
        message: "La decisión de revisión no es válida.",
      });
    }

    if (decision === "changes" && !reviewMessage.trim()) {
      return res.status(400).send({
        message: "Describe los cambios que necesitas.",
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).send({
        message: "No se encontró el proyecto.",
      });
    }

    if (project.status === "cancelled") {
      return res.status(400).send({
        message: "No se pueden revisar entregables de un proyecto cancelado.",
      });
    }

    const deliverable = await TaskDeliverable.findOne({
      _id: deliverableId,
      project: project._id,
      status: "approved",
      clientVisible: true,
    });

    if (!deliverable) {
      return res.status(404).send({
        message: "No se encontró el entregable.",
      });
    }

    if (
      deliverable.clientReviewStatus &&
      deliverable.clientReviewStatus !== "pending"
    ) {
      return res.status(400).send({
        message: "Este entregable ya fue revisado.",
      });
    }

    const task = await Task.findById(deliverable.task);

    if (!task) {
      return res.status(404).send({
        message: "No se encontró la tarea asociada al entregable.",
      });
    }

    if (task.status === "cancelled") {
      return res.status(400).send({
        message: "No se puede revisar un entregable de una tarea cancelada.",
      });
    }

    deliverable.clientReviewStatus =
      decision === "approve" ? "approved" : "changes_requested";

    deliverable.clientReviewMessage =
      decision === "changes" ? reviewMessage.trim() : "";

    deliverable.clientReviewedBy = req.user._id;
    deliverable.clientReviewedAt = new Date();

    await deliverable.save();

    if (decision === "changes") {
      const previousTaskStatus = task.status;

      task.status = "pending";
      task.completedAt = null;

      task.clientChangesPending = true;
      task.clientChangesMessage = reviewMessage.trim();
      task.clientChangesRequestedAt = new Date();

      await task.save();

      await TaskActivity.create({
        task: task._id,
        project: project._id,
        user: req.user._id,
        type: "changes_requested",
        fromStatus: previousTaskStatus,
        toStatus: "pending",
        message: `El cliente solicitó cambios: ${reviewMessage.trim()}`,
      });

      project.status = "in_progress";
      project.progress = projectProgressByStatus.in_progress;
      project.deliveredAt = null;

      if (!project.startedAt) {
        project.startedAt = new Date();
      }

      await project.save();
    } else {
      task.clientChangesPending = false;
      task.clientChangesMessage = "";
      task.clientChangesRequestedAt = null;

      await task.save();
    }

    const updatedDeliverable = await TaskDeliverable.findById(deliverable._id)
      .populate("uploadedBy", "name")
      .populate("reviewedBy", "name")
      .populate("clientReviewedBy", "name");

    return res.send(updatedDeliverable);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyProjects,
  getProjectById,
  getAllProjects,
  updateProjectStatus,
  updateProjectAssignee,
  getProjectDeliverables,
  reviewProjectDeliverable,
};
