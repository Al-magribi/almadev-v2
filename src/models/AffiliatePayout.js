import mongoose from "mongoose";

const bankSnapshotSchema = new mongoose.Schema(
  {
    bankName: { type: String, default: null, trim: true },
    accountNumber: { type: String, default: null, trim: true },
    accountName: { type: String, default: null, trim: true },
  },
  { _id: false },
);

const affiliatePayoutSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    period: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "paid", "cancelled"],
      default: "draft",
      index: true,
    },
    commissionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AffiliateCommission",
      },
    ],
    grossAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    adjustmentAmount: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      default: 0,
    },
    bankSnapshot: {
      type: bankSnapshotSchema,
      default: () => ({}),
    },
    proof: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

affiliatePayoutSchema.index({ referrerId: 1, period: 1 }, { unique: true });

const AffiliatePayout =
  mongoose.models.AffiliatePayout ||
  mongoose.model("AffiliatePayout", affiliatePayoutSchema);

export default AffiliatePayout;
