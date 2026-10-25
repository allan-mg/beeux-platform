const router = require("express").Router();

const {
  getContractByOrder,
  getMyContracts,
  generateContract,
  signContract,
} = require("../controllers/contracts");

const auth = require("../middlewares/auth");
const validateObjectId = require("../middlewares/validateObjectId");

router.get("/contracts/me", auth, getMyContracts);

router.get(
  "/contracts/order/:orderId",
  auth,
  validateObjectId("orderId"),
  getContractByOrder,
);

router.post(
  "/contracts/order/:orderId/generate",
  auth,
  validateObjectId("orderId"),
  generateContract,
);

router.post(
  "/contracts/order/:orderId/sign",
  auth,
  validateObjectId("orderId"),
  signContract,
);

module.exports = router;
