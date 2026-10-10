const Brief = require("../models/brief");

const createBriefFromContract = async (contract) => {
  const existingBrief = await Brief.findOne({
    contract: contract._id,
  });

  if (existingBrief) {
    return existingBrief;
  }

  const brief = await Brief.create({
    user: contract.user._id || contract.user,
    order: contract.order._id || contract.order,
    service: contract.service,
    contract: contract._id,

    serviceName:
      contract.contractSnapshot?.service?.name || contract.serviceName,

    serviceSlug: contract.contractSnapshot?.service?.slug || "",

    status: "pending",
    answers: {},
  });

  return brief;
};

module.exports = {
  createBriefFromContract,
};
