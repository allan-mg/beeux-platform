const router = require("express").Router();

const {
  createOrder,
  getOrderById,
  createCheckoutSession,
} = require("../controllers/orders");
const auth = require("../middlewares/auth");

router.post("/orders", auth, createOrder);
router.get("/orders/:orderId", auth, getOrderById);
router.post("/checkout/session", auth, createCheckoutSession);

module.exports = router;
