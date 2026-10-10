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

    contractVersion: {
      type: String,
      default: null,
    },

    contractSnapshot: {
      client: {
        legalName: {
          type: String,
          default: "",
        },

        email: {
          type: String,
          default: "",
        },

        taxId: {
          type: String,
          default: "",
        },

        phone: {
          type: String,
          default: "",
        },

        entityType: {
          type: String,
          default: "",
        },

        representativeName: {
          type: String,
          default: "",
        },

        address: {
          street: {
            type: String,
            default: "",
          },

          exteriorNumber: {
            type: String,
            default: "",
          },

          interiorNumber: {
            type: String,
            default: "",
          },

          neighborhood: {
            type: String,
            default: "",
          },

          city: {
            type: String,
            default: "",
          },

          state: {
            type: String,
            default: "",
          },

          postalCode: {
            type: String,
            default: "",
          },

          country: {
            type: String,
            default: "",
          },
        },
      },

      agency: {
        legalName: {
          type: String,
          default: "",
        },

        representativeName: {
          type: String,
          default: "",
        },

        taxId: {
          type: String,
          default: "",
        },

        address: {
          type: String,
          default: "",
        },

        email: {
          type: String,
          default: "",
        },

        phone: {
          type: String,
          default: "",
        },

        website: {
          type: String,
          default: "",
        },

        country: {
          type: String,
          default: "",
        },
      },

      service: {
        name: {
          type: String,
          default: "",
        },

        slug: {
          type: String,
          default: "",
        },

        amount: {
          type: Number,
          default: 0,
        },

        currency: {
          type: String,
          default: "",
        },

        billingType: {
          type: String,
          default: "",
        },
      },
    },

    status: {
      type: String,
      enum: [
        "awaiting_legal_data",
        "awaiting_verification",
        "ready_to_sign",
        "signed",
        "rejected",
        "cancelled",
      ],
      default: "awaiting_legal_data",
    },

    contractUrl: {
      type: String,
      default: null,
    },

    signedContractUrl: {
      type: String,
      default: null,
    },

    signature: {
      accepted: {
        type: Boolean,
        default: false,
      },

      signerName: {
        type: String,
        default: "",
      },

      signerEmail: {
        type: String,
        default: "",
      },

      method: {
        type: String,
        enum: ["electronic_acceptance", "provider", ""],
        default: "",
      },

      contractVersion: {
        type: String,
        default: "",
      },

      ipAddress: {
        type: String,
        default: "",
      },

      userAgent: {
        type: String,
        default: "",
      },

      provider: {
        type: String,
        default: "",
      },

      providerReferenceId: {
        type: String,
        default: "",
      },

      acceptedAt: {
        type: Date,
        default: null,
      },
    },

    generatedAt: {
      type: Date,
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

    rejectedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Contract", contractSchema);
