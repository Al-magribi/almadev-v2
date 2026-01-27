import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
    watchDuration: { type: Number, default: 0 }, // in seconds
    totalDuration: { type: Number, default: 0 }, // in seconds
    isCompleted: { type: Boolean, default: false },
    lastWatchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Create compound index for efficient queries
progressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });
progressSchema.index({ userId: 1, lastWatchedAt: -1 });

const Progress =
  mongoose.models.Progress || mongoose.model("Progress", progressSchema);

export default Progress;
