const Task = require("../models/task");
const Project = require("../models/project");
const User = require("../models/user");

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
    } = req.body;

    const task = await Task.findById(req.params.taskId);

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

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
    }

    await task.save();

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

    const allowedStatuses = ["pending", "in_progress", "review", "completed"];

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

    task.status = status;

    if (status === "completed") {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("project", "serviceName serviceSlug status progress")
      .populate("createdBy", "name email role");

    res.send(updatedTask);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyTasks,
  getProjectTasks,
  createProjectTask,
  updateTask,
  updateMyTaskStatus,
};
