const router = require("express").Router();

const servicesRouter = require("./services");
const usersRouter = require("./users");

router.get("/", (req, res) => {
  res.send("BeeUX API is running");
});

router.use("/services", servicesRouter);
router.use(usersRouter);

module.exports = router;
