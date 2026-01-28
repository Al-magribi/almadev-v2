import mongoose from "mongoose";

const viewDataSchema = new mongoose.Schema(
  {
    // Landing page reference
    landingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Landing",
      required: true,
    },

    // Item reference (course or product)
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    itemType: {
      type: String,
      enum: ["course", "product"],
      required: true,
    },

    // UTM tracking parameters
    utmSource: {
      type: String,
      default: "direct",
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

    // Visitor information
    ipAddress: {
      type: String,
    },

    userAgent: {
      type: String,
    },

    browserInfo: {
      browser: { type: String, default: "Unknown" },
      version: { type: String, default: "Unknown" },
      os: { type: String, default: "Unknown" },
      device: { type: String, default: "Unknown" },
    },

    referrer: {
      type: String,
    },

    // Page information
    pageUrl: {
      type: String,
      required: true,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient querying
viewDataSchema.index({ landingId: 1, createdAt: -1 });
viewDataSchema.index({ itemId: 1, itemType: 1, createdAt: -1 });
viewDataSchema.index({ utmSource: 1, createdAt: -1 });
viewDataSchema.index({ createdAt: -1 });

const ViewData =
  mongoose.models.ViewData || mongoose.model("ViewData", viewDataSchema);

export default ViewData;
