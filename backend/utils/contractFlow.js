const Contract = require("../models/contract");

const moveContractsToAwaitingVerification = (userId) =>
  Contract.updateMany(
    {
      user: userId,
      status: {
        $in: ["awaiting_legal_data", "awaiting_verification", "ready_to_sign"],
      },
    },
    {
      $set: {
        status: "awaiting_verification",
        contractUrl: null,
        generatedAt: null,
        sentAt: null,
      },
    },
    {
      runValidators: true,
    },
  );

const moveContractsToReadyToSign = (userId) =>
  Contract.updateMany(
    {
      user: userId,
      status: "awaiting_verification",
    },
    {
      $set: {
        status: "ready_to_sign",
      },
    },
    {
      runValidators: true,
    },
  );

module.exports = {
  moveContractsToAwaitingVerification,
  moveContractsToReadyToSign,
};
