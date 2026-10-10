const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
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

    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
      unique: true,
    },

    brief: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brief",
      required: true,
      unique: true,
    },

    serviceName: {
      type: String,
      required: true,
    },

    serviceSlug: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "brief_received",
        "planning",
        "in_progress",
        "review",
        "delivered",
        "cancelled",
      ],
      default: "brief_received",
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 10,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    estimatedDeliveryAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Project", projectSchema);
