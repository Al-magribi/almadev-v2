import mongoose from "mongoose";

const affiliateVisitSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    itemType: {
      type: String,
      enum: ["Course", "Product"],
      default: null,
      index: true,
    },
    landingPath: {
      type: String,
      default: null,
      trim: true,
    },
    visitorKey: {
      type: String,
      required: true,
      index: true,
    },
    ipAddressHash: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    utmSource: { type: String, default: null },
    utmMedium: { type: String, default: null },
    utmCampaign: { type: String, default: null },
    utmTerm: { type: String, default: null },
    utmContent: { type: String, default: null },
    convertedTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
      index: true,
    },
    convertedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

affiliateVisitSchema.index({ referrerId: 1, createdAt: -1 });
affiliateVisitSchema.index({ referralCode: 1, createdAt: -1 });
affiliateVisitSchema.index({ visitorKey: 1, referralCode: 1, createdAt: -1 });

const AffiliateVisit =
  mongoose.models.AffiliateVisit ||
  mongoose.model("AffiliateVisit", affiliateVisitSchema);

export default AffiliateVisit;
