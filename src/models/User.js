import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    avatar: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    phone: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["admin", "student", "bootcamp"],
      default: "student",
    },

    // Untuk flow checkout auto-create account
    isActive: { type: Boolean, default: true },
    isAutoCreated: { type: Boolean, default: false },

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

// Validasi Phone (Indonesia)
UserSchema.path("phone").validate(function (value) {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return phoneRegex.test(value);
}, "Nomor telepon tidak valid");

// Hash password sebelum save
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error(error);
  }
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
