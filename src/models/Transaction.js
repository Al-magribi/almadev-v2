import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    // =========================
    // Transaction code (internal)
    // =========================
    transactionCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // =========================
    // Transaction details
    // =========================
    type: {
      type: String,
      enum: ["Course", "Product", "Bootcamp"],
      required: true,
      index: true,
    },

    // Optional: nama item untuk email/log (tidak mengganggu polymorphic ref)
    itemName: {
      type: String,
      default: null,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "failed",
        "cancelled",
        "refunded",
        "expired",
      ],
      default: "pending",
      index: true,
    },

    // =========================
    // Polymorphic reference - Course / Product
    // =========================
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ["Course", "Product", "BootcampParticipant"],
      required: true,
      index: true,
    },
    // Optional: detail pembayaran bootcamp (pendaftaran / kelas)
    bootcampFeeType: {
      type: String,
      enum: ["registration", "class"],
      default: null,
      index: true,
    },

    // =========================
    // User who made the transaction
    // =========================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ✅ Untuk cleanup user auto-created (poin H)
    // set true saat transaksi dibuat karena user dibuat otomatis di checkout
    autoCreatedUser: {
      type: Boolean,
      default: false,
      index: true,
    },

    // =========================
    // UTM tracking (JANGAN DIHAPUS ✅)
    // =========================
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    utmTerm: { type: String },
    utmContent: { type: String },

    // =========================
    // Referral tracking
    // =========================
    referralCode: {
      type: String,
    },

    // =========================
    // Payment identifiers
    // =========================
    paymentId: {
      type: String,
    },

    // paymentMethod diisi dari Midtrans: payment_type (credit_card, bank_transfer, gopay, qris, echannel, dll)
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
        "cstore",
        "echannel",
        "permata_va",
        "bca_klikpay",
        "bri_epay",
        "other_qris",
        "other_va",
        "unknown",
      ],
      default: "unknown",
      index: true,
    },

    // =========================
    // ✅ Midtrans Snap fields (tambahan)
    // =========================

    // order_id yang dikirim ke midtrans (biasanya sama dengan transactionCode)
    midtransOrderId: {
      type: String,
      index: true,
    },

    // Snap token & redirect URL
    snapToken: {
      type: String,
    },
    snapRedirectUrl: {
      type: String,
    },

    // Status Midtrans (untuk audit/debug)
    midtransTransactionStatus: {
      type: String,
    },
    midtransStatusCode: {
      type: String,
    },
    fraudStatus: {
      type: String,
    },

    // Simpan payload midtrans supaya gampang debug saat dispute
    midtransPayload: {
      type: Object,
      default: null,
    },

    // =========================
    // Refund fields (tetap ✅)
    // =========================
    refundRequest: {
      requestedAt: {
        type: Date,
      },
      reason: {
        type: String,
        maxlength: 500,
      },
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
        type: String,
      },
      adminNotes: {
        type: String,
        maxlength: 1000,
      },
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// =========================
// Indexes
// =========================
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ itemType: 1, itemId: 1 });
transactionSchema.index({ midtransOrderId: 1, status: 1 });

// =========================
// Virtuals
// =========================
transactionSchema.virtual("item", {
  refPath: "itemType",
  localField: "itemId",
  foreignField: "_id",
  justOne: true,
});

transactionSchema.virtual("remainingAmount").get(function () {
  return (this.price || 0) - (this.refundAmount || 0);
});

transactionSchema.virtual("refundPercentage").get(function () {
  if (!this.price) return 0;
  return Math.round(((this.refundAmount || 0) / this.price) * 100);
});

// =========================
// Model export (Next.js safe)
// =========================
const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

export default Transaction;
