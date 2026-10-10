const router = require("express").Router();

const servicesRouter = require("./services");
const usersRouter = require("./users");
const ordersRouter = require("./orders");
const contractsRouter = require("./contracts");
const briefsRouter = require("./briefs");
const projectsRouter = require("./projects");

router.get("/", (req, res) => {
  res.send("BeeUX API is running");
});

router.use("/services", servicesRouter);
router.use(usersRouter);
router.use(ordersRouter);
router.use(contractsRouter);
router.use(briefsRouter);
router.use(projectsRouter);

module.exports = router;
