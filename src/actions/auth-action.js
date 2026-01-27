// HANDLE OTENTIKASI
"use server";

import User from "@/models/User";
import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { SignJWT } from "jose";
import dbConnect from "@/lib/db";
import { sendActivationEmail } from "@/lib/emailService";

export async function signupUser(prevState, formData) {
  try {
    await dbConnect();

    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const password = formData.get("password");

    // Validasi dasar
    if (!name || !email || !phone || !password) {
      return { success: false, message: "Semua kolom wajib diisi!" };
    }

    // Cek apakah email/hp sudah terdaftar
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return {
        success: false,
        message: "Email atau Nomor HP sudah terdaftar.",
      };
    }

    // Generate Activation Code (Token Unik)
    const activationToken = crypto.randomBytes(32).toString("hex");
    const activationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expire 24 jam

    // Buat User Baru
    const newUser = new User({
      name,
      email,
      phone,
      password, // Password akan di-hash otomatis oleh pre-save hook di User.js
      activationCode: activationToken,
      resetPasswordExpire: activationExpire,
      isVerified: false,
    });

    await newUser.save();

    // --- LOGIKA MENDAPATKAN DOMAIN OTOMATIS ---
    const headersList = await headers();
    const host = headersList.get("host"); // cth: localhost:3000 atau domain.com
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const activationUrl = `${protocol}://${host}/activate?token=${activationToken}`;

    // Kirim Email
    await sendActivationEmail(email, name, activationUrl);

    return {
      success: true,
      message: "Registrasi berhasil! Cek email Anda untuk aktivasi akun.",
    };
  } catch (error) {
    console.log(error);
    return { code: 500, message: error.message };
  }
}

export async function activateUser(token) {
  try {
    await dbConnect();

    // Cari user berdasarkan token
    const user = await User.findOne({
      activationCode: token,
      resetPasswordExpire: { $gt: Date.now() }, // Pastikan belum expired
    });

    if (!user) {
      return {
        success: false,
        message: "Token tidak valid atau sudah kadaluarsa.",
      };
    }

    // Update status user
    user.isVerified = true;
    user.activationCode = undefined; // Hapus token setelah dipakai
    user.resetPasswordExpire = undefined;

    await user.save();

    return {
      success: true,
      message: "Akun berhasil diaktifkan! Silakan login.",
    };
  } catch (error) {
    console.log(error);
    return { code: 500, message: error.message };
  }
}

export async function signinUser(prevState, formData) {
  try {
    await dbConnect();

    const email = formData.get("email");
    const password = formData.get("password");

    console.log(email, password);

    // Cari User
    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, message: "Email atau password salah." };
    }

    // Cek Password (menggunakan method comparePassword dari User.js)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return { success: false, message: "Email atau password salah." };
    }

    // Cek Status Verifikasi
    if (!user.isVerified) {
      return {
        success: false,
        message: "Akun belum aktif. Silakan cek email Anda.",
      };
    }

    // Buat Session Token (JWT)
    const tokenData = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = "HS256";

    const token = await new SignJWT(tokenData)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Set Cookie
    const cookie = await cookies();
    cookie.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 minggu
      path: "/",
    });

    // 6. TENTUKAN REDIRECT URL BERDASARKAN ROLE
    // Default ke /student jika role tidak spesifik
    const redirectUrl = user.role === "admin" ? "/admin" : "/student";

    return {
      success: true,
      message: "Login berhasil! Mengalihkan...",
      redirectUrl, // Kirim URL ini ke client
    };
  } catch (error) {
    console.log(error);
    return { code: 500, message: error.message };
  }
}
