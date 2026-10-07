const router = require("express").Router();
const { createUser, login, getCurrentUser } = require("../controllers/users");
const auth = require("../middlewares/auth");

router.post("/signup", createUser);
router.post("/signin", login);
router.get("/users/me", auth, getCurrentUser);

module.exports = router;
