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

const {
  createTeamInvite,
  getTeamInvite,
  acceptTeamInvite,
} = require("../controllers/teamInvites");

router.post("/signup", createUser);
router.post("/signin", login);

router.get("/users/me", auth, getCurrentUser);
router.get("/admin/team", auth, admin, getTeamMembers);

router.post("/admin/team/invitations", auth, admin, createTeamInvite);
router.get("/team/invitations/:token", getTeamInvite);
router.post("/team/invitations/accept", acceptTeamInvite);

router.patch("/users/me/legal-profile", auth, updateLegalProfile);

router.post(
  "/users/me/dev-verify",
  developmentOnly,
  auth,
  verifyCurrentUserForDevelopment,
);

module.exports = router;
