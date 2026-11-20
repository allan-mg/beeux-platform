const mongoose = require("mongoose");

const teamInviteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["employee"],
      default: "employee",
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("TeamInvite", teamInviteSchema);
