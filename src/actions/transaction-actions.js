"use server";

import Transaction from "@/models/Transaction";
import Course from "@/models/Course";
import Product from "@/models/Product";
import User from "@/models/User";
import Setting from "@/models/Setting";
import BootcampParticipant from "@/models/BootcampParticipant";
import Landing from "@/models/Landing";
import AffiliateVisit from "@/models/AffiliateVisit";
import dbConnect from "@/lib/db";
import { customAlphabet } from "nanoid";
import { sendPaymentEmail } from "@/lib/emailService";
import { getCurrentUser } from "@/lib/auth-service";
import { cookies } from "next/headers";
import { getOfferSessionKey, resolveCourseOfferStates } from "@/lib/course-offer";

const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

const serializeData = (data) => JSON.parse(JSON.stringify(data));

const NON_DELETABLE_TRANSACTION_STATUSES = new Set(["failed", "expired"]);

const normalizeReferralCode = (value = "") => {
  const normalized = String(value || "").trim().toUpperCase();
  return normalized || null;
};

const resolveReferralCode = (payload = {}) => {
  const directCode = normalizeReferralCode(payload?.referralCode);
  if (directCode) {
    return directCode;
  }

  const medium = String(payload?.utmMedium || "").trim().toLowerCase();
  if (medium === "referral") {
    return normalizeReferralCode(payload?.utmCampaign);
  }

  return null;
};

const normalizePhoneNumber = (value = "") => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
};

const getPhoneCandidates = (value = "") => {
  const normalized = normalizePhoneNumber(value);
  if (!normalized) return [];

  const variants = new Set([normalized]);
  if (normalized.startsWith("628")) {
    variants.add(`0${normalized.slice(2)}`);
  }

  return Array.from(variants);
};

const findUserByCheckoutIdentity = async ({ email, phone }) => {
  const userByEmail = email ? await User.findOne({ email }) : null;
  const phoneCandidates = getPhoneCandidates(phone);
  const userByPhone = phoneCandidates.length
    ? await User.findOne({ phone: { $in: phoneCandidates } })
    : null;

  return { userByEmail, userByPhone };
};

const resolveAffiliateItem = async ({ itemType, itemId }) => {
  if (itemType === "Course") {
    return Course.findById(itemId)
      .select("affiliateEnabled affiliateRewardAmount")
      .lean();
  }

  if (itemType === "Product") {
    return Product.findById(itemId)
      .select("affiliateEnabled affiliateRewardAmount")
      .lean();
  }

  return null;
};

const resolveAffiliateAttribution = async ({
  itemType,
  itemId,
  referralCode,
  buyerUserId,
}) => {
  const normalizedCode = normalizeReferralCode(referralCode);
  if (!normalizedCode) {
    return null;
  }

  const [referrer, affiliateItem] = await Promise.all([
    User.findOne({ referralCode: normalizedCode })
      .select("_id referralCode")
      .lean(),
    resolveAffiliateItem({ itemType, itemId }),
  ]);

  if (!referrer?._id) {
    return null;
  }

  if (buyerUserId && String(referrer._id) === String(buyerUserId)) {
    return null;
  }

  if (!affiliateItem?.affiliateEnabled) {
    return null;
  }

  const visit = await AffiliateVisit.findOne({
    referrerId: referrer._id,
    referralCode: normalizedCode,
    itemId,
    itemType,
  })
    .sort({ createdAt: -1 })
    .select("_id")
    .lean();

  return {
    referrerId: referrer._id,
    referralCode: normalizedCode,
    visitId: visit?._id || null,
    rewardAmount: Math.max(0, Number(affiliateItem?.affiliateRewardAmount) || 0),
    attributionModel: "last_click",
  };
};

