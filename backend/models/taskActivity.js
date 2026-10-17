const mongoose = require("mongoose");

const taskActivitySchema = new mongoose.Schema(
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

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "comment",
        "status_change",
        "file_uploaded",
        "review_requested",
        "changes_requested",
        "approved",
      ],
      required: true,
    },

    message: {
      type: String,
      trim: true,
      default: "",
    },

    fromStatus: {
      type: String,
      default: "",
    },

    toStatus: {
      type: String,
      default: "",
    },

    clientVisible: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("TaskActivity", taskActivitySchema);
