const router = require("express").Router();

const {
  getBriefByOrder,
  updateBriefByOrder,
} = require("../controllers/briefs");

const auth = require("../middlewares/auth");
const validateObjectId = require("../middlewares/validateObjectId");

router.get(
  "/briefs/order/:orderId",
  auth,
  validateObjectId("orderId"),
  getBriefByOrder,
);

router.patch(
  "/briefs/order/:orderId",
  auth,
  validateObjectId("orderId"),
  updateBriefByOrder,
);

module.exports = router;
