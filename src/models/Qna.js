import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isInstructor: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

const QnaSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessonId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isQuestion: {
      type: Boolean,
      default: true,
    },
    isInstructor: {
      type: Boolean,
      default: false,
    },
    replies: [ReplySchema],
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isResolved: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Index for better query performance
QnaSchema.index({ courseId: 1, lessonId: 1 });
QnaSchema.index({ user: 1 });
QnaSchema.index({ createdAt: -1 });

const Qna = mongoose.models.Qna || mongoose.model("Qna", QnaSchema);

export default Qna;
