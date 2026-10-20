const router = require("express").Router();

const {
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
} = require("../controllers/tasks");

const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const teamMember = require("../middlewares/teamMember");

router.get("/team/tasks/me", auth, teamMember, getMyTasks);

router.get("/admin/projects/:projectId/tasks", auth, admin, getProjectTasks);

router.get("/admin/tasks/:taskId/activity", auth, admin, getTaskActivity);

router.get("/team/tasks/:taskId/activity", auth, teamMember, getMyTaskActivity);

router.get(
  "/admin/tasks/:taskId/deliverables",
  auth,
  admin,
  getTaskDeliverables,
);

router.get(
  "/team/tasks/:taskId/deliverables",
  auth,
  teamMember,
  getTaskDeliverables,
);

router.post("/admin/projects/:projectId/tasks", auth, admin, createProjectTask);

router.post(
  "/team/tasks/:taskId/deliverables",
  auth,
  teamMember,
  addMyTaskDeliverable,
);

router.patch("/admin/tasks/:taskId", auth, admin, updateTask);

router.patch(
  "/team/tasks/:taskId/status",
  auth,
  teamMember,
  updateMyTaskStatus,
);

router.post("/admin/tasks/:taskId/comments", auth, admin, addTaskComment);

router.post("/team/tasks/:taskId/comments", auth, teamMember, addTaskComment);

module.exports = router;
