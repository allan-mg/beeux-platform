const router = require("express").Router();

const {
  createOrder,
  getOrderById,
  createCheckoutSession,
} = require("../controllers/orders");
const auth = require("../middlewares/auth");
const validateObjectId = require("../middlewares/validateObjectId");

router.post("/orders", auth, createOrder);
router.get(
  "/orders/:orderId",
  auth,
  validateObjectId("orderId"),
  getOrderById,
);
router.post("/checkout/session", auth, createCheckoutSession);

module.exports = router;
