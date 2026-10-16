const router = require("express").Router();

const {
  createUser,
  login,
  getCurrentUser,
  getTeamMembers,
  updateLegalProfile,
  verifyCurrentUserForDevelopment,
} = require("../controllers/users");

const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const developmentOnly = require("../middlewares/developmentOnly");

router.post("/signup", createUser);
router.post("/signin", login);

router.get("/users/me", auth, getCurrentUser);
router.get("/admin/team", auth, admin, getTeamMembers);

router.patch("/users/me/legal-profile", auth, updateLegalProfile);

router.post(
  "/users/me/dev-verify",
  developmentOnly,
  auth,
  verifyCurrentUserForDevelopment,
);

module.exports = router;
