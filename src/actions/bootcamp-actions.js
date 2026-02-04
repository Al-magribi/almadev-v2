"use server";

import dbConnect from "@/lib/db";
import { customAlphabet } from "nanoid";
import { getCurrentUser } from "@/lib/auth-service";
import BootcampParticipant from "@/models/BootcampParticipant";
import BootcampExercise from "@/models/BootcampExercise";
import Setting from "@/models/Setting";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { sendPaymentEmail } from "@/lib/emailService";

const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

const serialize = (data) => JSON.parse(JSON.stringify(data));

const getMidtransAppBaseUrl = (settings) => {
  const rawBase = (settings?.midtransBaseUrl || "").trim();
  if (rawBase.includes("app.sandbox.midtrans.com")) {
    return "https://app.sandbox.midtrans.com";
  }
  if (rawBase.includes("app.midtrans.com")) {
    return "https://app.midtrans.com";
  }
  if (
    rawBase.includes("api.sandbox.midtrans.com") ||
    rawBase.includes("api.midtrans.com")
  ) {
    return settings?.midtransIsProduction
      ? "https://app.midtrans.com"
      : "https://app.sandbox.midtrans.com";
  }
  return settings?.midtransIsProduction
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";
};

export async function getBootcampParticipants() {
  const user = await getCurrentUser();
  if (!user?.userId || user.role !== "admin") {
    return { success: false, data: [] };
  }

  await dbConnect();
  const participants = await BootcampParticipant.find()
    .sort({ createdAt: -1 })
    .lean();

  const data = serialize(participants).map((item) => ({
    id: String(item._id),
    userId: String(item.userId),
    name: item.name,
    email: item.email,
    phone: item.phone,
    status: item.status,
    registrationFee: item.registrationFee,
    classFee: item.classFee,
    transactionCode: item.transactionCode,
    midtransStatus: item.midtransStatus,
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
  }));

  return { success: true, data };
}

export async function getBootcampExercises() {
  const user = await getCurrentUser();
  if (!user?.userId || user.role !== "admin") {
    return { success: false, data: [] };
  }

  await dbConnect();
  const items = await BootcampExercise.find().sort({ updatedAt: -1 }).lean();

  const data = serialize(items).map((item) => ({
    id: String(item._id),
    title: item.title,
    content: item.content || "",
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
  }));

  return { success: true, data };
}

