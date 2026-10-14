const Project = require("../models/project");

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
      .sort({ createdAt: -1 });

    res.send(projects);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProjects,
  getProjectById,
  updateProjectStatus,
  getAllProjects,
};
