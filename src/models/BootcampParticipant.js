import mongoose from "mongoose";

const bootcampParticipantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "active", "cancelled", "expired"],
      default: "pending",
      index: true,
    },
    registrationFee: { type: Number, default: 100000 },
    classFee: { type: Number, default: 3000000 },
    transactionCode: { type: String, required: true, index: true },
    midtransStatus: { type: String, default: "pending" },
  },
  { timestamps: true },
);

bootcampParticipantSchema.index({ email: 1 });
bootcampParticipantSchema.index({ phone: 1 });

const BootcampParticipant =
  mongoose.models.BootcampParticipant ||
  mongoose.model("BootcampParticipant", bootcampParticipantSchema);

export default BootcampParticipant;
