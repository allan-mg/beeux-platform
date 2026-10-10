const router = require("express").Router();

const {
  getContractByOrder,
  getMyContracts,
  generateContract,
  signContract,
} = require("../controllers/contracts");

const auth = require("../middlewares/auth");

router.get("/contracts/me", auth, getMyContracts);

router.get("/contracts/order/:orderId", auth, getContractByOrder);

router.post("/contracts/order/:orderId/generate", auth, generateContract);

router.post("/contracts/order/:orderId/sign", auth, signContract);

module.exports = router;
