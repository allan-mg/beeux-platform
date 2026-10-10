const Project = require("../models/project");

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

module.exports = {
  getMyProjects,
  getProjectById,
};
