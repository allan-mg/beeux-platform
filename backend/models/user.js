const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["client", "admin"],
      default: "client",
    },

    legalProfile: {
      entityType: {
        type: String,
        enum: ["individual", "business"],
        default: "individual",
      },

      legalName: {
        type: String,
        trim: true,
        default: "",
      },

      taxId: {
        type: String,
        trim: true,
        default: "",
      },

      phone: {
        type: String,
        trim: true,
        default: "",
      },

      representativeName: {
        type: String,
        trim: true,
        default: "",
      },

      address: {
        street: {
          type: String,
          trim: true,
          default: "",
        },

        exteriorNumber: {
          type: String,
          trim: true,
          default: "",
        },

        interiorNumber: {
          type: String,
          trim: true,
          default: "",
        },

        neighborhood: {
          type: String,
          trim: true,
          default: "",
        },

        city: {
          type: String,
          trim: true,
          default: "",
        },

        state: {
          type: String,
          trim: true,
          default: "",
        },

        postalCode: {
          type: String,
          trim: true,
          default: "",
        },

        country: {
          type: String,
          trim: true,
          default: "",
        },
      },
    },

    identityVerification: {
      status: {
        type: String,
        enum: ["unverified", "pending", "verified", "rejected"],
        default: "unverified",
      },

      verificationType: {
        type: String,
        enum: ["identity", "business", ""],
        default: "",
      },

      provider: {
        type: String,
        trim: true,
        default: "",
      },

      referenceId: {
        type: String,
        trim: true,
        default: "",
      },

      verifiedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
