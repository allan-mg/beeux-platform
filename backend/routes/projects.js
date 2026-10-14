const router = require("express").Router();

const {
  getMyProjects,
  getProjectById,
  getAllProjects,
  updateProjectStatus,
} = require("../controllers/projects");

const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

router.get("/projects/me", auth, getMyProjects);

router.get("/projects/:projectId", auth, getProjectById);

router.get("/admin/projects", auth, admin, getAllProjects);

router.patch(
  "/admin/projects/:projectId/status",
  auth,
  admin,
  updateProjectStatus,
);

module.exports = router;
