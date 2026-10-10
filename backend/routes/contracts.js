const router = require("express").Router();

const {
  getContractByOrder,
  getMyContracts,
} = require("../controllers/contracts");

const auth = require("../middlewares/auth");

router.get("/contracts/me", auth, getMyContracts);
router.get("/contracts/order/:orderId", auth, getContractByOrder);

module.exports = router;
