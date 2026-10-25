const router = require("express").Router();

const {
  getMyProjects,
  getProjectById,
  getAllProjects,
  updateProjectStatus,
  updateProjectAssignee,
} = require("../controllers/projects");

const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validateObjectId = require("../middlewares/validateObjectId");

router.get("/projects/me", auth, getMyProjects);

router.get(
  "/projects/:projectId",
  auth,
  validateObjectId("projectId"),
  getProjectById,
);

router.get("/admin/projects", auth, admin, getAllProjects);

router.patch(
  "/admin/projects/:projectId/status",
  auth,
  admin,
  validateObjectId("projectId"),
  updateProjectStatus,
);

router.patch(
  "/admin/projects/:projectId/assignee",
  auth,
  admin,
  validateObjectId("projectId"),
  updateProjectAssignee,
);

module.exports = router;
