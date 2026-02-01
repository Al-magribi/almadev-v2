"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { revalidatePath } from "next/cache";

import { profileSchema, uploadImage, deleteFile } from "@/lib/server-utils"; // Sesuaikan path
import { getCurrentUser } from "@/lib/auth-service";

// --- 1. GET STUDENTS (Tetap sama, sedikit optimasi) ---
export async function getStudents() {
  try {
    await dbConnect();
    const students = await User.find({ role: "student" })
      .select("-password -resetPasswordToken -activationCode -__v")
      .sort({ createdAt: -1 })
      .lean();

    if (!students.length) return { success: true, data: [] };

    const studentIds = students.map((s) => s._id);
    const transactions = await Transaction.find({
      userId: { $in: studentIds },
      status: "completed",
    })
      .populate("item", "name type price image")
      .select("userId transactionCode price status createdAt itemType itemId")
      .sort({ createdAt: -1 })
      .lean();

    const formattedData = students.map((student) => {
      const userTransactions = transactions.filter(
        (t) => t.userId.toString() === student._id.toString(),
      );

      const purchaseHistory = userTransactions.map((t) => ({
        id: t._id.toString(),
        transactionCode: t.transactionCode,
        itemName: t.item ? t.item.name : "Item tidak ditemukan",
        itemType: t.itemType,
        price: t.price,
        status: t.status,
        date: t.createdAt.toISOString(),
      }));

      return {
        id: student._id.toString(),
        profile: {
          name: student.name,
          email: student.email,
          phone: student.phone,
          avatar: student.avatar,
        },
        stats: {
          totalSpent: purchaseHistory.reduce((acc, cur) => acc + cur.price, 0),
          totalPurchases: purchaseHistory.length,
        },
        joinedAt: student.createdAt.toISOString(),
        purchases: purchaseHistory,
      };
    });

    return { success: true, data: formattedData };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { success: false, error: "Gagal mengambil data siswa." };
  }
}

// --- 2. GET CURRENT USER PROFILE ---
export async function getUserProfile() {
  try {
    await dbConnect();

    // SECURITY: Ambil user dari Token, bukan parameter client
    const session = await getCurrentUser();
    if (!session || !session.userId) {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }

    const user = await User.findById(session.userId)
      .select("-password -resetPasswordToken -activationCode -__v")
      .lean();

    if (!user) return { success: false, error: "User tidak ditemukan" };

    // Serialisasi data untuk dikirim ke Client Component
    return {
      success: true,
      data: JSON.parse(JSON.stringify(user)),
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, error: "Gagal memuat profil: " + error.message };
  }
}

// --- 3. UPDATE USER PROFILE ---
export async function updateUserProfile(prevState, formData) {
  try {
    await dbConnect();

    // 1. SECURITY CHECK: Verifikasi Token
    const session = await getCurrentUser();
    if (!session || !session.userId) {
      return { success: false, error: "Sesi habis. Silakan refresh halaman." };
    }

    // 2. Persiapan Data
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"), // Opsional (Admin)
      title: formData.get("title"), // Opsional (Admin)
      bio: formData.get("bio"), // Opsional (Admin)
      avatar: formData.get("avatar"), // File object atau String URL
    };

    // 3. Validasi dengan Zod
    const validated = profileSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.flatten().fieldErrors, // Return error per field
      };
    }

    // 4. Ambil User Eksisting
    const currentUser = await User.findById(session.userId);
    if (!currentUser) return { success: false, error: "User tidak ditemukan." };

    // 5. Handle Avatar Upload
    let avatarPath = currentUser.avatar; // Default: pakai yang lama
    const imageFile = formData.get("avatar");

    // Cek jika user mengupload file baru (bukan string URL lama)
    if (imageFile && imageFile.size > 0 && typeof imageFile !== "string") {
      // a. Hapus avatar lama fisik jika ada di server lokal
      if (currentUser.avatar && currentUser.avatar.startsWith("/uploads")) {
        await deleteFile(currentUser.avatar);
      }

      // b. Upload baru
      const uploadedPath = await uploadImage(imageFile, "avatars");
      if (uploadedPath) {
        avatarPath = uploadedPath;
      } else {
        return {
          success: false,
          error: { avatar: ["Gagal mengupload gambar."] },
        };
      }
    }

    // 6. Update Field Database
    currentUser.name = rawData.name;
    currentUser.phone = rawData.phone;
    currentUser.avatar = avatarPath;

    // Catatan: Email biasanya butuh verifikasi ulang jika diganti.
    // Di sini kita izinkan ganti langsung untuk kesederhanaan, tapi hati-hati.
    if (rawData.email !== currentUser.email) {
      // Cek duplikasi email jika diganti
      const exist = await User.findOne({
        email: rawData.email,
        _id: { $ne: currentUser._id },
      });
      if (exist)
        return {
          success: false,
          error: { email: ["Email sudah digunakan user lain."] },
        };
      currentUser.email = rawData.email;
    }

    // Update khusus Admin
    if (currentUser.role === "admin") {
      currentUser.adminProfile = {
        company: rawData.company || "",
        title: rawData.title || "",
        bio: rawData.bio || "",
      };
    }

    await currentUser.save();

    revalidatePath("/account"); // Refresh cache halaman akun
    revalidatePath("/student/profile");
    return { success: true, message: "Profil berhasil diperbarui!" };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Terjadi kesalahan server." };
  }
}

// --- 4. CHANGE PASSWORD ---
export async function changeUserPassword(prevState, formData) {
  try {
    await dbConnect();

    const session = await getCurrentUser();
    if (!session || !session.userId) {
      return { success: false, error: "Sesi habis. Silakan login kembali." };
    }

    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "Semua kolom wajib diisi." };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Password baru minimal 6 karakter." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "Konfirmasi password tidak cocok." };
    }

    const user = await User.findById(session.userId);
    if (!user) return { success: false, error: "User tidak ditemukan." };

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return { success: false, error: "Password saat ini salah." };
    }

    user.password = newPassword;
    await user.save();

    revalidatePath("/student/profile");

    return { success: true, message: "Password berhasil diperbarui." };
  } catch (error) {
    console.error("Change Password Error:", error);
    return { success: false, error: "Terjadi kesalahan server." };
  }
}
