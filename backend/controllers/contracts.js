const Contract = require("../models/contract");

const getContractByOrder = (req, res, next) => {
  Contract.findOne({
    order: req.params.orderId,
    user: req.user._id,
  })
    .populate("user", "name email")
    .populate(
      "order",
      "serviceName serviceSlug amount currency billingType status createdAt",
    )
    .then((contract) => {
      if (!contract) {
        const error = new Error("Contract not found");
        error.statusCode = 404;
        throw error;
      }

      res.send(contract);
    })
    .catch(next);
};

const getMyContracts = (req, res, next) => {
  Contract.find({
    user: req.user._id,
  })
    .sort({ createdAt: -1 })
    .then((contracts) => {
      res.send(contracts);
    })
    .catch(next);
};

module.exports = {
  getContractByOrder,
  getMyContracts,
};
