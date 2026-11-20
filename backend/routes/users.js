const router = require("express").Router();

const {
  createUser,
  login,
  getCurrentUser,
  getTeamMembers,
  updateTeamMemberStatus,
  updateLegalProfile,
  verifyCurrentUserForDevelopment,
} = require("../controllers/users");

const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const developmentOnly = require("../middlewares/developmentOnly");
const validateObjectId = require("../middlewares/validateObjectId");

const {
  createTeamInvite,
  getTeamInvite,
  acceptTeamInvite,
} = require("../controllers/teamInvites");

const {
  createTeamMemberPasswordReset,
  getPasswordReset,
  completePasswordReset,
} = require("../controllers/passwordResets");

router.post("/signup", createUser);
router.post("/signin", login);

router.get("/users/me", auth, getCurrentUser);
router.get("/admin/team", auth, admin, getTeamMembers);
router.patch(
  "/admin/team/:userId/status",
  auth,
  admin,
  validateObjectId("userId"),
  updateTeamMemberStatus,
);

router.post("/admin/team/invitations", auth, admin, createTeamInvite);
router.get("/team/invitations/:token", getTeamInvite);
router.post("/team/invitations/accept", acceptTeamInvite);

router.post(
  "/admin/team/:userId/password-reset",
  auth,
  admin,
  validateObjectId("userId"),
  createTeamMemberPasswordReset,
);
router.get("/password-resets/:token", getPasswordReset);
router.post("/password-resets/complete", completePasswordReset);

router.patch("/users/me/legal-profile", auth, updateLegalProfile);

router.post(
  "/users/me/dev-verify",
  developmentOnly,
  auth,
  verifyCurrentUserForDevelopment,
);

module.exports = router;
