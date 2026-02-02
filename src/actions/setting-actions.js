"use server";

import dbConnect from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteFile, uploadImage } from "@/lib/server-utils";

// --- IMPORT SEMUA MODEL DARI FOLDER MODELS ---
import User from "@/models/User";
import Course from "@/models/Course";
import Product from "@/models/Product";
import Transaction from "@/models/Transaction";
import Setting from "@/models/Setting";
import Conversation from "@/models/Conversation";
import Editor from "@/models/Editor";
import Landing from "@/models/Landing";
import Message from "@/models/Message";
import Note from "@/models/Note";
import Progress from "@/models/Progress";
import Project from "@/models/Project";
import Qna from "@/models/Qna";
import Referral from "@/models/Referral";
import Reward from "@/models/Reward";
import ViewData from "@/models/ViewData";

// Helper serialize
const serialize = (data) => JSON.parse(JSON.stringify(data));

// 1. GET SETTINGS
export async function getSettings() {
  await dbConnect();
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    return { success: true, data: serialize(setting) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 2. UPDATE SETTINGS
export async function updateSettings(formData) {
  await dbConnect();
  try {
    const isFormData = typeof formData?.get === "function";
    const currentSetting = await Setting.findOne({}).lean();

    const getField = (name) =>
      isFormData ? formData.get(name) : formData?.[name];

    const resolveImage = async (input, currentValue, folder) => {
      if (input && typeof input !== "string") {
        const uploadedPath = await uploadImage(input, folder);
        if (uploadedPath) {
          if (currentValue && currentValue.startsWith("/uploads")) {
            await deleteFile(currentValue);
          }
          return uploadedPath;
        }
        return currentValue || "";
      }

      if (typeof input === "string") {
        return input;
      }

      return currentValue || "";
    };

    const parseBool = (value) => value === true || value === "true";

    const payload = {
      websiteName: getField("websiteName") || "",
      domain: getField("domain") || "",
      youtubeRoadmapLink: getField("youtubeRoadmapLink") || "",
      seoTitle: getField("seoTitle") || "",
      seoDescription: getField("seoDescription") || "",
      seoKeywords: getField("seoKeywords") || "",
      metaPixelId: getField("metaPixelId") || "",
      googleAnalyticsId: getField("googleAnalyticsId") || "",
      smtpHost: getField("smtpHost") || "",
      smtpPort: getField("smtpPort") || "",
      smtpUser: getField("smtpUser") || "",
      smtpPassword: getField("smtpPassword") || "",
      smtpFromEmail: getField("smtpFromEmail") || "",
      smtpFromName: getField("smtpFromName") || "",
      midtransServerKey: getField("midtransServerKey") || "",
      midtransClientKey: getField("midtransClientKey") || "",
      midtransMerchantId: getField("midtransMerchantId") || "",
      midtransBaseUrl: getField("midtransBaseUrl") || "",
      midtransIsProduction: parseBool(getField("midtransIsProduction")),
      maintenanceMode: parseBool(getField("maintenanceMode")),
    };

    payload.websiteLogo = await resolveImage(
      getField("websiteLogo"),
      currentSetting?.websiteLogo,
      "branding",
    );
    payload.websiteFavicon = await resolveImage(
      getField("websiteFavicon"),
      currentSetting?.websiteFavicon,
      "branding",
    );

    const setting = await Setting.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    revalidatePath("/");
    return { success: true, data: serialize(setting) };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Gagal menyimpan pengaturan." };
  }
}

// 3. BACKUP DATABASE (AMBIL SEMUA DATA)
export async function backupDatabase() {
  await dbConnect();
  try {
    // Menggunakan Promise.all agar pengambilan data berjalan paralel (lebih cepat)
    const [
      users,
      courses,
      products,
      transactions,
      settings,
      conversations,
      editors,
      landings,
      messages,
      notes,
      progresses,
      projects,
      qnas,
      referrals,
      rewards,
      viewDatas,
    ] = await Promise.all([
      User.find().lean(),
      Course.find().lean(),
      Product.find().lean(),
      Transaction.find().lean(),
      Setting.findOne().lean(),
      Conversation.find().lean(),
      Editor.find().lean(),
      Landing.find().lean(),
      Message.find().lean(),
      Note.find().lean(),
      Progress.find().lean(),
      Project.find().lean(),
      Qna.find().lean(),
      Referral.find().lean(),
      Reward.find().lean(),
      ViewData.find().lean(),
    ]);

    // Bungkus semua data dalam satu objek JSON
    const backupData = {
      timestamp: new Date().toISOString(),
      version: "2.0", // Update versi
      data: {
        users,
        courses,
        products,
        transactions,
        settings,
        conversations,
        editors,
        landings,
        messages,
        notes,
        progresses,
        projects,
        qnas,
        referrals,
        rewards,
        viewDatas,
      },
    };

    return { success: true, data: JSON.stringify(backupData) };
  } catch (error) {
    console.error("Backup Error:", error);
    return { success: false, error: error.message };
  }
}

// 4. RESTORE DATABASE (FULL RESTORE)
export async function restoreDatabase(jsonString) {
  await dbConnect();

  // Peta antara Key di JSON Backup dengan Model Mongoose
  // Pastikan urutan import models di atas sudah lengkap
  const modelMap = {
    settings: Setting,
    users: User,
    courses: Course,
    products: Product,
    transactions: Transaction,
    conversations: Conversation,
    editors: Editor,
    landings: Landing,
    messages: Message,
    notes: Note,
    progresses: Progress,
    projects: Project,
    qnas: Qna,
    referrals: Referral,
    rewards: Reward,
    viewDatas: ViewData,
  };

  try {
    const parsed = JSON.parse(jsonString);
    const { data } = parsed;

    if (!data)
      throw new Error("Format file backup tidak valid (Data root missing).");

    // Hitung statistik untuk laporan sukses
    let restoredCount = 0;
    let collectionsCount = 0;

    // Loop melalui setiap model yang didaftarkan
    for (const [key, Model] of Object.entries(modelMap)) {
      // Cek apakah data untuk model ini ada di file JSON
      if (data[key]) {
        // 1. HAPUS data lama (Reset Collection)
        await Model.deleteMany({});

        // 2. INSERT data baru (jika array tidak kosong)
        // Cek apakah data[key] adalah array (untuk tabel umum) atau object (untuk single document seperti Setting)
        const dataToInsert = Array.isArray(data[key]) ? data[key] : [data[key]];

        if (dataToInsert.length > 0) {
          await Model.insertMany(dataToInsert);
        }

        collectionsCount++;
        restoredCount += dataToInsert.length;
      }
    }

    // Refresh cache Next.js agar data baru langsung tampil
    revalidatePath("/");

    return {
      success: true,
      message: `Restore Berhasil! ${collectionsCount} koleksi diproses, total ${restoredCount} dokumen dipulihkan.`,
    };
  } catch (error) {
    console.error("Restore Error:", error);
    return {
      success: false,
      error: `Gagal melakukan restore: ${error.message}`,
    };
  }
}
