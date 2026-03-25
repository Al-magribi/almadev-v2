import mongoose from "mongoose";

const affiliateCommissionSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      unique: true,
      index: true,
    },
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AffiliateVisit",
      default: null,
      index: true,
    },
    payoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AffiliatePayout",
      default: null,
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ["Course", "Product"],
      required: true,
      index: true,
    },
    itemNameSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    buyerNameMasked: {
      type: String,
      default: null,
      trim: true,
    },
    buyerEmailMasked: {
      type: String,
      default: null,
      trim: true,
    },
    referralCodeSnapshot: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    rewardAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    netRewardAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    rewardPeriod: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
      index: true,
    },
    transactionCompletedAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "void", "reversed"],
      default: "pending",
      index: true,
    },
    refundStatus: {
      type: String,
      enum: ["none", "partial", "full"],
      default: "none",
      index: true,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundAt: {
      type: Date,
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

affiliateCommissionSchema.index({ referrerId: 1, rewardPeriod: 1, status: 1 });
affiliateCommissionSchema.index({ referrerId: 1, transactionCompletedAt: -1 });

const AffiliateCommission =
  mongoose.models.AffiliateCommission ||
  mongoose.model("AffiliateCommission", affiliateCommissionSchema);

export default AffiliateCommission;
