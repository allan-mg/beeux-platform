const router = require("express").Router();

const {
  createUser,
  login,
  getCurrentUser,
  updateLegalProfile,
} = require("../controllers/users");

const auth = require("../middlewares/auth");

router.post("/signup", createUser);
router.post("/signin", login);

router.get("/users/me", auth, getCurrentUser);

router.patch("/users/me/legal-profile", auth, updateLegalProfile);

module.exports = router;
