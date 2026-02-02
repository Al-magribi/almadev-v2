"use server";

import Transaction from "@/models/Transaction";
import Course from "@/models/Course";
import Product from "@/models/Product";
import User from "@/models/User";
import Setting from "@/models/Setting";
import BootcampParticipant from "@/models/BootcampParticipant";
import dbConnect from "@/lib/db";
import { customAlphabet } from "nanoid";
import { sendPaymentEmail } from "@/lib/emailService";

const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

const serializeData = (data) => JSON.parse(JSON.stringify(data));

const getMidtransApiBaseUrl = (settings) => {
  const rawBase = (settings?.midtransBaseUrl || "").trim();
  if (rawBase.includes("app.sandbox.midtrans.com")) {
    return "https://api.sandbox.midtrans.com";
  }
  if (rawBase.includes("app.midtrans.com")) {
    return "https://api.midtrans.com";
  }
  if (
    rawBase.includes("api.sandbox.midtrans.com") ||
    rawBase.includes("api.midtrans.com")
  ) {
    return rawBase;
  }

  return settings?.midtransIsProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";
};

export async function getAllTransactions() {
  await dbConnect();

  try {
    const transactions = await Transaction.find()
      .populate({ path: "userId", select: "name email avatar" })
      .populate({
        path: "item",
        select: "name title image price category type",
      })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: serializeData(transactions) };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, error: error.message };
  }
}

export async function getTransactionAnalytics() {
  await dbConnect();

  try {
    const revenueStats = await Transaction.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
    ]);

    const statusStats = await Transaction.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const utmStats = await Transaction.aggregate([
      {
        $group: {
          _id: "$utmSource",
          count: { $sum: 1 },
          revenue: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$price", 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const typeStats = await Transaction.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$itemType",
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
    ]);

    return {
      success: true,
      data: {
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        statusDistribution: serializeData(statusStats),
        utmSources: serializeData(utmStats),
        typeDistribution: serializeData(typeStats),
      },
    };
  } catch (error) {
    console.error("Error analyzing transactions:", error);
    return { success: false, error: error.message };
  }
}

// ==============================================
// SYNC PAYMENT STATUS (Manual fallback)
// ==============================================
export async function syncTransactionStatus(orderId) {
  await dbConnect();

  try {
    if (!orderId) {
      throw new Error("orderId wajib diisi.");
    }

    const settings = await Setting.findOne().lean();
    if (!settings?.midtransServerKey) {
      throw new Error("Payment Gateway belum dikonfigurasi.");
    }

    const trx = await Transaction.findOne({ transactionCode: orderId });
    if (!trx) {
      return { success: false, error: "Transaksi tidak ditemukan." };
    }

    const apiBaseUrl = getMidtransApiBaseUrl(settings);
    const authString = Buffer.from(`${settings.midtransServerKey}:`).toString(
      "base64",
    );

    const statusRes = await fetch(`${apiBaseUrl}/v2/${orderId}/status`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
    });

    const statusData = await statusRes.json();
    if (!statusRes.ok) {
      throw new Error(
        statusData?.status_message || "Gagal mengambil status Midtrans.",
      );
    }

    const trxStatus = statusData.transaction_status;

    let normalizedStatus = trx.status;
    if (trxStatus === "settlement" || trxStatus === "capture") {
      normalizedStatus = "completed";
    } else if (trxStatus === "pending") {
      normalizedStatus = "pending";
    } else if (["deny", "cancel", "expire"].includes(trxStatus)) {
      normalizedStatus =
        trxStatus === "deny"
          ? "failed"
          : trxStatus === "expire"
            ? "expired"
            : "cancelled";
    } else if (trxStatus === "refund") {
      normalizedStatus = "refunded";
    }

    const midtransUpdate = {
      midtransOrderId: statusData.order_id || orderId,
      midtransStatusCode: String(statusData.status_code || ""),
      midtransTransactionStatus: trxStatus,
      paymentMethod: statusData.payment_type || trx.paymentMethod || "unknown",
      fraudStatus: statusData.fraud_status || trx.fraudStatus || null,
      midtransPayload: statusData,
    };

    await Transaction.updateOne(
      { _id: trx._id },
      {
        $set: {
          status: normalizedStatus,
          ...midtransUpdate,
        },
      },
    );

    if (normalizedStatus === "completed") {
      const userUpdate = { isActive: true, isVerified: true };
      if (trx.itemType === "BootcampParticipant") {
        userUpdate.role = "bootcamp";
      }
      await User.updateOne({ _id: trx.userId }, { $set: userUpdate });

      if (trx.itemType === "BootcampParticipant") {
        await BootcampParticipant.updateOne(
          { _id: trx.itemId },
          { $set: { status: "active", midtransStatus: trxStatus } },
        );
      }

      if (trx.status !== "completed") {
        const user = await User.findById(trx.userId)
          .select("name fullName email")
          .lean();
        const customerName = user?.name || user?.fullName || "Pelanggan";
        const customerEmail = user?.email;
        const itemName = trx.itemName || "Pesanan Anda";

        if (customerEmail) {
          await sendPaymentEmail({
            to: customerEmail,
            name: customerName,
            status: "completed",
            transactionId: trx.transactionCode,
            itemName,
            amount: trx.price,
          });
        }
      }
    }

    if (
      normalizedStatus !== "completed" &&
      trx.itemType === "BootcampParticipant"
    ) {
      const nextStatus =
        trxStatus === "pending"
          ? "pending"
          : trxStatus === "expire"
            ? "expired"
            : ["deny", "cancel"].includes(trxStatus)
              ? "cancelled"
              : "pending";
      await BootcampParticipant.updateOne(
        { _id: trx.itemId },
        { $set: { status: nextStatus, midtransStatus: trxStatus } },
      );
    }

    return {
      success: true,
      data: {
        status: normalizedStatus,
        midtransStatus: trxStatus,
      },
    };
  } catch (error) {
    console.error("Sync Payment Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getTransactionsByUser(userId) {
  await dbConnect();

  if (!userId) return [];

  try {
    const transactions = await Transaction.find({ userId })
      .populate({
        path: "item",
        select: "name title image price category type",
      })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });

    const plain = serializeData(transactions);

    return plain.map((t) => ({
      id: t._id,
      transactionCode: t.transactionCode,
      price: t.price,
      status: t.status,
      paymentMethod: t.paymentMethod,
      createdAt: t.createdAt,
      itemType: t.itemType,
      itemName: t.itemName,
      utmSource: t.utmSource,
      refundAmount: t.refundAmount || 0,
      refundRequest: t.refundRequest || null,
      midtransStatus: t.midtransTransactionStatus || null,
      item: t.item
        ? {
            _id: t.item._id,
            name: t.item.name || t.item.title,
            image: t.item.image,
            price: t.item.price,
            category: t.item.category,
            type: t.item.type,
          }
        : null,
    }));
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return [];
  }
}

