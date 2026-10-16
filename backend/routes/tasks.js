const router = require("express").Router();

const {
  getMyTasks,
  getProjectTasks,
  createProjectTask,
  updateTask,
  updateMyTaskStatus,
} = require("../controllers/tasks");

const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const teamMember = require("../middlewares/teamMember");

router.get("/team/tasks/me", auth, teamMember, getMyTasks);

router.patch(
  "/team/tasks/:taskId/status",
  auth,
  teamMember,
  updateMyTaskStatus,
);

router.get("/admin/projects/:projectId/tasks", auth, admin, getProjectTasks);

router.post("/admin/projects/:projectId/tasks", auth, admin, createProjectTask);

router.patch("/admin/tasks/:taskId", auth, admin, updateTask);

module.exports = router;
