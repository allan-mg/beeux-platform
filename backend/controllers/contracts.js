const Contract = require("../models/contract");
const agencyLegalData = require("../config/agencyLegalData");
const generateContractPdf = require("../utils/generateContractPdf");
const generateSignedContractPdf = require("../utils/generateSignedContractPdf");
const { createBriefFromContract } = require("../utils/briefFlow");

const getContractByOrder = (req, res, next) => {
  Contract.findOne({
    order: req.params.orderId,
    user: req.user._id,
  })
    .populate("user", "name email legalProfile identityVerification")
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

const generateContract = async (req, res, next) => {
  try {
    const contract = await Contract.findOne({
      order: req.params.orderId,
      user: req.user._id,
    })
      .populate("user", "name email legalProfile identityVerification")
      .populate(
        "order",
        "serviceName serviceSlug amount currency billingType status createdAt",
      );

    if (!contract) {
      const error = new Error("Contract not found");
      error.statusCode = 404;
      throw error;
    }

    if (contract.status !== "ready_to_sign") {
      const error = new Error("Contract is not ready to be generated");
      error.statusCode = 400;
      throw error;
    }

    if (contract.order?.status !== "paid") {
      const error = new Error("Payment must be confirmed before generating");
      error.statusCode = 400;
      throw error;
    }

    if (contract.user?.identityVerification?.status !== "verified") {
      const error = new Error(
        "Identity verification is required before generating the contract",
      );
      error.statusCode = 400;
      throw error;
    }

    const legalProfile = contract.user.legalProfile;
    const address = legalProfile?.address || {};

    if (
      !contract.generatedAt ||
      !contract.contractSnapshot?.client?.legalName
    ) {
      contract.contractVersion = "1.0";

      contract.contractSnapshot = {
        client: {
          legalName: legalProfile?.legalName || "",
          email: contract.user.email || "",
          taxId: legalProfile?.taxId || "",
          phone: legalProfile?.phone || "",
          entityType: legalProfile?.entityType || "",
          representativeName: legalProfile?.representativeName || "",

          address: {
            street: address.street || "",
            exteriorNumber: address.exteriorNumber || "",
            interiorNumber: address.interiorNumber || "",
            neighborhood: address.neighborhood || "",
            city: address.city || "",
            state: address.state || "",
            postalCode: address.postalCode || "",
            country: address.country || "",
          },
        },

        agency: {
          legalName: agencyLegalData.legalName,
          representativeName: agencyLegalData.representativeName,
          taxId: agencyLegalData.taxId,
          address: agencyLegalData.address,
          email: agencyLegalData.email,
          phone: agencyLegalData.phone,
          website: agencyLegalData.website,
          country: agencyLegalData.country,
        },

        service: {
          name: contract.order.serviceName,
          slug: contract.order.serviceSlug,
          amount: contract.order.amount,
          currency: contract.order.currency,
          billingType: contract.order.billingType,
        },
      };

      contract.generatedAt = new Date();

      await contract.save();
    }

    if (!contract.contractUrl) {
      const { fileName } = await generateContractPdf(contract);

      contract.contractUrl = `/generated/contracts/${fileName}`;

      await contract.save();
    }

    res.send(contract);
  } catch (error) {
    next(error);
  }
};

const signContract = async (req, res, next) => {
  try {
    const { accepted, signerName } = req.body;

    if (accepted !== true) {
      const error = new Error(
        "You must expressly accept the contract before signing",
      );
      error.statusCode = 400;
      throw error;
    }

    if (!signerName?.trim()) {
      const error = new Error("Signer name is required");
      error.statusCode = 400;
      throw error;
    }

    const contract = await Contract.findOne({
      order: req.params.orderId,
      user: req.user._id,
    })
      .populate("user", "name email legalProfile identityVerification")
      .populate(
        "order",
        "serviceName serviceSlug amount currency billingType status createdAt",
      );

    if (!contract) {
      const error = new Error("Contract not found");
      error.statusCode = 404;
      throw error;
    }

    if (contract.status === "signed") {
      return res.send(contract);
    }

    if (contract.status !== "ready_to_sign") {
      const error = new Error("Contract is not ready to be signed");
      error.statusCode = 400;
      throw error;
    }

    if (contract.order?.status !== "paid") {
      const error = new Error("Payment must be confirmed before signing");
      error.statusCode = 400;
      throw error;
    }

    if (contract.user?.identityVerification?.status !== "verified") {
      const error = new Error(
        "Identity verification is required before signing",
      );
      error.statusCode = 400;
      throw error;
    }

    if (!contract.contractUrl || !contract.generatedAt) {
      const error = new Error(
        "Contract must be generated before it can be signed",
      );
      error.statusCode = 400;
      throw error;
    }

    const expectedSignerName =
      contract.contractSnapshot?.client?.legalName?.trim();

    if (
      expectedSignerName &&
      signerName.trim().toLowerCase() !== expectedSignerName.toLowerCase()
    ) {
      const error = new Error("Signer name must match the verified legal name");
      error.statusCode = 400;
      throw error;
    }

    const forwardedFor = req.headers["x-forwarded-for"];

    const ipAddress =
      typeof forwardedFor === "string"
        ? forwardedFor.split(",")[0].trim()
        : req.ip || req.socket?.remoteAddress || "";

    const signedAt = new Date();

    contract.signature = {
      accepted: true,
      signerName: signerName.trim(),
      signerEmail:
        contract.contractSnapshot?.client?.email || contract.user.email || "",
      method: "electronic_acceptance",
      contractVersion: contract.contractVersion || "",
      ipAddress,
      userAgent: req.headers["user-agent"] || "",
      provider: "",
      providerReferenceId: "",
      acceptedAt: signedAt,
    };

    contract.status = "signed";
    contract.signedAt = signedAt;

    await contract.save();

    const { fileName } = await generateSignedContractPdf(contract);

    contract.signedContractUrl = `/generated/contracts/${fileName}`;

    await contract.save();

    await createBriefFromContract(contract);

    res.send(contract);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContractByOrder,
  getMyContracts,
  generateContract,
  signContract,
};
