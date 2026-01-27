import mongoose from "mongoose";

const RewardSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // siapa yg ngajak
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // siapa yg daftar
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    amount: { type: Number, default: 50000 },
    status: {
      type: String,
      enum: ["pending", "eligible", "withdrawable", "paid"],
      default: "pending",
    },
    eligibleAt: Date, // tanggal setelah 10 hari Transaksi berhasil
    paidAt: Date, // tanggal transaksi berhasil
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Reward = mongoose.models.Reward || mongoose.model("Reward", RewardSchema);

export default Reward;
