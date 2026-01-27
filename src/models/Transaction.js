import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    // Transaction code
    transactionCode: {
      type: String,
      required: true,
      unique: true,
    },

    // Transaction details
    type: {
      type: String,
      enum: ["Course", "Product"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled", "refunded"],
      default: "pending",
    },

    // Polymorphic reference - can reference Course or Product
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    itemType: {
      type: String,
      enum: ["Course", "Product"],
      required: true,
    },

    // User who made the transaction
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    utmSource: {
      type: String,
    },

    utmMedium: {
      type: String,
    },

    utmCampaign: {
      type: String,
    },

    utmTerm: {
      type: String,
    },

    utmContent: {
      type: String,
    },

    // Referral tracking
    referralCode: {
      type: String,
    },

    paymentId: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: [
        "credit_card",
        "bank_transfer",
        "gopay",
        "shopeepay",
        "qris",
        "akulaku",
        "kredivo",
        "alfamart",
        "indomart",
        "cstore", // Tambahan: Midtrans sering mengirim ini untuk Alfamart/Indomaret
        "echannel", // Tambahan: Wajib untuk Mandiri Bill Payment (Error Anda saat ini)
        "permata_va", // Tambahan: Sering dipakai untuk Bank Permata
        "bca_klikpay", // Tambahan: Opsional
        "bri_epay", // Tambahan: Opsional
        "other_qris",
        "other_va", // Tambahan: Untuk bank lain
        "unknown", // Tambahan: Safety net
      ],
    },

    // Refund fields
    refundRequest: {
      requestedAt: {
        type: Date,
      },
      reason: {
        type: String,
        maxlength: 500,
      },
      // Bank details for refund
      bankName: {
        type: String,
        maxlength: 100,
      },
      accountNumber: {
        type: String,
        maxlength: 50,
      },
      accountName: {
        type: String,
        maxlength: 100,
      },
      status: {
        type: String,
        enum: ["diajukan", "diproses", "selesai", "ditolak"],
        default: null,
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      approvedAt: {
        type: Date,
      },
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      processedAt: {
        type: Date,
      },
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      completedAt: {
        type: Date,
      },
      refundProof: {
        type: String, // URL to uploaded image
      },
      adminNotes: {
        type: String,
        maxlength: 1000,
      },
    },

    // Direct refund amount field for easier access
    refundAmount: {
      type: Number,
      default: 0,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient querying
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ itemType: 1, itemId: 1 });
transactionSchema.index({ status: 1 });

// Virtual for dynamic population
transactionSchema.virtual("item", {
  refPath: "itemType",
  localField: "itemId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for remaining amount after refund
transactionSchema.virtual("remainingAmount").get(function () {
  return this.price - this.refundAmount;
});

// Virtual for refund percentage
transactionSchema.virtual("refundPercentage").get(function () {
  if (this.price === 0) return 0;
  return Math.round((this.refundAmount / this.price) * 100);
});

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

export default Transaction;
