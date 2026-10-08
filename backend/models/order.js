const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

    serviceSlug: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "USD",
    },

    billingType: {
      type: String,
      enum: ["one-time", "monthly", "yearly"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "refunded"],
      default: "pending",
    },

    stripeCheckoutSessionId: {
      type: String,
      default: null,
    },

    stripePaymentIntentId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
