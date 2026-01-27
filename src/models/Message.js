import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // Sender information
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderType: {
      type: String,
      enum: ["participant", "instructor"],
      required: true,
    },

    // Receiver information
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverType: {
      type: String,
      enum: ["participant", "instructor"],
      required: true,
    },

    // Message content
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },

    // Conversation tracking
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    parentMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    // Status tracking
    status: {
      type: String,
      enum: ["dikirim", "diterima", "dibaca"],
      default: "dikirim",
    },
    readAt: {
      type: Date,
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
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ status: 1 });

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
