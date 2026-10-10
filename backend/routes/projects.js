const router = require("express").Router();

const { getMyProjects, getProjectById } = require("../controllers/projects");

const auth = require("../middlewares/auth");

router.get("/projects/me", auth, getMyProjects);

router.get("/projects/:projectId", auth, getProjectById);

module.exports = router;
