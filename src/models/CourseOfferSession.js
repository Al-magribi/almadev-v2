import mongoose from "mongoose";

const courseOfferSessionSchema = new mongoose.Schema(
  {
    sessionKey: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    pricingId: {
      type: String,
      required: true,
      trim: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

courseOfferSessionSchema.index(
  { sessionKey: 1, courseId: 1, pricingId: 1 },
  { unique: true },
);

const CourseOfferSession =
  mongoose.models.CourseOfferSession ||
  mongoose.model("CourseOfferSession", courseOfferSessionSchema);

export default CourseOfferSession;
