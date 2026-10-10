const router = require("express").Router();

const {
  getBriefByOrder,
  updateBriefByOrder,
} = require("../controllers/briefs");

const auth = require("../middlewares/auth");

router.get("/briefs/order/:orderId", auth, getBriefByOrder);

router.patch("/briefs/order/:orderId", auth, updateBriefByOrder);

module.exports = router;