export async function getTransactionByCode(orderId) {
  await dbConnect();

  if (!orderId) {
    return { success: false, error: "orderId wajib diisi." };
  }

  try {
    const trx = await Transaction.findOne({ transactionCode: orderId })
      .select("price itemType itemId itemName status transactionCode")
      .lean();

    if (!trx) {
      return { success: false, error: "Transaksi tidak ditemukan." };
    }

    return { success: true, data: serializeData(trx) };
  } catch (error) {
    console.error("getTransactionByCode error:", error);
    return { success: false, error: error.message };
  }
}

// ==============================================
// CREATE PAYMENT (Checkout flow end-to-end)
// ==============================================
export async function createPayment(payload) {
  await dbConnect();

  try {
    const settings = await Setting.findOne().lean();
    if (!settings?.midtransServerKey) {
      throw new Error("Payment Gateway belum dikonfigurasi.");
    }

    // Midtrans base url fallback (sandbox/production)
    const baseUrl =
      settings.midtransBaseUrl ||
      (settings.midtransIsProduction
        ? "https://app.midtrans.com"
        : "https://app.sandbox.midtrans.com");

    // ============ A) VALIDASI INPUT ============
    const name = (payload.userName || "").trim();
    const email = (payload.userEmail || "").trim().toLowerCase();
    const phone = (payload.phone || "").trim();

    const itemType = payload.itemType; // "Course" | "Product"
    const itemId = payload.itemId;
    const price = Number(payload.price);

    if (!name) throw new Error("Nama wajib diisi.");
    if (!email) throw new Error("Email wajib diisi.");
    if (!phone) throw new Error("Nomor WhatsApp wajib diisi.");
    if (!itemType || !["Course", "Product"].includes(itemType)) {
      throw new Error("itemType wajib: Course atau Product.");
    }
    if (!itemId) throw new Error("itemId wajib diisi.");
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error("Harga tidak valid.");
    }

    // ambil itemName dari DB (biar akurat)
    let itemName = "Pesanan Anda";
    if (itemType === "Course") {
      const course = await Course.findById(itemId).select("title name").lean();
      if (!course) throw new Error("Course tidak ditemukan.");
      itemName = course.title || course.name || itemName;
    } else {
      const product = await Product.findById(itemId)
        .select("title name")
        .lean();
      if (!product) throw new Error("Product tidak ditemukan.");
      itemName = product.title || product.name || itemName;
    }

    // ============ B) CEK EMAIL & PHONE ============
    const userByEmail = await User.findOne({ email });
    const userByPhone = await User.findOne({ phone });

    if (
      userByEmail &&
      userByPhone &&
      String(userByEmail._id) !== String(userByPhone._id)
    ) {
      throw new Error(
        "Email dan nomor WhatsApp sudah terdaftar pada akun yang berbeda. Gunakan email/nomor yang sesuai.",
      );
    }

    let user = userByEmail || userByPhone;
    let autoCreatedUser = false;

    if (user) {
      // pastikan pair konsisten
      if (user.email !== email) {
        throw new Error(
          "Email tidak cocok dengan akun yang menggunakan nomor ini.",
        );
      }
      if (user.phone !== phone) {
        throw new Error(
          "Nomor WhatsApp tidak cocok dengan akun yang menggunakan email ini.",
        );
      }

      // requirement: langsung aktif
      const patch = {};
      if (user.isActive === false) patch.isActive = true;
      if (user.isVerified === false) patch.isVerified = true;
      if (Object.keys(patch).length) {
        await User.updateOne({ _id: user._id }, { $set: patch });
      }
    } else {
      // ============ C) BUAT AKUN BARU LANGSUNG AKTIF ============
      user = await User.create({
        name,
        email,
        phone,
        password: phone, // (disarankan nanti diganti flow set password/magic link)
        isActive: true,
        isVerified: true,
        isAutoCreated: true,
      });
      autoCreatedUser = true;
    }

    // ============ D) BUAT TRANSAKSI PENDING ============
    const orderId = `TRX-${nanoid()}`;

    const trx = await Transaction.create({
      transactionCode: orderId,
      midtransOrderId: orderId,

      type: itemType, // schema kamu: enum ["Course","Product"]
      itemId,
      itemType,

      itemName,
      userId: user._id,

      price,
      status: "pending",

      // ✅ UTM jangan dihapus: simpan semua
      utmSource: payload.utmSource || "direct",
      utmMedium: payload.utmMedium || null,
      utmCampaign: payload.utmCampaign || null,
      utmTerm: payload.utmTerm || null,
      utmContent: payload.utmContent || null,

      referralCode: payload.referralCode || null,

      autoCreatedUser,
      midtransTransactionStatus: "pending",
    });

    // ============ E) CREATE MIDTRANS SNAP TOKEN ============
    const authString = Buffer.from(`${settings.midtransServerKey}:`).toString(
      "base64",
    );

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
          gross_amount: price,
        },
        customer_details: {
          first_name: name,
          email,
          phone,
        },
        item_details: [
          {
            id: String(itemId),
            price: price,
            quantity: 1,
            name: itemName,
          },
        ],
        callbacks: {
          finish: `${settings.domain}/status?order_id=${orderId}`,
        },
      }),
    });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok) {
      // ============ H) CLEANUP kalau gagal buat token ============
      await Transaction.deleteOne({ _id: trx._id });

      if (autoCreatedUser) {
        const other = await Transaction.countDocuments({ userId: user._id });
        if (other === 0) {
          await User.deleteOne({ _id: user._id, isAutoCreated: true });
        }
      }

      throw new Error(midtransData?.error_messages?.[0] || "Midtrans Error");
    }

    // simpan snap token & redirect_url
    await Transaction.updateOne(
      { _id: trx._id },
      {
        $set: {
          snapToken: midtransData.token,
          snapRedirectUrl: midtransData.redirect_url,
          midtransTransactionStatus: "pending",
          midtransPayload: midtransData, // simpan response snap juga (optional)
        },
      },
    );

    // ============ G) EMAIL PENDING (sekali) ============
    await sendPaymentEmail({
      to: email,
      name,
      status: "pending",
      transactionId: orderId,
      itemName,
      amount: price,
    });

    // ============ E) Redirect to Midtrans ============
    return {
      success: true,
      token: midtransData.token,
      redirectUrl: midtransData.redirect_url,
      orderId,
    };
  } catch (error) {
    console.error("Payment Error:", error);
    return { success: false, error: error.message };
  }
}

// ✅ MY PRODUCTS: LIST PRODUK YANG SUDAH DIBELI USER
export async function getPurchasedProductsByUser(userId) {
  await dbConnect();
  if (!userId) return [];

  try {
    const txs = await Transaction.find({
      userId,
      status: "completed",
      itemType: "Product",
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "item",
        select:
          "name image description rating totalReviews category price fileLink filePath videoLink note",
      })
      .lean({ virtuals: true });

    const plain = JSON.parse(JSON.stringify(txs));

    return plain
      .filter((t) => t.item)
      .map((t) => ({
        transactionCode: t.transactionCode,
        purchasedAt: t.createdAt,
        price: t.price,
        status: t.status,
        product: {
          _id: t.item._id,
          name: t.item.name,
          image: t.item.image,
          description: t.item.description,
          rating: t.item.rating,
          totalReviews: t.item.totalReviews,
          category: t.item.category,
          price: t.item.price,
          fileLink: t.item.fileLink,
          filePath: t.item.filePath,
          videoLink: t.item.videoLink,
          note: t.item.note,
        },
      }));
  } catch (e) {
    console.error("getPurchasedProductsByUser error:", e);
    return [];
  }
}
