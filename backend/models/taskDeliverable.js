const mongoose = require("mongoose");

const taskDeliverableSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["file", "link"],
      required: true,
    },

    source: {
      type: String,
      enum: ["upload", "canva", "affinity", "drive", "external"],
      default: "upload",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    externalId: {
      type: String,
      default: "",
      trim: true,
    },

    externalUrl: {
      type: String,
      default: "",
      trim: true,
    },

    fileName: {
      type: String,
      default: "",
      trim: true,
    },

    mimeType: {
      type: String,
      default: "",
      trim: true,
    },

    fileSize: {
      type: Number,
      default: null,
    },

    version: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "changes_requested"],
      default: "submitted",
    },

    clientVisible: {
      type: Boolean,
      default: false,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewMessage: {
      type: String,
      default: "",
      trim: true,
    },

    clientReviewStatus: {
      type: String,
      enum: ["pending", "approved", "changes_requested"],
      default: "pending",
    },

    clientReviewMessage: {
      type: String,
      default: "",
      trim: true,
    },

    clientReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    clientReviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("TaskDeliverable", taskDeliverableSchema);
