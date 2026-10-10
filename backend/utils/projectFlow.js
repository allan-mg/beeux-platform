const Project = require("../models/project");

const createProjectFromBrief = async (brief) => {
  const existingProject = await Project.findOne({
    brief: brief._id,
  });

  if (existingProject) {
    return existingProject;
  }

  const project = await Project.create({
    user: brief.user,
    order: brief.order,
    service: brief.service,
    contract: brief.contract,
    brief: brief._id,

    serviceName: brief.serviceName,
    serviceSlug: brief.serviceSlug,

    status: "brief_received",
    progress: 10,
  });

  brief.project = project._id;
  await brief.save();

  return project;
};

module.exports = {
  createProjectFromBrief,
};
