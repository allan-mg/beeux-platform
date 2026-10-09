const Contract = require("../models/contract");

const getContractByOrder = (req, res, next) => {
  Contract.findOne({
    order: req.params.orderId,
    user: req.user._id,
  })
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

module.exports = {
  getContractByOrder,
};