export async function createBootcampExercise({ title, content }) {
  const user = await getCurrentUser();
  if (!user?.userId || user.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  if (!title || !title.trim()) {
    return { success: false, message: "Judul wajib diisi." };
  }

  await dbConnect();
  const item = await BootcampExercise.create({
    title: title.trim(),
    content: content || "",
    createdBy: user.userId,
    updatedBy: user.userId,
  });

  return {
    success: true,
    data: {
      id: String(item._id),
      title: item.title,
      content: item.content || "",
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    },
  };
}

export async function updateBootcampExercise({ exerciseId, title, content }) {
  const user = await getCurrentUser();
  if (!user?.userId || user.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  if (!exerciseId) {
    return { success: false, message: "Data tidak lengkap." };
  }

  await dbConnect();
  const item = await BootcampExercise.findById(exerciseId);
  if (!item) return { success: false, message: "Latihan tidak ditemukan." };

  if (title && title.trim()) item.title = title.trim();
  if (content !== undefined) item.content = content || "";
  item.updatedBy = user.userId;
  item.updatedAt = new Date();
  await item.save();

  return {
    success: true,
    data: {
      id: String(item._id),
      title: item.title,
      content: item.content || "",
      updatedAt: item.updatedAt.toISOString(),
    },
  };
}

export async function deleteBootcampExercise({ exerciseId }) {
  const user = await getCurrentUser();
  if (!user?.userId || user.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  if (!exerciseId) {
    return { success: false, message: "Data tidak lengkap." };
  }

  await dbConnect();
  const item = await BootcampExercise.findById(exerciseId);
  if (!item) return { success: false, message: "Latihan tidak ditemukan." };

  await BootcampExercise.findByIdAndDelete(exerciseId);
  return { success: true };
}

export async function createBootcampPayment({
  name,
  email,
  phone,
  bootcampFeeType = "registration",
  utmSource,
  utmMedium,
  utmCampaign,
  utmTerm,
  utmContent,
}) {
  await dbConnect();

  try {
    const settings = await Setting.findOne().lean();
    if (!settings?.midtransServerKey) {
      throw new Error("Payment Gateway belum dikonfigurasi.");
    }

    const safeName = (name || "").trim();
    const safeEmail = (email || "").trim().toLowerCase();
    const safePhone = (phone || "").trim();

    if (!safeName) throw new Error("Nama wajib diisi.");
    if (!safeEmail) throw new Error("Email wajib diisi.");
    if (!safePhone) throw new Error("Nomor WhatsApp wajib diisi.");

    const existingByEmail = await User.findOne({ email: safeEmail });
    const existingByPhone = await User.findOne({ phone: safePhone });

    if (
      existingByEmail &&
      existingByPhone &&
      String(existingByEmail._id) !== String(existingByPhone._id)
    ) {
      throw new Error(
        "Email dan nomor WhatsApp sudah terdaftar pada akun yang berbeda.",
      );
    }

    let user = existingByEmail || existingByPhone;
    let autoCreatedUser = false;

    if (user) {
      if (user.email !== safeEmail) {
        throw new Error(
          "Email tidak cocok dengan akun yang menggunakan nomor ini.",
        );
      }
      if (user.phone !== safePhone) {
        throw new Error(
          "Nomor WhatsApp tidak cocok dengan akun yang menggunakan email ini.",
        );
      }

      const patch = {};
      if (user.isActive === false) patch.isActive = true;
      if (user.isVerified === false) patch.isVerified = true;
      if (Object.keys(patch).length) {
        await User.updateOne({ _id: user._id }, { $set: patch });
      }
    } else {
      user = await User.create({
        name: safeName,
        email: safeEmail,
        phone: safePhone,
        password: safePhone,
        isActive: true,
        isVerified: true,
        isAutoCreated: true,
      });
      autoCreatedUser = true;
    }

    const existingParticipant = await BootcampParticipant.findOne({
      $or: [{ email: safeEmail }, { phone: safePhone }],
      status: { $in: ["pending", "active"] },
    }).lean();

    if (existingParticipant) {
      throw new Error("Peserta sudah terdaftar pada program bootcamp.");
    }

    const orderId = `BOOTCAMP-${nanoid()}`;
    const registrationFee = 100000;
    const classFee = 3000000;
    const feeType =
      bootcampFeeType === "class" ? "class" : "registration";
    const feeAmount = feeType === "class" ? classFee : registrationFee;
    const feeLabel =
      feeType === "class"
        ? "Bootcamp - Biaya Kelas"
        : "Bootcamp - Biaya Pendaftaran";

    const participant = await BootcampParticipant.create({
      userId: user._id,
      name: safeName,
      email: safeEmail,
      phone: safePhone,
      status: "pending",
      registrationFee,
      classFee,
      transactionCode: orderId,
      midtransStatus: "pending",
    });

    const trx = await Transaction.create({
      transactionCode: orderId,
      midtransOrderId: orderId,
      type: "Bootcamp",
      itemId: participant._id,
      itemType: "BootcampParticipant",
      itemName: feeLabel,
      userId: user._id,
      price: feeAmount,
      status: "pending",
      bootcampFeeType: feeType,
      utmSource: utmSource || "direct",
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
      utmTerm: utmTerm || null,
      utmContent: utmContent || null,
      autoCreatedUser,
      midtransTransactionStatus: "pending",
    });

    const baseUrl = getMidtransAppBaseUrl(settings);
    const authString = Buffer.from(`${settings.midtransServerKey}:`).toString(
      "base64",
    );

    const finishUrl = `${settings.domain}/status?order_id=${encodeURIComponent(
      orderId,
    )}`;

    const midtransResponse = await fetch(`${baseUrl}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: feeAmount,
        },
        customer_details: {
          first_name: safeName,
          email: safeEmail,
          phone: safePhone,
        },
        item_details: [
          {
            id: String(participant._id),
            price: feeAmount,
            quantity: 1,
            name: feeLabel,
          },
        ],
        callbacks: {
          finish: finishUrl,
        },
      }),
    });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok) {
      await Transaction.deleteOne({ _id: trx._id });
      await BootcampParticipant.deleteOne({ _id: participant._id });

      if (autoCreatedUser) {
        const other = await Transaction.countDocuments({ userId: user._id });
        if (other === 0) {
          await User.deleteOne({ _id: user._id, isAutoCreated: true });
        }
      }

      throw new Error(midtransData?.error_messages?.[0] || "Midtrans Error");
    }

    await Transaction.updateOne(
      { _id: trx._id },
      {
        $set: {
          snapToken: midtransData.token,
          snapRedirectUrl: midtransData.redirect_url,
          midtransTransactionStatus: "pending",
          midtransPayload: midtransData,
        },
      },
    );

    await sendPaymentEmail({
      to: safeEmail,
      name: safeName,
      status: "pending",
      transactionId: orderId,
      itemName: feeLabel,
      amount: feeAmount,
      isBootcamp: true,
      loginEmail: safeEmail,
      loginPhone: safePhone,
      showLoginInfo: autoCreatedUser,
      mustChangePassword: autoCreatedUser,
    });

    return {
      success: true,
      token: midtransData.token,
      redirectUrl: midtransData.redirect_url,
      orderId,
    };
  } catch (error) {
    console.error("Bootcamp Payment Error:", error);
    return { success: false, error: error.message };
  }
}
