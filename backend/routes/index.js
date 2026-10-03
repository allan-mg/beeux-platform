const router = require("express").Router();

const servicesRouter = require("./services");

router.get("/", (req, res) => {
  res.send("BeeUX API is running");
});

router.use("/services", servicesRouter);

module.exports = router;
