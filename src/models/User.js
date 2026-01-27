import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    avatar: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    phone: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin", "student"], default: "student" },

    bankInfo: {
      bankName: { type: String, default: null },
      accountNumber: { type: String, default: null },
      accountName: { type: String, default: null },
    },

    adminProfile: {
      title: { type: String, default: "admin" },
      company: { type: String, default: null },
      experience: { type: String, default: null },
      studentCount: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      bio: { type: String, default: null },
    },

    isVerified: { type: Boolean, default: false },
    activationCode: { type: String },
    referralCode: { type: String, default: null, sparse: true },

    resetPasswordToken: { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null },
  },
  { timestamps: true },
);

// Validasi Email
UserSchema.path("email").validate(function (value) {
  const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailRegex.test(value);
}, "Email tidak valid");

// Validasi Phone
UserSchema.path("phone").validate(function (value) {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return phoneRegex.test(value);
}, "Nomor telepon tidak valid");

// --- PERBAIKAN KRUSIAL DI SINI ---
// 1. Hapus parameter 'next' dari dalam kurung: async function ()
// 2. Hapus 'return next()' di baris validasi
UserSchema.pre("save", async function () {
  // Jika password tidak berubah, langsung return (selesai) tanpa next()
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    // Gunakan throw error, bukan next(error)
    throw new Error(error);
  }
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Cek models existing untuk mencegah overwrite error di development
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
