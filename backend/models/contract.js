const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    serviceName: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "sent", "signed", "rejected", "cancelled"],
      default: "pending",
    },

    contractUrl: {
      type: String,
      default: null,
    },

    signedContractUrl: {
      type: String,
      default: null,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    signedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Contract", contractSchema);
