import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // Participants in the conversation
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Course context (optional - if message is related to a specific course)
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },

    // Conversation metadata
    title: {
      type: String,
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
    },

    // Status tracking
    isActive: {
      type: Boolean,
      default: true,
    },
    participantUnreadCount: {
      type: Number,
      default: 0,
    },
    instructorUnreadCount: {
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

// Index for efficient querying
conversationSchema.index({ participantId: 1, instructorId: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ courseId: 1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
