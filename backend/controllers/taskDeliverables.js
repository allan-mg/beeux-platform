const Task = require("../models/task");
const TaskDeliverable = require("../models/taskDeliverable");
const TaskActivity = require("../models/taskActivity");

const getMyTaskDeliverables = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    if (
      !task.assignedTo ||
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      const error = new Error("You do not have access to this task");
      error.statusCode = 403;
      throw error;
    }

    const deliverables = await TaskDeliverable.find({
      task: task._id,
    })
      .populate("uploadedBy", "name email role")
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });

    res.send(deliverables);
  } catch (error) {
    next(error);
  }
};

const createTaskDeliverable = async (req, res, next) => {
  try {
    const { type, source, name, url, externalId, externalUrl } = req.body;

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    if (
      !task.assignedTo ||
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      const error = new Error(
        "You can only add deliverables to your assigned tasks",
      );
      error.statusCode = 403;
      throw error;
    }

    if (task.status === "cancelled") {
      const error = new Error(
        "Deliverables cannot be added to a cancelled task",
      );
      error.statusCode = 400;
      throw error;
    }

    if (!name?.trim()) {
      const error = new Error("Deliverable name is required");
      error.statusCode = 400;
      throw error;
    }

    if (!url?.trim()) {
      const error = new Error("Deliverable URL is required");
      error.statusCode = 400;
      throw error;
    }

    if (!["file", "link"].includes(type)) {
      const error = new Error("Invalid deliverable type");
      error.statusCode = 400;
      throw error;
    }

    const allowedSources = ["upload", "canva", "affinity", "drive", "external"];

    if (source && !allowedSources.includes(source)) {
      const error = new Error("Invalid deliverable source");
      error.statusCode = 400;
      throw error;
    }

    const deliverable = await TaskDeliverable.create({
      task: task._id,
      project: task.project,
      uploadedBy: req.user._id,
      type,
      source: source || "external",
      name: name.trim(),
      url: url.trim(),
      externalId: externalId?.trim() || "",
      externalUrl: externalUrl?.trim() || "",
      status: "submitted",
    });

    await TaskActivity.create({
      task: task._id,
      project: task.project,
      user: req.user._id,
      type: "file_uploaded",
      message: `Se agregó el entregable "${deliverable.name}".`,
      clientVisible: false,
    });

    const populatedDeliverable = await TaskDeliverable.findById(deliverable._id)
      .populate("uploadedBy", "name email role")
      .populate("reviewedBy", "name email role");

    res.status(201).send(populatedDeliverable);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyTaskDeliverables,
  createTaskDeliverable,
};
