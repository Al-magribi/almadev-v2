import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
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
      enum: ["pending", "eligible", "withdrawable", "paid", "cancelled"],
      default: "pending",
    },
    eligibleAt: Date, // tanggal setelah 10 hari Transaksi berhasil
    paidAt: Date, // tanggal transaksi berhasil
    withdrawalProof: String, // bukti transfer dari admin
    adminNotes: String, // catatan admin saat memproses penarikan
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Referral =
  mongoose.models.Referral || mongoose.model("Referral", referralSchema);

export default Referral;