export async function applyAffiliateConversionForTransaction(transactionId) {
  if (!transactionId) return;

  await dbConnect();

  const trx = await Transaction.findById(transactionId)
    .select("itemId affiliate completedAt")
    .lean();

  if (!trx) return;

  const completedAt = trx.completedAt ? new Date(trx.completedAt) : new Date();

  if (!trx.completedAt) {
    await Transaction.updateOne(
      { _id: trx._id, completedAt: null },
      { $set: { completedAt } },
    );
  }

  if (!trx?.affiliate?.referrerId || !trx?.affiliate?.referralCode) {
    return;
  }

  let visit = null;

  if (trx?.affiliate?.visitId) {
    visit = await AffiliateVisit.findById(trx.affiliate.visitId)
      .select("_id")
      .lean();
  }

  if (!visit) {
    visit = await AffiliateVisit.findOne({
      referrerId: trx.affiliate.referrerId,
      referralCode: trx.affiliate.referralCode,
      itemId: trx.itemId,
    })
      .sort({ createdAt: -1 })
      .select("_id")
      .lean();
  }

  if (!visit?._id) {
    return;
  }

  await AffiliateVisit.updateOne(
    {
      _id: visit._id,
      $or: [
        { convertedTransactionId: null },
        { convertedTransactionId: trx._id },
      ],
    },
    {
      $set: {
        convertedTransactionId: trx._id,
        convertedAt: completedAt,
      },
    },
  );

  if (!trx?.affiliate?.visitId) {
    await Transaction.updateOne(
      { _id: trx._id, "affiliate.visitId": null },
      { $set: { "affiliate.visitId": visit._id } },
    );
  }
}

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
      .populate({ path: "userId", select: "name email phone avatar role" })
      .populate({
        path: "item",
        select:
          "name title image price category type email phone status registrationFee classFee midtransStatus transactionCode",
      })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: serializeData(transactions) };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTransactionByAdmin(transactionId) {
  await dbConnect();

  try {
    const session = await getCurrentUser();
    if (!session?.userId || session.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    if (!transactionId) {
      return { success: false, error: "transactionId wajib diisi." };
    }

    const existing = await Transaction.findById(transactionId)
      .select("status")
      .lean();

    if (!existing) {
      return { success: false, error: "Transaksi tidak ditemukan." };
    }

    if (NON_DELETABLE_TRANSACTION_STATUSES.has(existing.status)) {
      return {
        success: false,
        error:
          "Transaksi dengan status failed atau expired harus tetap disimpan.",
      };
    }

    await Transaction.findByIdAndDelete(transactionId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: error.message };
  }
}

export async function validateCourseCheckoutAccess(payload) {
  await dbConnect();

  try {
    const email = (payload?.email || "").trim().toLowerCase();
    const phone = normalizePhoneNumber(payload?.phone || "");
    const courseId = payload?.courseId;

    if (!email) {
      return { success: false, error: "Email wajib diisi." };
    }

    if (!phone) {
      return { success: false, error: "Nomor WhatsApp wajib diisi." };
    }

    if (!courseId) {
      return { success: false, error: "Course tidak valid." };
    }

    const { userByEmail, userByPhone } = await findUserByCheckoutIdentity({
      email,
      phone,
    });

    if (
      userByEmail &&
      userByPhone &&
      String(userByEmail._id) !== String(userByPhone._id)
    ) {
      return {
        success: false,
        error:
          "Email dan nomor WhatsApp sudah terdaftar pada akun yang berbeda. Gunakan email/nomor yang sesuai.",
      };
    }

    const user = userByEmail || userByPhone;
    if (!user) {
      return { success: true, alreadyPurchased: false, normalizedPhone: phone };
    }

    if (user.email !== email) {
      return {
        success: false,
        error: "Email tidak cocok dengan akun yang menggunakan nomor ini.",
      };
    }

    if (normalizePhoneNumber(user.phone) !== phone) {
      return {
        success: false,
        error: "Nomor WhatsApp tidak cocok dengan akun yang menggunakan email ini.",
      };
    }

    const existingPurchase = await Transaction.findOne({
      userId: user._id,
      itemType: "Course",
      itemId: courseId,
      status: "completed",
    })
      .select("_id")
      .lean();

    return {
      success: true,
      alreadyPurchased: Boolean(existingPurchase),
      normalizedPhone: phone,
    };
  } catch (error) {
    console.error("validateCourseCheckoutAccess error:", error);
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
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$utmSource",
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
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
    const previousStatus = trx.status;

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
      await applyAffiliateConversionForTransaction(trx._id);

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
          .select("name fullName email phone")
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
            isBootcamp: trx.itemType === "BootcampParticipant",
            loginEmail: customerEmail,
            loginPhone: user?.phone,
            showLoginInfo: trx.autoCreatedUser,
            mustChangePassword: trx.autoCreatedUser,
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

    const emailableStatuses = new Set([
      "pending",
      "failed",
      "cancelled",
      "expired",
    ]);
    if (
      normalizedStatus !== "completed" &&
      normalizedStatus !== previousStatus &&
      emailableStatuses.has(normalizedStatus)
    ) {
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
          status: normalizedStatus,
          transactionId: trx.transactionCode,
          itemName,
          amount: trx.price,
        });
      }
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
    const phone = normalizePhoneNumber(payload.phone || "");

    const itemType = payload.itemType; // "Course" | "Product"
    const itemId = payload.itemId;
    let price = Number(payload.price);
    const planId = payload?.planId ? String(payload.planId) : null;

    if (!name) throw new Error("Nama wajib diisi.");
    if (!email) throw new Error("Email wajib diisi.");
    if (!phone) throw new Error("Nomor WhatsApp wajib diisi.");
    if (!itemType || !["Course", "Product"].includes(itemType)) {
      throw new Error("itemType wajib: Course atau Product.");
    }
    if (!itemId) throw new Error("itemId wajib diisi.");

    // ambil itemName dari DB (biar akurat)
    let itemName = "Pesanan Anda";
    if (itemType === "Course") {
      const course = await Course.findById(itemId).select("title name price").lean();
      if (!course) throw new Error("Course tidak ditemukan.");
      itemName = course.title || course.name || itemName;
      price = Number(course.price) || 0;

      const landing = await Landing.findOne({ courseId: itemId })
        .select("pricing.items")
        .lean();
      const pricingItems = landing?.pricing?.items || [];
      const selectedPlan =
        pricingItems.find((item) => String(item?._id) === planId) || null;

      if (selectedPlan) {
        const cookieStore = await cookies();
        const sessionKey = await getOfferSessionKey(cookieStore);
        const [offerState] = await resolveCourseOfferStates({
          courseId: itemId,
          plans: [selectedPlan],
          sessionKey,
          now: new Date(),
        });

        price = Number.isFinite(Number(offerState?.currentPrice))
          ? Number(offerState.currentPrice)
          : Number(selectedPlan.price) || 0;
        itemName = `${course.title || course.name || "Course"} - ${selectedPlan.name}`;
      }
    } else {
      const product = await Product.findById(itemId)
        .select("title name price")
        .lean();
      if (!product) throw new Error("Product tidak ditemukan.");
      itemName = product.title || product.name || itemName;
      price = Number(product.price) || 0;
    }

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error("Harga tidak valid.");
    }

    // ============ B) CEK EMAIL & PHONE ============
    const { userByEmail, userByPhone } = await findUserByCheckoutIdentity({
      email,
      phone,
    });

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
      if (normalizePhoneNumber(user.phone) !== phone) {
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

    if (itemType === "Course") {
      const existingPurchase = await Transaction.findOne({
        userId: user._id,
        itemType: "Course",
        itemId,
        status: "completed",
      })
        .select("transactionCode")
        .lean();

      if (existingPurchase) {
        throw new Error(
          "Email dan nomor WhatsApp ini sudah terdaftar membeli course yang sama. Anda tidak bisa membeli course ini lagi.",
        );
      }
    }

    // ============ D) BUAT TRANSAKSI PENDING ============
    const orderId = `TRX-${nanoid()}`;

    const affiliateAttribution = await resolveAffiliateAttribution({
      itemType,
      itemId,
      referralCode: resolveReferralCode(payload),
      buyerUserId: user._id,
    });

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

      referralCode:
        affiliateAttribution?.referralCode ||
        resolveReferralCode(payload),
      affiliate: affiliateAttribution || undefined,

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
      loginEmail: email,
      loginPhone: phone,
      showLoginInfo: autoCreatedUser,
      mustChangePassword: autoCreatedUser,
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
