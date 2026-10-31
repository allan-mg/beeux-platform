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
  toggleTaskArchive,
  reviewTaskDeliverable,
} = require("../controllers/tasks");

const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const teamMember = require("../middlewares/teamMember");
const validateObjectId = require("../middlewares/validateObjectId");

router.get("/team/tasks/me", auth, teamMember, getMyTasks);

router.get(
  "/admin/projects/:projectId/tasks",
  auth,
  admin,
  validateObjectId("projectId"),
  getProjectTasks,
);

router.get(
  "/admin/tasks/:taskId/activity",
  auth,
  admin,
  validateObjectId("taskId"),
  getTaskActivity,
);

router.get(
  "/team/tasks/:taskId/activity",
  auth,
  teamMember,
  validateObjectId("taskId"),
  getMyTaskActivity,
);

router.get(
  "/admin/tasks/:taskId/deliverables",
  auth,
  admin,
  validateObjectId("taskId"),
  getTaskDeliverables,
);

router.get(
  "/team/tasks/:taskId/deliverables",
  auth,
  teamMember,
  validateObjectId("taskId"),
  getTaskDeliverables,
);

router.post(
  "/admin/projects/:projectId/tasks",
  auth,
  admin,
  validateObjectId("projectId"),
  createProjectTask,
);

router.post(
  "/team/tasks/:taskId/deliverables",
  auth,
  teamMember,
  validateObjectId("taskId"),
  addMyTaskDeliverable,
);

router.post(
  "/admin/tasks/:taskId/comments",
  auth,
  admin,
  validateObjectId("taskId"),
  addTaskComment,
);

router.post(
  "/team/tasks/:taskId/comments",
  auth,
  teamMember,
  validateObjectId("taskId"),
  addTaskComment,
);

router.patch(
  "/admin/tasks/:taskId",
  auth,
  admin,
  validateObjectId("taskId"),
  updateTask,
);

router.patch(
  "/team/tasks/:taskId/status",
  auth,
  teamMember,
  validateObjectId("taskId"),
  updateMyTaskStatus,
);

router.patch(
  "/admin/tasks/:taskId/archive",
  auth,
  admin,
  validateObjectId("taskId"),
  toggleTaskArchive,
);

router.patch(
  "/admin/deliverables/:deliverableId/review",
  auth,
  admin,
  validateObjectId("deliverableId"),
  reviewTaskDeliverable,
);

module.exports = router;
