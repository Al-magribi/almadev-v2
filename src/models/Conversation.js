import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
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
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },

    // TAMBAHAN: Konteks spesifik (Section & Lesson)
    context: {
      sectionTitle: { type: String },
      lessonTitle: { type: String },
      lessonId: { type: String }, // ID referensi ke sub-dokumen lesson
    },

    title: { type: String, required: true },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    lastMessageAt: { type: Date },

    isActive: { type: Boolean, default: true }, // True = Open, False = Solved/Closed
    isSolved: { type: Boolean, default: false }, // Penanda eksplisit Solved

    participantUnreadCount: { type: Number, default: 0 },
    instructorUnreadCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

conversationSchema.index({ participantId: 1, instructorId: 1 });
conversationSchema.index({ lastMessageAt: -1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);
export default Conversation;
