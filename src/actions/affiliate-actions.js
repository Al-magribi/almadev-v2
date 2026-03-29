"use server";

import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { getCurrentUser } from "@/lib/auth-service";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import AffiliatePayout from "@/models/AffiliatePayout";

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

export async function getAffiliateMembersAdmin() {
  try {
    await dbConnect();

    const session = await getCurrentUser();
    if (!session?.userId || session.role !== "admin") {
      return { success: false, message: "Unauthorized", data: [] };
    }

    const members = await User.find({
      $or: [
        { affiliateJoinedAt: { $ne: null } },
        { affiliateStatus: "active" },
        { referralCode: { $ne: null } },
      ],
    })
      .select(
        "name email phone referralCode affiliateStatus affiliateJoinedAt bankInfo",
      )
      .sort({ affiliateJoinedAt: -1, createdAt: -1 })
      .lean();

    const memberIds = members.map((item) => item._id);
    const transactionStats = memberIds.length
      ? await Transaction.aggregate([
          {
            $match: {
              "affiliate.referrerId": { $in: memberIds },
            },
          },
          {
            $group: {
              _id: "$affiliate.referrerId",
              totalTransactions: { $sum: 1 },
              completedTransactions: {
                $sum: {
                  $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
                },
              },
              rewardTotal: {
                $sum: {
                  $cond: [
                    { $eq: ["$status", "completed"] },
                    "$affiliate.rewardAmount",
                    0,
                  ],
                },
              },
              rewardReady: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$status", "completed"] },
                        { $ne: ["$affiliateRefund.refundStatus", "full"] },
                        { $ne: ["$affiliateRefund.commissionEffect", "void"] },
                      ],
                    },
                    "$affiliate.rewardAmount",
                    0,
                  ],
                },
              },
            },
          },
        ])
      : [];

    const statsMap = new Map(
      transactionStats.map((item) => [String(item._id), item]),
    );

    return {
      success: true,
      data: members.map((member) => {
        const stats = statsMap.get(String(member._id));
        return {
          id: String(member._id),
          name: member.name || "User",
          email: member.email || "-",
          phone: member.phone || "-",
          referralCode: member.referralCode || "-",
          affiliateStatus: member.affiliateStatus || "inactive",
          affiliateJoinedAt: member.affiliateJoinedAt
            ? new Date(member.affiliateJoinedAt).toISOString()
            : null,
          bankInfo: {
            bankName: member.bankInfo?.bankName || "-",
            accountNumber: member.bankInfo?.accountNumber || "-",
            accountName: member.bankInfo?.accountName || "-",
          },
          totalTransactions: Number(stats?.totalTransactions || 0),
          completedTransactions: Number(stats?.completedTransactions || 0),
          rewardTotal: Number(stats?.rewardTotal || 0),
          rewardReady: Number(stats?.rewardReady || 0),
        };
      }),
    };
  } catch (error) {
    console.error("getAffiliateMembersAdmin error:", error);
    return {
      success: false,
      message: error.message || "Gagal mengambil member affiliate.",
      data: [],
    };
  }
}

export async function getAffiliatePayoutsAdmin() {
  try {
    await dbConnect();

    const session = await getCurrentUser();
    if (!session?.userId || session.role !== "admin") {
      return { success: false, message: "Unauthorized", data: [] };
    }

    const members = await User.find({
      $or: [
        { affiliateJoinedAt: { $ne: null } },
        { affiliateStatus: "active" },
        { referralCode: { $ne: null } },
      ],
    })
      .select("name email referralCode bankInfo")
      .lean();

    const memberIds = members.map((item) => item._id);

    const [payoutStats, pendingRewardStats] = memberIds.length
      ? await Promise.all([
          AffiliatePayout.aggregate([
            {
              $match: {
                referrerId: { $in: memberIds },
              },
            },
            {
              $group: {
                _id: "$referrerId",
                payoutCount: { $sum: 1 },
                paidAmount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "paid"] }, "$netAmount", 0],
                  },
                },
                scheduledAmount: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ["draft", "scheduled"]] },
                      "$netAmount",
                      0,
                    ],
                  },
                },
                totalPayoutAmount: { $sum: "$netAmount" },
                lastPaidAt: { $max: "$paidAt" },
              },
            },
          ]),
          Transaction.aggregate([
            {
              $match: {
                "affiliate.referrerId": { $in: memberIds },
                status: "completed",
              },
            },
            {
              $group: {
                _id: "$affiliate.referrerId",
                rewardReady: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ["$affiliateRefund.refundStatus", "full"] },
                          { $ne: ["$affiliateRefund.commissionEffect", "void"] },
                        ],
                      },
                      "$affiliate.rewardAmount",
                      0,
                    ],
                  },
                },
              },
            },
          ]),
        ])
      : [[], []];

    const payoutMap = new Map(
      payoutStats.map((item) => [String(item._id), item]),
    );
    const rewardMap = new Map(
      pendingRewardStats.map((item) => [String(item._id), item]),
    );

    return {
      success: true,
      data: members
        .map((member) => {
          const payout = payoutMap.get(String(member._id));
          const reward = rewardMap.get(String(member._id));

          return {
            id: String(member._id),
            name: member.name || "User",
            email: member.email || "-",
            referralCode: member.referralCode || "-",
            bankInfo: {
              bankName: member.bankInfo?.bankName || "-",
              accountNumber: member.bankInfo?.accountNumber || "-",
              accountName: member.bankInfo?.accountName || "-",
            },
            payoutCount: Number(payout?.payoutCount || 0),
            paidAmount: Number(payout?.paidAmount || 0),
            scheduledAmount: Number(payout?.scheduledAmount || 0),
            totalPayoutAmount: Number(payout?.totalPayoutAmount || 0),
            rewardReady: Number(reward?.rewardReady || 0),
            lastPaidAt: payout?.lastPaidAt
              ? new Date(payout.lastPaidAt).toISOString()
              : null,
          };
        })
        .filter(
          (row) =>
            row.rewardReady > 0 ||
            row.scheduledAmount > 0 ||
            row.paidAmount > 0 ||
            row.payoutCount > 0 ||
            row.totalPayoutAmount > 0,
        ),
    };
  } catch (error) {
    console.error("getAffiliatePayoutsAdmin error:", error);
    return {
      success: false,
      message: error.message || "Gagal mengambil payout affiliate.",
      data: [],
    };
  }
}
