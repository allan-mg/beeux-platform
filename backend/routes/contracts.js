const router = require("express").Router();

const { getContractByOrder } = require("../controllers/contracts");
const auth = require("../middlewares/auth");

router.get("/contracts/order/:orderId", auth, getContractByOrder);

module.exports = router;
