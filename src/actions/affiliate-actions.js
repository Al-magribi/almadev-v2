"use server";

import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { getCurrentUser } from "@/lib/auth-service";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const nanoid = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 5);

const normalizeCodeSeed = (value = "") =>
  String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);

async function generateUniqueReferralCode(name = "") {
  const seed = normalizeCodeSeed(name) || "ALMA";

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = `${seed}${nanoid()}`;
    const exists = await User.exists({ referralCode: candidate });
    if (!exists) return candidate;
  }

  throw new Error("Gagal membuat kode referral unik. Coba lagi.");
}

export async function registerAffiliateProgram(prevState, formData) {
  try {
    await dbConnect();

    const session = await getCurrentUser();
    if (!session?.userId) {
      return { success: false, message: "Sesi habis. Silakan login kembali." };
    }

    const bankName = String(formData.get("bankName") || "").trim();
    const accountNumber = String(formData.get("accountNumber") || "").trim();
    const accountName = String(formData.get("accountName") || "").trim();

    if (!bankName || !accountNumber || !accountName) {
      return {
        success: false,
        message: "Semua data bank wajib diisi untuk bergabung ke program affiliate.",
      };
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return { success: false, message: "User tidak ditemukan." };
    }

    const alreadyAffiliate = Boolean(user.referralCode && user.affiliateJoinedAt);

    if (!user.referralCode) {
      user.referralCode = await generateUniqueReferralCode(user.name);
    }

    user.bankInfo = {
      bankName,
      accountNumber,
      accountName,
    };
    user.affiliateStatus = "active";
    if (!user.affiliateJoinedAt) {
      user.affiliateJoinedAt = new Date();
    }

    await user.save();

    revalidatePath("/student/affiliate");
    revalidatePath("/student/profile");

    return {
      success: true,
      message: alreadyAffiliate
        ? "Data rekening affiliate berhasil diperbarui."
        : `Selamat, Anda resmi bergabung sebagai affiliate dengan kode ${user.referralCode}.`,
    };
  } catch (error) {
    console.error("registerAffiliateProgram error:", error);
    return {
      success: false,
      message: error.message || "Gagal mendaftarkan program affiliate.",
    };
  }
}
