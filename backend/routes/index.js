const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("BeeUX API is running");
});

module.exports = router;
